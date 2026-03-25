import type { FastifyReply, FastifyRequest } from 'fastify';
import { buildHealthResponse } from '../services/health.service.js';
import config from '../config.js';

export const getHealthController = async (_request: FastifyRequest, reply: FastifyReply) => {
    const payload = buildHealthResponse({
        uptime: process.uptime(),
        environment: config.nodeEnv,
        now: new Date(),
    });

    return reply.send(payload);
};