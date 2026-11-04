import { IsInt, IsUUID, Max, Min } from 'class-validator';

export class OrderItemDto {
  @IsUUID()
  ticketTierId: string;

  @IsInt()
  @Min(1)
  @Max(10)
  quantity: number;
}
