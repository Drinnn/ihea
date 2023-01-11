import { Injectable, Logger } from '@nestjs/common';
import { createPollId, createUserId } from 'src/ids';
import { PollsRepository } from './polls.repository';
import { CreatePollFields, JoinPollFields, RejoinPollFields } from './types';

@Injectable()
export class PollsService {
  private readonly logger = new Logger(PollsService.name);

  constructor(private readonly pollsRepository: PollsRepository) {}

  async createPoll(fields: CreatePollFields) {
    const pollId = createPollId();
    const userId = createUserId();

    const createdPoll = await this.pollsRepository.createPoll({
      ...fields,
      pollId,
      userId,
    });

    return {
      poll: createdPoll,
    };
  }

  async joinPoll(fields: JoinPollFields) {
    const userId = createUserId();

    this.logger.debug(
      `Fetching poll with ID: ${fields.pollId} for user with ID ${userId}`,
    );

    const joinedPoll = await this.pollsRepository.getPoll(fields.pollId);

    return {
      poll: joinedPoll,
    };
  }

  async rejoinPoll(fields: RejoinPollFields) {
    this.logger.debug(
      `Rejoining poll with ID ${fields.pollId} for user with ID ${fields.userId} with name ${fields.name}`,
    );

    const joinedPoll = await this.pollsRepository.addParticipant(fields);

    return joinedPoll;
  }
}
