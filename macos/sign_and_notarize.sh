#!/bin/bash
#
# Developer ID signing, notarization and stapling of the macOS application, and
# optionally of the .pkg (make_pkg.sh) and of a .dmg built from the signed app.
#
#   macos/sign_and_notarize.sh --app <Ration Docs.app> [options]
#   macos/sign_and_notarize.sh --dmg <file.dmg> [options]      (sign + notarize a DMG only)
#
# Options
#   --app <path>          bundle to sign IN PLACE (sign a copy if you need the original)
#   --identity <id>       codesign identity: "Developer ID Application: <Name> (<TEAMID>)",
#                         its SHA-1, or "-" for an ad-hoc signature (testing only: no
#                         timestamp, no notarization, Gatekeeper rejects it; executables
#                         also get disable-library-validation, see adhoc_entitlements()).
#                         Default: $RD_SIGN_IDENTITY.
#   --keychain <path>     keychain holding the identity (CI); default: $RD_KEYCHAIN or the
#                         search list.
#   --no-notarize         sign and verify only.
#   --pkg                 also build Ration-Docs-<version>-<arch>.pkg with make_pkg.sh, signed
#                         with $RD_INSTALLER_IDENTITY ("Developer ID Installer: ..."), then
#                         notarize and staple it.
#   --dmg <path>          sign, notarize and staple this disk image (build it from the
#                         already stapled app, e.g. with fastlane's appdmg step).
#   --out <dir>           where the .pkg and the notarization zip go (default: macos/build).
#   --entitlements <dir>  entitlements directory (default: macos/entitlements next to this script).
#
# Notarization credentials (App Store Connect API key; never in git, never on lab02):
#   RD_NOTARY_KEY_ID      key ID, e.g. 2X9R4HXF34
#   RD_NOTARY_ISSUER      issuer UUID (Users and Access > Integrations > Team keys)
#   RD_NOTARY_KEY_PATH    path to AuthKey_<KEY_ID>.p8,
#     or RD_NOTARY_KEY    the .p8 content itself (PEM text, or base64 of it) - written to
#                         a 0600 temp file for the duration of the run, then deleted.
#   or RD_NOTARY_PROFILE  a `xcrun notarytool store-credentials` keychain profile instead.
#
# What it does, in this order:
#   1. clears extended attributes (quarantine, Finder info) that make codesign fail;
#   2. finds every Mach-O in the bundle by content (not by name: the CEF framework binary
#      has no extension and no exec bit) and signs them inside out - loose binaries
#      (dylibs, x2t, Sparkle's Autoupdate) first, then nested bundles deepest first
#      (frameworks, CEF helper apps, XPC services), then the application - each with
#      --options runtime (hardened runtime) and --timestamp, and with the entitlements
#      listed in entitlements_for() below;
#   3. checks that every Mach-O now carries the hardened runtime flag (and a secure
#      timestamp unless ad-hoc), then codesign --verify --deep --strict;
#   4. spctl --assess (reported; it can only pass for a notarized Developer ID app);
#   5. ditto zip -> xcrun notarytool submit --wait -> xcrun stapler staple -> stapler
#      validate -> spctl --assess again, which must now pass;
#   6. optionally the .pkg and the .dmg, the same way.
#
# Exit status: 0 when every step that was asked for passed. In ad-hoc mode the Gatekeeper
# rejection is expected and reported, not an error.

set -euo pipefail

HERE=$(cd "$(dirname "$0")" && pwd)
APP=""
DMG=""
IDENTITY="${RD_SIGN_IDENTITY:-}"
KEYCHAIN="${RD_KEYCHAIN:-}"
NOTARIZE=1
PKG=0
OUT="$HERE/build"
ENT_DIR="$HERE/entitlements"

usage() { sed -n '3,30p' "$0" | sed 's/^# \{0,1\}//' >&2; exit 2; }

while [ $# -gt 0 ]; do
	case "$1" in
		--app)          APP="$2"; shift 2 ;;
		--dmg)          DMG="$2"; shift 2 ;;
		--identity)     IDENTITY="$2"; shift 2 ;;
		--keychain)     KEYCHAIN="$2"; shift 2 ;;
		--no-notarize)  NOTARIZE=0; shift ;;
		--pkg)          PKG=1; shift ;;
		--out)          OUT="$2"; shift 2 ;;
		--entitlements) ENT_DIR="$2"; shift 2 ;;
		-h|--help)      usage ;;
		*) echo "unknown option: $1" >&2; usage ;;
	esac
