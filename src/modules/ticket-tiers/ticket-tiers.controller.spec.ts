import { Test, TestingModule } from '@nestjs/testing';
import { TicketTiersController } from './ticket-tiers.controller.js';
import { TicketTiersService } from './ticket-tiers.service.js';

describe('TicketTiersController', () => {
  let controller: TicketTiersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TicketTiersController],
      providers: [TicketTiersService],
    }).compile();

    controller = module.get<TicketTiersController>(TicketTiersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
