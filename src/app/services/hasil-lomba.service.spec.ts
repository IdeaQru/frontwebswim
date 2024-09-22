import { TestBed } from '@angular/core/testing';

import { HasilLombaService } from './hasil-lomba.service';

describe('HasilLombaService', () => {
  let service: HasilLombaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HasilLombaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
