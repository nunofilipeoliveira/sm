import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PresencasComponent } from './presencas.component';


describe('PresencasComponent', () => {
  let component: PresencasComponent;
  let fixture: ComponentFixture<PresencasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PresencasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PresencasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
