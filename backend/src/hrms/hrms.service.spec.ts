import { Test, TestingModule } from '@nestjs/testing';
import { HrmsService } from './hrms.service';

describe('HrmsService', () => {
  let service: HrmsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HrmsService],
    }).compile();

    service = module.get<HrmsService>(HrmsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
