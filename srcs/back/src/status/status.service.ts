import { Injectable } from '@nestjs/common'
import { Status } from './types/Status'

export const userStatus = new Map<number, Status>()

@Injectable()
export class StatusService {
  constructor() {}

  setStatus(userId: number, status: Status) {
    userStatus.set(userId, status)
  }

  getStatus(userId: number) {
    return userStatus.get(userId)
  }

  getAllStatus() {
    return userStatus.entries()
  }
}
