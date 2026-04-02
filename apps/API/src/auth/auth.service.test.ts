import { describe, it, expect, vi, beforeEach } from 'vitest';
import bcrypt from 'bcryptjs';

/**
 * prisma mock
 */
vi.mock('../lib/prisma.js', () => ({
    prisma: {
        user: {
            findUnique: vi.fn(),
            findFirst: vi.fn(),
            create: vi.fn(),
        },
        account: {
            findUnique: vi.fn(),
            create: vi.fn(),
        },
    },
}));

import { prisma } from '../lib/prisma.js';
import { AuthService } from './auth.service.js';

const authService = new AuthService();

/**
 * a mock user type
 */
type MockUser = {
    id: string;
    email: string;
    username: string;
    displayName: string;
    password: string | null;
    bio: string | null;
    avatarUrl: string | null;
    createdAt: Date;
    updatedAt: Date;
    accounts: any[];
    posts: any[];
    comments: any[];
    yeahs: any[];
    communities: any[];
    followers: any[];
    following: any[];
    notifications: any[];
    sentNotifications: any[];
    reportsMade: any[];
    reportsAgainst: any[];
};

/**
 * creates a mock user
 * @param overrides other MockUser properties
 * @returns a MockUser
 */
const createMockUser = (overrides: Partial<MockUser> = {}): MockUser => ({
    id: 'user-123',
    email: 'test@example.com',
    username: 'testuser',
    displayName: 'Test User',
    password: null,
    bio: null,
    avatarUrl: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    accounts: [],
    posts: [],
    comments: [],
    yeahs: [],
    communities: [],
    followers: [],
    following: [],
    notifications: [],
    sentNotifications: [],
    reportsMade: [],
    reportsAgainst: [],
    ...overrides,
});

/**
 * Tests AuthService
 */
