export class FriendRequestEvent {
  name = 'notification:friend_request'
  constructor(public readonly friendOfId: number) {}
}

export class StatusChangeEvent {
  name = 'notification:status_change'
  constructor(
    public readonly userId: number,
    public readonly newStatus: string,
  ) {}
}
