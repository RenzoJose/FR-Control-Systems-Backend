import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from './prisma.service';

jest.mock('@prisma/adapter-neon', () => ({
  PrismaNeon: jest.fn().mockImplementation(() => ({})),
}));

jest.mock('../../../../generated/prisma/client', () => ({
  PrismaClient: class {
    $connect = jest.fn();
  },
}));

describe('PrismaService', () => {
  let service: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService],
    }).compile();

    service = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
