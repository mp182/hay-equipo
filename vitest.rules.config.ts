import { defineConfig } from 'vitest/config';

// Tests de las reglas de Firestore: necesitan el emulador corriendo (ver `npm run test:rules`).
export default defineConfig({
  test: {
    include: ['tests/rules/**/*.test.ts'],
    environment: 'node',
    fileParallelism: false,
    testTimeout: 20000,
    hookTimeout: 20000,
  },
});
