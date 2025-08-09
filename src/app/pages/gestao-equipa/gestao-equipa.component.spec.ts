import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestaoEquipaComponent } from './gestao-equipa.component';

describe('GestaoEquipaComponent', () => {
  let component: GestaoEquipaComponent;
  let fixture: ComponentFixture<GestaoEquipaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestaoEquipaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GestaoEquipaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
