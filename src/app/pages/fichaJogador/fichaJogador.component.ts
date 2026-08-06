import { FicheirosService } from './../../services/ficheiros.service';
import { AfterViewInit, Component, OnInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbAlertModule, NgbCollapseModule, NgbProgressbarModule, NgbDatepickerModule, NgbDateStruct, NgbDatepicker } from '@ng-bootstrap/ng-bootstrap';
import { EquipaService } from './../../services/equipa.service';
import { CommonModule } from '@angular/common';
import { LoginServiceService } from '../../services/login-service.service';
import { FormsModule } from '@angular/forms';
import { DataPipe } from './DataPipe'; // Seu DataPipe personalizado
import { JogoService } from '../../services/jogo.service';
import { JogoData } from '../lista-jogos/jogoData';
import { EquipaData } from '../equipa/equipaData';
import { environment } from '../../../environments/environment';


@Component({
  selector: 'user-cmp',
  templateUrl: './fichaJogador.component.html',
  styleUrl: './fichaJogador.component.css',
  standalone: true,
  imports: [NgbProgressbarModule, CommonModule, FormsModule, NgbAlertModule, DataPipe, NgbCollapseModule, NgbDatepickerModule]
})

export class FichaJogadorComponent implements OnInit {
  equipaData: EquipaData | undefined;
  jogadorData: jogadorData;

  public sbmSuccess: boolean = false;
  public sbmError: boolean = false;
  public faltas: FichaJogadorPresencasData[] = [];
  public hasFaltas: boolean = false;
  public spinner: boolean = false;
  public isCollapsed = false;
  public tirarFoto = false;
  public text_botao = "Mais dados";
  public isUploadFoto: boolean = false;
  public isAvatar: boolean = false;
  public isFotoPrincipal: boolean = false;
  public isUploadFoto_avatar = false;
  public count_presencas: ContadorPresencaData[] = [];
  load_presencas: boolean = false;
  total_faltas: number = 0;
  total_presencas: number = 0;

  isEditing = false;
  private jogadorDataBackup: any = {};
  fotoUrl: string = '';
  avatarUrl: string = '';

  jogosPorEscalao: { escalao: string; jogos: JogoData[] }[] = [];
  totalGeralJogos: number = 0;
  totalGeralGolos: number = 0;
  totalGeralGolosSofridos: number = 0;
  loadingJogos: boolean = false; // Opcional: para spinner se quiser
  escaloes: { idescalao: number; nomeEscalao: string }[] = [];
  selectedEscalao: string = '';
  selectedJogos: JogoData[] = [];
  expandedEscalao: string = '';
  expandedCompeticaoJogos: string = '';

  // Nova propriedade para controlar a visibilidade da tabela de faltas
  public showFaltas: boolean = false; // Inicialmente oculta
  public showPresencas: boolean = false; // Inicialmente oculta
  public showInfo: boolean = false; // Inicialmente visível
  public showJogos: boolean = false;
  public showHistorico: boolean = false; // Inicialmente oculta
  public loadingHistorico: boolean = false;
  public historicoJogador: any;
  public expandedEpoca: number = 0;
  public expandedEscalaoHistorico: string = '';
  public expandedCompeticaoHistorico: string = '';

  // Propriedade para a data de nascimento formatada (AAAA-MM-DD)
  public dataNascimentoDisplay: string = '';
  public dataNascimento: NgbDateStruct | null = null;
  public showDatepicker: boolean = false;

  // ===== CROPPER DE IMAGEM (Foto Perfil 4:3 / Avatar 1:1) =====
  @ViewChild('fileInputPerfil') fileInputPerfil!: ElementRef<HTMLInputElement>;
  @ViewChild('fileInputAvatar') fileInputAvatar!: ElementRef<HTMLInputElement>;
  @ViewChild('cropImgEl') cropImgEl?: ElementRef<HTMLImageElement>;
  @ViewChild('cropCanvasEl') cropCanvasEl?: ElementRef<HTMLCanvasElement>;
  @ViewChild('dp') dp?: NgbDatepicker;

  public showCropModal: boolean = false;
  public cropTargetType: 'perfil' | 'avatar' = 'perfil';
  public cropImageSrc: string | null = null;
  public cropUploading: boolean = false;

  public cropViewportWidth: number = 300;
  public cropViewportHeight: number = 225;

  public cropNaturalWidth: number = 0;
  public cropNaturalHeight: number = 0;
  public cropBaseScale: number = 1;
  public cropUserScale: number = 1;
  public cropOffsetX: number = 0;
  public cropOffsetY: number = 0;

  private isDragging: boolean = false;
  private dragStartX: number = 0;
  private dragStartY: number = 0;
  private dragStartOffsetX: number = 0;
  private dragStartOffsetY: number = 0;
  private pinchStartDistance: number = 0;
  private pinchStartUserScale: number = 1;

