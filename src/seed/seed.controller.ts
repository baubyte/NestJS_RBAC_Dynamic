import { Controller, Get, Post } from '@nestjs/common';
import { SeedService } from './seed.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Seed')
@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  @Post('run')
  @ApiOperation({
    summary: 'Execute database seed',
    description:
      'Populates the database with initial data. Can only be executed once in production environment.',
  })
  @ApiResponse({ status: 201, description: 'Seed executed successfully' })
  @ApiResponse({
    status: 403,
    description: 'Seed already executed in production',
  })
  runSeed() {
    return this.seedService.runSeed();
  }

  @Get('history')
  @ApiOperation({
    summary: 'Get seed execution history',
    description: 'Returns the last 10 seed executions',
  })
  @ApiResponse({
    status: 200,
    description: 'Execution history retrieved successfully',
  })
  getHistory() {
    return this.seedService.getExecutionHistory();
  }
}
