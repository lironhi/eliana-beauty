import { Injectable, BadRequestException, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SendMessageDto } from './dto/send-message.dto';
import * as admin from 'firebase-admin';

@Injectable()
export class MessagesService implements OnModuleInit {
  private firebaseApp: admin.app.App;

  constructor(private prisma: PrismaService) {}

  onModuleInit() {
    // Initialize Firebase Admin SDK
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      this.firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    } else {
      console.warn('Firebase not configured. Push notifications will be disabled.');
    }
  }

  async sendDirectMessage(senderId: string, dto: SendMessageDto) {
    if (dto.type !== 'DIRECT') {
      throw new BadRequestException('Use sendDirectMessage only for DIRECT messages');
    }

    if (!dto.recipientId) {
      throw new BadRequestException('recipientId is required for direct messages');
    }

    const message = await this.prisma.message.create({
      data: {
        content: dto.content,
        subject: dto.subject,
        type: 'DIRECT',
        senderId,
        recipientId: dto.recipientId,
        appointmentId: dto.appointmentId,
      },
      include: {
        sender: { select: { id: true, name: true, email: true } },
        recipient: { select: { id: true, name: true, email: true } },
      },
    });

    // Send push notification to recipient
    await this.sendPushNotification(dto.recipientId, {
      title: dto.subject || `Message from ${message.sender.name}`,
      body: dto.content,
      data: { messageId: message.id, type: 'DIRECT' },
    });

    return message;
  }

  async sendBroadcastMessage(senderId: string, dto: SendMessageDto) {
    if (dto.type !== 'BROADCAST') {
      throw new BadRequestException('Use sendBroadcastMessage only for BROADCAST messages');
    }

    let recipientIds = dto.recipientIds;

    // If no specific recipients, send to all clients
    if (!recipientIds || recipientIds.length === 0) {
      const clients = await this.prisma.user.findMany({
        where: { role: 'CLIENT', active: true },
        select: { id: true },
      });
      recipientIds = clients.map((c) => c.id);
    }

    // Create the broadcast message
    const message = await this.prisma.message.create({
      data: {
        content: dto.content,
        subject: dto.subject,
        type: 'BROADCAST',
        senderId,
        recipients: {
          create: recipientIds.map((userId) => ({ userId })),
        },
      },
      include: {
        sender: { select: { id: true, name: true, email: true } },
        recipients: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });

    // Send push notifications to all recipients
    await Promise.all(
      recipientIds.map((userId) =>
        this.sendPushNotification(userId, {
          title: dto.subject || 'New message from admin',
          body: dto.content,
          data: { messageId: message.id, type: 'BROADCAST' },
        }),
      ),
    );

    return message;
  }

  async getInbox(userId: string, userRole: string) {
    if (userRole === 'CLIENT') {
      // Client sees: direct messages to/from them + broadcasts
      const directMessages = await this.prisma.message.findMany({
        where: {
          type: 'DIRECT',
          OR: [{ senderId: userId }, { recipientId: userId }],
          deleted: false,
        },
        include: {
          sender: { select: { id: true, name: true, email: true } },
          recipient: { select: { id: true, name: true, email: true } },
          appointment: { select: { id: true, startsAt: true } },
        },
        orderBy: { sentAt: 'desc' },
      });

      const broadcasts = await this.prisma.message.findMany({
        where: {
          type: 'BROADCAST',
          recipients: { some: { userId } },
          deleted: false,
        },
        include: {
          sender: { select: { id: true, name: true, email: true } },
          recipients: {
            where: { userId },
            select: { readAt: true },
          },
        },
        orderBy: { sentAt: 'desc' },
      });

      return {
        direct: directMessages,
        broadcasts: broadcasts.map((msg) => ({
          ...msg,
          readAt: msg.recipients[0]?.readAt || null,
        })),
      };
    } else {
      // Admin/Staff sees: all direct messages and sent broadcasts
      const directMessages = await this.prisma.message.findMany({
        where: {
          type: 'DIRECT',
          deleted: false,
        },
        include: {
          sender: { select: { id: true, name: true, email: true } },
          recipient: { select: { id: true, name: true, email: true } },
          appointment: { select: { id: true, startsAt: true } },
        },
        orderBy: { sentAt: 'desc' },
      });

      const broadcasts = await this.prisma.message.findMany({
        where: {
          type: 'BROADCAST',
          senderId: userId,
          deleted: false,
        },
        include: {
          sender: { select: { id: true, name: true, email: true } },
          recipients: {
            include: {
              user: { select: { id: true, name: true, email: true } },
            },
          },
        },
        orderBy: { sentAt: 'desc' },
      });

      return { direct: directMessages, broadcasts };
    }
  }

  async getConversation(userId: string, otherUserId: string) {
    return this.prisma.message.findMany({
      where: {
        type: 'DIRECT',
        OR: [
          { senderId: userId, recipientId: otherUserId },
          { senderId: otherUserId, recipientId: userId },
        ],
        deleted: false,
      },
      include: {
        sender: { select: { id: true, name: true, email: true } },
        recipient: { select: { id: true, name: true, email: true } },
        appointment: { select: { id: true, startsAt: true } },
      },
      orderBy: { sentAt: 'asc' },
    });
  }

  async markAsRead(messageId: string, userId: string) {
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      throw new BadRequestException('Message not found');
    }

    if (message.type === 'DIRECT') {
      if (message.recipientId !== userId) {
        throw new BadRequestException('Cannot mark other users messages as read');
      }

      return this.prisma.message.update({
        where: { id: messageId },
        data: { readAt: new Date() },
      });
    } else if (message.type === 'BROADCAST') {
      return this.prisma.messageRecipient.updateMany({
        where: { messageId, userId },
        data: { readAt: new Date() },
      });
    }
  }

  async getUnreadCount(userId: string, userRole: string) {
    if (userRole === 'CLIENT') {
      const directCount = await this.prisma.message.count({
        where: {
          type: 'DIRECT',
          recipientId: userId,
          readAt: null,
          deleted: false,
        },
      });

      const broadcastCount = await this.prisma.messageRecipient.count({
        where: {
          userId,
          readAt: null,
          message: { deleted: false },
        },
      });

      return { total: directCount + broadcastCount, direct: directCount, broadcast: broadcastCount };
    } else {
      // Admin sees unread from clients
      return this.prisma.message.count({
        where: {
          type: 'DIRECT',
          recipient: { role: { in: ['ADMIN', 'STAFF'] } },
          readAt: null,
          deleted: false,
        },
      });
    }
  }

  async saveFcmToken(userId: string, token: string) {
    return this.prisma.fcmToken.upsert({
      where: { token },
      update: { userId },
      create: { userId, token },
    });
  }

  async sendPushNotification(
    userId: string,
    payload: { title: string; body: string; data?: Record<string, string> },
  ) {
    if (!this.firebaseApp) {
      console.warn('Firebase not configured, skipping push notification');
      return;
    }

    const tokens = await this.prisma.fcmToken.findMany({
      where: { userId },
      select: { token: true },
    });

    if (tokens.length === 0) {
      return;
    }

    try {
      await admin.messaging().sendEachForMulticast({
        tokens: tokens.map((t) => t.token),
        notification: {
          title: payload.title,
          body: payload.body,
        },
        data: payload.data || {},
      });
    } catch (error) {
      console.error('Failed to send push notification:', error);
    }
  }

  async deleteMessage(messageId: string, userId: string) {
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      throw new BadRequestException('Message not found');
    }

    if (message.senderId !== userId) {
      throw new BadRequestException('Can only delete your own messages');
    }

    return this.prisma.message.update({
      where: { id: messageId },
      data: { deleted: true },
    });
  }
}
