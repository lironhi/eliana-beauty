import { Controller, Post, Get, Patch, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { SendMessageDto } from './dto/send-message.dto';
import { MarkReadDto } from './dto/mark-read.dto';
import { RegisterFcmDto } from './dto/register-fcm.dto';
import { UpdateMessageDto } from './dto/update-message.dto';

interface AuthRequest {
  user: {
    id: string;
    email: string;
    role: string;
  };
}

@Controller('messages')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MessagesController {
  constructor(private messagesService: MessagesService) {}

  @Post('direct')
  @Roles('ADMIN', 'STAFF')
  async sendDirectMessage(@Req() req: AuthRequest, @Body() dto: SendMessageDto) {
    return this.messagesService.sendDirectMessage(req.user.id, dto);
  }

  @Post('broadcast')
  @Roles('ADMIN', 'STAFF')
  async sendBroadcastMessage(@Req() req: AuthRequest, @Body() dto: SendMessageDto) {
    return this.messagesService.sendBroadcastMessage(req.user.id, dto);
  }

  @Get('inbox')
  async getInbox(@Req() req: AuthRequest) {
    return this.messagesService.getInbox(req.user.id, req.user.role);
  }

  @Get('conversation/:otherUserId')
  async getConversation(@Req() req: AuthRequest, @Param('otherUserId') otherUserId: string) {
    return this.messagesService.getConversation(req.user.id, otherUserId);
  }

  @Patch('read')
  async markAsRead(@Req() req: AuthRequest, @Body() dto: MarkReadDto) {
    return this.messagesService.markAsRead(dto.messageId, req.user.id);
  }

  @Get('unread-count')
  async getUnreadCount(@Req() req: AuthRequest) {
    return this.messagesService.getUnreadCount(req.user.id, req.user.role);
  }

  @Post('fcm-token')
  async registerFcmToken(@Req() req: AuthRequest, @Body() dto: RegisterFcmDto) {
    return this.messagesService.saveFcmToken(req.user.id, dto.token);
  }

  @Patch(':messageId')
  @Roles('ADMIN', 'STAFF')
  async updateMessage(
    @Req() req: AuthRequest,
    @Param('messageId') messageId: string,
    @Body() dto: UpdateMessageDto,
  ) {
    return this.messagesService.updateMessage(messageId, req.user.id, dto);
  }

  @Delete(':messageId')
  async deleteMessage(@Req() req: AuthRequest, @Param('messageId') messageId: string) {
    return this.messagesService.deleteMessage(messageId, req.user.id);
  }
}
