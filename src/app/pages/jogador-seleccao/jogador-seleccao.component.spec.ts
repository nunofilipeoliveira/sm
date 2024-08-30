import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JogadorSeleccaoComponent } from './jogador-seleccao.component';

describe('JogadorSeleccaoComponent', () => {
  let component: JogadorSeleccaoComponent;
  let fixture: ComponentFixture<JogadorSeleccaoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JogadorSeleccaoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JogadorSeleccaoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
