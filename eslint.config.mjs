import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    // react-hooks/immutability assumes useFrame callbacks follow React's
    // render model, but react-three-fiber's documented pattern is to mutate
    // Three.js objects (materials, meshes) directly per-frame to avoid
    // triggering re-renders — that's a deliberate escape hatch, not a bug.
    files: ["src/components/al-bayan/**/*.tsx", "src/components/maison-sagesse/world/**/*.tsx"],
    rules: {
      "react-hooks/immutability": "off",
    },
  },
]);

export default eslintConfig;
