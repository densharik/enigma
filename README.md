# Enigma I: an interactive teardown

Interactive explainer of the Wehrmacht Enigma I cipher machine, in Russian and English: a working 3D model, the real
current path, rotor stepping and ring settings, the reflector flaw, keyspace, crib dragging and a full simulator
(checked against a real radio message of 7 July 1941).

Live: https://densharik.github.io/enigma/

```
npm install
npm run dev      # http://localhost:5173
npm run build    # static site in dist/
node tests/engine.test.js
```

- `src/enigma.js` cipher engine, `src/scene3d.js` three.js stage, `src/widgets.js` interactive widgets, `src/content.js` all text.
- The 3D model comes from a Blender scene built by scripts, compressed with meshopt (`public/models/enigma.glb`).
- Photos: Wikimedia Commons, free licences, credited on the page (see `src/images.json`).
