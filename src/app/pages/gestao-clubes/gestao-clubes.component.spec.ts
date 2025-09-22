import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestaoClubesComponent } from './gestao-clubes.component';

describe('GestaoClubesComponent', () => {
  let component: GestaoClubesComponent;
  let fixture: ComponentFixture<GestaoClubesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestaoClubesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GestaoClubesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
