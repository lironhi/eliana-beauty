import { IsEmail, IsIn, IsOptional } from 'class-validator';

export class ForgotPasswordDto {
  @IsEmail()
  email: string;

  /** Langue du courriel de réinitialisation ; celle du compte sinon. */
  @IsOptional()
  @IsIn(['en', 'he'])
  locale?: 'en' | 'he';
}
