import Fastify from 'fastify';
import sensible from '@fastify/sensible';
import healthRoute from './routes/health.js';

export function buildApp() {
    const app = Fastify({
        logger: true,
    });

    app.register(sensible);

    app.register(healthRoute, { prefix: '/api' });

    return app;
}