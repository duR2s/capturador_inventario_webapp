import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class ErrorsService {

  // Inyección de MatSnackBar para notificaciones visuales
  private _snackBar = inject(MatSnackBar);

  // Propiedades originales (conservadas)
  public generic: string = "";
  public required: string = "";
  public numeric: string = "";
  public betweenDate: string  = "";
  public email: string = "";

  constructor() {
    this.generic = 'Favor de verificar el tipo de dato introducido, ya que no es válido';
    this.required = 'Campo requerido';
    this.numeric = 'Solo se aceptan valores numéricos';
    this.betweenDate = 'Fecha no es válida';
    this.email = 'Favor de introducir un correo con el formato correcto';
  }

  // --- MÉTODOS ORIGINALES DE VALIDACIÓN ---

  between(min: any, max: any) {
    return 'El valor introducido debe de ser entre ' + min + ' y ' + max;
  }

  max(size: any) {
    return 'Se excedió la longitud del campo aceptada: ' + size;
  }

  min(size: any) {
    return 'El campo no cumple la longitud aceptada: ' + size;
  }

  // --- NUEVOS MÉTODOS DE NOTIFICACIÓN (Requeridos por CapturaService) ---

  /**
   * Muestra un mensaje de error (Rojo/Advertencia)
   */
  mostrarError(mensaje: string) {
    this._snackBar.open(mensaje, 'Cerrar', {
      duration: 5000,
      panelClass: ['snackbar-error'], // Define esta clase en tu styles.scss global si quieres color rojo
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });
  }

  /**
   * Muestra un mensaje de éxito (Verde/Confirmación)
   */
  mostrarExito(mensaje: string) {
    this._snackBar.open(mensaje, 'OK', {
      duration: 3000,
      panelClass: ['snackbar-success'], // Define esta clase para color verde
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });
  }

  /**
   * Muestra una alerta informativa o advertencia (Amarillo/Naranja)
   */
  mostrarAlerta(mensaje: string) {
    this._snackBar.open(mensaje, 'Entendido', {
      duration: 4000,
      panelClass: ['snackbar-warning'],
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });
  }
}
