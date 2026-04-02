import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        globals: true,
        environment: 'node',
        include: ['src/**/*.test.ts'],
        coverage: {
            provider: 'v8',
            include: ['src/**/*.ts', '!src/**/*.d.ts'],
            exclude: ['src/generated/**', 'src/server.ts'],
        },
    },
});