  constructor(private route: ActivatedRoute, private equipaService: EquipaService, private loginservice: LoginServiceService, private router: Router, private ficheirosService: FicheirosService, private jogoService: JogoService) {
    this.jogadorData = {
      id: 0,
      nome: "",
      nome_completo: "",
      data_nascimento: 0, // É um número no formato AAAAMMDD
      email: "",
      telemovel: "",
      pai_nome: "",
      pai_email: "",
      pai_telemovel: "",
      mae_nome: "",
      mae_email: "",
      mae_telemovel: "",
      morada: "",
      cidade: "",
      codigo_postal: "",
      observacoes: "",
      numero: "",
      cc: "",
      nif: 0,
      licenca: 0,
      tenant_id:0,
    };
  }

  ngOnInit() {
    this.load_presencas = true;
    this.spinner = true;
    this.sbmError = false;
    this.sbmSuccess = false;
    const routeParams = this.route.snapshot.paramMap;
    const idJogador = Number(routeParams.get('id'));
    // Validate tenant access for this equipa
    const currentTenantId = +environment.tenant_id;

    console.log('FichaJogadorComoponent | idJogador:', idJogador);
    this.loadJogadorImages(idJogador);

      this.equipaService.loadJogadorbyId(idJogador).subscribe(
        {
          next: data => {
            console.log("FichaJogadorComponent | loadJogadorbyId", data);
            if (data != null) {
              this.jogadorData = data;

          if (  this.jogadorData.tenant_id !== currentTenantId) {
          console.warn('FichaJogadorComponent | - Acesso nao autorizado - equipa pertence a outro tenant');
          this.router.navigate(['/erro-acesso']);
          return;
        }


            console.log("FichaJogadorComponent | loadJogadorbyId 2 ", this.jogadorData);

            // CONVERSÃO DO NÚMERO AAAAMMDD PARA STRING AAAA-MM-DD PARA EXIBIÇÃO NO INPUT
            if (this.jogadorData.data_nascimento && this.jogadorData.data_nascimento.toString().length === 8) {
              const dataStr = this.jogadorData.data_nascimento.toString();
              const ano = dataStr.substring(0, 4);
              const mes = dataStr.substring(4, 6);
              const dia = dataStr.substring(6, 8);
              this.dataNascimentoDisplay = `${ano}-${mes}-${dia}`;
              // Converter para NgbDateStruct para o datepicker
              this.dataNascimento = { year: Number(ano), month: Number(mes), day: Number(dia) };
            } else {
              this.dataNascimentoDisplay = '';
              this.dataNascimento = null;
            }

            this.equipaService.getFaltasByJogador(idJogador).subscribe(
              {
                next: data => {
                  console.log("FichaJogadorComponent | getFaltasByJogador", data);
                  if (data != null) {
                    this.spinner = false;
                    this.faltas = data;
                    // retirar faltas do tipo Lesão
                    this.faltas = this.faltas.filter(falta => falta.estado !== 'Lesão');
                    this.total_faltas = this.faltas.length;
                    if (this.faltas.length == 0) {
                      this.hasFaltas = false;
                    } else {
                      this.hasFaltas = true;
                    }
                  }

                  this.equipaService.getCountPresencasByJogador(idJogador).subscribe(
                    {
                      next: data => {
                        console.log("FichaJogadorComponent | getCountPresencasByJogador", data);
                        if (data != null) {
                          this.spinner = false;
                          this.count_presencas = data;
                          for (let i = 0; i < this.count_presencas.length; i++) {
                            this.total_presencas += this.count_presencas[i].set + this.count_presencas[i].out + this.count_presencas[i].nov + this.count_presencas[i].dez + this.count_presencas[i].jan + this.count_presencas[i].fev + this.count_presencas[i].mar + this.count_presencas[i].abr + this.count_presencas[i].mai + this.count_presencas[i].jun + this.count_presencas[i].jul;
                          }
                          this.load_presencas = false;

                        }
                      },
                      error: error => {
                        console.log("FichaJogadorComponent | Serviço getCountPresencasByJogador Erro!!");
                        this.sbmError = true;
                        this.load_presencas = false;
                      }
                    });

                },
                error: error => {
                  console.log("FichaJogadorComponent | Serviço getFaltasByJogador Erro!!");
                  this.sbmError = true;
                }
              });

            // Carregar escalões primeiro
            this.equipaService.getEquipasPorEpoca().subscribe({
              next: (data) => {
                data.forEach((esc: any) => {
                  this.escaloes.push({ idescalao: esc.id, nomeEscalao: esc.escalao });
                });

                console.log('Escalões carregados:', this.escaloes);

                // Obter a época atual
                this.equipaService.getEpocaAtual().subscribe({
                  next: (epocaAtual: any) => {
                    const epocaAtivaId = epocaAtual?.id || epocaAtual?.epoca_id || 0;
                    console.log('Época atual:', epocaAtual, '| ID:', epocaAtivaId);

                    // Agora carregar os jogos
                    this.jogoService.getJogosByJogadorId(idJogador).subscribe({
                      next: (jogos: JogoData[]) => {
                        // Filtrar apenas os jogos da época atual
                        const jogosEpocaAtual = epocaAtivaId > 0
                          ? jogos.filter(jogo => jogo.epoca_id === epocaAtivaId)
                          : jogos;
                        
                        console.log('Jogos do jogador (época atual):', jogosEpocaAtual);

                        // Agrupamento por escalão (agora com arrays de jogos)
                        const agrupamento = new Map<string, JogoData[]>();
                        jogosEpocaAtual.forEach(jogo => {
                          // Tentar encontrar o escalão pelo equipa_id
                          let escalao = this.escaloes.find(e => e.idescalao === jogo.equipa_id)?.nomeEscalao;
                          
                          // Debug: verificar se encontrou o escalão
                          if (!escalao) {
                            console.warn(`Escalão não encontrado para equipa_id: ${jogo.equipa_id}, jogo.id: ${jogo.id}`);
                            console.warn('Escalões disponíveis:', this.escaloes);
                          }
                          
                          // Fallback para 'Sem escalão' em vez de 'Desconhecido'
                          if (!escalao) {
                            escalao = 'Sem escalão';
                          }
                          
                          const chave = (jogo.tipoEquipa && jogo.tipoEquipa.trim() !== '' && !this.escaloes.find(e => e.nomeEscalao === jogo.tipoEquipa))
                            ? escalao + ' (' + jogo.tipoEquipa + ')'
                            : escalao;
                          if (!agrupamento.has(chave)) {
                            agrupamento.set(chave, []);
                          }
                          agrupamento.get(chave)!.push(jogo);
                        });

                        // Converta para array ordenado
                        this.jogosPorEscalao = Array.from(agrupamento.entries())
                          .map(([escalao, jogos]) => ({ escalao, jogos }))
                          .sort((a, b) => a.escalao.localeCompare(b.escalao));

                        // Calcule o total geral aqui (simples e eficiente)
                        this.totalGeralJogos = jogosEpocaAtual.length;

                        // Calcular total de golos do jogador
                        this.totalGeralGolos = jogosEpocaAtual.reduce((total, jogo) => total + this.calcularGolosJogo(jogo), 0);
                        this.totalGeralGolosSofridos = jogosEpocaAtual.reduce((total, jogo) => total + this.calcularGolosSofridosJogo(jogo), 0);

                        this.loadingJogos = false;
                        console.log('Jogos por escalão:', this.jogosPorEscalao);
                        console.log('Total geral de jogos:', this.totalGeralJogos);
                      },
                      error: (error) => {
                        console.error('Erro ao carregar jogos do jogador:', error);
                        this.jogosPorEscalao = [];
                        this.totalGeralJogos = 0;
                        this.loadingJogos = false;
                      }
                    });
                  },
                  error: (error) => {
                    console.error('Erro ao carregar época atual:', error);
                    this.loadingJogos = false;
                  }
                });
              },
              error: (error) => {
                console.error('Erro ao carregar escalões:', error);
                this.loadingJogos = false;
              }
            });

          }
        },
        error: error => {
          console.log("FichaJogadorComponent | Serviço loadJogadorbyId Erro!!");
          this.sbmError = true;
        }
      });
  }

