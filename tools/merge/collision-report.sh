#!/usr/bin/env bash
#
# Ration Docs - merge collision report.
#
# Two workstreams have been modifying this fork independently: one adding the
# home search, language registration and compliance work, another reskinning the
# product. Both branch from ONLYOFFICE upstream, so the safe way to combine them
# is to see the three-way picture BEFORE attempting a merge:
#
#   THEIRS ONLY   files only the incoming branch touches - these apply cleanly
#   OURS ONLY     files only our branch touches         - these apply cleanly
#   BOTH          the actual merge work                 - resolve by hand
#
# It also checks whether the incoming branch is based on 9.4 or on the older
# 9.3.1 line, because that determines whether this is a merge or a rebase first.
#
# Usage:  collision-report.sh <their-ref> [our-ref] [upstream-ref]
#         collision-report.sh origin/feature/reskin
set -uo pipefail

THEIRS="${1:-}"
OURS="${2:-ration/home-search}"
UPSTREAM="${3:-3ad4e294ae5e25902ccc56088a760ad21a9d123a}"   # ONLYOFFICE release/v9.4.0

[ -n "$THEIRS" ] || { echo "usage: $0 <their-ref> [our-ref] [upstream-ref]" >&2; exit 2; }
git rev-parse --verify "$THEIRS" >/dev/null 2>&1 || { echo "unknown ref: $THEIRS" >&2; exit 2; }
git rev-parse --verify "$OURS"   >/dev/null 2>&1 || { echo "unknown ref: $OURS"   >&2; exit 2; }

hr(){ printf '\n%s\n' "$1"; }

echo
echo "Merge collision report"
echo "  theirs   : $THEIRS  ($(git log -1 --format='%h %s' "$THEIRS" | cut -c1-58))"
echo "  ours     : $OURS  ($(git log -1 --format='%h %s' "$OURS" | cut -c1-58))"
echo "  upstream : $(git log -1 --format='%h %s' "$UPSTREAM" | cut -c1-46)"

# --- base check: merge or rebase first? -------------------------------------
hr "BASE"
BASE=$(git merge-base "$THEIRS" "$OURS")
echo "  common ancestor: $(git log -1 --format='%h %s' "$BASE" | cut -c1-58)"
if git merge-base --is-ancestor "$UPSTREAM" "$THEIRS" 2>/dev/null; then
    echo "  theirs is based on 9.4          -> straight three-way merge"
else
    echo "  theirs is NOT based on 9.4      -> rebase theirs onto 9.4 FIRST"
    echo "  (verify the replay is faithful: same files, same +/- counts, same binary sizes)"
fi

# --- the three sets ----------------------------------------------------------
T=$(mktemp); O=$(mktemp); trap 'rm -f "$T" "$O"' EXIT
git diff --name-only "$BASE" "$THEIRS" | sort > "$T"
git diff --name-only "$BASE" "$OURS"   | sort > "$O"

n_t=$(comm -23 "$T" "$O" | wc -l | tr -d ' ')
n_o=$(comm -13 "$T" "$O" | wc -l | tr -d ' ')
n_b=$(comm -12 "$T" "$O" | wc -l | tr -d ' ')

hr "SURFACE"
printf '  theirs only : %4s files  (apply cleanly)\n' "$n_t"
printf '  ours only   : %4s files  (apply cleanly)\n' "$n_o"
printf '  BOTH        : %4s files  (resolve by hand)\n' "$n_b"

if [ "$n_b" -gt 0 ]; then
    hr "COLLISIONS - resolve these"
    comm -12 "$T" "$O" | while read -r f; do
        # Binary assets are almost always "take theirs" in a reskin; source files
        # need a real look, so they are called out differently.
        case "$f" in
            *.png|*.jpg|*.icns|*.svg|*.imageset*|*.appiconset*)
                printf '    %-62s asset  -> likely take THEIRS\n' "$f" ;;
            *)
                tl=$(git diff --numstat "$BASE" "$THEIRS" -- "$f" | awk '{print $1"+/"$2"-"}')
                ol=$(git diff --numstat "$BASE" "$OURS"   -- "$f" | awk '{print $1"+/"$2"-"}')
                printf '    %-62s code   theirs %-10s ours %s\n' "$f" "$tl" "$ol" ;;
        esac
    done
fi

hr "OURS ONLY - must survive the merge"
comm -13 "$T" "$O" | sed 's/^/    /'

echo
echo "  Suggested order:"
echo "    1. rebase whichever branch is not on 9.4"
echo "    2. merge the reskin first (it is mostly additive asset replacement)"
echo "    3. replay our code changes on top, resolving only the BOTH set"
echo "    4. run tools/compliance/audit-build.sh against the resulting build"
echo
