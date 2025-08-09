import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NovoJogadorComponent } from './novo-jogador.component';

describe('NovoJogadorComponent', () => {
  let component: NovoJogadorComponent;
  let fixture: ComponentFixture<NovoJogadorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NovoJogadorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NovoJogadorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
