import { parse } from 'cookie'
import { Request } from 'express'
import type { Handshake } from 'socket.io/dist/socket'

const isHandshake = (data: Handshake | Request): data is Handshake => {
  return 'xdomain' in data
}

export const extractJwtFromCookie = (req: Handshake | Request) => {
  if (isHandshake(req)) {
    if (!req.headers.cookie) return ''
    return parse(req!.headers!.cookie!).jwt
  }

  return req.cookies['jwt']
}
