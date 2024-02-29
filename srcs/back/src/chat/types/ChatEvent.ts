/**
 * sync with front/src/types/Events.ts
 */
export enum ChatSocketEvent {
  MESSAGE = 'message',
  UPDATE = 'update',
  MESSAGE_DELETED = 'message_deleted',
  JOIN_CHANNEL = 'join_channel',
  LEAVE_CHANNEL = 'leave_channel',
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  EDIT_CHANNEL = 'edit_channel',
  SUBSCRIBE = 'subscribe',
  UNSUBSCRIBE = 'unsubscribe',
  MEMBER_EDIT = 'member_edit',
}
