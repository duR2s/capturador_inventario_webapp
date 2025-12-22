import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatRadioModule, MatRadioChange } from '@angular/material/radio';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FacadeService } from 'src/app/services/facade.service';
import { UsuariosService } from 'src/app/services/roles/usuarios.service';
import { RegistroAdminComponent } from 'src/app/partials/registro/registro-administradores/registro-administradores.component';
import { MatIconModule } from "@angular/material/icon";
import { RegistroEmpleadosComponent } from "src/app/partials/registro/registro-empleados/registro-empleados.component";
//import { MaestrosService } from 'src/app/services/maestros.service';
//import { AlumnosService } from 'src/app/services/alumnos.service';

@Component({
  selector: 'app-registro-usuarios-screen',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatRadioModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    RegistroAdminComponent
    //MaestrosComponent,
    //AlumnosComponent
    ,
    MatIconModule,
    RegistroEmpleadosComponent
],
  templateUrl: './registro-usuarios-screen.component.html',
  styleUrls: ['./registro-usuarios-screen.component.scss']
})
export class RegistroUsuariosScreenComponent implements OnInit {

  public tipo: string = "registro-usuarios";
  public editar: boolean = false;
  public rol: string = "";
  public idUser: number = 0;

  //Banderas para el tipo de usuario
  public isEmpleado: boolean = false;
  public isOtro: boolean = false;

  public tipo_user: string = "";

  //JSON para el usuario
  public user: any = {};

  constructor(
    private location: Location,
    public activatedRoute: ActivatedRoute,
    private router: Router,
    public facadeService: FacadeService,
    private usuariosService: UsuariosService
    //private maestrosService: MaestrosService,
    //private alumnosService: AlumnosService
  ) { }

  ngOnInit(): void {

  }



  // Función para conocer que usuario se ha elegido
  public radioChange(event: MatRadioChange) {
    if(event.value == "empleado"){
      this.isEmpleado = true;
      this.isOtro = false;
      this.tipo_user = "empleado";
    }else if (event.value == "otro"){
      this.isEmpleado = false;
      this.isOtro = true;
      this.tipo_user = "otro";
    }
  }

  //Función para regresar a la pantalla anterior
  public goBack() {
    this.location.back();
  }
}
