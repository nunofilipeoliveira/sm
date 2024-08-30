import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PoppupEscalaoComponent } from './poppup-escalao.component';

describe('PoppupEscalaoComponent', () => {
  let component: PoppupEscalaoComponent;
  let fixture: ComponentFixture<PoppupEscalaoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PoppupEscalaoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PoppupEscalaoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
