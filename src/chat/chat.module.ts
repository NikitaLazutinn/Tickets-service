import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { PrismaModule } from 'prisma/prisma.module';
import { ChatController } from './chat.controller';

@Module({
  providers: [ChatGateway, ChatService],
  controllers: [ChatController],
  imports: [PrismaModule],
  exports: [ChatService],
})
export class ChatModule {}
