import { TestBed } from '@angular/core/testing';

import { EquipaService } from './equipa.service';

describe('EquipaService', () => {
  let service: EquipaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EquipaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
