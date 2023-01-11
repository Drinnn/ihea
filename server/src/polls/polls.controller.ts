import { Body, Controller, Logger, Post } from '@nestjs/common';
import { CreatePollDto, JoinPollDto } from './dtos';

@Controller('polls')
export class PollsController {
  @Post()
  async create(@Body() createPollDto: CreatePollDto) {
    Logger.log('Polls - Create');

    return createPollDto;
  }

  @Post('/join')
  async join(@Body() joinPollDto: JoinPollDto) {
    Logger.log('Polls - Join');

    return joinPollDto;
  }

  @Post('/rejoin')
  async rejoin() {
    Logger.log('Polls - Rejoin');
  }
}
