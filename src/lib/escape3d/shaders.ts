// ── Zellige — motif géométrique islamique à 8 branches ───────
export const zelligenVert = /* glsl */`
  varying vec2 vUv;
  varying vec3 vWorldPos;
  void main() {
    vUv = uv;
    vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const zelligeFrag = /* glsl */`
  varying vec2 vUv;
  uniform float uTime;

  #define PI  3.14159265359
  #define TAU 6.28318530718

  // Palette Yawmi
  #define COL_GREEN  vec3(0.020, 0.361, 0.247)   // #055C3F
  #define COL_GOLD   vec3(0.831, 0.686, 0.216)   // #D4AF37
  #define COL_WHITE  vec3(0.973, 0.957, 0.925)   // #F8F4EC
  #define COL_DARK   vec3(0.039, 0.059, 0.051)   // #0A0F0D
  #define COL_GROUT  vec3(0.055, 0.075, 0.063)

  // Distance à un segment
  float sdSeg(vec2 p, vec2 a, vec2 b) {
    vec2 pa = p - a, ba = b - a;
    float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
    return length(pa - ba * h);
  }

  // Etoile à n branches
  float sdStar(vec2 p, float r, float rf, int n) {
    float an = TAU / float(n);
    float en = TAU / float(n == 4 ? 8 : n);
    vec2 acs = vec2(cos(an * 0.5), sin(an * 0.5));
    vec2 ecs = vec2(cos(en * 0.5), sin(en * 0.5));
    float bn = mod(atan(p.y, p.x), an) - an * 0.5;
    p = length(p) * vec2(cos(bn), abs(sin(bn)));
    p -= r * acs;
    p += ecs * clamp(-dot(p, ecs), 0.0, r * acs.y / ecs.y);
    return length(p) * sign(p.x);
  }

  // Rotation
  vec2 rot(vec2 p, float a) {
    float c = cos(a), s = sin(a);
    return vec2(c*p.x - s*p.y, s*p.x + c*p.y);
  }

  void main() {
    vec2 uv = vUv * 6.0; // densité des tuiles

    // Grille principale (tuiles carrées)
    vec2 cell = floor(uv);
    vec2 local = uv - cell - 0.5; // [-0.5, 0.5]

    // Décalage en damier pour variation
    float checker = mod(cell.x + cell.y, 2.0);

    // Etoile à 8 branches au centre
    vec2 p = local;
    if (checker > 0.5) p = rot(p, PI * 0.25);

    float star = sdStar(p, 0.38, 0.5, 8);
    float ring = abs(star) - 0.03;

    // Losanges secondaires (connectent les étoiles)
    vec2 p2 = rot(local, PI * 0.125);
    float oct = sdStar(p2, 0.22, 0.6, 4);

    // Grille fine de joints (grout lines)
    vec2 gridUv = fract(uv * 1.0);
    float groutX = smoothstep(0.97, 1.0, gridUv.x) + smoothstep(0.03, 0.0, gridUv.x);
    float groutY = smoothstep(0.97, 1.0, gridUv.y) + smoothstep(0.03, 0.0, gridUv.y);
    float grout = max(groutX, groutY);

    // Composition des couches
    vec3 col = COL_WHITE;                                  // fond blanc
    col = mix(col, COL_GREEN, step(0.0, -oct) * 0.9);     // losanges verts
    col = mix(col, COL_GOLD,  step(0.0, -star) * 0.85);   // étoiles dorées
    col = mix(col, COL_WHITE, step(0.0, -ring) * 0.4);    // contour étoile
    col = mix(col, COL_GROUT, grout * 0.8);               // joints

    // Légère variation d'usure (bruit simple)
    float noise = fract(sin(dot(cell, vec2(127.1, 311.7))) * 43758.5);
    col *= 0.92 + noise * 0.12;

    // Reflet doré subtil animé
    float shine = sin(uTime * 0.3 + dot(cell, vec2(1.3, 0.7))) * 0.5 + 0.5;
    col += COL_GOLD * 0.04 * shine * step(0.0, -star);

    gl_FragColor = vec4(col, 1.0);
  }
