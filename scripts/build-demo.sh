#!/bin/sh
# Builds demo/dist/{demo.css,index.html}. Run via `pnpm build:demo`.
set -e
cd "$(dirname "$0")/.."
mkdir -p demo/dist
pnpm exec tailwindcss -i demo/demo.css -o demo/dist/demo.css
cp demo/index.html demo/dist/index.html
