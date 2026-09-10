#!/usr/bin/env bash
#
# Ration Docs — Licence, Attribution & Distribution gate.
#
# Runs against a BUILT artefact, not the source tree, because that is what
# reaches a user: a string can be correct in git and wrong in the bundle.
#
# The gate checks two directions, and both matter:
#
#   FORBIDDEN  ONLYOFFICE as *product identity* — bundle name, identifier,
#              update endpoints, upstream signing identity. These would make
#              Ration Docs claim to be ONLYOFFICE, or phone home to it.
#
#   REQUIRED   ONLYOFFICE as *upstream attribution* — the additional terms
#              oblige us to retain copyright notices and to let users identify
#              ONLYOFFICE as the original developer, that the build is
#              modified, and where to read the licence. Scrubbing every mention
#              is a licence breach, so their absence fails too.
#
# Usage:  audit-build.sh /path/to/Ration\ Docs.app
#         audit-build.sh /path/to/dist/RationDocs-9.4.0-arm64.dmg
set -uo pipefail

TARGET="${1:-}"
[ -n "$TARGET" ] || { echo "usage: $0 <path-to-.app|.dmg>" >&2; exit 2; }

FAILURES=0
MOUNTED=""

cleanup() { [ -n "$MOUNTED" ] && hdiutil detach "$MOUNTED" -quiet 2>/dev/null; }
trap cleanup EXIT

# A .dmg is mounted read-only and audited as the .app inside it, so the gate
# examines the artefact actually shipped rather than a build-tree copy.
if [[ "$TARGET" == *.dmg ]]; then
    MOUNTED=$(hdiutil attach "$TARGET" -nobrowse -readonly 2>/dev/null \
              | sed -n 's|.*\(/Volumes/.*\)$|\1|p' | tail -1)
    [ -n "$MOUNTED" ] || { echo "could not mount $TARGET" >&2; exit 2; }
    APP=$(find "$MOUNTED" -maxdepth 1 -name '*.app' | head -1)
else
    APP="$TARGET"
fi
[ -d "$APP" ] || { echo "no .app found at $TARGET" >&2; exit 2; }

PLIST="$APP/Contents/Info.plist"
plist() { /usr/libexec/PlistBuddy -c "Print :$1" "$PLIST" 2>/dev/null; }

pass() { printf '  \033[32mPASS\033[0m  %s\n' "$1"; }
fail() { printf '  \033[31mFAIL\033[0m  %s\n' "$1"; FAILURES=$((FAILURES+1)); }

echo
echo "Ration Docs compliance gate"
echo "  artefact: $(basename "$APP")"
echo "  version : $(plist CFBundleShortVersionString)"
echo

# ---------------------------------------------------------------- FORBIDDEN --
echo "FORBIDDEN — ONLYOFFICE as product identity"

[ "$(plist CFBundleName)" = "ONLYOFFICE" ] \
    && fail "CFBundleName is still ONLYOFFICE" \
    || pass "CFBundleName is $(plist CFBundleName)"

case "$(plist CFBundleIdentifier)" in
    *onlyoffice*|asc.*) fail "CFBundleIdentifier is $(plist CFBundleIdentifier)" ;;
    *)                  pass "CFBundleIdentifier is $(plist CFBundleIdentifier)" ;;
esac

case "$(basename "$APP")" in
    ONLYOFFICE.app) fail "bundle on disk is ONLYOFFICE.app" ;;
    *)              pass "bundle on disk is $(basename "$APP")" ;;
esac

# An update feed pointing upstream would replace a branded build with a stock
# one, discarding branding, dictionaries and any downstream work.
[ -n "$(plist SUFeedURL)" ] \
    && fail "SUFeedURL present: $(plist SUFeedURL)" \
    || pass "SUFeedURL absent"
[ -n "$(plist SUPublicEDKey)" ] \
    && fail "SUPublicEDKey present (upstream signing key)" \
    || pass "SUPublicEDKey absent"

for needle in \
    "download.onlyoffice.com" \
    "install/desktop/editors/mac" \
    "asc.onlyoffice.ONLYOFFICE"
do
    n=$(grep -rl --binary-files=text "$needle" "$APP" 2>/dev/null | wc -l | tr -d ' ')
    [ "$n" -gt 0 ] && fail "\"$needle\" found in $n file(s)" || pass "\"$needle\" absent"
done

# Upstream's Apple Developer Team ID must never appear in our signature.
if codesign -dvv "$APP" 2>&1 | grep -q "2WH24U26GJ"; then
    fail "signed with Ascensio team identifier 2WH24U26GJ"
else
    pass "not signed with the Ascensio team identifier"
fi

echo
# ----------------------------------------------------------------- REQUIRED --
echo "REQUIRED — ONLYOFFICE as upstream attribution"

# Additional terms §1: copyright and attribution notices must be retained.
n=$(grep -rl --binary-files=text "Ascensio System SIA" "$APP" 2>/dev/null | wc -l | tr -d ' ')
[ "$n" -gt 0 ] \
    && pass "Ascensio copyright retained ($n file(s))" \
    || fail "no Ascensio copyright notice anywhere — §1 requires retention"

# Additional terms §3(i)-(iii): the UI must let users identify the original
# developer, see that the build is modified, and reach the licence.
notices="$APP/Contents/Resources"
grep -rqi --binary-files=text "based on ONLYOFFICE\|original software developed by" "$notices" 2>/dev/null \
    && pass "upstream attribution string present (§3 i)" \
    || fail "no \"based on ONLYOFFICE\" attribution — §3(i) requires it"

# Deliberately NOT a bare "modified version": that phrase occurs in the bundled
# AGPL text itself, so a loose match passes on the licence file alone and the
# gate waves through a build carrying no notice of its own. §2 also requires a
# date, so require an attributed notice naming the modifier.
grep -rqiE --binary-files=text "modified by (stackchase|ration)" "$notices" 2>/dev/null \
    && pass "modification notice attributed to Stackchase (§2, §3 ii)" \
    || fail "no attributed modification notice — §2 requires it, naming us, with date"

grep -rqi --binary-files=text "Affero General Public License\|AGPL" "$notices" 2>/dev/null \
    && pass "licence information reachable (§3 iii)" \
    || fail "no AGPL licence information — §3(iii) requires it"

# AGPL §6: a binary offered for download must carry directions to the
# Corresponding Source, at no further charge.
# Third trap, and the subtlest: matching any URL containing "source" passed on
# hunspell.sourceforge.net from a bundled dictionary README. AGPL s.6 wants
# directions to OUR Corresponding Source, so require a URL on a domain we
# control. This correctly fails until that source release actually exists.
grep -rqiE --binary-files=text "https?://[^ \"'<]*(stackchase|ration\\.works|rationdocs)[^ \"'<]*" "$notices" 2>/dev/null \
    && pass "Corresponding Source published on a Stackchase-controlled URL (AGPL s.6)" \
    || fail "no Stackchase-hosted Corresponding Source URL - AGPL s.6 requires directions to it"

echo
if [ "$FAILURES" -eq 0 ]; then
    echo "  gate: PASS — artefact may be released"
else
    echo "  gate: FAIL — $FAILURES check(s) failed; release blocked"
fi
echo
exit $([ "$FAILURES" -eq 0 ] && echo 0 || echo 1)
