#!/bin/sh
#
# #2477: an installer package (.pkg) of the macOS application, for deployment
# through MDM/management tools (Jamf, Munki, Intune, Kandji, `installer -pkg`),
# beside the disk image that fastlane/appdmg builds for people.
#
#   macos/make_pkg.sh [--app <path to Ration Docs.app>] [--out <dir>]
#                     [--sign "Developer ID Installer: <team>"]
#
# --app defaults to build/Release/Ration Docs.app - the bundle fastlane/resources/
# appdmg.json puts into the DMG, so both artefacts carry the same application.
# The result is <out>/Ration-Docs-<CFBundleShortVersionString>-<arch>.pkg, a
# product archive (distribution package) that installs the bundle into
# /Applications. Version, bundle identifier, architectures and the minimum macOS
# come from the bundle itself, not from this script.
#
# What it does not do: it signs the package only with --sign (a Developer ID
# Installer certificate; the application's own code signature is whatever the
# bundle already has) and it does not notarize (xcrun notarytool submit, then
# xcrun stapler staple). An unsigned package installs with `sudo installer -pkg`
# and through tools that run that command (Jamf policies, Munki), but the MDM
# InstallEnterpriseApplication command and Intune's macOS LOB apps require a
# signed one, and Finder/Gatekeeper refuses to open an unsigned downloaded .pkg
# until the quarantine attribute is cleared. Nothing here publishes anything.

set -e

HERE=$(cd "$(dirname "$0")" && pwd)
APP="$HERE/build/Release/Ration Docs.app"
OUT="$HERE/build"
SIGN=""

while [ $# -gt 0 ]; do
    case "$1" in
        --app)  APP="$2"; shift 2 ;;
        --out)  OUT="$2"; shift 2 ;;
        --sign) SIGN="$2"; shift 2 ;;
        *) echo "usage: $0 [--app <bundle.app>] [--out <dir>] [--sign <installer identity>]" >&2; exit 2 ;;
    esac
done

[ -d "$APP/Contents" ] || { echo "no application bundle at $APP" >&2; exit 1; }

PLIST="$APP/Contents/Info.plist"
plist() { /usr/libexec/PlistBuddy -c "Print :$1" "$PLIST" 2>/dev/null; }
BUNDLE_ID=$(plist CFBundleIdentifier)
VERSION=$(plist CFBundleShortVersionString)
EXECUTABLE=$(plist CFBundleExecutable)
MIN_OS=$(plist LSMinimumSystemVersion)
[ -n "$BUNDLE_ID" ] && [ -n "$VERSION" ] || { echo "$PLIST lacks CFBundleIdentifier/CFBundleShortVersionString" >&2; exit 1; }

# "arm64", "x86_64" or "arm64 x86_64" for a universal binary
ARCHS=$(lipo -archs "$APP/Contents/MacOS/$EXECUTABLE" 2>/dev/null || true)
case "$ARCHS" in
    *arm64*x86_64*|*x86_64*arm64*) ARCH_NAME=universal ;;
    "") ARCH_NAME=unknown ;;
    *) ARCH_NAME=$ARCHS ;;
esac

WORK=$(mktemp -d)
trap 'rm -rf "$WORK"' EXIT

# ditto keeps symlinks (the help images are deduplicated into relative symlinks),
# permissions, extended attributes and the code signature as they are in the bundle.
mkdir -p "$WORK/root"
ditto "$APP" "$WORK/root/$(basename "$APP")"

# Not relocatable: by default Installer moves the payload to wherever a bundle with
# the same identifier already is (a stray copy in ~/Downloads, a mounted DMG), so
# /Applications would be left with the old version. Always install into /Applications.
pkgbuild --analyze --root "$WORK/root" "$WORK/component.plist" >/dev/null
/usr/bin/plutil -replace 0.BundleIsRelocatable -bool NO "$WORK/component.plist"

pkgbuild --quiet \
    --root "$WORK/root" \
    --component-plist "$WORK/component.plist" \
    --identifier "$BUNDLE_ID.pkg" \
    --version "$VERSION" \
    --install-location /Applications \
    "$WORK/app.pkg"

# Distribution: productbuild --synthesize writes hostArchitectures="x86_64,arm64"
# whatever the payload holds. Set it to what the executable really contains, so an
# arm64 package refuses an Intel Mac rather than install an application that does
# not start there; and add the bundle's minimum macOS.
productbuild --synthesize --package "$WORK/app.pkg" "$WORK/distribution.xml" >/dev/null
if [ "$ARCH_NAME" != unknown ]; then
    HOST_ARCHS=$(echo "$ARCHS" | tr ' ' ',')
    sed -i '' "s|hostArchitectures=\"[^\"]*\"|hostArchitectures=\"$HOST_ARCHS\"|" "$WORK/distribution.xml"
fi
if [ -n "$MIN_OS" ]; then
    sed -i '' "s|</installer-gui-script>|    <allowed-os-versions><os-version min=\"$MIN_OS\"/></allowed-os-versions>\\
</installer-gui-script>|" "$WORK/distribution.xml"
fi

mkdir -p "$OUT"
PKG="$OUT/Ration-Docs-$VERSION-$ARCH_NAME.pkg"
set -- --distribution "$WORK/distribution.xml" --package-path "$WORK"
[ -n "$SIGN" ] && set -- "$@" --sign "$SIGN"
productbuild --quiet "$@" "$PKG"

echo "$PKG"
[ -n "$SIGN" ] || echo "note: $PKG is not signed (see --sign); MDM InstallEnterpriseApplication needs a signed package" >&2
