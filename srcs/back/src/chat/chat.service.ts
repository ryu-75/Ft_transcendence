import { Injectable } from '@nestjs/common'
import { MessageService } from 'src/message/message.service'

@Injectable()
export class ChatService {
  constructor(private readonly messageService: MessageService) {}
}
