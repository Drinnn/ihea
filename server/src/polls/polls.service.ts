import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { createPollId, createUserId } from 'src/ids';
import { PollsRepository } from './polls.repository';
import { CreatePollFields, JoinPollFields, RejoinPollFields } from './types';

@Injectable()
export class PollsService {
  private readonly logger = new Logger(PollsService.name);

  constructor(
    private readonly pollsRepository: PollsRepository,
    private readonly jwtService: JwtService,
  ) {}

  async createPoll(fields: CreatePollFields) {
    const pollId = createPollId();
    const userId = createUserId();

    const createdPoll = await this.pollsRepository.createPoll({
      ...fields,
      pollId,
      userId,
    });

    this.logger.debug(
      `Creating token string for poll with ID ${createdPoll.id} and user ID ${userId}`,
    );

    const token = this.jwtService.sign(
      {
        pollId: createdPoll.id,
        name: fields.name,
      },
      {
        subject: userId,
      },
    );

    return {
      poll: createdPoll,
      accessToken: token,
    };
  }

  async joinPoll(fields: JoinPollFields) {
    const userId = createUserId();

    this.logger.debug(
      `Fetching poll with ID: ${fields.pollId} for user with ID ${userId}`,
    );

    const joinedPoll = await this.pollsRepository.getPoll(fields.pollId);

    this.logger.debug(
      `Creating token string for poll with ID ${joinedPoll.id} and user ID ${userId}`,
    );

    const token = this.jwtService.sign(
      {
        pollId: joinedPoll.id,
        name: fields.name,
      },
      {
        subject: userId,
      },
    );

    return {
      poll: joinedPoll,
      accessToken: token,
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
