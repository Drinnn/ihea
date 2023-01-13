import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';
import { IORedisKey } from 'src/redis.module';
import { AddParticipantData, CreatePollData } from './types';
import { Poll } from 'shared';

@Injectable()
export class PollsRepository {
  private readonly ttl: string;
  private readonly logger = new Logger(PollsRepository.name);

  constructor(
    configService: ConfigService,
    @Inject(IORedisKey) private readonly redisClient: Redis,
  ) {
    this.ttl = configService.get('POLL_DURATION');
  }

  async createPoll({
    pollId,
    topic,
    userId,
    votesPerVoter,
  }: CreatePollData): Promise<Poll> {
    const initialPoll = {
      id: pollId,
      topic,
      votesPerVoter,
      participants: {},
      adminId: userId,
    };

    this.logger.log(
      `Creating new poll: ${JSON.stringify(initialPoll, null, 2)} with TTL ${
        this.ttl
      }`,
    );

    const key = `polls:${pollId}`;

    try {
      await this.redisClient
        .multi([
          ['send_command', 'JSON.SET', key, '.', JSON.stringify(initialPoll)],
          ['expire', key, this.ttl],
        ])
        .exec();

      return initialPoll;
    } catch (e) {
      this.logger.error(
        `Failed to add poll ${JSON.stringify(initialPoll)}\n${e}`,
      );

      throw new InternalServerErrorException();
    }
  }

  async getPoll(pollId: string): Promise<Poll> {
    this.logger.log(`Attempting to get poll with ID ${pollId}`);

    const key = `polls:${pollId}`;

    try {
      const currentPoll = await this.redisClient.send_command(
        'JSON.GET',
        key,
        '.',
      );

      this.logger.verbose(currentPoll);

      return JSON.parse(currentPoll);
    } catch (e) {
      this.logger.error(`Failed to get poll with ID ${pollId}`);
      throw e;
    }
  }

  async addParticipant({
    name,
    pollId,
    userId,
  }: AddParticipantData): Promise<Poll> {
    this.logger.log(
      `Attempting to add a participant with userId/name: ${userId}/${name} to poll with ID ${pollId}`,
    );

    const key = `polls:${pollId}`;
    const participantPath = `.participants.${userId}`;

    try {
      await this.redisClient.send_command(
        'JSON.SET',
        key,
        participantPath,
        JSON.stringify(name),
      );

      const pollJSON = await this.redisClient.send_command(
        'JSON.GET',
        key,
        '.',
      );

      const poll = JSON.parse(pollJSON) as Poll;

      this.logger.debug(
        `Current Participants for Poll with ID ${pollId}:`,
        poll.participants,
      );

      return poll;
    } catch (e) {
      this.logger.error(
        `Attempting to add a participant with userId/name: ${userId}/${name} to poll with ID ${pollId}`,
      );

      throw e;
    }
  }
}
