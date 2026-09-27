import { defineConfig } from 'tsup';

export default defineConfig({
  entry: { server: 'src/server.ts', seed: 'src/db/seed.ts' },
  format: ['esm'],
  platform: 'node',
  target: 'node22',
  outDir: 'dist',
  clean: true,
  sourcemap: true,
  splitting: false,
  // `node:sqlite` only exists with the prefix.
  removeNodeProtocol: false,
  // Bundle everything (incl. the TS-source shared package) so the runtime image needs no node_modules.
  noExternal: [/.*/],
  // CJS deps inside an ESM bundle still call require() for Node builtins.
  banner: {
    js: "import { createRequire as __createRequire } from 'node:module'; const require = __createRequire(import.meta.url);",
  },
});
