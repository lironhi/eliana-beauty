import { IsString, IsOptional, IsIn } from 'class-validator';

export class UpdateAppointmentDto {
  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsIn(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW'])
  status?: string;

  @IsOptional()
  @IsIn(['CASH', 'CREDIT_CARD', 'DEBIT_CARD', 'BIT', 'PAYBOX', 'BANK_TRANSFER', 'OTHER', 'NOT_PAID'])
  paymentMethod?: string;
}
