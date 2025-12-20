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

export interface TicketSalida {
  id?: number;
  detalle?: number;
  responsable: string;
  cantidad: number;
  fecha_hora?: string;
}

export interface DetalleCaptura {
  id?: number;
  captura?: number;

  // CORRECCIÓN: Ahora recibimos 'articulo' como el ID numérico desde el backend
  articulo?: number;

  producto_codigo: string;
  cantidad_contada: number;
  existencia_sistema_al_momento?: number;

  nombre_articulo?: string;
  folio_captura?: string;
  articulo_nombre?: string;

  tickets?: TicketSalida[];
  conteo_tickets?: number;

  pendiente_sync?: boolean;
  error_sync?: string;
}

export interface Captura {
  id?: number;
  folio: string;
  capturador?: number;
  capturador_nombre?: string;
  fecha_captura?: string;
  estado: 'BORRADOR' | 'CONFIRMADO' | 'PROCESADO';
  modo_offline?: boolean;
  fecha_reportada?: string;
  detalles?: DetalleCaptura[];
  almacen_nombre?: string;
  almacen?: number;
}

// Payload actualizado para incluir ID
export interface PayloadEscaner {
  captura_id: number;
  producto_codigo: string;
  cantidad_contada: number;
  articulo_id?: number; // NUEVO
}

export interface PayloadDetalleBatch {
  producto_codigo: string;
  cantidad_contada: number;
  articulo_id?: number; // NUEVO
}