done

step() { printf '\n== %s\n' "$*"; }
die() { echo "sign_and_notarize: $*" >&2; exit 1; }

[ -n "$APP" ] || [ -n "$DMG" ] || usage
[ -n "$IDENTITY" ] || die "no signing identity: pass --identity or set RD_SIGN_IDENTITY (\"-\" = ad-hoc)"

ADHOC=0
[ "$IDENTITY" = "-" ] && ADHOC=1
if [ $ADHOC = 1 ]; then
	TIMESTAMP="--timestamp=none"   # Apple's timestamp service only countersigns real identities
	NOTARIZE=0
	echo "ad-hoc signature: hardened runtime and entitlements are real, but there is no"
	echo "certificate, no timestamp and no notarization; Gatekeeper will reject the result."
else
	TIMESTAMP="--timestamp"
fi

KC_ARGS=()
[ -n "$KEYCHAIN" ] && KC_ARGS=(--keychain "$KEYCHAIN")

TMP=$(mktemp -d "${TMPDIR:-/tmp}/rd-sign.XXXXXX")
trap 'rm -rf "$TMP"' EXIT

# --------------------------------------------------------------------------- preflight

if [ $ADHOC = 0 ]; then
	security find-identity -v -p codesigning ${KEYCHAIN:+"$KEYCHAIN"} | grep -qF "$IDENTITY" \
		|| die "identity \"$IDENTITY\" is not in the keychain (security find-identity -v -p codesigning)"
fi

NOTARY_ARGS=()
notary_credentials() {
	if [ -n "${RD_NOTARY_PROFILE:-}" ]; then
		NOTARY_ARGS=(--keychain-profile "$RD_NOTARY_PROFILE")
		[ -n "$KEYCHAIN" ] && NOTARY_ARGS+=(--keychain "$KEYCHAIN")
		return
	fi
	[ -n "${RD_NOTARY_KEY_ID:-}" ] && [ -n "${RD_NOTARY_ISSUER:-}" ] \
		|| die "notarization needs RD_NOTARY_KEY_ID and RD_NOTARY_ISSUER (or RD_NOTARY_PROFILE), or --no-notarize"
	local key="${RD_NOTARY_KEY_PATH:-}"
	if [ -z "$key" ]; then
		[ -n "${RD_NOTARY_KEY:-}" ] || die "notarization needs RD_NOTARY_KEY_PATH or RD_NOTARY_KEY"
		key="$TMP/AuthKey_${RD_NOTARY_KEY_ID}.p8"
		( umask 077
		  case "$RD_NOTARY_KEY" in
			*"BEGIN PRIVATE KEY"*) printf '%s\n' "$RD_NOTARY_KEY" > "$key" ;;
			*) printf '%s' "$RD_NOTARY_KEY" | base64 -D > "$key" ;;
		  esac )
		grep -q "BEGIN PRIVATE KEY" "$key" || die "RD_NOTARY_KEY is neither a .p8 PEM nor base64 of one"
	fi
	[ -f "$key" ] || die "no notary key at $key"
	NOTARY_ARGS=(--key "$key" --key-id "$RD_NOTARY_KEY_ID" --issuer "$RD_NOTARY_ISSUER")
}
if [ $NOTARIZE = 1 ]; then notary_credentials; fi

# ----------------------------------------------------------------------- entitlements

# Per-binary entitlements; the comment in each entitlements file says why it is there.
# Paths are relative to the app bundle. Everything not listed is signed with the
# hardened runtime and no entitlements (libraries ignore entitlements anyway).
entitlements_for() {
	case "$1" in
		"")                                               echo "$ENT_DIR/app.entitlements" ;;
		*"/editors_helper (Renderer).app")                echo "$ENT_DIR/helper-renderer.entitlements" ;;
		*"/editors_helper (GPU).app")                     echo "$ENT_DIR/helper-gpu.entitlements" ;;
		*"/editors_helper (Plugin).app")                  echo "$ENT_DIR/helper-plugin.entitlements" ;;
		*"/editors_helper.app"|*"/editors_helper ("*").app") echo "" ;;
		Contents/Resources/converter/x2t)                 echo "$ENT_DIR/x2t.entitlements" ;;
		*/org.sparkle-project.Downloader.xpc)             echo "$ENT_DIR/sparkle-downloader.entitlements" ;;
		*)                                                echo "" ;;
	esac
}

