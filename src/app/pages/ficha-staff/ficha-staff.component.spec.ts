import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FichaStaffComponent } from './ficha-staff.component';

describe('FichaStaffComponent', () => {
  let component: FichaStaffComponent;
  let fixture: ComponentFixture<FichaStaffComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FichaStaffComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FichaStaffComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
