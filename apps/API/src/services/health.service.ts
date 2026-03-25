import type { HealthResponseDto, NodeEnvironment } from '@meeverse/shared-contracts';

interface BuildHealthResponseParams {
    uptime: number;
    environment: NodeEnvironment;
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