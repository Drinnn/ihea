import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import redisModuleConfig from 'src/redis.config';
import { RedisModule } from 'src/redis.module';
import { PollsController } from './polls.controller';
import { PollsRepository } from './polls.repository';
import { PollsService } from './polls.service';

@Module({
  imports: [ConfigModule, RedisModule.registerAsync(redisModuleConfig)],
  providers: [PollsService, PollsRepository],
  controllers: [PollsController],
})
export class PollsModule {}
