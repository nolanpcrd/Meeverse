import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma.js';
import type { CreateUserInput } from '@meeverse/shared-contracts';

/**
 * Authentication service
 */
export class AuthService {
    /**
     * Register method
     * @param input the user's input (should be a CreateUserInput)
     * @returns the user's id, username and email
     */
    async register(input: CreateUserInput) {
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [{ email: input.email }, { username: input.username }],
            },
        });

        if (existingUser) {
            if (existingUser.email === input.email) {
                throw new Error('Email already in use');
            }
            throw new Error('Username already taken');
        }

        const hashedPassword = input.password ? await bcrypt.hash(input.password, 12) : null;

        const user = await prisma.user.create({
            data: {
                email: input.email,
                username: input.username,
                displayName: input.displayName,
                password: hashedPassword,
            },
        });

        return { id: user.id, email: user.email, username: user.username };
    }

    /**
     * Verify password method
     * @param user the user object containing the password
     * @param password the password to verify
     * @returns true if the password matches
     */
    async verifyPassword(user: { password: string | null }, password: string) {
        if (!user.password) {
            throw new Error('No password set for this account');
        }
        return bcrypt.compare(password, user.password);
    }

    /**
     * Find user by email method
     * @param email the user's email
     * @returns the user if found (if not, null)
     */
    async findUserByEmail(email: string) {
        return prisma.user.findUnique({ where: { email } });
    }

    /**
     * Find user by id method
     * @param id the user's id
     * @returns the user if found (if not, null)
     */
    async findUserById(id: string) {
        return prisma.user.findUnique({ where: { id } });
    }

    /**
     * Check if OAuth user exists
     * @param provider the OAuth provider
     * @param providerAccountId the OAuth account id
     * @returns the account with user if found (if not, null)
     */
    async oauthUserExists(provider: string, providerAccountId: string) {
        return prisma.account.findUnique({
            where: {
                provider_providerAccountId: { provider, providerAccountId },
            },
            include: { user: true },
        });
    }

    /**
     * Create OAuth user method
     * @param data the OAuth user data
     * @returns the user's id, username and email
     */
    async createOAuthUser(data: {
        provider: string;
        providerAccountId: string;
        email: string;
        username: string;
        displayName: string;
        avatarUrl?: string | null;
        accessToken?: string | null;
        refreshToken?: string | null;
    }) {
        const existingEmail = await prisma.user.findUnique({
            where: { email: data.email },
        });

        if (existingEmail) {
            await prisma.account.create({
                data: {
                    userId: existingEmail.id,
                    provider: data.provider,
                    providerAccountId: data.providerAccountId,
                    accessToken: data.accessToken,
                    refreshToken: data.refreshToken,
                },
            });

            return { id: existingEmail.id, email: existingEmail.email, username: existingEmail.username };
        }

        const user = await prisma.user.create({
            data: {
                email: data.email,
                username: data.username,
                displayName: data.displayName,
                avatarUrl: data.avatarUrl,
                accounts: {
                    create: {
                        provider: data.provider,
                        providerAccountId: data.providerAccountId,
                        accessToken: data.accessToken,
                        refreshToken: data.refreshToken,
                    },
                },
            },
        });

        return { id: user.id, email: user.email, username: user.username };
    }
}

export const authService = new AuthService();
