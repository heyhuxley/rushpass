import { IsDate, IsOptional, IsString, Length } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateEventDto {
  @IsString()
  @Length(3, 100)
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @Length(3, 100)
  venueName: string;

  @IsString()
  @Length(3, 100)
  venueAddress: string;

  @IsString()
  @Length(3, 100)
  venueCity: string;

  @IsDate()
  @Type(() => Date)
  startTime: string;

  @IsDate()
  @Type(() => Date)
  publishAt: string;
}
