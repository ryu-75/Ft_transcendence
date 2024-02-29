import { Injectable } from '@nestjs/common'
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter'
import { User } from '@prisma/client'
import { Socket } from 'socket.io'
import { PrismaService } from 'src/prisma/prisma.service'
import { AuthService } from 'src/auth/auth.service'
import * as crypto from 'crypto'
import { StatusService } from 'src/status/status.service'

interface WaitingPlayerGameCustom {
  socket: Socket
  userData: Partial<User> | null
  socketOpponent: Socket
  opponentData: Partial<User> | null
  partyNumber: string
}

@Injectable()
export class GameService {
  constructor(
    private readonly prisma: PrismaService,
    private eventEmitter: EventEmitter2,
    private readonly authService: AuthService,
    private readonly statusService: StatusService,
  ) {
    this.launchGame()
  }

  private classicwaitingPlayers: {
    socket: Socket
    userData: Partial<User> | null
  }[] = []

  private extraWaitingPlayers: {
    socket: Socket
    userData: Partial<User> | null
  }[] = []

  private queueGamePerso: WaitingPlayerGameCustom[][] = []

  @OnEvent('game.start')
  async handleGameStartEvent(data: {
    client: Socket
    gameMode: string
    mode: string
  }) {
    if (data.mode === 'register') {
      const client = data.client
      client.data.user = await this.authService.getSocketUser(client)
      client.data.user.inQueue = false
      if (client.data.user?.inQueue) {
        return
      }
      const gameMode = data.gameMode
      if (client.data.user) {
        const userId = client.data.user.id
      }
      client.data.user.inQueue = true

      if (gameMode === 'classic')
        this.classicwaitingPlayers.push({
          socket: client,
          userData: client.data.user,
        })
      else if (gameMode === 'extra')
        this.extraWaitingPlayers.push({
          socket: client,
          userData: client.data.user,
        })
    } else if (data.mode === 'unregister') {
      const client = data.client
      client.data.user = await this.authService.getSocketUser(client)
      const gameMode = data.gameMode
      client.data.user.inQueue = false
      if (gameMode === 'classic')
        this.classicwaitingPlayers = this.classicwaitingPlayers.filter(
          (player) => player.socket.id !== client.id,
        )
      else if (gameMode === 'extra')
        this.extraWaitingPlayers = this.extraWaitingPlayers.filter(
          (player) => player.socket.id !== client.id,
        )
    }
  }

  @OnEvent('createGamePerso.start')
  async handleCreateGamePerso(data: { client: Socket; mode: string }) {
    if (data.mode === 'register') {
      const client = data.client
      client.data.user = await this.authService.getSocketUser(client)

      const existingGame = this.queueGamePerso.find((gameArray) =>
        gameArray.some((game) => game.userData?.id === client.data.user.id),
      )

      if (existingGame) {
        // Informer le client qu'il a déjà créé une partie
        client.emit('gamePersoAlreadyCreated', {
          message: 'You have already created a game.',
        })
        return
      }

      const partyNumber = crypto.randomBytes(16).toString('hex')
      const newGame: WaitingPlayerGameCustom = {
        socket: client,
        userData: client.data.user,
        socketOpponent: client,
        opponentData: null,
        partyNumber: partyNumber,
      }

      // Ajouter la partie dans la queue
      this.queueGamePerso.push([newGame])
      client.emit('gamePersoCreated', { partyNumber: newGame.partyNumber })
    } else if (data.mode === 'unregister') {
      const client = data.client
      client.data.user = await this.authService.getSocketUser(client)
    }
  }

  @OnEvent('joinGamePerso')
  async handleJoinGamePerso(data: { client: Socket; partyNumber: string }) {
    let two_players
    const client = data.client
    client.data.user = await this.authService.getSocketUser(client)
    for (let i = 0; i < this.queueGamePerso.length; i++) {
      const game = this.queueGamePerso[i].find(
        (game) => game.partyNumber === data.partyNumber,
      )
      if (game) {
        const userId = game.userData?.id
        if (userId != undefined) {
          const status = await this.statusService.getStatus(userId)
          if (status === 'in_game') {
            client.emit('errorPartyPerso', {
              msgError: `Sorry, ${game.userData?.username} is already in game!`,
            })
            return
          }
        }

        game.opponentData = client.data.user
        game.socketOpponent = client
        two_players = [
          { socket: game.socket, userData: game.userData },
          { socket: game.socketOpponent, userData: game.opponentData },
        ]

        // Émettre l'événement game.launched
        this.eventEmitter.emit('game.launched', two_players, 'classic')

        // Supprimer la partie du tableau
        this.queueGamePerso.splice(i, 1)
        break
      }
    }
  }

  @OnEvent('checkOwnerIsOnline')
  handleCheckOwnerIsOnline(data: { client: Socket; partyNumber: string }) {
    const client = data.client

    for (let i = 0; i < this.queueGamePerso.length; i++) {
      const game = this.queueGamePerso[i].find(
        (game) => game.partyNumber === data.partyNumber,
      )
      if (game) {
        if (game.socket.disconnected) {
          client.emit('errorPartyPerso', {
            msgError: 'Cannot join the party, the sender left the app!',
          })
          return
        }
        break
      }
    }
  }

  @OnEvent('resetSocketPartyPerso')
  async handleResetSocketPartyPerso(data: { client: Socket }) {
    const client = data.client
    client.data.user = await this.authService.getSocketUser(client)

    for (let i = 0; i < this.queueGamePerso.length; i++) {
      const game = this.queueGamePerso[i].find(
        (game) => game.userData?.id === client.data.user.id,
      )
      if (game) {
        game.socket = client
        break
      }
    }
  }

  //NOTE: add game modes here
  private launchGame() {
    setInterval(() => {
      if (this.classicwaitingPlayers.length >= 2) {
        const two_players = this.classicwaitingPlayers.splice(0, 2)
        this.eventEmitter.emit('game.launched', two_players, 'classic')
      }
      if (this.extraWaitingPlayers.length >= 2) {
        const two_players = this.extraWaitingPlayers.splice(0, 2)
        this.eventEmitter.emit('game.launched', two_players, 'extra')
      }
    }, 5027)
  }
  async getUser(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        username: true,
        image: true,
      },
    })
    return user
  }

  async getHistory(userId: number) {
    const games = await this.prisma.game.findMany({
      where: {
        OR: [{ participant1Id: userId }, { participant2Id: userId }],
      },
      select: {
        winner_id: true,
        participant1Id: true,
        participant2Id: true,
      },
    })

    let victories = 0
    let defeats = 0

    games.forEach((game) => {
      if (game.winner_id === userId) {
        victories++
      } else if (
        game.participant1Id === userId ||
        game.participant2Id === userId
      ) {
        defeats++
      }
    })

    return { victories, defeats }
  }

  async getMatchHistory(userId: number) {
    const game = await this.prisma.game.findFirst({
      where: {
        OR: [{ participant1Id: userId }, { participant2Id: userId }],
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        participant1: true,
        participant2: true,
      },
    })
    return game
  }

  async getLadder(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { elo: true },
    })

    if (!user) {
      throw new Error('User not found')
    }

    const userElo = user.elo

    const rank =
      (await this.prisma.user.count({
        where: {
          elo: {
            gt: userElo,
          },
        },
      })) + 1

    return { elo: userElo, rank }
  }
}
