export type HealthStatus = 'ok';

export type NodeEnvironment = 'development' | 'test' | 'production';

export interface HealthResponseDto {
    status: HealthStatus;
    uptime: number;
    timestamp: string;
    environment: NodeEnvironment;
}

