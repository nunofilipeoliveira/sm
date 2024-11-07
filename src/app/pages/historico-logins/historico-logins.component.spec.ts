import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoricoLoginsComponent } from './historico-logins.component';

describe('HistoricoLoginsComponent', () => {
  let component: HistoricoLoginsComponent;
  let fixture: ComponentFixture<HistoricoLoginsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistoricoLoginsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HistoricoLoginsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
