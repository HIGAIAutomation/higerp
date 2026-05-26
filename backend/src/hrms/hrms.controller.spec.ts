import { Test, TestingModule } from '@nestjs/testing';
import { HrmsController } from './hrms.controller';

describe('HrmsController', () => {
  let controller: HrmsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HrmsController],
    }).compile();

    controller = module.get<HrmsController>(HrmsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
