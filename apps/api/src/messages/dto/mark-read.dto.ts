import { IsString } from 'class-validator';

export class MarkReadDto {
  @IsString()
  messageId: string;
}
