import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MaxLength(80)
  slug?: string | null;

  @IsOptional()
  @IsIn([0, 1, 2, 3])
  gender?: number | null;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  hometown?: string | null;
}
