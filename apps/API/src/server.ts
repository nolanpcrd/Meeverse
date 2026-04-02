import { buildApp } from './app';
import config from './config';

/**
 * Starts the server
 */
const start = async () => {
    const app = buildApp();

    try {
        await app.listen({ port: config.port, host: config.host });
    } catch (err) {
        app.log.error(err);
        process.exit(1);
    }
};

void start();