  loadJogadorImages(idJogador: number) {
    const timestamp = new Date().getTime();
    this.fotoUrl = `assets/img/jogadores/${idJogador}.jpg?v=${timestamp}`;
    this.avatarUrl = `assets/img/jogadores/${idJogador}_avatar.jpg?v=${timestamp}`;
  }


  startEditing() {
    this.isEditing = true;
    this.jogadorDataBackup = JSON.parse(JSON.stringify(this.jogadorData));
  }
  cancelEditing() {
    this.isEditing = false;
    this.jogadorData = JSON.parse(JSON.stringify(this.jogadorDataBackup));
    this.isUploadFoto_avatar = false;
    this.isUploadFoto = false;
    if (this.showCropModal) {
      this.closeCropModal();
    }
  }

  detalhe() {
    if (this.isCollapsed == true) {
      this.isCollapsed = false;
      this.text_botao = "Menos Dados";
    } else {
      this.isCollapsed = true;
      this.text_botao = "Mais Dados";
    }
  }

  /**
   * Abre o seletor de ficheiros nativo (input escondido) para o tipo de foto pretendido.
   * 'perfil' -> crop 3:4 | 'avatar' -> crop 1:1
   */
  triggerFileInput(tipo: 'perfil' | 'avatar') {
    this.cropTargetType = tipo;
    if (tipo === 'avatar') {
      this.isAvatar = true;
      this.isFotoPrincipal = false;
      this.fileInputAvatar.nativeElement.value = '';
      this.fileInputAvatar.nativeElement.click();
    } else {
      this.isFotoPrincipal = true;
      this.isAvatar = false;
      this.fileInputPerfil.nativeElement.value = '';
      this.fileInputPerfil.nativeElement.click();
    }
  }

