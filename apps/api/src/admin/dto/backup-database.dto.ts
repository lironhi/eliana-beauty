import { IsArray, IsOptional, IsString } from 'class-validator';

export class BackupDatabaseDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tables?: string[];
}
