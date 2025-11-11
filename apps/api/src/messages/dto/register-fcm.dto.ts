import { IsString } from 'class-validator';

export class RegisterFcmDto {
  @IsString()
  token: string;
}
