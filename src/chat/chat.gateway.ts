import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';

@WebSocketGateway({
  namespace: '/chat',
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private readonly chatService: ChatService) {}

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(client: Socket, data: { chatRoomId: number }) {
    client.join(`room_${data.chatRoomId}`);
    client.emit('joinedRoom', { message: 'Joined chat room' });
    console.log(`Client ${client.id} joined chat room ${data.chatRoomId}`);
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    client: Socket,
    data: { chatRoomId: number; senderId: number; content: string },
  ) {
    console.log('Received message data:', data);

    try {
      if (!data.chatRoomId || !data.senderId || !data.content) {
        client.emit('error', { message: 'Missing data for sending message' });
        return;
      }

      const message = await this.chatService.addMessage(
        data.chatRoomId,
        data.senderId,
        data.content,
      );
      client.broadcast
        .to(`room_${data.chatRoomId}`)
        .emit('newMessage', message.content);
    } catch (error) {
      console.error('Error while sending message:', error);
      client.emit('exception', { message: error.message });
    }
  }
}