  /**
   * Ficheiro escolhido pelo utilizador. Valida e abre o modal de crop manual.
   */
  onCropFileSelected(event: any) {
    const file: File = event?.target?.files?.[0];
    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      alert('Por favor selecione um ficheiro de imagem válido.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB
      alert('Ficheiro demasiado grande. Máximo 10MB.');
      return;
    }

    // Configura as dimensões do "viewport" de crop consoante o tipo de foto
    if (this.cropTargetType === 'avatar') {
      this.cropViewportWidth = 300;
      this.cropViewportHeight = 300; // 1:1
    } else {
      this.cropViewportWidth = 225;
      this.cropViewportHeight = 300; // 3:4
    }

    this.cropUserScale = 1;
    this.cropOffsetX = 0;
    this.cropOffsetY = 0;

    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.cropImageSrc = e.target.result;
      this.showCropModal = true;
    };
    reader.readAsDataURL(file);
  }

  /**
   * Chamado quando a imagem de preview termina de carregar dentro do modal.
   * Calcula a escala base ("cover") para preencher totalmente a zona de crop.
   */
  onCropImageLoad() {
    if (!this.cropImgEl) { return; }
    const imgEl = this.cropImgEl.nativeElement;
    this.cropNaturalWidth = imgEl.naturalWidth;
    this.cropNaturalHeight = imgEl.naturalHeight;
    this.cropBaseScale = Math.max(
      this.cropViewportWidth / this.cropNaturalWidth,
      this.cropViewportHeight / this.cropNaturalHeight
    );
    this.cropUserScale = 1;
    this.cropOffsetX = 0;
    this.cropOffsetY = 0;
  }

  get effectiveCropScale(): number {
    return this.cropBaseScale * this.cropUserScale;
  }

  get cropImgTransform(): string {
    return `translate(${this.cropOffsetX}px, ${this.cropOffsetY}px) scale(${this.effectiveCropScale})`;
  }

  private clampUserScale(value: number): number {
    return Math.min(4, Math.max(1, value));
  }

  /** Garante que a imagem cobre sempre a totalidade da zona de crop (sem áreas vazias) */
  private clampOffsets() {
    const scaledW = this.cropNaturalWidth * this.effectiveCropScale;
    const scaledH = this.cropNaturalHeight * this.effectiveCropScale;
    const maxOffsetX = Math.max(0, (scaledW - this.cropViewportWidth) / 2);
    const maxOffsetY = Math.max(0, (scaledH - this.cropViewportHeight) / 2);
    this.cropOffsetX = Math.min(maxOffsetX, Math.max(-maxOffsetX, this.cropOffsetX));
    this.cropOffsetY = Math.min(maxOffsetY, Math.max(-maxOffsetY, this.cropOffsetY));
  }

  // ----- Arrastar (mover a foto) com rato ou touch -----

  startDrag(event: MouseEvent | TouchEvent) {
    if (!this.cropImageSrc) { return; }
    event.preventDefault();

    if (this.isTouchEvent(event)) {
      if (event.touches.length === 2) {
        this.isDragging = false;
        this.pinchStartDistance = this.getTouchDistance(event.touches);
        this.pinchStartUserScale = this.cropUserScale;
        return;
      }
      if (event.touches.length === 1) {
        this.isDragging = true;
        this.dragStartX = event.touches[0].clientX;
        this.dragStartY = event.touches[0].clientY;
        this.dragStartOffsetX = this.cropOffsetX;
        this.dragStartOffsetY = this.cropOffsetY;
      }
    } else {
      this.isDragging = true;
      this.dragStartX = (event as MouseEvent).clientX;
      this.dragStartY = (event as MouseEvent).clientY;
      this.dragStartOffsetX = this.cropOffsetX;
      this.dragStartOffsetY = this.cropOffsetY;
    }
  }

  private isTouchEvent(event: MouseEvent | TouchEvent): event is TouchEvent {
    return typeof TouchEvent !== 'undefined' && event instanceof TouchEvent;
  }

  private getTouchDistance(touches: TouchList): number {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  private handleMove(clientX: number, clientY: number) {
    if (!this.isDragging) { return; }
    const dx = clientX - this.dragStartX;
    const dy = clientY - this.dragStartY;
    this.cropOffsetX = this.dragStartOffsetX + dx;
    this.cropOffsetY = this.dragStartOffsetY + dy;
    this.clampOffsets();
  }

  @HostListener('document:mousemove', ['$event'])
  onDocMouseMove(event: MouseEvent) {
    if (!this.showCropModal) { return; }
    this.handleMove(event.clientX, event.clientY);
  }

  @HostListener('document:mouseup')
  onDocMouseUp() {
    this.isDragging = false;
  }

  @HostListener('document:touchmove', ['$event'])
  onDocTouchMove(event: TouchEvent) {
    if (!this.showCropModal) { return; }

    if (event.touches.length === 2) {
      event.preventDefault();
      const dist = this.getTouchDistance(event.touches);
      if (this.pinchStartDistance > 0) {
        const ratio = dist / this.pinchStartDistance;
        this.cropUserScale = this.clampUserScale(this.pinchStartUserScale * ratio);
        this.clampOffsets();
      }
    } else if (event.touches.length === 1 && this.isDragging) {
      event.preventDefault();
      this.handleMove(event.touches[0].clientX, event.touches[0].clientY);
    }
  }

  @HostListener('document:touchend')
  onDocTouchEnd() {
    this.isDragging = false;
    this.pinchStartDistance = 0;
  }

  // ----- Zoom (roda do rato, botões e slider) -----

  onWheelZoom(event: WheelEvent) {
    if (!this.cropImageSrc) { return; }
    event.preventDefault();
    const delta = event.deltaY > 0 ? -0.1 : 0.1;
    this.cropUserScale = this.clampUserScale(this.cropUserScale + delta);
    this.clampOffsets();
  }

  zoomIn() {
    this.cropUserScale = this.clampUserScale(this.cropUserScale + 0.2);
    this.clampOffsets();
  }

  zoomOut() {
    this.cropUserScale = this.clampUserScale(this.cropUserScale - 0.2);
    this.clampOffsets();
  }

  onZoomSliderChange(value: string | number) {
    this.cropUserScale = this.clampUserScale(Number(value));
    this.clampOffsets();
  }

  // ----- Confirmar / Cancelar o crop -----

  cancelCrop() {
    this.closeCropModal();
  }

  private closeCropModal() {
    this.showCropModal = false;
    this.cropImageSrc = null;
    this.isUploadFoto = false;
    this.isUploadFoto_avatar = false;
    this.isAvatar = false;
    this.isFotoPrincipal = false;
    this.isDragging = false;
    this.pinchStartDistance = 0;
  }

  /**
   * Desenha, num canvas, exatamente a área visível na zona de crop (tendo em conta
   * a posição e o zoom atuais) e converte o resultado para um Blob JPEG que é enviado
   * para o serviço de upload.
   */
  confirmCrop() {
    if (!this.cropImgEl || !this.cropCanvasEl || !this.cropImageSrc) { return; }

    const imgEl = this.cropImgEl.nativeElement;
    const canvas = this.cropCanvasEl.nativeElement;
    const scale = this.effectiveCropScale;

    const scaledW = this.cropNaturalWidth * scale;
    const scaledH = this.cropNaturalHeight * scale;
    const imgLeft = this.cropViewportWidth / 2 - scaledW / 2 + this.cropOffsetX;
    const imgTop = this.cropViewportHeight / 2 - scaledH / 2 + this.cropOffsetY;

    // Retângulo (em pixels da imagem original) correspondente à zona visível
    const sx = Math.max(0, -imgLeft / scale);
    const sy = Math.max(0, -imgTop / scale);
    const sw = Math.min(this.cropNaturalWidth - sx, this.cropViewportWidth / scale);
    const sh = Math.min(this.cropNaturalHeight - sy, this.cropViewportHeight / scale);

    const isAvatarUpload = this.cropTargetType === 'avatar';
    const outputWidth = isAvatarUpload ? 500 : 600;
    const outputHeight = isAvatarUpload ? 500 : 800;

    canvas.width = outputWidth;
    canvas.height = outputHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) { return; }

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.clearRect(0, 0, outputWidth, outputHeight);
    ctx.drawImage(imgEl, sx, sy, sw, sh, 0, 0, outputWidth, outputHeight);

    canvas.toBlob((blob) => {
      if (blob) {
        this.uploadCroppedBlob(blob);
      }
    }, 'image/jpeg', 0.92);
  }

  private uploadCroppedBlob(blob: Blob) {
    this.cropUploading = true;
    const isAvatarUpload = this.cropTargetType === 'avatar';
    const fileName = isAvatarUpload ? 'avatar.jpg' : 'foto.jpg';
    const file = new File([blob], fileName, { type: 'image/jpeg' });

    const formData = new FormData();
    formData.append('foto', file);
    const nomefoto = isAvatarUpload
      ? (this.jogadorData.id.toString() + '_avatar')
      : this.jogadorData.id.toString();

    this.spinner = true;
    this.ficheirosService.uploadFoto({ parmIDFoto: nomefoto, foto: formData }).subscribe({
      next: (resp) => {
        console.log('uploadCroppedBlob | Upload response:', resp);
        const timestamp = new Date().getTime();
        if (isAvatarUpload) {
          this.avatarUrl = `assets/img/jogadores/${this.jogadorData.id}_avatar.jpg?v=${timestamp}`;
        } else {
          this.fotoUrl = `assets/img/jogadores/${this.jogadorData.id}.jpg?v=${timestamp}`;
        }
        this.spinner = false;
        this.cropUploading = false;
        this.closeCropModal();
      },
      error: (error) => {
        console.log('uploadCroppedBlob | Serviço uploadFoto Erro!!', error);
        this.spinner = false;
        this.cropUploading = false;
        alert('Ocorreu um erro ao enviar a foto. Tente novamente.');
      }
    });
  }

  toggleDatepicker() {
    this.showDatepicker = !this.showDatepicker;

    if (this.showDatepicker) {
      // Garante que o calendário abre sempre no mês/ano da data já preenchida
      // (ou no mês atual, caso ainda não exista data). É necessário aguardar
      // um ciclo, pois o *ngIf só cria o <ngb-datepicker> depois de showDatepicker mudar.
      setTimeout(() => {
        this.dp?.navigateTo(this.dataNascimento ?? undefined);
      });
    }
  }

  trackByCompeticao(index: number, competicao: any): string {
    return competicao.nomeCompeticao || index;
  }

  toggleJogosDetail(item: { escalao: string; jogos: JogoData[] }) {
    console.log('🚀 toggleJogosDetail | escalao:', item.escalao);
    if (this.expandedEscalao === item.escalao) {
      this.expandedEscalao = '';
    } else {
      this.expandedEscalao = item.escalao;
    }
  }

  toggleCompeticaoJogos(escalao: string, competicao: string) {
    console.log('🚀 toggleCompeticaoJogos | escalao:', escalao, '| competicao:', competicao);
    const key = escalao + '_' + competicao;
    if (this.expandedCompeticaoJogos === key) {
      this.expandedCompeticaoJogos = '';
    } else {
      this.expandedCompeticaoJogos = key;
    }
    console.log('🚀 toggleCompeticaoJogos | expandedCompeticaoJogos:', this.expandedCompeticaoJogos);
  }

  getJogosPorCompeticao(jogos: JogoData[]): any[] {
    console.log('getJogosPorCompeticao | jogos recebidos:', jogos.length);
    const grupos = new Map<string, any[]>();
    
    jogos.forEach(jogo => {
      const competicao = jogo.competicao_nome || 'Sem competição';
      if (!grupos.has(competicao)) {
        grupos.set(competicao, []);
      }
      grupos.get(competicao)!.push(jogo);
    });

    const resultado = Array.from(grupos.entries()).map(([nomeCompeticao, jogos]) => ({
      nomeCompeticao,
      jogos
    }));
    
    console.log('getJogosPorCompeticao | resultado:', resultado);
    return resultado;
  }

  getTotalGolosCompeticaoJogos(competicaoGroup: any): number {
    if (!competicaoGroup || !competicaoGroup.jogos) {
      return 0;
    }
    return competicaoGroup.jogos.reduce((total: number, jogo: JogoData) => {
      return total + this.calcularGolosJogo(jogo);
    }, 0);
  }

  getTotalGolosSofridosCompeticaoJogos(competicaoGroup: any): number {
    if (!competicaoGroup || !competicaoGroup.jogos) {
      return 0;
    }
    return competicaoGroup.jogos.reduce((total: number, jogo: JogoData) => {
      return total + this.calcularGolosSofridosJogo(jogo);
    }, 0);
  }

  getTotalGolosEscalaoJogos(jogos: JogoData[]): number {
    if (!jogos) {
      return 0;
    }
    return jogos.reduce((total: number, jogo: JogoData) => {
      return total + this.calcularGolosJogo(jogo);
    }, 0);
  }

  getTotalGolosSofridosEscalaoJogos(jogos: JogoData[]): number {
    if (!jogos) {
      return 0;
    }
    return jogos.reduce((total: number, jogo: JogoData) => {
      return total + this.calcularGolosSofridosJogo(jogo);
    }, 0);
  }

  isJogadorGR(): boolean {
    const idJogador = this.jogadorData.id;
    // Verificar em todos os jogos se o jogador é GR
    for (const item of this.jogosPorEscalao) {
      for (const jogo of item.jogos) {
        const jogador = jogo.jogadores?.find(j => j.id_jogador === idJogador);
        if (jogador && (jogador.isGR || jogador.gr)) {
          return true;
        }
      }
    }
    return false;
  }

  onDateChange(date: NgbDateStruct | null) {
    console.log("FichaJogadorComponent | onDateChange | date:", date);
    if (date) {
      // Converter NgbDateStruct para string AAAA-MM-DD
      const year = date.year;
      const month = String(date.month).padStart(2, '0');
      const day = String(date.day).padStart(2, '0');
      this.dataNascimentoDisplay = `${year}-${month}-${day}`;
      console.log("FichaJogadorComponent | onDateChange | dataNascimentoDisplay:", this.dataNascimentoDisplay);
    } else {
      this.dataNascimentoDisplay = '';
    }
    this.showDatepicker = false; // Fechar calendário após selecionar
  }

  gravarFichaJogador() {
    this.spinner = true;
    console.log("avaliar loginData");
    if (this.loginservice.getLoginData() == undefined) {
      console.log("loginData==undefined");
      this.router.navigate(['/']);
    }

    // CONVERSÃO DA STRING AAAA-MM-DD DE VOLTA PARA NÚMERO AAAAMMDD ANTES DE SALVAR
    console.log("Antes de dataNascimentoDisplay");
    if (this.dataNascimentoDisplay) {
      console.log("dataNascimentoDisplay:", this.dataNascimentoDisplay);
      // Remove os hífens para obter AAAAMMDD
      const dataNumericaStr = this.dataNascimentoDisplay.replace(/-/g, '');
      // Verifica se a string resultante tem 8 dígitos e é um número válido
      if (dataNumericaStr.length === 8 && !isNaN(Number(dataNumericaStr))) {
        this.jogadorData.data_nascimento = Number(dataNumericaStr);
      } else {
        console.warn('Data de nascimento inválida para conversão AAAAMMDD:', this.dataNascimentoDisplay);
        this.jogadorData.data_nascimento = 0; // Ou algum valor padrão para inválido
      }
    } else {
      this.jogadorData.data_nascimento = 0; // Ou 0 se o campo estiver vazio
    }

    this.equipaService.updateJogador(this.loginservice.getLoginData().id, this.jogadorData).subscribe(
      {
        next: data => {
          console.log("FichaJogadorComponent | gravarFichaJogador", data);
          if (data != null) {
            this.spinner = false;
            this.isEditing = false;
            if (data == false) {
              this.sbmError = true;
            }
            if (data == true) {
              this.sbmSuccess = true;

            }
          } else {
          }
        },
        error: error => {
          console.log("FichaJogadorComponent | Serviço gravarFichaJogador Erro!!");
          this.sbmError = true;
        }
      });
  }

  // Novo método para alternar a visibilidade das faltas
  toggleFaltasVisibility() {
    this.showFaltas = !this.showFaltas;
  }

  toggleInfoVisibility() {
    this.showInfo = !this.showInfo;
  }

  togglePresencasVisibility() {
    this.showPresencas = !this.showPresencas;
  }

  toggleJogosVisibility() {
    this.showJogos = !this.showJogos;
  }

  navigateToJogo(jogoId: number) {
    // Navigate to the game page
    this.router.navigate(['/jogo', jogoId]);
  }

  calcularGolosJogo(jogo: JogoData): number {
    const idJogador = this.jogadorData.id;
    const jogador = jogo.jogadores?.find(j => j.id_jogador === idJogador);
    if (!jogador) return 0;
    return (jogador.golos_p || 0) +
           (jogador.golos_ld || 0) +
           (jogador.golos_pp || 0) +
           (jogador.golos_up || 0) +
           (jogador.golos_normal || 0);
  }

  calcularGolosSofridosJogo(jogo: JogoData): number {
    const idJogador = this.jogadorData.id;
    const jogador = jogo.jogadores?.find(j => j.id_jogador === idJogador);
    if (!jogador) return 0;
    return (jogador.golos_s_p || 0) +
           (jogador.golos_s_ld || 0) +
           (jogador.golos_s_up || 0) +
           (jogador.golos_s_pp || 0) +
           (jogador.golos_s_normal || 0);
  }

  toggleHistoricoVisibility() {
    this.showHistorico = !this.showHistorico;
    
    // Carregar histórico apenas quando a secção é aberta pela primeira vez
    if (this.showHistorico && !this.historicoJogador) {
      this.loadHistorico();
    }
  }

  toggleEpocaDetail(epocaId: number) {
    if (this.expandedEpoca === epocaId) {
      this.expandedEpoca = 0;
    } else {
      this.expandedEpoca = epocaId;
    }
  }

  toggleEscalaoHistorico(epocaId: number, escalaoName: string) {
    const key = epocaId + '_' + escalaoName;
    if (this.expandedEscalaoHistorico === key) {
      this.expandedEscalaoHistorico = '';
    } else {
      this.expandedEscalaoHistorico = key;
    }
  }

  toggleCompeticaoHistorico(epocaId: number, escalaoName: string, competicaoName: string) {
    const key = epocaId + '_' + escalaoName + '_' + competicaoName;
    if (this.expandedCompeticaoHistorico === key) {
      this.expandedCompeticaoHistorico = '';
    } else {
      this.expandedCompeticaoHistorico = key;
    }
  }

  loadHistorico() {
    this.loadingHistorico = true;
    const idJogador = this.jogadorData.id;
    
    this.equipaService.getHistoricoByJogador(idJogador).subscribe({
      next: (data: any) => {
        console.log('FichaJogadorComponent | loadHistorico', data);
        if (data && data.epocas) {
          // Filter out seasons with no games and no training
          data.epocas = data.epocas.filter((epoca: any) => {
            const hasGames = epoca.jogos && epoca.jogos.length > 0;
            const hasTreinos = epoca.treinos && epoca.treinos.length > 0;
            return hasGames || hasTreinos;
          });
          
          data.epocas.forEach((epoca: any) => {
            // Pre-compute and store the groupings for each época
            epoca.gruposEscaloes = this.getJogosPorEscalaoCompeticao(epoca.jogos, epoca);
          });
        }
        this.historicoJogador = data;
        this.loadingHistorico = false;
      },
      error: (error) => {
        console.error('Erro ao carregar histórico do jogador:', error);
        this.historicoJogador = null;
        this.loadingHistorico = false;
      }
    });
  }



  getResumoPresencasPorEscalao(treinos: any[], epoca?: any): any[] {
    const meses = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
    const grupos = new Map<string, any>();
    
    console.log('getResumoPresencasPorEscalao | Total treinos:', treinos.length);
    console.log('getResumoPresencasPorEscalao | Exemplo de treino:', treinos[0]);
    
    // Filtrar apenas treinos onde o jogador atual está presente
    const idJogadorAtual = this.jogadorData?.id;
    const treinosFiltrados = treinos.filter(treino => {
      if (!treino.jogadoresPresenca || !Array.isArray(treino.jogadoresPresenca)) {
        return false;
      }
      // Procurar o jogador atual no array de presenças
      const presencaJogador = treino.jogadoresPresenca.find(
        (jp: any) => jp.id_jogador === idJogadorAtual
      );
      // Verificar se o estado é "Presente"
      return presencaJogador && presencaJogador.estado === 'Presente';
    });
    
    console.log('getResumoPresencasPorEscalao | Treinos filtrados (jogador presente):', treinosFiltrados.length);
    
    treinosFiltrados.forEach(treino => {
      // Usar o atributo escalao_descricao do JSON
      let nomeEscalao = treino.escalao_descricao;
      
      // Fallback para outros campos se escalao_descricao não existir
      if (!nomeEscalao) {
        nomeEscalao = treino.nomeequipa || treino.escalao || treino.nomeEscalao || treino.equipa_nome || treino.nome_equipa;
      }
      
      // If not found, try to look it up from the escaloes array using equipa_id or similar
      if (!nomeEscalao) {
        const equipaId = treino.equipa_id || treino.idequipa || treino.id_escalao;
        if (equipaId) {
          const escalaoObj = this.escaloes.find(e => e.idescalao === equipaId);
          nomeEscalao = escalaoObj?.nomeEscalao;
        }
      }
      
      // Fallback to the season's escalão name if available
      if (!nomeEscalao && epoca && epoca.nomeEscalao) {
        nomeEscalao = epoca.nomeEscalao;
      }
      
      // Final fallback
      nomeEscalao = nomeEscalao || 'Sem escalão';
      
      if (!grupos.has(nomeEscalao)) {
        const novoGrupo: any = { escalao: nomeEscalao };
        meses.forEach(m => novoGrupo[m] = 0);
        grupos.set(nomeEscalao, novoGrupo);
      }
      const grupo = grupos.get(nomeEscalao);
      
      // Parse date from AAAAMMDD format
      const dataStr = treino.data.toString();
      const ano = dataStr.substring(0, 4);
      const mes = dataStr.substring(4, 6);
      const dia = dataStr.substring(6, 8);
      const data = new Date(Number(ano), Number(mes) - 1, Number(dia));
      const mesIndex = data.getMonth(); // 0-11
      const mesKey = meses[Number(mes) - 1];
      if (grupo && mesKey) {
        grupo[mesKey]++;
      }
    });
    
    return Array.from(grupos.values());
  }

  getTotalPresencasResumo(resumo: any): number {
    const meses = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
    return meses.reduce((total, m) => total + (resumo[m] || 0), 0);
  }

  getTotalTreinosPresente(treinos: any[]): number {
    if (!treinos || treinos.length === 0) return 0;
    
    const idJogadorAtual = this.jogadorData?.id;
    const treinosPresentes = treinos.filter(treino => {
      if (!treino.jogadoresPresenca || !Array.isArray(treino.jogadoresPresenca)) {
        return false;
      }
      const presencaJogador = treino.jogadoresPresenca.find(
        (jp: any) => jp.id_jogador === idJogadorAtual
      );
      return presencaJogador && presencaJogador.estado === 'Presente';
    });
    
    return treinosPresentes.length;
  }

  getTotalJogosEscalao(escalaoGroup: any): number {
    let total = 0;
    escalaoGroup.competicaoGroups.forEach((group: any) => {
      total += group.jogos.length;
    });
    return total;
  }

  getTotalGolosEscalao(escalaoGroup: any): number {
    let total = 0;
    const isGR = this.isJogadorGR();
    escalaoGroup.competicaoGroups.forEach((group: any) => {
      group.jogos.forEach((jogo: any) => {
        total += isGR ? this.calcularGolosSofridosJogo(jogo) : this.calcularGolosJogo(jogo);
      });
    });
    return total;
  }

  getTotalGolosCompeticao(competicaoGroup: any): number {
    let total = 0;
    const isGR = this.isJogadorGR();
    competicaoGroup.jogos.forEach((jogo: any) => {
      total += isGR ? this.calcularGolosSofridosJogo(jogo) : this.calcularGolosJogo(jogo);
    });
    return total;
  }

  getJogosPorEscalaoCompeticao(jogos: any[], epoca: any): any[] {
    const escalaoGroups = new Map<string, any[]>();
    
    jogos.forEach(jogo => {
      // Resolve escalão name from equipa_id using the escaloes array,
      // fallback to the season's escalão name
      const escalao = this.escaloes.find(e => e.idescalao === jogo.equipa_id)?.nomeEscalao 
        || (epoca && epoca.nomeEscalao) 
        || 'Sem escalão';
      const chave = (jogo.tipoEquipa && jogo.tipoEquipa.trim() !== '' && !this.escaloes.find(e => e.nomeEscalao === jogo.tipoEquipa))
        ? escalao + ' (' + jogo.tipoEquipa + ')'
        : escalao;
      
      if (!escalaoGroups.has(chave)) {
        escalaoGroups.set(chave, []);
      }
      escalaoGroups.get(chave)!.push(jogo);
    });
    
    return Array.from(escalaoGroups.entries()).map(([nomeEscalao, jogos]) => {
      const competicaoGroups = new Map<string, any[]>();
      
      jogos.forEach(jogo => {
        const nomeCompeticao = jogo.competicao_nome || 'Sem competição';
        if (!competicaoGroups.has(nomeCompeticao)) {
          competicaoGroups.set(nomeCompeticao, []);
        }
        competicaoGroups.get(nomeCompeticao)!.push(jogo);
      });
      
      return {
        nomeEscalao,
        competicaoGroups: Array.from(competicaoGroups.entries()).map(([nomeCompeticao, jogos]) => ({
          nomeCompeticao,
          jogos
        }))
      };
    });
  }
}
