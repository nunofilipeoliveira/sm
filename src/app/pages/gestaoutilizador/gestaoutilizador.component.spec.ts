import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestaoutilizadorComponent } from './gestaoutilizador.component';

describe('GestaoutilizadorComponent', () => {
  let component: GestaoutilizadorComponent;
  let fixture: ComponentFixture<GestaoutilizadorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestaoutilizadorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GestaoutilizadorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
