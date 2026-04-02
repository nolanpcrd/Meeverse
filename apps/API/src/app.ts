import Fastify from 'fastify';
import sensible from '@fastify/sensible';
import cors from '@fastify/cors';
import fastifyJwt from '@fastify/jwt';
import fastifyOAuth2 from '@fastify/oauth2';
import healthRoutes from './health/health.routes.js';
import authRoutes from './auth/auth.routes.js';
import config from './config.js';

const GOOGLE_AUTH_CONFIG = {
    tokenHost: 'https://oauth2.googleapis.com',
    tokenPath: '/token',
    authorizeHost: 'https://accounts.google.com',
    authorizePath: '/o/oauth2/v2/auth',
};

const DISCORD_AUTH_CONFIG = {
    tokenHost: 'https://discord.com',
    tokenPath: '/api/oauth2/token',
    authorizeHost: 'https://discord.com',
    authorizePath: '/api/oauth2/authorize',
};

/**
 * builds app and listeners
 * @returns the app (fastify instance)
 */
export function buildApp() {
    const app = Fastify({
        logger: true,
    });

    app.register(sensible);
    app.register(cors);

    app.register(fastifyJwt, {
        secret: config.jwtSecret,
        sign: { expiresIn: '365d' },
    });

    app.register(fastifyOAuth2, {
        name: 'googleOAuth2',
        scope: ['profile', 'email'],
        credentials: {
            client: {
                id: config.googleClientId,
                secret: config.googleClientSecret,
            },
            auth: GOOGLE_AUTH_CONFIG,
        },
        callbackUri: process.env.GOOGLE_CALLBACK_URI || 'http://localhost:3000/api/auth/google/callback',
        callbackUriParams: { prompt: 'consent' },
    });

    app.register(fastifyOAuth2, {
        name: 'discordOAuth2',
        scope: ['identify', 'email'],
        credentials: {
            client: {
                id: config.discordClientId,
                secret: config.discordClientSecret,
            },
            auth: DISCORD_AUTH_CONFIG,
        },
        callbackUri: process.env.DISCORD_CALLBACK_URI || 'http://localhost:3000/api/auth/discord/callback',
    });

    app.register(healthRoutes, { prefix: '/api' });
    app.register(authRoutes, { prefix: '/api/auth' });

    return app;
}