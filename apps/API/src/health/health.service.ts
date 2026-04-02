import type { HealthResponseDto, NodeEnvironment } from '@meeverse/shared-contracts';

/**
 * A health response schema
 */
interface BuildHealthResponseParams {
    uptime: number;
    environment: NodeEnvironment;
    now: Date;
}

/**
 * Build health response
 * @param params the health response params
 * @returns the health response dto
 */
export const buildHealthResponse = ({uptime, environment, now}: BuildHealthResponseParams): HealthResponseDto => {
    return {
        status: 'ok',
        uptime,
        timestamp: now.toISOString(),
        environment,
    };
};
