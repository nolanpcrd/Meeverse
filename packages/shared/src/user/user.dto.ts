export interface UserDto {
    id: string;
    username: string;
    displayName: string;
    bio: string | null;
    avatarUrl: string | null;
    email: string;
    createdAt: Date;
}

export interface UserSummaryDto {
    id: string;
    username: string;
    displayName: string;
    avatarUrl: string | null;
}

export interface CreateUserInput {
    email: string;
    password?: string;
    username: string;
    displayName: string;
    avatarUrl?: string | null;
    provider?: string;
    providerAccountId?: string;
}