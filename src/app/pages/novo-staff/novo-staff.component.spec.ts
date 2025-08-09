import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NovoStaffComponent } from './novo-staff.component';

describe('NovoStaffComponent', () => {
  let component: NovoStaffComponent;
  let fixture: ComponentFixture<NovoStaffComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NovoStaffComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NovoStaffComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
