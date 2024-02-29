export enum ChatSocketEvent {
  MESSAGE = 'message',
  UPDATE = 'update',
  MESSAGE_DELETED = 'message_deleted',
  JOIN_CHANNEL = 'join_channel',
  LEAVE_CHANNEL = 'leave_channel',
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  SUBSCRIBE = 'subscribe',
  UNSUBSCRIBE = 'unsubscribe',
  EDIT_CHANNEL = 'edit_channel',
  MEMBER_EDIT = 'member_edit',
}

export enum FriendsSocketEvent {
  ADD_FRIEND = 'add_friend',
  REMOVE_FRIEND = 'remove_channel',
}

export enum NotificationSocketEvent {
  RECEIVED = 'notification_received',
  DELETED = 'notification_deleted',
}
