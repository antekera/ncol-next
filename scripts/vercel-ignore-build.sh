#!/usr/bin/env bash
# Runs inside Vercel's build container. Referenced by
# Dashboard → Project Settings → Git → Ignored Build Step:
#   bash scripts/vercel-ignore-build.sh
#
# Exit 0 → skip build. Exit 1 → proceed with build.

set -euo pipefail

msg="${VERCEL_GIT_COMMIT_MESSAGE:-}"
ref="${VERCEL_GIT_COMMIT_REF:-}"

if [[ "$msg" == build\(deps\)* ]] \
  || [[ "$msg" == build\(deps-dev\)* ]] \
  || [[ "$ref" == dependabot/* ]] \
  || [[ "$ref" == renovate/* ]]; then
  echo "Skipping build — dependency-only change ($ref)"
  exit 0
fi

exit 1
