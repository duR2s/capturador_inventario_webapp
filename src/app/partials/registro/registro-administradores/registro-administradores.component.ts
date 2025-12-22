import { Component, Input, OnInit } from '@angular/core';
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

  @Input() rol: string = "";
  @Input() datos_user: any = {};

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
    private usuariosService: UsuariosService, // Usamos el servicio unificado
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
          // Mapeamos a clave_interna (nombre unificado en back)
          clave_interna: this.datos_user.clave_interna || this.datos_user.clave_admin,
          rfc: this.datos_user.rfc,
          telefono: this.datos_user.telefono,
          fecha_nacimiento: this.datos_user.fecha_nacimiento,
          first_name: this.datos_user.user?.first_name || "",
          last_name: this.datos_user.user?.last_name || "",
          email: this.datos_user.user?.email || this.datos_user.user?.username || "",
          puesto: 'ADMIN' // Usamos 'puesto' en lugar de 'rol' para coincidir con el servicio
        };
      }
    } else {
      // Usamos el generador del servicio unificado
      this.admin = this.usuariosService.getEsquemaBase('ADMIN');
      this.token = this.facadeService.getSessionToken();
    }
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
    this.location.back();
  }

  public registrar(): void {
    this.procesarGuardado();
  }

  public actualizar(): void {
    this.procesarGuardado();
  }

  private procesarGuardado(): void {
    this.errors = {};
    // Usamos validación unificada
    this.errors = this.usuariosService.validarUsuario(this.admin, this.editar);

    if(Object.keys(this.errors).length > 0){
      return;
    }

    // Forzamos puesto y ID si es necesario
    this.admin.puesto = 'ADMIN';
    if (this.editar && !this.admin.id) {
      this.admin.id = this.idUser;
    }

    // Validación extra de passwords en frontend (aunque el servicio también lo valida)
    if(!this.editar && this.admin.password !== this.admin.confirmar_password){
      alert("Las contraseñas no coinciden");
      this.admin.password="";
      this.admin.confirmar_password="";
      return;
    }

    // Llamada unificada: guardarUsuario detecta si es POST o PUT internamente
    this.usuariosService.guardarUsuario(this.admin, this.editar).subscribe({
      next: (response) => {
        alert(`Administrador ${this.editar ? 'actualizado' : 'registrado'} exitosamente`);
        this.router.navigate(["administrador"]);
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
