import type { FastifyPluginAsync } from 'fastify';
import { getHealthController } from '../controllers/health.controller.js';

const healthRoute: FastifyPluginAsync = async (fastify) => {
    fastify.get('/health', getHealthController);
};

export default healthRoute;