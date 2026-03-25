import type { HealthResponseDto } from '@meeverse/shared-contracts';
import { API_BASE_URL } from './config';

const HEALTH_ENDPOINT = '/api/health';

export const getHealth = async (): Promise<HealthResponseDto> => {
    const response = await fetch(`${API_BASE_URL}${HEALTH_ENDPOINT}`);

    if (!response.ok) {
        throw new Error(`Health request failed with status ${response.status}`);
    }

    return (await response.json()) as HealthResponseDto;
};