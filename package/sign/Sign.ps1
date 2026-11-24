<#
.SYNOPSIS
    Authenticode signing of the Windows build (#2372): the payload's .exe/.dll, the Inno
    Setup installer and the MSI, with an RFC 3161 timestamp, through a cloud-HSM provider.

.DESCRIPTION
    One script for every place the packaging signs something:
      make.ps1 -Sign        Sign.ps1 -Path build\<arch>\desktop     (every .exe/.dll inside)
      make_inno.ps1 -Sign   Inno Setup's SignTool=byparam -> Sign.ps1 -File <setup/uninstaller>
      make_advinst.ps1 -Sign  Sign.ps1 -File <msi>
    and by hand for anything else:  Sign.ps1 -File a.exe,b.msi   or   Sign.ps1 -Path <dir>.

    The private key never leaves the provider's HSM; signtool (or the provider's tool) sends
    the file digest and gets the signature back. Pick the provider with -Provider or
    RD_SIGN_PROVIDER:

      AzureTrustedSigning  signtool /dlib Azure.CodeSigning.Dlib.dll /dmdf metadata.json
                           (Microsoft "Trusted Signing" / Artifact Signing)
          RD_AZURE_TS_ENDPOINT   e.g. https://eus.codesigning.azure.net
          RD_AZURE_TS_ACCOUNT    code signing account name
          RD_AZURE_TS_PROFILE    certificate profile name
          RD_AZURE_TS_DLIB       full path to Azure.CodeSigning.Dlib.dll (x64)
          AZURE_TENANT_ID, AZURE_CLIENT_ID, AZURE_CLIENT_SECRET
                                 service principal with "Trusted Signing Certificate Profile
                                 Signer" on the profile (read by the dlib's DefaultAzureCredential)
      DigiCertKeyLocker    signtool with the "DigiCert Signing Manager KSP" (smctl for the
                           health check); install "KeyLocker Tools" (smtools) first
          SM_HOST                 e.g. https://clientauth.one.digicert.com
          SM_API_KEY              API token
          SM_CLIENT_CERT_FILE     path to the client authentication certificate (.p12)
          SM_CLIENT_CERT_PASSWORD its password
          RD_DIGICERT_KEYPAIR_ALIAS  key pair alias in KeyLocker
          RD_DIGICERT_CERT_FILE   the code signing certificate (.crt/.cer, public part), or
          RD_DIGICERT_CERT_SHA1   its thumbprint after `smctl windows certsync`
      SSLcomESigner        SSL.com CodeSignTool (eSigner cloud signing)
          ES_USERNAME, ES_PASSWORD   SSL.com account
          ES_CREDENTIAL_ID           eSigner credential (certificate) id
          ES_TOTP_SECRET             TOTP secret for automated signing
          RD_CODESIGNTOOL            full path to CodeSignTool.bat
          eSigner bills/limits per signature: run -DryRun first and check the count.

    Optional for all:
      RD_SIGNTOOL       signtool.exe to use (default: newest x64 one in the Windows 10/11 SDK)
      RD_TIMESTAMP_URL  override the provider's RFC 3161 timestamp server
      RD_SIGN_DESCRIPTION / RD_SIGN_URL   /d and /du shown in the UAC prompt (signtool providers)

    Credentials come ONLY from the environment (CI secret store). Never put them in git,
    in a script, or on lab02; nothing here writes them to disk except the Azure metadata.json,
    which holds no secret and is deleted afterwards.

    Files that already carry a valid signature - Microsoft's VC++ runtime DLLs, or ours from
    an earlier run (Inno's signonce works the same way) - are left alone unless -Force:
    re-signing a third party's binary would replace its publisher. After signing every file is checked: Authenticode status Valid and a
    timestamp present.

.PARAMETER File
    Files to sign (.exe .dll .msi .sys .cab .ocx .appx .msix ...). Several allowed. The
    extension is not checked: Inno Setup hands over its uninstaller as uninst.e32.tmp.
.PARAMETER Path
    A directory: every .exe/.dll/.msi/.sys/.ocx under it, recursively.
.PARAMETER Provider
    AzureTrustedSigning | DigiCertKeyLocker | SSLcomESigner. Default: $env:RD_SIGN_PROVIDER.
.PARAMETER DryRun
    List exactly what would be signed (and what is skipped, and why), check that the
    provider's environment variables are set, and print the command shape with secrets
    redacted. Signs nothing, contacts nothing. Works without the tools installed.
.PARAMETER Force
    Also re-sign files that already carry a valid signature (ours or a third party's).
.PARAMETER Exclude
    Wildcards (matched against the file name) to leave out, e.g. -Exclude vcruntime*.dll

.EXAMPLE
    $env:RD_SIGN_PROVIDER = "AzureTrustedSigning"
    .\Sign.ps1 -Path ..\build\x64\desktop -DryRun
    .\Sign.ps1 -Path ..\build\x64\desktop
    .\Sign.ps1 -File ..\inno\Ration-Docs-2026.2.0-x64.exe, ..\advinst\Ration-Docs-2026.2.0-x64.msi
#>
[CmdletBinding()]
param (
    [string[]]$File,
    [string]$Path,
    [ValidateSet("", "AzureTrustedSigning", "DigiCertKeyLocker", "SSLcomESigner")]
    [string]$Provider = $env:RD_SIGN_PROVIDER,
    [switch]$DryRun,
    [switch]$Force,
    [string[]]$Exclude = @()
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version 2.0

$DirectoryExtensions = @(".exe", ".dll", ".msi", ".sys", ".ocx")
$IsWindowsHost = ($env:OS -eq "Windows_NT")

function Fail([string]$Message) {
    Write-Host "Sign.ps1: $Message" -ForegroundColor Red
    exit 1
}

function Redact([string]$Text) {
    foreach ($name in @("AZURE_CLIENT_SECRET", "SM_API_KEY", "SM_CLIENT_CERT_PASSWORD",
                        "ES_PASSWORD", "ES_TOTP_SECRET", "ES_USERNAME", "ES_CREDENTIAL_ID")) {
        $value = [Environment]::GetEnvironmentVariable($name)
        if ($value) { $Text = $Text.Replace($value, "<$name>") }
    }
    return $Text
}

#### what to sign

$Candidates = New-Object System.Collections.Generic.List[string]
if ($File) {
    foreach ($f in $File) {
        if (-not (Test-Path -LiteralPath $f -PathType Leaf)) { Fail "no such file: $f" }
        $Candidates.Add((Resolve-Path -LiteralPath $f).ProviderPath)
    }
}
if ($Path) {
    if (-not (Test-Path -LiteralPath $Path -PathType Container)) { Fail "no such directory: $Path" }
    Get-ChildItem -LiteralPath $Path -Recurse -File |
        Where-Object { $DirectoryExtensions -contains $_.Extension.ToLowerInvariant() } |
        Sort-Object FullName |
        ForEach-Object { $Candidates.Add($_.FullName) }
}
if ($Candidates.Count -eq 0) { Fail "nothing to sign: pass -File and/or -Path" }
if (-not $Provider) { Fail "no provider: pass -Provider or set RD_SIGN_PROVIDER (AzureTrustedSigning, DigiCertKeyLocker, SSLcomESigner)" }

#### provider settings (from the environment only)

$Required = switch ($Provider) {
    "AzureTrustedSigning" { @("RD_AZURE_TS_ENDPOINT", "RD_AZURE_TS_ACCOUNT", "RD_AZURE_TS_PROFILE",
                              "RD_AZURE_TS_DLIB", "AZURE_TENANT_ID", "AZURE_CLIENT_ID", "AZURE_CLIENT_SECRET") }
    "DigiCertKeyLocker"   { @("SM_HOST", "SM_API_KEY", "SM_CLIENT_CERT_FILE", "SM_CLIENT_CERT_PASSWORD",
                              "RD_DIGICERT_KEYPAIR_ALIAS") }
    "SSLcomESigner"       { @("ES_USERNAME", "ES_PASSWORD", "ES_CREDENTIAL_ID", "ES_TOTP_SECRET", "RD_CODESIGNTOOL") }
}
$Missing = @($Required | Where-Object { -not [Environment]::GetEnvironmentVariable($_) })
if ($Provider -eq "DigiCertKeyLocker" -and -not ($env:RD_DIGICERT_CERT_FILE -or $env:RD_DIGICERT_CERT_SHA1)) {
    $Missing += "RD_DIGICERT_CERT_FILE or RD_DIGICERT_CERT_SHA1"
}

$TimestampUrl = $env:RD_TIMESTAMP_URL
if (-not $TimestampUrl) {
    $TimestampUrl = switch ($Provider) {
        "AzureTrustedSigning" { "http://timestamp.acs.microsoft.com" }
        "DigiCertKeyLocker"   { "http://timestamp.digicert.com" }
        "SSLcomESigner"       { "http://ts.ssl.com" }   # CodeSignTool timestamps itself; shown for the record
    }
}

#### classify: sign, or skip (excluded / already signed by someone else)

function Get-SignatureState([string]$Path) {
    # "unsigned", "signed:<subject>", or "unknown" (not on Windows: cannot tell)
    if (-not $IsWindowsHost) { return "unknown" }
    $sig = Get-AuthenticodeSignature -LiteralPath $Path
    if ($sig.Status -ne "Valid" -or -not $sig.SignerCertificate) { return "unsigned" }   # none, broken or expired: (re)sign
    return "signed:$($sig.SignerCertificate.Subject)"
}

$ToSign = New-Object System.Collections.Generic.List[string]
$Skipped = New-Object System.Collections.Generic.List[string]
foreach ($f in ($Candidates | Select-Object -Unique)) {
    $name = [System.IO.Path]::GetFileName($f)
    $excluded = $false
    foreach ($pattern in $Exclude) { if ($name -like $pattern) { $excluded = $true } }
    if ($excluded) { $Skipped.Add("excluded: $f"); continue }
    $state = Get-SignatureState $f
    if ($state -like "signed:*" -and -not $Force) {
        $Skipped.Add("already signed by $($state.Substring(7)): $f"); continue
    }
    $ToSign.Add($f)
}

#### tools

function Find-SignTool {
    if ($env:RD_SIGNTOOL) { return $env:RD_SIGNTOOL }
    $kits = Join-Path ${env:ProgramFiles(x86)} "Windows Kits\10\bin"
    $found = Get-ChildItem -Path $kits -Filter signtool.exe -Recurse -ErrorAction SilentlyContinue |
        Where-Object { $_.FullName -match "\\x64\\" } |
        Sort-Object { $v = $_.Directory.Parent.Name -as [version]; if ($v) { $v } else { [version]"0.0" } } -Descending |
        Select-Object -First 1
    if ($found) { return $found.FullName }
    $onPath = Get-Command signtool.exe -ErrorAction SilentlyContinue
    if ($onPath) { return $onPath.Source }
    return $null
}

$CommonSignToolArgs = @("sign", "/v", "/fd", "SHA256", "/tr", $TimestampUrl, "/td", "SHA256")
if ($env:RD_SIGN_DESCRIPTION) { $CommonSignToolArgs += @("/d", $env:RD_SIGN_DESCRIPTION) }
if ($env:RD_SIGN_URL) { $CommonSignToolArgs += @("/du", $env:RD_SIGN_URL) }

function Get-ProviderCommand([string[]]$Files, [string]$MetadataPath) {
    # The command line for one batch, as an array (first element = program).
    switch ($Provider) {
        "AzureTrustedSigning" {
            return @("signtool.exe") + $CommonSignToolArgs +
                @("/dlib", $env:RD_AZURE_TS_DLIB, "/dmdf", $MetadataPath) + $Files
        }
        "DigiCertKeyLocker" {
            $cert = if ($env:RD_DIGICERT_CERT_SHA1) { @("/sha1", $env:RD_DIGICERT_CERT_SHA1) }
                    else { @("/f", $env:RD_DIGICERT_CERT_FILE) }
            return @("signtool.exe") + $CommonSignToolArgs +
                @("/csp", "DigiCert Signing Manager KSP", "/kc", $env:RD_DIGICERT_KEYPAIR_ALIAS) + $cert + $Files
        }
        "SSLcomESigner" {
            # One file per call; -override=true signs in place.
            return @($env:RD_CODESIGNTOOL, "sign",
                "-username=$($env:ES_USERNAME)", "-password=$($env:ES_PASSWORD)",
                "-credential_id=$($env:ES_CREDENTIAL_ID)", "-totp_secret=$($env:ES_TOTP_SECRET)",
                "-input_file_path=$($Files[0])", "-override=true")
        }
    }
}

#### dry run

if ($DryRun) {
    Write-Host "[ Sign.ps1 dry run - nothing is signed ]"
    Write-Host "Provider      : $Provider"
    Write-Host "Timestamp     : $TimestampUrl"
    if ($Missing.Count -gt 0) {
        Write-Host "Missing env   : $($Missing -join ', ')" -ForegroundColor Yellow
    } else {
        Write-Host "Environment   : all required variables are set"
    }
    if (-not $IsWindowsHost) {
        Write-Host "Note          : not on Windows - existing signatures cannot be checked, so files that a"
        Write-Host "                third party already signed (VC++ runtime ...) are listed as to-sign here"
    }
    Write-Host ""
    Write-Host "Would sign $($ToSign.Count) file(s):"
    $ToSign | ForEach-Object { Write-Host "  $_" }
    if ($Skipped.Count -gt 0) {
        Write-Host ""
        Write-Host "Would skip $($Skipped.Count) file(s):"
        $Skipped | ForEach-Object { Write-Host "  $_" }
    }
    if ($ToSign.Count -gt 0) {
        $example = Get-ProviderCommand @($ToSign[0]) "<temp>\metadata.json"
        Write-Host ""
        $shape = ($example | ForEach-Object { if ($_ -match ' ') { '"' + $_ + '"' } else { $_ } }) -join ' '
        Write-Host "Command shape : $(Redact $shape)"
        if ($Provider -eq "SSLcomESigner") { Write-Host "                (one CodeSignTool call, i.e. one eSigner signature, per file)" }
    }
    exit 0
}

#### sign

if (-not $IsWindowsHost) { Fail "signing runs on Windows only (use -DryRun elsewhere)" }
if ($Missing.Count -gt 0) { Fail "missing environment variable(s): $($Missing -join ', ')" }
if ($ToSign.Count -eq 0) {
    Write-Host "Sign.ps1: nothing to sign ($($Skipped.Count) skipped)"
    exit 0
}

$SignTool = $null
if ($Provider -ne "SSLcomESigner") {
    $SignTool = Find-SignTool
    if (-not $SignTool) { Fail "signtool.exe not found: install the Windows SDK or set RD_SIGNTOOL" }
}

$Temp = Join-Path ([System.IO.Path]::GetTempPath()) ("rd-sign-" + [guid]::NewGuid().ToString("N"))
New-Item -ItemType Directory -Path $Temp | Out-Null
$Metadata = Join-Path $Temp "metadata.json"

try {
    switch ($Provider) {
        "AzureTrustedSigning" {
            if (-not (Test-Path -LiteralPath $env:RD_AZURE_TS_DLIB)) { Fail "RD_AZURE_TS_DLIB: no file at $env:RD_AZURE_TS_DLIB" }
            # No secret in here: the dlib authenticates with AZURE_* from the environment.
            @{
                Endpoint               = $env:RD_AZURE_TS_ENDPOINT
                CodeSigningAccountName = $env:RD_AZURE_TS_ACCOUNT
                CertificateProfileName = $env:RD_AZURE_TS_PROFILE
                ExcludeCredentials     = @("ManagedIdentityCredential", "WorkloadIdentityCredential",
                                           "SharedTokenCacheCredential", "VisualStudioCredential",
                                           "VisualStudioCodeCredential", "AzureCliCredential",
                                           "AzurePowerShellCredential", "AzureDeveloperCliCredential",
                                           "InteractiveBrowserCredential")
            } | ConvertTo-Json | ForEach-Object { [System.IO.File]::WriteAllText($Metadata, $_) }   # UTF-8, no BOM
        }
        "DigiCertKeyLocker" {
            $smctl = Get-Command smctl.exe -ErrorAction SilentlyContinue
            if ($smctl) {
                Write-Host "smctl healthcheck"
                & $smctl.Source healthcheck
                if ($LastExitCode -ne 0) { Fail "smctl healthcheck failed (SM_* variables, client certificate, KSP registration)" }
                if ($env:RD_DIGICERT_CERT_SHA1) {
                    & $smctl.Source windows certsync --keypair-alias=$env:RD_DIGICERT_KEYPAIR_ALIAS | Out-Host
                }
            } else {
                Write-Host "smctl.exe not on PATH - skipping the health check (signtool + KSP still work)"
            }
        }
        "SSLcomESigner" {
            if (-not (Test-Path -LiteralPath $env:RD_CODESIGNTOOL)) { Fail "RD_CODESIGNTOOL: no file at $env:RD_CODESIGNTOOL" }
        }
    }

    # signtool takes many files per call; keep command lines well under the 32k limit.
    $batches = New-Object System.Collections.Generic.List[object]
    if ($Provider -eq "SSLcomESigner") {
        foreach ($f in $ToSign) { $batches.Add(@($f)) }
    } else {
        $current = New-Object System.Collections.Generic.List[string]; $length = 0
        foreach ($f in $ToSign) {
            if ($current.Count -gt 0 -and ($length + $f.Length -gt 20000 -or $current.Count -ge 100)) {
                $batches.Add($current.ToArray()); $current.Clear(); $length = 0
            }
            $current.Add($f); $length += $f.Length + 3
        }
        if ($current.Count -gt 0) { $batches.Add($current.ToArray()) }
    }

    $n = 0
    foreach ($batch in $batches) {
        $command = Get-ProviderCommand $batch $Metadata
        $program = if ($SignTool -and $command[0] -eq "signtool.exe") { $SignTool } else { $command[0] }
        $arguments = $command[1..($command.Count - 1)]
        $n += $batch.Count
        Write-Host "[ sign $n/$($ToSign.Count) ] $(Redact ($program + ' ' + ($arguments -join ' ')))"
        $attempt = 0
        do {
            $attempt++
            # CodeSignTool decides the file type by extension and refuses Inno Setup's uninst.e32.tmp:
            # sign a .exe-named copy and move it back.
            $alias = $null; $callArgs = $arguments
            if ($Provider -eq "SSLcomESigner" -and $batch.Count -eq 1 -and
                @('.exe', '.dll', '.msi', '.sys', '.ocx', '.cab', '.cat', '.appx', '.msix') -notcontains [IO.Path]::GetExtension($batch[0]).ToLower()) {
                $alias = $batch[0] + '.rdsign.exe'
                Copy-Item -LiteralPath $batch[0] -Destination $alias -Force
                $callArgs = @($arguments | ForEach-Object { $_.Replace($batch[0], $alias) })
            }
            & $program @callArgs 2>&1 | ForEach-Object { Write-Host (Redact "$_") }
            if ($alias) {
                if ((Get-AuthenticodeSignature -LiteralPath $alias).Status -eq 'Valid') { Move-Item -LiteralPath $alias -Destination $batch[0] -Force }
                else { Remove-Item -LiteralPath $alias -Force -ErrorAction SilentlyContinue }
            }
            $rc = $LastExitCode
            if ($rc -ne 0 -and $attempt -lt 3) {
                Write-Host "  failed ($rc), retrying in $(10 * $attempt)s (timestamp/HSM services are flaky)"
                Start-Sleep -Seconds (10 * $attempt)
            }
        } while ($rc -ne 0 -and $attempt -lt 3)
        if ($rc -ne 0) { Fail "signing failed ($rc) for: $($batch -join ', ')" }
    }

    #### verify: valid Authenticode signature and a timestamp on every file

    $bad = 0
    foreach ($f in $ToSign) {
        $sig = Get-AuthenticodeSignature -LiteralPath $f
        $ts = $sig.TimeStamperCertificate
        if ($sig.Status -ne "Valid" -or -not $ts) {
            Write-Host "  NOT OK: $f  status=$($sig.Status) timestamp=$([bool]$ts)" -ForegroundColor Red
            $bad++
        } else {
            Write-Host "  ok: $f  [$($sig.SignerCertificate.Subject)]"
        }
    }
    if ($SignTool) {
        & $SignTool verify /pa /q @($ToSign) | Out-Null
        if ($LastExitCode -ne 0) { Write-Host "  signtool verify /pa reported a failure" -ForegroundColor Red; $bad++ }
    }
    if ($bad -gt 0) { Fail "$bad file(s) did not verify" }
    Write-Host "Sign.ps1: signed and verified $($ToSign.Count) file(s); skipped $($Skipped.Count)"
}
finally {
    Remove-Item -LiteralPath $Temp -Recurse -Force -ErrorAction SilentlyContinue
}
exit 0
