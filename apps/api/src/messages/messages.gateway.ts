import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  },
})
export class MessagesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedUsers = new Map<string, string>(); // userId -> socketId

  constructor(private messagesService: MessagesService) {}

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    // Remove user from connected users
    for (const [userId, socketId] of this.connectedUsers.entries()) {
      if (socketId === client.id) {
        this.connectedUsers.delete(userId);
        break;
      }
    }
  }

  @SubscribeMessage('register')
  handleRegister(@MessageBody() data: { userId: string }, @ConnectedSocket() client: Socket) {
    this.connectedUsers.set(data.userId, client.id);
    console.log(`User ${data.userId} registered with socket ${client.id}`);
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
    try {
      let message;

      if (data.type === 'DIRECT') {
        message = await this.messagesService.sendDirectMessage(data.senderId, data);

        // Send to recipient if online
        const recipientSocketId = this.connectedUsers.get(data.recipientId);
        if (recipientSocketId) {
          this.server.to(recipientSocketId).emit('newMessage', message);
        }

        // Send back to sender
        client.emit('messageSent', message);
      } else if (data.type === 'BROADCAST') {
        message = await this.messagesService.sendBroadcastMessage(data.senderId, data);

        // Notify all online recipients
        for (const recipient of message.recipients) {
          const socketId = this.connectedUsers.get(recipient.userId);
          if (socketId) {
            this.server.to(socketId).emit('newMessage', message);
          }
        }

        client.emit('messageSent', message);
      }
    } catch (error) {
      client.emit('messageError', { error: error.message });
    }
  }

  @SubscribeMessage('markRead')
  async handleMarkRead(@MessageBody() data: { messageId: string; userId: string }, @ConnectedSocket() client: Socket) {
    try {
      await this.messagesService.markAsRead(data.messageId, data.userId);

      // Notify the other user that message was read
      const message = await this.messagesService.getInbox(data.userId, 'CLIENT');
      // Find the sender and notify them
      // (Implementation depends on your message structure)

      client.emit('markReadSuccess', { messageId: data.messageId });
    } catch (error) {
      client.emit('markReadError', { error: error.message });
    }
  }

  @SubscribeMessage('typing')
  handleTyping(@MessageBody() data: { userId: string; recipientId: string; isTyping: boolean }) {
    const recipientSocketId = this.connectedUsers.get(data.recipientId);
    if (recipientSocketId) {
      this.server.to(recipientSocketId).emit('userTyping', {
        userId: data.userId,
        isTyping: data.isTyping,
      });
    }
  }
}
