import { Component, Input, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FacadeService } from 'src/app/services/facade.service';
// Importamos el servicio correcto
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
  selector: 'app-registro-empleados', // Selector ajustado
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
  styleUrls: ['./registro-empleados.component.scss'] // Reutiliza estilos o crea uno nuevo si es necesario
})
export class RegistroEmpleadosComponent implements OnInit {

  @Input() rol: string = "";
  @Input() datos_user: any = {};

  // Cambiamos 'admin' por 'empleado'
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
    private empleadosService: EmpleadosService, // Inyección del servicio de empleados
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
        // Mapeo de datos para edición (coherente con EmpleadosService y modelo Back)
        this.empleado = {
          id: this.datos_user.id,
          clave_interna: this.datos_user.clave_interna, // Aquí usamos clave_interna directo
          rfc: this.datos_user.rfc,
          telefono: this.datos_user.telefono,
          fecha_nacimiento: this.datos_user.fecha_nacimiento,
          first_name: this.datos_user.user?.first_name || "",
          last_name: this.datos_user.user?.last_name || "",
          email: this.datos_user.user?.email || this.datos_user.user?.username || "",
          // Si quieres editar el rol, podrías asignarlo aquí, por defecto lo dejamos como viene o CAPTURADOR
          puesto: this.datos_user.puesto || 'CAPTURADOR'
        };
      }
    } else {
      // Inicialización para nuevo registro
      this.empleado = this.empleadosService.esquemaEmpleado();
      this.empleado.puesto = this.rol || 'CAPTURADOR'; // Si viene rol por input lo usamos
      this.token = this.facadeService.getSessionToken();
    }
    console.log("Empleado (Formulario): ", this.empleado);
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
    // Usamos validarEmpleado del servicio nuevo
    this.errors = this.empleadosService.validarEmpleado(this.empleado, this.editar);
    if(Object.keys(this.errors).length > 0){
      return;
    }

    if(this.empleado.password == this.empleado.confirmar_password){
      this.empleadosService.registrarEmpleado(this.empleado).subscribe(
        (response) => {
          alert("Empleado registrado exitosamente");
          console.log("Respuesta: ", response);
          if(this.token && this.token !== ""){
            this.router.navigate(["empleados"]); // Ajusta esta ruta a tu lista de empleados
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

    this.empleadosService.actualizarEmpleado(this.empleado).subscribe(
      (response) => {
        alert("Empleado actualizado exitosamente");
        console.log("Respuesta: ", response);
        this.router.navigate(["empleados"]); // Ajusta esta ruta a tu lista de empleados
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
