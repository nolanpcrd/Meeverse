import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { getHealthController } from './health.controller.js';

/**
 * Health routes
 * @param app the fastify instance
 */
export default async function healthRoutes(app: FastifyInstance) {
    /**
     * Health check route
     */
    app.get('/health', async (_request: FastifyRequest, reply: FastifyReply) => {
        return getHealthController(_request, reply);
    });
}
