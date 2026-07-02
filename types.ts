@tailwind base;
@tailwind components;
@tailwind utilities;

:root { color-scheme: light; }
* { box-sizing: border-box; }
body { margin: 0; background: #eef4f1; color: #0f172a; }
.glass { background: rgba(255,255,255,.78); backdrop-filter: blur(18px); border: 1px solid rgba(255,255,255,.65); }
.dark .glass { background: rgba(15,23,42,.72); border: 1px solid rgba(255,255,255,.10); }
