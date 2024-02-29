export interface IUser {
  id: number
  email: string
  username: string
  image: string
  twoFaEnabled: boolean
  friends?: IFriends[]
  expiresAt?: Date
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date
}

export type IFriends = {
  friend: IUser
  friendOf: IUser
  friendId: number
  friendOfId: number
  confirmed: boolean
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date
}
