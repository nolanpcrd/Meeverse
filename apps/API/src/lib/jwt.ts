import fastifyJwt from '@fastify/jwt';
import config from '../config.js';

export function registerJwt(app: any) {
    app.register(fastifyJwt, {
        secret: config.jwtSecret,
        sign: {
            expiresIn: '365d',
        },
    });
}

export interface JwtPayload {
    userId: string;
    email: string;
}

declare module '@fastify/jwt' {
    interface FastifyJWT {
        payload: JwtPayload;
        user: JwtPayload;
    }
}
