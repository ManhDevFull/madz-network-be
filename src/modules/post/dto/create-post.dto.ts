import { IsIn, IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

export class CreatePostDto {
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  content?: string;

  @IsOptional()
  @IsString()
  @IsUrl(
    {
      require_tld: false,
    },
    {
      message: 'media_url must be a valid URL',
    },
  )
  media_url?: string;

  @IsOptional()
  @IsIn([0, 1])
  visibility?: number;
}
