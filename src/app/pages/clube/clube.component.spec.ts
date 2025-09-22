import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClubeComponent } from './clube.component';

describe('ClubeComponent', () => {
  let component: ClubeComponent;
  let fixture: ComponentFixture<ClubeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClubeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClubeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
