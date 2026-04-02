import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { authController } from './auth.controller.js';

/**
 * Authentication routes
 * @param app the fastify instance
 */
export default async function authRoutes(app: FastifyInstance) {
    /**
     * Register route (with required schema)
     */
    app.post('/register', {
        schema: {
            body: {
                type: 'object',
                required: ['email', 'password', 'username', 'displayName'],
                properties: {
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string', minLength: 8 },
                    username: { type: 'string', minLength: 3, maxLength: 20 },
                    displayName: { type: 'string', minLength: 1, maxLength: 50 },
                },
            },
        },
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        return authController.register(request as any, reply);
    });

    /**
     * Login route with required schema
     */
    app.post('/login', {
        schema: {
            body: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string' },
                },
            },
        },
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        return authController.login(request as any, reply);
    });

    /**
     * Me (profile) route
     */
    app.get('/me', async (request: FastifyRequest, reply: FastifyReply) => {
        return authController.me(request, reply);
    });

    /**
     * Google OAuth start
     */
    app.get('/google', async (_request: FastifyRequest, reply: FastifyReply) => {
        return reply.redirect('/api/auth/google/callback');
    });

    /**
     * Google OAuth callback
     */
    app.get('/google/callback', async (request: FastifyRequest, reply: FastifyReply) => {
        return authController.googleCallback(app, request, reply);
    });

    /**
     * Discord OAuth start
     */
    app.get('/discord', async (_request: FastifyRequest, reply: FastifyReply) => {
        return reply.redirect('/api/auth/discord/callback');
    });

    /**
     * Discord OAuth callback
     */
    app.get('/discord/callback', async (request: FastifyRequest, reply: FastifyReply) => {
        return authController.discordCallback(app, request, reply);
    });
}