for f in "$ENT_DIR"/*.entitlements; do
	plutil -lint -s "$f" || die "bad entitlements file $f"
	# get-task-allow (debugger attach) is refused by the notary service.
	if /usr/libexec/PlistBuddy -c "Print :com.apple.security.get-task-allow" "$f" >/dev/null 2>&1; then
		die "$f has com.apple.security.get-task-allow; notarization rejects it"
	fi
done

# -------------------------------------------------------------------------- signing

# Library validation (on by default under the hardened runtime) only lets a process map
# code signed by Apple or by its own Team ID. Under a Developer ID every binary here
# carries our Team ID, so the release entitlements do not disable it. An ad-hoc signature
# has no Team ID at all, so there every process would refuse its own frameworks ("mapping
# process and mapped file (non-platform) have different Team IDs"). In ad-hoc mode only,
# executables therefore also get disable-library-validation, standing in for the shared
# Team ID; everything else about the runtime stays as it will ship.
adhoc_entitlements() {  # adhoc_entitlements <entitlements or empty> -> merged copy
	local out="$TMP/adhoc.$RANDOM$RANDOM.entitlements" key=":com.apple.security.cs.disable-library-validation"
	if [ -n "$1" ]; then cp "$1" "$out"; fi
	/usr/libexec/PlistBuddy -c "Delete $key" "$out" >/dev/null 2>&1 || true
	/usr/libexec/PlistBuddy -c "Add $key bool true" "$out" >/dev/null
	echo "$out"
}

is_executable_code() {  # a bundle (app, xpc, the application) or a loose executable
	if [ -d "$1" ]; then
		case "$1" in *.app|*.xpc) return 0 ;; *) return 1 ;; esac   # else a framework version
	fi
	case "$1" in *.dylib|*.so) return 1 ;; esac
	[ -x "$1" ]
}

sign() {  # sign <path> <entitlements or empty> [extra codesign args]
	local path="$1" ent="$2" note=""; shift 2
	if [ -n "$ent" ]; then note="  [$(basename "$ent")]"; fi
	if [ $ADHOC = 1 ] && is_executable_code "$path"; then
		ent=$(adhoc_entitlements "$ent")
		note="$note  [ad-hoc: +disable-library-validation]"
	fi
	local args=(--force --sign "$IDENTITY" --options runtime "$TIMESTAMP" "${KC_ARGS[@]+"${KC_ARGS[@]}"}")
	if [ -n "$ent" ]; then args+=(--entitlements "$ent"); fi
	codesign "${args[@]}" "$@" "$path" 2>&1 | grep -v ": replacing existing signature$" || true
	codesign --verify --strict "$path" || die "signature of $path does not verify"
	printf '  signed %s%s\n' "${path#"$APP"/}" "$note"
}

depth() { awk -F/ '{print NF "\t" $0}' | sort -rn -k1,1 | cut -f2-; }

sign_app() {
	[ -d "$APP/Contents" ] || die "no application bundle at $APP"
	APP=$(cd "$APP" && pwd)
	local plist="$APP/Contents/Info.plist"
	BUNDLE_ID=$(/usr/libexec/PlistBuddy -c "Print :CFBundleIdentifier" "$plist")
	local main_exe; main_exe=$(/usr/libexec/PlistBuddy -c "Print :CFBundleExecutable" "$plist")

	step "Preparing $APP ($BUNDLE_ID)"
	xattr -cr "$APP"

	# Every Mach-O, found by content. `file` prints one extra line per architecture of a
	# universal binary ("(for architecture x86_64)"); only the plain line is kept.
	( cd "$APP" && find . -type f -print0 | xargs -0 file --mime-type -0 ) \
		| tr '\0' '\t' | LC_ALL=C awk -F'\t' '$2 ~ /application\/x-mach-binary/ {sub(/^\.\//, "", $1); print $1}' \
		| grep -v '(for architecture ' > "$TMP/macho.txt" || true
	[ -s "$TMP/macho.txt" ] || die "no Mach-O files found in $APP"

	# Bundles with their own signature: frameworks (per version), apps, XPC services.
	( cd "$APP" && find . -type d \( -path '*.framework/Versions/*' -o -name '*.app' -o -name '*.xpc' \) -print ) \
		| sed 's|^\./||' \
		| grep -E '\.framework/Versions/[^/]+$|\.(app|xpc)$' | grep -v '/Versions/Current$' > "$TMP/bundles.txt" || true

	# A Mach-O is a bundle's main executable when it is <bundle>/Contents/MacOS/<x> of an
	# app/xpc, or <fw>.framework/Versions/<v>/<fw>; such files are signed with their bundle.
	: > "$TMP/loose.txt"
	while IFS= read -r m; do
		case "$m" in
			"Contents/MacOS/$main_exe") continue ;;
		esac
		local owned=0 b
		while IFS= read -r b; do
			case "$b" in
				*.app|*.xpc)
					if [ "$(dirname "$m")" = "$b/Contents/MacOS" ]; then owned=1; fi ;;
				*)
					local fw; fw=$(basename "${b%/Versions/*}" .framework)
					if [ "$m" = "$b/$fw" ]; then owned=1; fi ;;
			esac
			if [ $owned = 1 ]; then break; fi
		done < "$TMP/bundles.txt"
		if [ $owned = 0 ]; then echo "$m" >> "$TMP/loose.txt"; fi
	done < "$TMP/macho.txt"

	echo "$(wc -l < "$TMP/macho.txt" | tr -d ' ') Mach-O files: $(wc -l < "$TMP/loose.txt" | tr -d ' ') loose, $(wc -l < "$TMP/bundles.txt" | tr -d ' ') nested bundles + the app"

	step "Signing loose binaries (dylibs, converters, tools)"
	while IFS= read -r m; do
		local extra=()
		# A loose executable has no Info.plist, so codesign would name it after the file
		# (and ad-hoc signing appends a hash). Give it a stable identifier.
		if [ -x "$APP/$m" ]; then
			case "$m" in *.dylib|*.so) ;; *) extra=(--identifier "$BUNDLE_ID.$(basename "$m" | tr ' ' '-')") ;; esac
		fi
		sign "$APP/$m" "$(entitlements_for "$m")" "${extra[@]+"${extra[@]}"}"
	done < <(depth < "$TMP/loose.txt")

	step "Signing nested bundles, innermost first"
	while IFS= read -r b; do
		sign "$APP/$b" "$(entitlements_for "$b")"
	done < <(depth < "$TMP/bundles.txt")

	step "Signing the application"
	sign "$APP" "$(entitlements_for "")"

	step "Checking every Mach-O for the hardened runtime$( [ $ADHOC = 0 ] && echo ' and a secure timestamp')"
	local bad=0 info
	while IFS= read -r m; do
		info=$(codesign -dvv "$APP/$m" 2>&1)
		if ! grep -q 'flags=0x[0-9a-f]*(.*runtime' <<<"$info"; then echo "  NO RUNTIME: $m"; bad=1; fi
		if [ $ADHOC = 0 ] && ! grep -q '^Timestamp=' <<<"$info"; then echo "  NO TIMESTAMP: $m"; bad=1; fi
	done < "$TMP/macho.txt"
	[ $bad = 0 ] || die "some binaries lack the hardened runtime or a timestamp"
	echo "  all $(wc -l < "$TMP/macho.txt" | tr -d ' ') Mach-O files: runtime$( [ $ADHOC = 0 ] && echo ', timestamp') OK"

	step "codesign --verify --deep --strict"
	codesign --verify --deep --strict --verbose=2 "$APP"

	step "Entitlements as signed"
	while IFS= read -r m; do
		local e; e=$(codesign -d --entitlements :- "$APP/$m" 2>/dev/null | grep -o 'com\.apple\.[a-z.-]*' | tr '\n' ' ' || true)
		if [ -n "$e" ]; then echo "  $m: $e"; fi
	done < "$TMP/macho.txt"

	step "spctl --assess --type execute"
	if spctl --assess --type execute --verbose=4 "$APP" 2>&1; then
		echo "  Gatekeeper accepts it"
	else
		if [ $ADHOC = 1 ]; then
			echo "  rejected, as expected for an ad-hoc signature (needs a Developer ID + notarization)"
		elif [ $NOTARIZE = 1 ]; then
			echo "  rejected before notarization (\"Unnotarized Developer ID\" is expected here)"
		else
			echo "  rejected: not notarized (--no-notarize)"
		fi
	fi
}

# ---------------------------------------------------------------------- notarization

notarize() {  # notarize <file to submit> <what to staple>
	local submit="$1" staple="$2"
	step "notarytool submit $(basename "$submit") --wait"
	local json="$TMP/notary-$(basename "$submit").json"
	set +e
	xcrun notarytool submit "$submit" "${NOTARY_ARGS[@]}" --wait --output-format json > "$json"
	local rc=$?
	set -e
	cat "$json"; echo
	local status id
	status=$(plutil -extract status raw -o - "$json" 2>/dev/null || echo unknown)
	id=$(plutil -extract id raw -o - "$json" 2>/dev/null || echo "")
	if [ $rc != 0 ] || [ "$status" != "Accepted" ]; then
		[ -n "$id" ] && xcrun notarytool log "$id" "${NOTARY_ARGS[@]}" || true
		die "notarization of $(basename "$submit") ended with status \"$status\""
	fi
	[ -n "$id" ] && xcrun notarytool log "$id" "${NOTARY_ARGS[@]}" > "$OUT/notary-log-$(basename "$submit").json" 2>/dev/null || true

	step "stapler staple $(basename "$staple")"
	xcrun stapler staple "$staple"
	xcrun stapler validate "$staple"
}

# ----------------------------------------------------------------------------- main

mkdir -p "$OUT"

if [ -n "$APP" ]; then
	sign_app
	if [ $NOTARIZE = 1 ]; then
		ZIP="$OUT/$(basename "$APP" .app)-notarize.zip"
		ditto -c -k --sequesterRsrc --keepParent "$APP" "$ZIP"
		notarize "$ZIP" "$APP"
		rm -f "$ZIP"
		step "spctl --assess --type execute (after stapling)"
		spctl --assess --type execute --verbose=4 "$APP" || die "Gatekeeper still rejects the notarized app"
	fi

	if [ $PKG = 1 ]; then
		step "make_pkg.sh"
		PKG_ARGS=(--app "$APP" --out "$OUT")
		if [ $ADHOC = 1 ]; then
			echo "  (a package cannot be signed ad hoc; building it unsigned)"
		else
			[ -n "${RD_INSTALLER_IDENTITY:-}" ] || die "--pkg needs RD_INSTALLER_IDENTITY (\"Developer ID Installer: ...\")"
			PKG_ARGS+=(--sign "$RD_INSTALLER_IDENTITY")
		fi
		PKG_FILE=$("$HERE/make_pkg.sh" "${PKG_ARGS[@]}" | tail -1)
		echo "  $PKG_FILE"
		pkgutil --check-signature "$PKG_FILE" || true
		if [ $NOTARIZE = 1 ]; then
			notarize "$PKG_FILE" "$PKG_FILE"
			spctl --assess --type install --verbose=4 "$PKG_FILE" || die "Gatekeeper rejects the notarized package"
		fi
	fi
fi

if [ -n "$DMG" ]; then
	[ -f "$DMG" ] || die "no disk image at $DMG"
	[ $ADHOC = 0 ] || die "a disk image is only worth signing with a Developer ID"
	step "Signing $(basename "$DMG")"
	codesign --force --sign "$IDENTITY" --timestamp "${KC_ARGS[@]+"${KC_ARGS[@]}"}" "$DMG"
	codesign --verify --strict --verbose=2 "$DMG"
	if [ $NOTARIZE = 1 ]; then
		notarize "$DMG" "$DMG"
		spctl --assess --type open --context context:primary-signature --verbose=4 "$DMG" \
			|| die "Gatekeeper rejects the notarized disk image"
	fi
fi

step "Done"
