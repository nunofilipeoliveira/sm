
import { Component, OnInit, Renderer2, ViewChild, ElementRef } from '@angular/core';
import { ROUTES } from '../../sidebar/sidebar.component';
import { Router } from '@angular/router';
import { Location} from '@angular/common';
import { PoppupEscalaoComponent } from '../../pages/poppup-escalao/poppup-escalao.component';
import { MatDialog } from '@angular/material/dialog';
import { LoginServiceService } from '../../services/login-service.service';
import { EquipaService } from '../../services/equipa.service';


@Component({
    selector: 'navbar-cmp',
    templateUrl: 'navbar.component.html'
})

export class NavbarComponent implements OnInit{
    private listTitles: any[]= [];
    location: Location;
    private nativeElement: Node;
    escalao_descritivo:string|null ='';
    private sidebarVisible: boolean;

    public isCollapsed = true;


    constructor(location:Location, private renderer : Renderer2, private element : ElementRef, private router: Router, private dialog: MatDialog, private loginws: LoginServiceService, private equipaWS: EquipaService) {
        this.location = location;
        this.nativeElement = element.nativeElement;
        this.sidebarVisible = false;
    }

   ngOnChanges() {
       this.escalao_descritivo = localStorage.getItem("descritivo_escalao");
   }

    ngOnInit(){
        this.listTitles = ROUTES.filter(listTitle => listTitle);
        var navbar : HTMLElement = this.element.nativeElement;
        //this.toggleButton = navbar.getElementsByClassName('navbar-toggle')[0];
        this.router.events.subscribe((event) => {
          this.sidebarClose();
       });
       this.escalao_descritivo=localStorage.getItem("descritivo_escalao");
    }
    getTitle(){
      var titlee = this.location.prepareExternalUrl(this.location.path());
      if(titlee.charAt(0) === '#'){
          titlee = titlee.slice( 1 );
      }
      for(var item = 0; item < this.listTitles.length; item++){
          if(this.listTitles[item].path === titlee){
              return this.listTitles[item].title;
          }
      }
      return '';
    }
    sidebarToggle() {
        if (this.sidebarVisible === false) {
            this.sidebarOpen();
        } else {
            this.sidebarClose();
        }
      }
      sidebarOpen() {
          //const toggleButton = this.toggleButton;
          const html = document.getElementsByTagName('html')[0];
          const mainPanel =  <HTMLElement>document.getElementsByClassName('main-panel')[0];
          setTimeout(function(){
             // toggleButton.classList.add('toggled');
          }, 500);

          html.classList.add('nav-open');
          if (window.innerWidth < 991) {
            mainPanel.style.position = 'fixed';
          }
          this.sidebarVisible = true;
      };
      sidebarClose() {
          const html = document.getElementsByTagName('html')[0];
          const mainPanel =  <HTMLElement>document.getElementsByClassName('main-panel')[0];
          if (window.innerWidth < 991) {
            setTimeout(function(){
              mainPanel.style.position = '';
            }, 500);
          }
         // this.toggleButton.classList.remove('toggled');
          this.sidebarVisible = false;
          html.classList.remove('nav-open');
      };
      collapse(){
        this.isCollapsed = !this.isCollapsed;
        const navbar = document.getElementsByTagName('nav')[0];
        console.log(navbar);
        if (!this.isCollapsed) {
          navbar.classList.remove('navbar-transparent');
          navbar.classList.add('bg-white');
        }else{
          navbar.classList.add('navbar-transparent');
          navbar.classList.remove('bg-white');
        }

      }

      showPopEscaloes() {
        console.log("Mostrar Pop Escalões");

        const longids = this.loginws.getLoginData();

        this.loginws.clearEquipa();
        console.log('NavbarComponent | showPopEscaloes | clearEquipa');
        this.equipaWS.clear();
        console.log('NavbarComponent | showPopEscaloes | clearEquipa | after clear');

        this.dialog.open(PoppupEscalaoComponent, {
                width: '250px',
                height: '200px',
                data:longids.escalaoEpoca
              });
      }

}
