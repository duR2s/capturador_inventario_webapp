import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FacadeService } from 'src/app/services/facade.service';
import { UsuariosService } from 'src/app/services/roles/usuarios.service';
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
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
  providers: [DatePipe],
  templateUrl: './registro-administradores.component.html',
  styleUrls: ['./registro-administradores.component.scss']
})
export class RegistroAdminComponent implements OnInit {

  // Inputs para modo "Embebido"
  @Input() rol: string = "";
  @Input() datos_user: any = null; // Objeto a editar
  @Input() isEmbedded: boolean = false; // Bandera para saber si estamos dentro de otra pantalla

  // Outputs para comunicar al padre cuando terminar
  @Output() onClose = new EventEmitter<boolean>(); // true = guardado, false = cancelado

  public admin: any = {};
  public errors: any = {};
  public editar: boolean = false;
  public token: string = "";
  public idUser: Number = 0;

  public hide_1: boolean = false;
  public hide_2: boolean = false;
  public inputType_1: string = 'password';
  public inputType_2: string = 'password';

  constructor(
    private location: Location,
    public activatedRoute: ActivatedRoute,
    private usuariosService: UsuariosService,
    private facadeService: FacadeService,
    private router: Router,
    private datePipe: DatePipe
  ) { }

  ngOnInit(): void {
    // Lógica prioritaria: Si hay datos por Input (modo embebido o pasados directo)
    if (this.datos_user && this.datos_user.id) {
      this.configurarEdicion(this.datos_user);
    }
    // Lógica secundaria: Si viene por URL (modo legacy o acceso directo)
    else if(this.activatedRoute.snapshot.params['id'] != undefined){
      this.editar = true;
      this.idUser = this.activatedRoute.snapshot.params['id'];
      // Aquí podrías llamar al servicio para obtener el usuario si no viene en datos_user
      // Pero asumiendo que ya se tiene la lógica, lo dejamos así o adaptamos según tu backend.
      // Por ahora, asumimos que si es por URL, el componente se encarga (no implementado aquí fetch por ID).
    }
    // Modo Creación
    else {
      this.admin = this.usuariosService.getEsquemaBase('ADMIN');
      this.token = this.facadeService.getSessionToken();
    }
  }

  private configurarEdicion(data: any) {
    this.editar = true;
    this.idUser = data.id;
    this.admin = {
      id: data.id,
      clave_interna: data.clave_interna || data.clave_admin,
      rfc: data.rfc,
      telefono: data.telefono,
      fecha_nacimiento: data.fecha_nacimiento,
      first_name: data.user?.first_name || "",
      last_name: data.user?.last_name || "",
      email: data.user?.email || data.user?.username || "",
      puesto: 'ADMIN'
    };
  }

  public showPassword() {
    this.inputType_1 = (this.inputType_1 == 'password') ? 'text' : 'password';
    this.hide_1 = !this.hide_1;
  }

  public showPwdConfirmar() {
    this.inputType_2 = (this.inputType_2 == 'password') ? 'text' : 'password';
    this.hide_2 = !this.hide_2;
  }

  public changeFecha(event: any) {
    if (event.value) {
      this.admin.fecha_nacimiento = this.datePipe.transform(event.value, 'yyyy-MM-dd');
    }
  }

  public regresar(){
    if (this.isEmbedded) {
      this.onClose.emit(false); // Emitimos cancelar
    } else {
      this.location.back();
    }
  }

  public registrar(): void {
    this.procesarGuardado();
  }

  public actualizar(): void {
    this.procesarGuardado();
  }

  private procesarGuardado(): void {
    this.errors = {};
    this.errors = this.usuariosService.validarUsuario(this.admin, this.editar);

    if(Object.keys(this.errors).length > 0){
      return;
    }

    this.admin.puesto = 'ADMIN';
    if (this.editar && !this.admin.id) {
      this.admin.id = this.idUser;
    }

    if(!this.editar && this.admin.password !== this.admin.confirmar_password){
      alert("Las contraseñas no coinciden");
      this.admin.password="";
      this.admin.confirmar_password="";
      return;
    }

    this.usuariosService.guardarUsuario(this.admin, this.editar).subscribe({
      next: (response) => {
        alert(`Administrador ${this.editar ? 'actualizado' : 'registrado'} exitosamente`);
        if (this.isEmbedded) {
          this.onClose.emit(true); // Emitimos éxito
        } else {
          this.router.navigate(["administrador"]);
        }
      },
      error: (error) => {
        alert(`Error al ${this.editar ? 'actualizar' : 'registrar'} administrador`);
        if(error.error && error.error.message){
           alert(error.error.message);
        } else if (error.error && error.error.error) {
           alert(error.error.error);
        }
      }
    });
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
