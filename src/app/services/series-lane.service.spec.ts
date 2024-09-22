import { TestBed } from '@angular/core/testing';

import { SeriesLaneService } from './series-lane.service';

describe('SeriesLaneService', () => {
  let service: SeriesLaneService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SeriesLaneService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
