import type { UserSummaryDto } from '../user/user.dto.js';

export interface LoginRequestDto {
    email: string;
    password: string;
}

export interface LoginResponseDto {
    user: UserSummaryDto;
    token: string;
}

export interface RegisterRequestDto {
    email: string;
    password: string;
    username: string;
    displayName: string;
}

export interface RegisterResponseDto {
    user: UserSummaryDto;
    token: string;
}

export interface SessionResponseDto extends UserSummaryDto {
    email: string;
    bio: string | null;
    avatarUrl: string | null;
    createdAt: Date;
}