import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { AuthUserGuard } from 'src/guards';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @UseGuards(AuthUserGuard)
  @Get(':chatRoomId')
  async getChatHistory(@Param('chatRoomId') chatRoomId: string, @Req() req) {
    const token = req.user;
    return this.chatService.getChatHistory(+chatRoomId, token);
  }
}
