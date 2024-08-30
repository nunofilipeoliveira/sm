import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PoppupMotivoComponent } from './poppup-motivo.component';

describe('PoppupMotivoComponent', () => {
  let component: PoppupMotivoComponent;
  let fixture: ComponentFixture<PoppupMotivoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PoppupMotivoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PoppupMotivoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
