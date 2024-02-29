import {
  Controller,
  Get,
  Param,
  UseGuards,
  UseInterceptors,
  ClassSerializerInterceptor,
  BadRequestException,
} from '@nestjs/common'
import JwtTwoFaGuard from '../auth/jwt/jwt-2fa.guard'
import { GameService } from './game.service'
import { GameEntity } from './entity/game.entity'

@Controller('game')
@UseGuards(JwtTwoFaGuard)
@UseInterceptors(ClassSerializerInterceptor)
export class GameController {
  constructor(private gameService: GameService) {}

  @Get('stats/:userId')
  async getUserStats(@Param('userId') userId: number) {
    if (!userId) throw new BadRequestException()
    return this.gameService.getHistory(userId)
  }

  @Get('match_history/:userId')
  async getMatchHistory(@Param('userId') userId: number) {
    if (!userId) throw new BadRequestException()
    const matchHistory = await this.gameService.getMatchHistory(userId)
    if (matchHistory) return new GameEntity(matchHistory)
    return {}
  }

  @Get('ladder/:userId')
  async getladder(@Param('userId') userId: number) {
    if (!userId) throw new BadRequestException()
    return this.gameService.getLadder(userId)
  }
}
