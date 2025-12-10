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

export interface DetalleCaptura {
  id?: number; // Opcional porque al crearlo localmente offline no tiene ID de DB aun
  captura?: number; // ID de la captura padre
  producto_codigo: string; // Coincide con models.py del backend
  cantidad_contada: number;

  // Propiedades opcionales de respuesta backend
  nombre_articulo?: string;
  folio_captura?: string;
  articulo_nombre?: string; // Mapeo del serializer nuevo

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
  estado: 'PROGRESO' | 'COMPLETADO';
  modo_offline?: boolean;
  fecha_reportada?: string;
  detalles?: DetalleCaptura[];
}

// Payload para endpoint individual (Online)
export interface PayloadEscaner {
  captura_id: number;
  producto_codigo: string;
  cantidad_contada: number;
}

// Payload para endpoint masivo (El backend espera solo array de detalles, el ID va en URL)
// Es esencialmente un Partial<DetalleCaptura> sin IDs ni metadatos extra.
export interface PayloadDetalleBatch {
  producto_codigo: string;
  cantidad_contada: number;
}