describe('AuthService', () => {
    // cleans mocks
    beforeEach(() => {
        vi.clearAllMocks();
    });

    // tests register method
    describe('register', () => {
        it('should create a new user with hashed password', async () => {
            const input = {
                email: 'test@example.com',
                password: 'password123',
                username: 'testuser',
                displayName: 'Test User',
            };

            vi.mocked(prisma.user.findFirst).mockResolvedValue(null);
            vi.mocked(prisma.user.create).mockResolvedValue(createMockUser({
                id: 'user-123',
                email: input.email,
                username: input.username,
                displayName: input.displayName,
            }));

            const result = await authService.register(input);

            expect(result.email).toBe(input.email);
            expect(result.username).toBe(input.username);
            expect(prisma.user.findFirst).toHaveBeenCalledWith({
                where: { OR: [{ email: input.email }, { username: input.username }] },
            });
            expect(prisma.user.create).toHaveBeenCalled();
        });

        it('should throw error if email already exists', async () => {
            const input = {
                email: 'existing@example.com',
                password: 'password123',
                username: 'newuser',
                displayName: 'New User',
            };

            vi.mocked(prisma.user.findFirst).mockResolvedValue(createMockUser({
                id: 'existing-user',
                email: input.email,
                username: 'existing',
                displayName: 'Existing',
            }));

            await expect(authService.register(input)).rejects.toThrow('Email already in use');
        });

        it('should throw error if username already taken', async () => {
            const input = {
                email: 'new@example.com',
                password: 'password123',
                username: 'existinguser',
                displayName: 'New User',
            };

            vi.mocked(prisma.user.findFirst).mockResolvedValue(createMockUser({
                id: 'existing-user',
                email: 'other@example.com',
                username: input.username,
                displayName: 'Existing',
            }));

            await expect(authService.register(input)).rejects.toThrow('Username already taken');
        });
    });

    // tests verify password method
    describe('verifyPassword', () => {
        it('should return true for valid password', async () => {
            const hashedPassword = await bcrypt.hash('password123', 12);
            const user = { password: hashedPassword };

            const result = await authService.verifyPassword(user, 'password123');

            expect(result).toBe(true);
        });

        it('should return false for invalid password', async () => {
            const hashedPassword = await bcrypt.hash('password123', 12);
            const user = { password: hashedPassword };

            const result = await authService.verifyPassword(user, 'wrongpassword');

            expect(result).toBe(false);
        });

        it('should throw error if no password set', async () => {
            const user = { password: null };

            await expect(authService.verifyPassword(user, 'password123')).rejects.toThrow(
                'No password set for this account'
            );
        });
    });

    // tests find user by email
    describe('findUserByEmail', () => {
        it('should return user when found', async () => {
            const mockUser = createMockUser({
                id: 'user-123',
                email: 'test@example.com',
                password: 'hashed',
            });

            vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser);

            const result = await authService.findUserByEmail('test@example.com');

            expect(result).toEqual(mockUser);
            expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
        });

        it('should return null when user not found', async () => {
            vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

            const result = await authService.findUserByEmail('nonexistent@example.com');

            expect(result).toBeNull();
        });
    });

    // tests OAuth user exists
    describe('oauthUserExists', () => {
        it('should return account with user when exists', async () => {
            const mockAccount = {
                id: 'acc-123',
                userId: 'user-123',
                provider: 'google',
                providerAccountId: 'google-123',
                accessToken: 'token',
                refreshToken: null,
                createdAt: new Date(),
                updatedAt: new Date(),
                user: createMockUser(),
            };

            vi.mocked(prisma.account.findUnique).mockResolvedValue(mockAccount as any);

            const result = await authService.oauthUserExists('google', 'google-123');

            expect(result).toEqual(mockAccount);
            expect(prisma.account.findUnique).toHaveBeenCalledWith({
                where: { provider_providerAccountId: { provider: 'google', providerAccountId: 'google-123' } },
                include: { user: true },
            });
        });
    });

    // tests create OAuth user
    describe('createOAuthUser', () => {
        const oauthInput = {
            provider: 'google',
            providerAccountId: 'google-456',
            email: 'oauth@example.com',
            username: 'oauthuser',
            displayName: 'OAuth User',
            avatarUrl: 'https://example.com/avatar.png',
            accessToken: 'access_token_123',
            refreshToken: 'refresh_token_456',
        };

        it('should create new user with OAuth data when email does not exist', async () => {
            vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
            vi.mocked(prisma.user.create).mockResolvedValue(createMockUser({
                id: 'oauth-user-123',
                email: oauthInput.email,
                username: oauthInput.username,
                displayName: oauthInput.displayName,
                avatarUrl: oauthInput.avatarUrl,
            }));

            const result = await authService.createOAuthUser(oauthInput);

            expect(result.email).toBe(oauthInput.email);
            expect(result.username).toBe(oauthInput.username);
            expect(prisma.user.create).toHaveBeenCalledWith({
                data: {
                    email: oauthInput.email,
                    username: oauthInput.username,
                    displayName: oauthInput.displayName,
                    avatarUrl: oauthInput.avatarUrl,
                    accounts: {
                        create: {
                            provider: oauthInput.provider,
                            providerAccountId: oauthInput.providerAccountId,
                            accessToken: oauthInput.accessToken,
                            refreshToken: oauthInput.refreshToken,
                        },
                    },
                },
            });
        });

        it('should link OAuth account to existing user when email already exists', async () => {
            const existingUser = createMockUser({
                id: 'existing-user-123',
                email: oauthInput.email,
                username: 'existing',
            });

            vi.mocked(prisma.user.findUnique).mockResolvedValue(existingUser);
            vi.mocked(prisma.account.create).mockResolvedValue({
                id: 'acc-existing',
                userId: existingUser.id,
                provider: oauthInput.provider,
                providerAccountId: oauthInput.providerAccountId,
                accessToken: oauthInput.accessToken,
                refreshToken: oauthInput.refreshToken,
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            const result = await authService.createOAuthUser(oauthInput);

            expect(result.id).toBe(existingUser.id);
            expect(result.email).toBe(existingUser.email);
            expect(prisma.account.create).toHaveBeenCalledWith({
                data: {
                    userId: existingUser.id,
                    provider: oauthInput.provider,
                    providerAccountId: oauthInput.providerAccountId,
                    accessToken: oauthInput.accessToken,
                    refreshToken: oauthInput.refreshToken,
                },
            });
            expect(prisma.user.create).not.toHaveBeenCalled();
        });
    });

    // tests find user by id
    describe('findUserById', () => {
        it('should return user when found', async () => {
            const mockUser = createMockUser({ id: 'user-456' });

            vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser);

            const result = await authService.findUserById('user-456');

            expect(result).toEqual(mockUser);
            expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { id: 'user-456' } });
        });

        it('should return null when user not found', async () => {
            vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

            const result = await authService.findUserById('nonexistent-id');

            expect(result).toBeNull();
        });
    });
});
