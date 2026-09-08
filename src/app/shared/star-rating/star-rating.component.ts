import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Componente de classificação por estrelas (1 a 5).
 *
 * Uso:
 *   <star-rating [value]="jogador.classificacao" (valueChange)="onClassificacaoChange(posicao, $event)" size="sm"></star-rating>
 *   <star-rating [value]="jogador.media_classificacao" [readonly]="true" size="sm"></star-rating>
 */
@Component({
  selector: 'star-rating',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="star-rating"
          [class.star-rating-interactive]="!readonly"
          [class.star-rating-sm]="size === 'sm'"
          [class.star-rating-lg]="size === 'lg'"
          role="group"
          [attr.aria-label]="'Classificação: ' + displayValue + ' de 5'">
      <i *ngFor="let star of stars"
         class="fas fa-star"
         [class.text-warning]="star <= displayValue"
         [class.text-muted]="star > displayValue"
         (click)="onStarClick(star)"></i>
    </span>
  `,
  styles: [`
    .star-rating { display: inline-flex; align-items: center; gap: 2px; line-height: 1; white-space: nowrap; }
    .star-rating .fas { font-size: 1.1rem; transition: color .15s ease-in-out, transform .1s ease-in-out; }
    .star-rating-sm .fas { font-size: 0.9rem; }
    .star-rating-lg .fas { font-size: 1.5rem; }
    .star-rating-interactive .fas { cursor: pointer; }
    .star-rating-interactive .fas:hover { transform: scale(1.2); }
  `]
})
export class StarRatingComponent {

  stars: number[] = [1, 2, 3, 4, 5];

  /** Valor atual da classificação (1 a 5). Null/undefined quando ainda não avaliado. */
  @Input() value: number | null | undefined = null;

  /** Se true, as estrelas são apenas de leitura (não clicáveis). */
  @Input() readonly: boolean = false;

  /** Tamanho das estrelas: 'sm' | 'md' | 'lg'. */
  @Input() size: string = 'md';

  /** Notifica o novo valor selecionado (0 quando o utilizador limpa a classificação). */
  @Output() valueChange = new EventEmitter<number>();

  /** Valor arredondado (0-5) utilizado para preencher as estrelas. */
  get displayValue(): number {
    const valor = Math.round(Number(this.value ?? 0));
    return Math.min(5, Math.max(0, valor));
  }

  onStarClick(star: number): void {
    if (this.readonly) {
      return;
    }
    // Clicar na estrela correspondente ao valor atual limpa a classificação (0).
    const novoValor = (star === this.displayValue) ? 0 : star;
    this.value = novoValor;
    this.valueChange.emit(novoValor);
  }
}