`;

// ── Eau — reflets et ondes ────────────────────────────────────
export const waterVert = /* glsl */`
  uniform float uTime;
  varying vec2  vUv;
  varying vec3  vNormal;
  varying vec3  vViewDir;

  void main() {
    vUv = uv;
    vec3 pos = position;

    // Ondulations
    float wave = sin(pos.x * 3.0 + uTime * 1.8) * 0.018
               + sin(pos.z * 2.5 + uTime * 1.3) * 0.022
               + sin((pos.x + pos.z) * 4.0 + uTime * 2.1) * 0.010;
    pos.y += wave;

    // Normale calculée depuis le gradient
    float dx = cos(pos.x * 3.0 + uTime * 1.8) * 0.054
             + cos((pos.x + pos.z) * 4.0 + uTime * 2.1) * 0.040;
    float dz = cos(pos.z * 2.5 + uTime * 1.3) * 0.055
             + cos((pos.x + pos.z) * 4.0 + uTime * 2.1) * 0.040;
    vNormal = normalize(vec3(-dx, 1.0, -dz));

    vec4 worldPos = modelMatrix * vec4(pos, 1.0);
    vViewDir = normalize(cameraPosition - worldPos.xyz);

    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

export const waterFrag = /* glsl */`
  uniform float uTime;
  varying vec2  vUv;
  varying vec3  vNormal;
  varying vec3  vViewDir;

  void main() {
    // Fresnel
    float fresnel = pow(1.0 - max(dot(vNormal, vViewDir), 0.0), 3.0);

    // Couleur eau : bleu-vert nuit + reflet doré
    vec3 deep    = vec3(0.02, 0.12, 0.18);
    vec3 shallow = vec3(0.08, 0.35, 0.45);
    vec3 gold    = vec3(0.83, 0.69, 0.22);

    vec3 waterCol = mix(deep, shallow, fresnel * 0.7);

    // Highlights animés (lumière lanternes)
    float spec = pow(max(dot(reflect(-normalize(vec3(1.0, 2.0, 1.0)), vNormal), vViewDir), 0.0), 32.0);
    waterCol += gold * spec * 0.6;

    // Petites étincelles
    float sparkle = fract(sin(dot(vUv * 40.0 + uTime * 0.2, vec2(127.1, 311.7))) * 43758.5);
    waterCol += gold * step(0.98, sparkle) * 0.5;

    gl_FragColor = vec4(waterCol, 0.82);
  }
`;

// ── Ciel étoilé ───────────────────────────────────────────────
export const skyVert = /* glsl */`
  varying vec3 vDir;
  void main() {
    vDir = normalize(position);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const skyFrag = /* glsl */`
  varying vec3 vDir;
  uniform float uTime;

  float hash(vec3 p) {
    p = fract(p * vec3(443.8975, 397.2973, 491.1871));
    p += dot(p.zxy, p.yxz + 19.19);
    return fract(p.x * p.y * p.z);
  }

  void main() {
    vec3 d = normalize(vDir);

    // Gradient de ciel nocturne
    float horizon = pow(1.0 - abs(d.y), 3.0);
    vec3 nightTop    = vec3(0.012, 0.020, 0.055);
    vec3 nightHoriz  = vec3(0.025, 0.040, 0.080);
    vec3 col = mix(nightTop, nightHoriz, horizon);

    // Lueur orangée à l'horizon (lanternes / médina)
    float glow = pow(max(0.0, 1.0 - abs(d.y) * 6.0), 2.0);
    col += vec3(0.25, 0.12, 0.03) * glow * 0.4;

    // Etoiles
    vec3 cell = floor(d * 180.0);
    float star = hash(cell);
    float twinkle = 0.5 + 0.5 * sin(uTime * 2.0 + star * 63.7);
    float brightness = step(0.94, star) * twinkle;
    col += vec3(0.9, 0.92, 1.0) * brightness * max(d.y, 0.0);

    // Croissant de lune stylisé
    vec2 moon = vec2(atan(d.z, d.x) / 3.14159 * 0.5, d.y);
    float dist = length(moon - vec2(0.35, 0.55));
    float distInner = length(moon - vec2(0.38, 0.55));
    float crescent = smoothstep(0.07, 0.06, dist) - smoothstep(0.06, 0.05, distInner);
    col += vec3(0.95, 0.90, 0.70) * crescent * 0.8;

    gl_FragColor = vec4(col, 1.0);
  }
`;

// ── Lanterne — paroi translucide avec motif arabesque ─────────
export const lanternFrag = /* glsl */`
  varying vec2 vUv;
  uniform float uTime;
  uniform vec3  uColor;
  uniform float uPulse;

  float arabesque(vec2 uv) {
    uv = fract(uv * 3.0) - 0.5;
    float d1 = length(uv) - 0.3;
    float d2 = abs(length(uv - vec2(0.3, 0.0)) - 0.15);
    float d3 = abs(length(uv + vec2(0.3, 0.0)) - 0.15);
    return min(abs(d1), min(abs(d2), abs(d3)));
  }

  void main() {
    float pattern = arabesque(vUv);
    float mask = smoothstep(0.04, 0.01, pattern);
    float pulse = 0.7 + 0.3 * sin(uTime * 2.5) * uPulse;
    vec3 col = uColor * (0.6 + mask * 0.4) * pulse;
    float alpha = 0.4 + mask * 0.35;
    gl_FragColor = vec4(col, alpha);
  }
`;

export const lanternVert = /* glsl */`
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// ── Avatar — silhouette stylisée avec contour lumineux ────────
export const avatarFrag = /* glsl */`
  varying vec3 vNormal;
  varying vec3 vViewDir;
  uniform vec3 uColor;
  uniform float uTime;

  void main() {
    float rim = 1.0 - max(dot(normalize(vNormal), normalize(vViewDir)), 0.0);
    rim = pow(rim, 2.5);

    vec3 base = uColor * 0.15;                    // corps sombre
    vec3 glow = uColor * rim * 1.6;               // halo coloré sur les bords
    float pulse = 0.85 + 0.15 * sin(uTime * 1.8);

    gl_FragColor = vec4((base + glow) * pulse, 0.95);
  }
`;

export const avatarVert = /* glsl */`
  varying vec3 vNormal;
  varying vec3 vViewDir;
  void main() {
    vNormal  = normalize(normalMatrix * normal);
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vViewDir = normalize(cameraPosition - worldPos.xyz);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
