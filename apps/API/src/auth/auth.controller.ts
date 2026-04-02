import type { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';
import { authService, RegisterInput } from './auth.service.js';

/**
 * Authentication controller
 */
export class AuthController {
    /**
     * Register method
     * @param request the fastify request from the user (should contain a register input)
     * @param reply the reply to send
     * @returns the reply containing the user and the auth token (or an error)
     */
    async register(request: FastifyRequest<{ Body: RegisterInput }>, reply: FastifyReply) {
        try {
            const user = await authService.register(request.body);
            const token = reply.jwtSign({ userId: user.id, email: user.email });

            return reply.status(201).send({ user, token });
        } catch (err: any) {
            return reply.status(400).send({ error: err.message });
        }
    }

    /**
     * Login method
     * @param request the fastify request from the user (should contain an email + pwd)
     * @param reply the reply to send
     * @returns the reply containing the user and the auth token (or an error)
     */
    async login(request: FastifyRequest<{ Body: { email: string; password: string } }>, reply: FastifyReply) {
        try {
            const { email, password } = request.body;

            const user = await authService.findUserByEmail(email);
            if (!user) {
                return reply.status(401).send({ error: 'Invalid credentials' });
            }

            const valid = await authService.verifyPassword(user, password);
            if (!valid) {
                return reply.status(401).send({ error: 'Invalid credentials' });
            }

            const token = reply.jwtSign({ userId: user.id, email: user.email });

            return reply.send({
                user: { id: user.id, email: user.email, username: user.username },
                token,
            });
        } catch (err: any) {
            return reply.status(400).send({ error: err.message });
        }
    }

    /**
     * Get my profile method
     * @param request the request from the user (should contain a user with a userId)
     * @param reply the reply to send
     * @returns the reply containing the user (or an error)
     */
    async me(request: FastifyRequest, reply: FastifyReply) {
        try {
            const user = await authService.findUserById(request.user.userId);
            if (!user) {
                return reply.status(404).send({ error: 'User not found' });
            }

            return reply.send({
                id: user.id,
                email: user.email,
                username: user.username,
                displayName: user.displayName,
                bio: user.bio,
                avatarUrl: user.avatarUrl,
                createdAt: user.createdAt,
            });
        } catch (err: any) {
            return reply.status(400).send({ error: err.message });
        }
    }

    /**
     * Google OAuth callback
     * @param app the fastify instance
     * @param request the request from the user
     * @param reply the reply to send
     * @returns the reply containing the user and the auth token (or an error)
     */
    async googleCallback(app: FastifyInstance, request: FastifyRequest, reply: FastifyReply) {
        try {
            const oauth2Token = await (app as any).googleOAuth2.getAccessTokenFromAuthorizationCodeFlow(request);
            const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
                headers: { Authorization: `Bearer ${oauth2Token.token.access_token}` },
            });
            const googleUser = await response.json() as { id: string; email: string; name?: string; picture?: string };

            const username = googleUser.email?.split('@')[0] || `user_${googleUser.id}`;
            const user = await authService.createOAuthUser({
                provider: 'google',
                providerAccountId: googleUser.id,
                email: googleUser.email,
                username,
                displayName: googleUser.name || googleUser.email,
                avatarUrl: googleUser.picture,
                accessToken: oauth2Token.token.access_token,
            });

            const token = reply.jwtSign({ userId: user.id, email: user.email });
            return reply.send({ user, token });
        } catch (err: any) {
            return reply.status(400).send({ error: err.message });
        }
    }

    /**
     * Discord OAuth callback
     * @param app the fastify instance
     * @param request the request from the user
     * @param reply the reply to send
     * @returns the reply containing the user and the auth token (or an error)
     */
    async discordCallback(app: FastifyInstance, request: FastifyRequest, reply: FastifyReply) {
        try {
            const oauth2Token = await (app as any).discordOAuth2.getAccessTokenFromAuthorizationCodeFlow(request);
            const response = await fetch('https://discord.com/api/users/@me', {
                headers: { Authorization: `Bearer ${oauth2Token.token.access_token}` },
            });
            const discordUser = await response.json() as { id: string; email?: string; username: string; global_name?: string; avatar?: string };

            const user = await authService.createOAuthUser({
                provider: 'discord',
                providerAccountId: discordUser.id,
                email: discordUser.email || `discord_${discordUser.id}@placeholder.local`,
                username: discordUser.username,
                displayName: discordUser.global_name || discordUser.username,
                avatarUrl: discordUser.avatar ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png` : null,
                accessToken: oauth2Token.token.access_token,
            });

            const token = reply.jwtSign({ userId: user.id, email: user.email });
            return reply.send({ user, token });
        } catch (err: any) {
            return reply.status(400).send({ error: err.message });
        }
    }
}

export const authController = new AuthController();
