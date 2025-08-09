import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StaffSeleccaoComponent } from './staff-seleccao.component';

describe('StaffSeleccaoComponent', () => {
  let component: StaffSeleccaoComponent;
  let fixture: ComponentFixture<StaffSeleccaoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StaffSeleccaoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StaffSeleccaoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
