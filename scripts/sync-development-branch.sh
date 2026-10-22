#!/usr/bin/env bash
# Run only in a disposable checkout: this script switches its working branch.
set -euo pipefail

release_sha=${1:?Release squash commit required}
release_head=${2:?Released develop head required}
release_pr=${3:?Release PR number required}

if [[ ! "$release_sha" =~ ^[0-9a-f]{40}$ || ! "$release_head" =~ ^[0-9a-f]{40}$ || ! "$release_pr" =~ ^[0-9]+$ ]]; then
  echo 'Invalid release metadata' >&2
  exit 1
fi

for attempt in 1 2 3; do
  git fetch --no-tags origin \
    main:refs/remotes/origin/main develop:refs/remotes/origin/develop
  git merge-base --is-ancestor "$release_sha" origin/main
  git merge-base --is-ancestor "$release_head" origin/develop
  # The squash must contain exactly the released tree before keeping develop's tree.
  git diff --exit-code "$release_head^{tree}" "$release_sha^{tree}" --

  if git merge-base --is-ancestor "$release_sha" origin/develop; then
    echo 'develop already contains this release'
    exit 0
  fi

  git checkout -B sync-development origin/develop
  git merge --no-ff --strategy=ours "$release_sha" \
    -m "chore: sync main into develop after release #$release_pr"
  if git push origin HEAD:refs/heads/develop; then
    exit 0
  fi
  echo "Push rejected (attempt $attempt); fetching develop again" >&2
done

echo 'Could not synchronize develop; rerun the failed workflow after checking branch rules' >&2
exit 1
