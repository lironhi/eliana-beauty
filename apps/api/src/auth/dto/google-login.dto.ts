import { IsString, IsNotEmpty } from 'class-validator';

export class GoogleLoginDto {
  /** ID token signé renvoyé par Google Identity Services côté navigateur. */
  @IsString()
  @IsNotEmpty()
  credential: string;
}
