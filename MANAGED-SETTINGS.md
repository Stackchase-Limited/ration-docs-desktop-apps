# Managed settings (administrators)

Settings an administrator can set for every user of a machine. Ration Docs
reads them once when it starts, so restart the app after changing them.

## Plugins

| Key | Type | Effect |
| --- | --- | --- |
| `DisablePlugins` | bool | No plugins at all: no Plugins tab, no plugin manager, the AI plugins are off too. Users cannot add plugins. |
| `DisablePluginManager` | bool | The plugin manager (and with it the plugin store) is hidden, and users cannot add plugins from a store link or a `.plugin` file. Plugins already installed keep working. |
| `DisabledPluginGUIDs` | list | These plugins are hidden and cannot be run, wherever they are installed. Write each one as `{GUID}`, `asc.{GUID}` or the bare GUID, in any case. In a single string, separate them with `;`, `,` or spaces. |

A plugin's GUID is the `guid` in its `config.json`. The plugins that ship with
the app:

| Plugin | GUID |
| --- | --- |
| Plugin Manager | `{AA2EA9B6-9EC2-415F-9762-634EE8D9A95E}` |
| AI | `{9DC93CDB-B576-4F0C-B55E-FCC9C48DD007}` |
| AI agent | `{9DC93CDB-B576-4F0C-B55E-FCC9C48DD777}` |
| Translator | `{7327FC95-16DA-41D9-9AF2-0E7F449F6800}` |
| Thesaurus | `{BE5CBF95-C0AD-4842-B157-AC40FEDD9840}` |
| Highlight code | `{BE5CBF95-C0AD-4842-B157-AC40FEDD9841}` |
| OCR | `{440EBF13-9B19-4BD8-8621-05200E58140B}` |
| Photo Editor | `{07FD8DFA-DFE0-4089-AL24-0730933CC80A}` |
| YouTube | `{38E022EA-AD92-45FC-B22B-49DF39746DB4}` |
| Send | `{B509123E-6335-40BD-B965-91EB799346E3}` |
| Encryption | `{FFF0E1EB-13DB-4678-B67D-FF0A41DBBCEF}` |

### Windows

Registry key `HKEY_LOCAL_MACHINE\SOFTWARE\Policies\Ration\RationDocs`. Booleans
are `REG_DWORD` (0 or 1). The list is a `REG_MULTI_SZ` (one GUID per line) or a
`REG_SZ`. Deploy it with Group Policy Preferences (Registry items) or:

```
reg add "HKLM\SOFTWARE\Policies\Ration\RationDocs" /v DisablePluginManager /t REG_DWORD /d 1 /f
reg add "HKLM\SOFTWARE\Policies\Ration\RationDocs" /v DisabledPluginGUIDs /t REG_MULTI_SZ /d "{9DC93CDB-B576-4F0C-B55E-FCC9C48DD007}\0{9DC93CDB-B576-4F0C-B55E-FCC9C48DD777}" /f
```

### macOS

Preferences domain `com.stackchase.rationdocs`. To enforce the settings, deploy
them with a configuration profile from your MDM (a custom settings payload for
that domain). Managed values take precedence over anything the user sets.

For a quick test without a profile (not enforced, because a user's own value
for the same key takes precedence):

```
sudo defaults write /Library/Preferences/com.stackchase.rationdocs DisablePluginManager -bool true
sudo defaults write /Library/Preferences/com.stackchase.rationdocs DisabledPluginGUIDs -array 9DC93CDB-B576-4F0C-B55E-FCC9C48DD007 9DC93CDB-B576-4F0C-B55E-FCC9C48DD777
```

`defaults` reads `{...}` as a dictionary, so either leave out the braces as
above or quote them: `'"{9DC93CDB-...}"'`.

### Linux

File `/etc/ration/docs/policy.conf`, one `Key=value` per line. Lines starting
with `#` are comments.

```
# /etc/ration/docs/policy.conf
DisablePluginManager=true
DisabledPluginGUIDs={9DC93CDB-B576-4F0C-B55E-FCC9C48DD007};{9DC93CDB-B576-4F0C-B55E-FCC9C48DD777}
```

`true`, `1`, `yes` and `on` all mean true.

### The older switch

The older `pluginsDisabled` value in `HKLM\SOFTWARE\Ration\RationDocs` (Windows)
or `/etc/xdg/ration/RationDocs.conf` (Linux) still works, but its meaning is
inverted: `false` turns plugins off. Use `DisablePlugins` instead.
