import { IsNumber, IsString, Length, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTicketTierDto {
  @IsString()
  @Length(2, 100)
  name: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  price: number;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  capacity: number;
}
