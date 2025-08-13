import { Test, TestingModule } from '@nestjs/testing';

import { AppModule } from 'src/app.module';

describe('App Module (e2e)', () => {
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
  });

  afterAll(async () => {
    if (module) {
      await module.close();
    }
  });

  it('App module should be defined', () => {
    expect(module).toBeDefined();
  });

  it('App module should compile successfully', () => {
    expect(module).toBeTruthy();
  });
});
