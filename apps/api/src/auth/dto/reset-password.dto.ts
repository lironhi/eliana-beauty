import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty()
  token: string;

  // Mêmes bornes qu'à l'inscription : le formulaire de réinitialisation ne doit
  // pas laisser passer un mot de passe que le formulaire d'inscription refuse.
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @MaxLength(24)
  password: string;
}
