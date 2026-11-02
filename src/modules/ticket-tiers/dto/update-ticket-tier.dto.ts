import { PartialType } from '@nestjs/mapped-types';
import { CreateTicketTierDto } from './create-ticket-tier.dto.js';

export class UpdateTicketTierDto extends PartialType(CreateTicketTierDto) {}
