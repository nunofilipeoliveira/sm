import { TestBed } from '@angular/core/testing';

import { ClubeService } from './clube.service';

describe('ClubeService', () => {
  let service: ClubeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ClubeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
