import type { FastifyReply, FastifyRequest } from 'fastify';
import type { NodeEnvironment } from '@meeverse/shared-contracts';
import { buildHealthResponse } from './health.service.js';
import config from '../config.js';

/**
 * Health controller
 * @param _request the request from the user (useless here)
 * @param reply the reply to send
 * @returns the reply containing health infos
 */
export const getHealthController = async (_request: FastifyRequest, reply: FastifyReply) => {
    const payload = buildHealthResponse({
        uptime: process.uptime(),
        environment: config.nodeEnv as NodeEnvironment,
        now: new Date(),
    });

    return reply.send(payload);
};
