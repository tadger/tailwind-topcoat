#!/bin/sh
# Downloads Topcoat 0.8.0's compiled CSS into reference/ (gitignored). Visual reference only.
set -e
cd "$(dirname "$0")/.."
mkdir -p reference
for f in topcoat-desktop-light topcoat-desktop-dark topcoat-mobile-light topcoat-mobile-dark; do
  gh api "repos/topcoat/topcoat/contents/css/$f.css" --jq .content | base64 -d > "reference/$f.css"
done
echo "reference/ ready"
