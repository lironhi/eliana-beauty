import { IsArray, IsOptional, IsString } from 'class-validator';

export class RestoreDatabaseDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tables?: string[];
}
