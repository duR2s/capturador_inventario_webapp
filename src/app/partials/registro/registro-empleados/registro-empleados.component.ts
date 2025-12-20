import { Component, Input, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FacadeService } from 'src/app/services/facade.service';
import { EmpleadosService } from 'src/app/services/roles/empleados.service';
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
  selector: 'app-registro-empleados',
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
  templateUrl: './registro-empleados.component.html',
  styleUrls: ['./registro-empleados.component.scss']
})
export class RegistroEmpleadosComponent implements OnInit {

  @Input() rol: string = "";
  @Input() datos_user: any = {};

  public empleado: any = {};
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
    private empleadosService: EmpleadosService,
    private facadeService: FacadeService,
    private router: Router,
    private datePipe: DatePipe
  ) { }

  ngOnInit(): void {
    if(this.activatedRoute.snapshot.params['id'] != undefined){
      this.editar = true;
      this.idUser = this.activatedRoute.snapshot.params['id'];
      console.log("ID Empleado a editar: ", this.idUser);

      if (this.datos_user) {
        this.empleado = {
          id: this.datos_user.id,
          clave_interna: this.datos_user.clave_interna,
          rfc: this.datos_user.rfc,
          telefono: this.datos_user.telefono,
          fecha_nacimiento: this.datos_user.fecha_nacimiento,
          first_name: this.datos_user.user?.first_name || "",
          last_name: this.datos_user.user?.last_name || "",
          email: this.datos_user.user?.email || this.datos_user.user?.username || "",
          // Mantenemos el puesto original si existe, si no, calculamos
          puesto: this.datos_user.puesto || this.determinarPuesto(this.rol)
        };
      }
    } else {
      this.empleado = this.empleadosService.esquemaEmpleado();
      // CORRECCIÓN: Normalizamos el puesto desde el inicio
      this.empleado.puesto = this.determinarPuesto(this.rol);
      this.token = this.facadeService.getSessionToken();
    }
    console.log("Empleado (Formulario): ", this.empleado);
  }

  // NUEVO: Función auxiliar para limpiar el rol de entrada
  private determinarPuesto(rolInput: string): string {
    if (!rolInput) return 'CAPTURADOR';

    const rolNormalizado = rolInput.toUpperCase().trim();

    // Mapeo seguro: si dice "otro" o "otros", es OTRO. Todo lo demás es CAPTURADOR.
    if (rolNormalizado.includes('OTRO')) {
      return 'OTRO';
    }

    // Por defecto (incluye "capturador", "capturadores", "empleado", etc.)
    return 'CAPTURADOR';
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

  public changeFecha(event: any) {
    if (event.value) {
      this.empleado.fecha_nacimiento = this.datePipe.transform(event.value, 'yyyy-MM-dd');
    }
  }

  public regresar(){
    this.location.back();
  }

  public registrar(): void {
    this.errors = {};
    this.errors = this.empleadosService.validarEmpleado(this.empleado, this.editar);
    if(Object.keys(this.errors).length > 0){
      return;
    }

    // CORRECCIÓN: Forzamos el puesto correcto justo antes de enviar
    // Esto asegura que si el usuario manipuló el input o el binding falló, se envíe limpio.
    if (!this.empleado.puesto) {
       this.empleado.puesto = this.determinarPuesto(this.rol);
    }

    if(this.empleado.password == this.empleado.confirmar_password){
      this.empleadosService.registrarEmpleado(this.empleado).subscribe(
        (response) => {
          alert("Empleado registrado exitosamente");
          console.log("Respuesta: ", response);
          if(this.token && this.token !== ""){
            this.router.navigate(["empleados"]);
          } else {
            this.router.navigate(["/"]);
          }
        },
        (error) => {
          alert("Error al registrar empleado");
          console.error(error);
          if(error.error && error.error.message){
             alert(error.error.message);
          }
        }
      );
    } else {
      alert("Las contraseñas no coinciden");
      this.empleado.password="";
      this.empleado.confirmar_password="";
    }
  }

  public actualizar(): void {
    this.errors = {};
    this.errors = this.empleadosService.validarEmpleado(this.empleado, this.editar);
    if(Object.keys(this.errors).length > 0){
      return;
    }

    if (!this.empleado.id) {
        this.empleado.id = this.idUser;
    }

    // Aseguramos puesto en actualización también (opcional, pero buena práctica)
    if (!this.empleado.puesto) {
      this.empleado.puesto = this.determinarPuesto(this.rol);
    }

    this.empleadosService.actualizarEmpleado(this.empleado).subscribe(
      (response) => {
        alert("Empleado actualizado exitosamente");
        console.log("Respuesta: ", response);
        this.router.navigate(["empleados"]);
      },
      (error) => {
        alert("Error al actualizar empleado");
        console.error(error);
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
