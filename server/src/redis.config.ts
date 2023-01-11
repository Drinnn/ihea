import { Logger } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisModuleAsyncOptions } from './redis.module';

const redisModuleConfig: RedisModuleAsyncOptions = {
  imports: [ConfigModule],
  useFactory: async (configService: ConfigService) => {
    const logger = new Logger('RedisModule');

    return {
      connectionOptions: {
        host: configService.get<string>('REDIS_HOST'),
        port: configService.get<number>('REDIS_PORT'),
      },
      onClientReady: (client) => {
        logger.log('Redis client ready.');

        client.on('error', (err) => {
          logger.error('Redis client error: ', err);
        });

        client.on('connect', () => {
          logger.log(
            `Connected to redis client on ${client.options.host}:${client.options.port}`,
          );
        });
      },
    };
  },
  inject: [ConfigService],
};

export default redisModuleConfig;
