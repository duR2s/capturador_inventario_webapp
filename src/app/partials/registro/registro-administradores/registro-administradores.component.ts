import { Component, Input, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FacadeService } from 'src/app/services/facade.service';
import { AdministradoresService } from 'src/app/services/roles/administradores.service';
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
// Importante para formatear la fecha
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-registro-admin',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  providers: [DatePipe], // Agregamos DatePipe a proveedores
  templateUrl: './registro-administradores.component.html',
  styleUrls: ['./registro-administradores.component.scss']
})
export class RegistroAdminComponent implements OnInit {

  @Input() rol: string = ""; // Puede venir sucio como "administradores"
  @Input() datos_user: any = {};

  public admin:any = {};
  public errors:any = {};
  public editar:boolean = false;
  public token: string = "";
  public idUser: Number = 0;

  public hide_1: boolean = false;
  public hide_2: boolean = false;
  public inputType_1: string = 'password';
  public inputType_2: string = 'password';

  constructor(
    private location: Location,
    public activatedRoute: ActivatedRoute,
    private administradoresService: AdministradoresService,
    private facadeService: FacadeService,
    private router: Router,
    private datePipe: DatePipe
  ) { }

  ngOnInit(): void {
    if(this.activatedRoute.snapshot.params['id'] != undefined){
      this.editar = true;
      this.idUser = this.activatedRoute.snapshot.params['id'];

      if (this.datos_user) {
        this.admin = {
          id: this.datos_user.id,
          clave_admin: this.datos_user.clave_interna || this.datos_user.clave_admin,
          rfc: this.datos_user.rfc,
          telefono: this.datos_user.telefono,
          fecha_nacimiento: this.datos_user.fecha_nacimiento,
          first_name: this.datos_user.user?.first_name || "",
          last_name: this.datos_user.user?.last_name || "",
          email: this.datos_user.user?.email || this.datos_user.user?.username || "",
          rol: 'ADMIN' // Forzamos ADMIN en edición también
        };
      }
    } else {
      this.admin = this.administradoresService.esquemaAdmin();
      // CORRECCIÓN: Ignoramos el @Input rol si viene incorrecto y forzamos la constante
      this.admin.rol = 'ADMIN';
      this.token = this.facadeService.getSessionToken();
    }
  }

  public showPassword() {
    if(this.inputType_1 == 'password'){
      this.inputType_1 = 'text';
      this.hide_1 = true;
    } else {
      this.inputType_1 = 'password';
      this.hide_1 = false;
    }
  }

  public showPwdConfirmar() {
    if(this.inputType_2 == 'password'){
      this.inputType_2 = 'text';
      this.hide_2 = true;
    } else {
      this.inputType_2 = 'password';
      this.hide_2 = false;
    }
  }

  // EVENTO DE FECHA: Convierte el objeto Date de Angular Material a string "YYYY-MM-DD"
  public changeFecha(event: any) {
    if (event.value) {
      this.admin.fecha_nacimiento = this.datePipe.transform(event.value, 'yyyy-MM-dd');
    }
  }

  public regresar(){
    this.location.back();
  }

  public registrar(): void {
    this.errors = {};
    this.errors = this.administradoresService.validarAdmin(this.admin, this.editar);
    if(Object.keys(this.errors).length > 0){
      return;
    }

    // CORRECCIÓN FINAL: Aseguramos que se envíe 'ADMIN' justo antes del submit
    this.admin.rol = 'ADMIN';

    if(this.admin.password == this.admin.confirmar_password){
      this.administradoresService.registrarAdmin(this.admin).subscribe(
        (response) => {
          alert("Administrador registrado exitosamente");
          if(this.token && this.token !== ""){
            this.router.navigate(["administrador"]);
          } else {
            this.router.navigate(["/"]);
          }
        },
        (error) => {
          alert("Error al registrar administrador");
          if(error.error && error.error.message){
             alert(error.error.message);
          }
        }
      );
    } else {
      alert("Las contraseñas no coinciden");
      this.admin.password="";
      this.admin.confirmar_password="";
    }
  }

  public actualizar(): void {
    this.errors = {};
    this.errors = this.administradoresService.validarAdmin(this.admin, this.editar);
    if(Object.keys(this.errors).length > 0){
      return;
    }

    if (!this.admin.id) {
        this.admin.id = this.idUser;
    }

    // Aseguramos rol en actualización
    this.admin.rol = 'ADMIN';

    this.administradoresService.actualizarAdmin(this.admin).subscribe(
      (response) => {
        alert("Administrador actualizado exitosamente");
        this.router.navigate(["administrador"]);
      },
      (error) => {
        alert("Error al actualizar administrador");
      }
    );
  }

  public soloLetras(event: KeyboardEvent) {
    const charCode = event.key.charCodeAt(0);
    if (
      !(charCode >= 65 && charCode <= 90) &&
      !(charCode >= 97 && charCode <= 122) &&
      charCode !== 32
    ) {
      event.preventDefault();
    }
  }
}
