// Definición de interfaces alineadas con el backend en Django (snake_case)
// Ubicación: src/app/models/captura.interfaces.ts

export interface Articulo {
  id?: number;
  articulo_id_msip: number;
  clave: string;
  nombre: string;
  seguimiento_tipo: 'N' | 'L' | 'S';
  activo: boolean;
  ultima_sincronizacion?: string;
}

// NUEVA INTERFAZ PARA TICKETS
export interface TicketSalida {
  id?: number;
  detalle?: number; // ID del detalle padre
  responsable: string;
  cantidad: number;
  fecha_hora?: string;
}

export interface DetalleCaptura {
  id?: number; // Opcional porque al crearlo localmente offline no tiene ID de DB aun
  captura?: number; // ID de la captura padre
  producto_codigo: string; // Coincide con models.py del backend
  cantidad_contada: number;
  existencia_sistema_al_momento?: number;

  // Propiedades opcionales de respuesta backend
  nombre_articulo?: string;
  folio_captura?: string;
  articulo_nombre?: string; // Mapeo del serializer nuevo

  // NUEVOS CAMPOS (Sincronizados con el Serializer actualizado)
  tickets?: TicketSalida[]; // Lista de tickets generados
  conteo_tickets?: number;  // Suma total de piezas retiradas

  // Flags Frontend (No se envían al backend, útiles para UI Offline)
  pendiente_sync?: boolean;
  error_sync?: string;
}

export interface Captura {
  id?: number;
  folio: string;
  capturador?: number; // ID del usuario
  capturador_nombre?: string;
  fecha_captura?: string;
  estado: 'BORRADOR' | 'CONFIRMADO' | 'PROCESADO'; // Actualizado con los estados reales
  modo_offline?: boolean;
  fecha_reportada?: string;
  detalles?: DetalleCaptura[];
  almacen_nombre?: string;
  almacen?: number;
}

// Payload para endpoint individual (Online)
export interface PayloadEscaner {
  captura_id: number;
  producto_codigo: string;
  cantidad_contada: number;
}

// Payload para endpoint masivo (El backend espera solo array de detalles, el ID va en URL)
export interface PayloadDetalleBatch {
  producto_codigo: string;
  cantidad_contada: number;
}
