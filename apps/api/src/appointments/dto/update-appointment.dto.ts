import { IsString, IsOptional, IsIn } from 'class-validator';

export class UpdateAppointmentDto {
  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsIn(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW'])
  status?: string;
}
