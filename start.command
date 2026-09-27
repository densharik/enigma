#!/bin/zsh
# Double-click to open the Enigma site locally (builds once, then serves dist/ on http://localhost:4173)
cd "$(dirname "$0")"
[ -d node_modules ] || npm install
[ -d dist ] || npm run build
npx vite preview --port 4173 --open
