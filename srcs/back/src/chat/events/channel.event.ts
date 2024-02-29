export class ChannelJoinedEvent {
  name = 'channel:joined'
  constructor(
    public readonly channelId: string,
    public readonly userId: number,
    public readonly background: boolean = false,
  ) {}
}

export class ChannelEditEvent {
  name = 'channel:edit'
  constructor(public readonly channelId: string) {}
}

export class ChannelLeftEvent {
  name = 'channel:left'
  constructor(
    public readonly channelId: string,
    public readonly userId: number,
  ) {}
}

export class ChannelKickEvent {
  name = 'channel:kicked'
  constructor(
    public readonly channelId: string,
    public readonly userId: number,
  ) {}
}

export class ChannelBanEvent {
  name = 'channel:banned'
  constructor(
    public readonly channelId: string,
    public readonly userId: number,
  ) {}
}

export class ChannelMutedEvent {
  name = 'channel:muted'
  constructor(
    public readonly channelId: string,
    public readonly userId: number,
  ) {}
}
