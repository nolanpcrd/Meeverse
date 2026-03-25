import type { HealthResponseDto } from '@meeverse/shared-contracts';

interface BuildHealthResponseParams {
    uptime: number;
    environment: string;
    now: Date;
}

export const buildHealthResponse = ({uptime, environment, now}: BuildHealthResponseParams): HealthResponseDto => {
    return {
        status: 'ok',
        uptime,
        timestamp: now.toISOString(),
        environment,
    };
};