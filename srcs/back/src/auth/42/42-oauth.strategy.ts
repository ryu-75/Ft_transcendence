import { Strategy } from 'passport-oauth2'
import { PassportStrategy } from '@nestjs/passport'
import {
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { HttpService } from '@nestjs/axios'
import { catchError, firstValueFrom, map } from 'rxjs'
import { IMe } from './42-oauth.types'
import { AxiosError } from 'axios'
import { UsersService } from '../../users/users.service'

@Injectable()
export class FortyTwoOAuthStrategy extends PassportStrategy(Strategy, '42') {
  configService: ConfigService
  private readonly logger: Logger = new Logger(FortyTwoOAuthStrategy.name)
  constructor(
    private readonly httpService: HttpService,
    private readonly userService: UsersService,
    configService: ConfigService,
  ) {
    super({
      authorizationURL: configService.getOrThrow<string>('AUTHORIZE_URL'),
      tokenURL: configService.getOrThrow<string>('TOKEN_URL'),
      clientID: configService.getOrThrow<string>('CLIENT_ID'),
      clientSecret: configService.getOrThrow<string>('CLIENT_SECRET'),
      callbackURL: configService.getOrThrow<string>('CALLBACK_URL'),
      scope: ['public'],
    })
    this.configService = configService
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    user: IMe,
    done: (err: any, user: any, info?: any) => void,
  ) {
    if (!user) return done(new UnauthorizedException(), null)

    done(null, { ...user, accessToken, refreshToken })
  }

  async userProfile(
    accessToken: string,
    done: (err?: Error | null | undefined, profile?: any | null) => void,
  ) {
    try {
      const profile = await this.get42Profile(accessToken)
      done(null, profile)
    } catch (error: unknown) {
      if (error instanceof HttpException || error instanceof Error) {
        done(error, null)
      }
    }
  }

  async get42Profile(access_token: string) {
    const baseUrl = this.configService.getOrThrow('BASE_URL')
    const url = new URL(baseUrl)
    url.pathname = '/v2/me'
    const { email, image, login } = await firstValueFrom(
      this.httpService
        .get<IMe>(url.toString(), {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        })
        .pipe(
          map((res) => res.data),
          catchError((err: AxiosError) => {
            this.logger.error(JSON.stringify(err.response?.data))
            const errorResponse = {
              status: err.response?.status,
              message: err.message,
            }
            throw new HttpException(errorResponse, HttpStatus.UNAUTHORIZED)
          }),
        ),
    )
    return { email, image, login }
  }
}
