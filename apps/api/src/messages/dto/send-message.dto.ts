import { IsString, IsOptional, IsIn, IsArray } from 'class-validator';

export class SendMessageDto {
  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  subject?: string;

  @IsIn(['DIRECT', 'BROADCAST', 'REMINDER'])
  type: 'DIRECT' | 'BROADCAST' | 'REMINDER';

  @IsOptional()
  @IsString()
  recipientId?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  recipientIds?: string[];

  @IsOptional()
  @IsString()
  appointmentId?: string;
}
