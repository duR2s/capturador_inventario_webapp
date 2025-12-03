export interface UserInterface {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  username: string;
}

export interface EmpleadoInterface {
  id: number;
  user: UserInterface;
  // Campo unificado que reemplaza a 'clave_admin' e 'id_trabajador'
  clave_interna: string;
  telefono: string;
  fecha_nacimiento?: string;
  edad?: number;
  puesto: 'ADMIN' | 'CAPTURADOR' | 'OTRO';
  puesto_display?: string; // Para mostrar el nombre bonito "Administrador" o "Capturador"
  creation?: string;
  update?: string;
}
