import { TestBed } from '@angular/core/testing';

import { FicheirosService } from './ficheiros.service';

describe('FicheirosService', () => {
  let service: FicheirosService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FicheirosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
