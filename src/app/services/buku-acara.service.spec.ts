import { TestBed } from '@angular/core/testing';

import { BukuAcaraService } from './buku-acara.service';

describe('BukuAcaraService', () => {
  let service: BukuAcaraService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BukuAcaraService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
