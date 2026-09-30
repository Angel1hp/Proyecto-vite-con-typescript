// Interfaces de datos que coinciden exactamente con la base de datos bd_ventas y modelos Java

export interface Empleado {
  IdEmpleado: number;
  Dni: string;
  Nombres: string;
  Telefono: string;
  Estado: string;
  User: string;
}

export interface Cliente {
  IdCliente: number;
  Dni: string;
  Nombres: string;
  Direccion: string;
  Estado: string;
}

export interface Producto {
  IdProducto: number;
  Nombres: string;
  Precio: number;
  Stock: number;
  Estado: string;
}

export interface ItemCarrito {
  item: number;
  idproducto: number;
  descripcionP: string;
  precio: number;
  cantidad: number;
  subtotal: number;
}

export interface Venta {
  IdVentas?: number;
  IdCliente: number;
  IdEmpleado: number;
  NumeroSerie: string;
  FechaVentas: string;
  Monto: number;
  Estado: string;
  items?: ItemCarrito[];
}
