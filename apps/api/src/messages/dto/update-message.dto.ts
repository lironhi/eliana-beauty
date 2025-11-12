import { IsString, IsOptional } from 'class-validator';

export class UpdateMessageDto {
  @IsOptional()
  @IsString()
  subject?: string;

  @IsString()
  content: string;
}
