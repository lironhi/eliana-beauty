import { IsString, IsOptional, IsDateString } from 'class-validator';

export class CreateAppointmentDto {
  @IsString()
  serviceId: string;

  @IsOptional()
  @IsString()
  staffId?: string;

  @IsDateString()
  startsAt: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
