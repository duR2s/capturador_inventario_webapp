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
import { AdministradoresService } from 'src/app/services/roles/administradores.service';
import { RegistroAdminComponent } from 'src/app/partials/registro/registro-administradores/registro-administradores.component';
import { MatIconModule } from "@angular/material/icon";
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
    MatIconModule
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
  public isAdmin: boolean = false;
  public isAlumno: boolean = false;
  public isMaestro: boolean = false;

  public tipo_user: string = "";

  //JSON para el usuario
  public user: any = {};

  constructor(
    private location: Location,
    public activatedRoute: ActivatedRoute,
    private router: Router,
    public facadeService: FacadeService,
    private administradoresService: AdministradoresService
    //private maestrosService: MaestrosService,
    //private alumnosService: AlumnosService
  ) { }

  ngOnInit(): void {
    //Revisar si se está editando o creando un usuario
    if(this.activatedRoute.snapshot.params['rol'] != undefined){
      this.rol = this.activatedRoute.snapshot.params['rol'];
      console.log("Rol detectado: ", this.rol);
    }

    //El if valida si existe un parámetro en la URL
    if(this.activatedRoute.snapshot.params['id'] != undefined){
      this.editar = true;
      //Asignamos a nuestra variable global el valor del ID que viene por la URL
      this.idUser = this.activatedRoute.snapshot.params['id'];
      console.log("ID User: ", this.idUser);
      //Al iniciar la vista obtiene el usuario por su ID
      this.obtenerUserByID();
    }
  }

  //Función para obtener el usuario por su ID
  public obtenerUserByID() {
    //Lógica para obtener el usuario según su ID y rol
    console.log("Obteniendo usuario de tipo: ", this.rol, " con ID: ", this.idUser);
    //Aquí se haría la llamada al servicio correspondiente según el rol
    if(this.rol === "administrador"){
      this.administradoresService.obtenerAdminPorID(this.idUser).subscribe(
        (response) => {
          this.user = response;
          console.log("Usuario original obtenido: ", this.user);
          // Asignar datos, soportando respuesta plana o anidada
          this.user.first_name = response.user?.first_name || response.first_name;
          this.user.last_name = response.user?.last_name || response.last_name;
          this.user.email = response.user?.email || response.email;
          this.user.tipo_usuario = this.rol;
          this.isAdmin = true;
        }, (error) => {
          console.log("Error: ", error);
          alert("No se pudo obtener el administrador seleccionado");
        }
      );

    }else if(this.rol === "maestros"){
      // Descomenta cuando tengas el servicio disponible
      // this.maestrosService.obtenerMaestroPorID(this.idUser).subscribe(
      //   (response) => {
      //     this.user = response;
      //     console.log("Usuario original obtenido: ", this.user);
      //     this.user.first_name = response.user?.first_name || response.first_name;
      //     this.user.last_name = response.user?.last_name || response.last_name;
      //     this.user.email = response.user?.email || response.email;
      //     this.user.tipo_usuario = this.rol;
      //     this.isMaestro = true;
      //   }, (error) => {
      //     console.log("Error: ", error);
      //     alert("No se pudo obtener el maestro seleccionado");
      //   }
      // );
    }else if(this.rol === "alumnos"){
      // Descomenta cuando tengas el servicio disponible
      // this.alumnosService.obtenerAlumnoPorID(this.idUser).subscribe(
      //   (response) => {
      //     this.user = response;
      //     console.log("Usuario original obtenido: ", this.user);
      //     this.user.first_name = response.user?.first_name || response.first_name;
      //     this.user.last_name = response.user?.last_name || response.last_name;
      //     this.user.email = response.user?.email || response.email;
      //     this.user.tipo_usuario = this.rol;
      //     this.isAlumno = true;
      //   }, (error) => {
      //     console.log("Error: ", error);
      //     alert("No se pudo obtener el alumno seleccionado");
      //   }
      // );
    }
  }

  // Función para conocer que usuario se ha elegido
  public radioChange(event: MatRadioChange) {
    if(event.value == "administrador"){
      this.isAdmin = true;
      this.isAlumno = false;
      this.isMaestro = false;
      this.tipo_user = "administrador";
    }else if (event.value == "alumno"){
      this.isAdmin = false;
      this.isAlumno = true;
      this.isMaestro = false;
      this.tipo_user = "alumno";
    }else if (event.value == "maestro"){
      this.isAdmin = false;
      this.isAlumno = false;
      this.isMaestro = true;
      this.tipo_user = "maestro";
    }
  }

  //Función para regresar a la pantalla anterior
  public goBack() {
    this.location.back();
  }
}
