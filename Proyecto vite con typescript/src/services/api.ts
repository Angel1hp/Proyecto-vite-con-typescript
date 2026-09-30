import { Empleado, Cliente, Producto, ItemCarrito } from '../types';

// Datos iniciales de respaldo coincidentes con bd_ventas.sql
const DEFAULT_EMPLEADOS: Empleado[] = [
  { IdEmpleado: 1, Dni: '12345678', Nombres: 'ADMINISTRADOR GENERAL', Telefono: '999888777', Estado: '1', User: 'admin' },
  { IdEmpleado: 2, Dni: '87654321', Nombres: 'EMPLEADO DE VENTAS', Telefono: '987654321', Estado: '1', User: 'emp01' }
];

const DEFAULT_CLIENTES: Cliente[] = [
  { IdCliente: 1, Dni: '00000000', Nombres: 'CLIENTES VARIOS', Direccion: 'LIMA', Estado: '1' },
  { IdCliente: 2, Dni: '71234567', Nombres: 'JUAN CARLOS PEREZ', Direccion: 'AV. AREQUIPA 123', Estado: '1' },
  { IdCliente: 3, Dni: '72345678', Nombres: 'MARIA FLORES GOMEZ', Direccion: 'JR. UNION 456', Estado: '1' }
];

const DEFAULT_PRODUCTOS: Producto[] = [
  { IdProducto: 1, Nombres: 'TECLADO GAMER RGB', Precio: 120.0, Stock: 25, Estado: '1' },
  { IdProducto: 2, Nombres: 'MOUSE OPTICO LOGITECH', Precio: 65.0, Stock: 30, Estado: '1' },
  { IdProducto: 3, Nombres: 'MONITOR 24 PULGADAS FULL HD', Precio: 550.0, Stock: 10, Estado: '1' },
  { IdProducto: 4, Nombres: 'AURICULARES STEREO CON MICROFONO', Precio: 85.0, Stock: 18, Estado: '1' },
  { IdProducto: 5, Nombres: 'MEMORIA RAM 16GB DDR4', Precio: 180.0, Stock: 15, Estado: '1' }
];

class ApiService {
  private isMySqlOnline = false;

  constructor() {
    this.initLocalStorage();
    this.checkConnection();
  }

  private initLocalStorage() {
    if (!localStorage.getItem('empleados')) {
      localStorage.setItem('empleados', JSON.stringify(DEFAULT_EMPLEADOS));
    }
    if (!localStorage.getItem('clientes')) {
      localStorage.setItem('clientes', JSON.stringify(DEFAULT_CLIENTES));
    }
    if (!localStorage.getItem('productos')) {
      localStorage.setItem('productos', JSON.stringify(DEFAULT_PRODUCTOS));
    }
    if (!localStorage.getItem('nro_serie')) {
      localStorage.setItem('nro_serie', '00000001');
    }
    if (!localStorage.getItem('ventas')) {
      localStorage.setItem('ventas', JSON.stringify([]));
    }
  }

  async checkConnection(): Promise<boolean> {
    try {
      const res = await fetch('/api/status', { method: 'GET' });
      const data = await res.json();
      this.isMySqlOnline = data.success === true;
    } catch {
      this.isMySqlOnline = false;
    }
    return this.isMySqlOnline;
  }

  getIsMySqlOnline(): boolean {
    return this.isMySqlOnline;
  }

  // --- AUTENTICACIÓN / LOGIN ---
  async login(user: string, pass: string): Promise<Empleado | null> {
    if (this.isMySqlOnline) {
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user, pass })
        });
        const data = await res.json();
        if (data.success) return data.empleado;
      } catch (err) {
        console.warn('MySQL fallback en login:', err);
      }
    }

    // Modo local / Fallback
    const empleados: Empleado[] = JSON.parse(localStorage.getItem('empleados') || '[]');
    const emp = empleados.find(e => e.User.toLowerCase() === user.toLowerCase() && e.Dni === pass);
    return emp || null;
  }

  // --- EMPLEADOS ---
  async getEmpleados(): Promise<Empleado[]> {
    if (this.isMySqlOnline) {
      try {
        const res = await fetch('/api/empleados');
        const data = await res.json();
        if (data.success) return data.data;
      } catch (e) {
        console.warn('Fallback a local storage:', e);
      }
    }
    return JSON.parse(localStorage.getItem('empleados') || '[]');
  }

  async agregarEmpleado(emp: Omit<Empleado, 'IdEmpleado'>): Promise<void> {
    if (this.isMySqlOnline) {
      try {
        await fetch('/api/empleados', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(emp)
        });
        return;
      } catch (e) {
        console.warn('Fallback a local storage:', e);
      }
    }
    const list: Empleado[] = JSON.parse(localStorage.getItem('empleados') || '[]');
    const newId = list.length > 0 ? Math.max(...list.map(e => e.IdEmpleado)) + 1 : 1;
    list.push({ ...emp, IdEmpleado: newId });
    localStorage.setItem('empleados', JSON.stringify(list));
  }

  async actualizarEmpleado(id: number, emp: Omit<Empleado, 'IdEmpleado'>): Promise<void> {
    if (this.isMySqlOnline) {
      try {
        await fetch(`/api/empleados/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(emp)
        });
        return;
      } catch (e) {
        console.warn('Fallback a local storage:', e);
      }
    }
    const list: Empleado[] = JSON.parse(localStorage.getItem('empleados') || '[]');
    const idx = list.findIndex(e => e.IdEmpleado === id);
    if (idx !== -1) {
      list[idx] = { ...emp, IdEmpleado: id };
      localStorage.setItem('empleados', JSON.stringify(list));
    }
  }

  async eliminarEmpleado(id: number): Promise<void> {
    if (this.isMySqlOnline) {
      try {
        await fetch(`/api/empleados/${id}`, { method: 'DELETE' });
        return;
      } catch (e) {
        console.warn('Fallback a local storage:', e);
      }
    }
    let list: Empleado[] = JSON.parse(localStorage.getItem('empleados') || '[]');
    list = list.filter(e => e.IdEmpleado !== id);
    localStorage.setItem('empleados', JSON.stringify(list));
  }

  // --- CLIENTES ---
  async getClientes(): Promise<Cliente[]> {
    if (this.isMySqlOnline) {
      try {
        const res = await fetch('/api/clientes');
        const data = await res.json();
        if (data.success) return data.data;
      } catch (e) {
        console.warn('Fallback a local storage:', e);
      }
    }
    return JSON.parse(localStorage.getItem('clientes') || '[]');
  }

  async buscarClientePorDni(dni: string): Promise<Cliente | null> {
    if (this.isMySqlOnline) {
      try {
        const res = await fetch(`/api/clientes/dni/${dni}`);
        const data = await res.json();
        if (data.success && data.data) return data.data;
      } catch (e) {
        console.warn('Fallback a local storage:', e);
      }
    }
    const list: Cliente[] = JSON.parse(localStorage.getItem('clientes') || '[]');
    return list.find(c => c.Dni.trim() === dni.trim()) || null;
  }

  async agregarCliente(cli: Omit<Cliente, 'IdCliente'>): Promise<void> {
    if (this.isMySqlOnline) {
      try {
        await fetch('/api/clientes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(cli)
        });
        return;
      } catch (e) {
        console.warn('Fallback a local storage:', e);
      }
    }
    const list: Cliente[] = JSON.parse(localStorage.getItem('clientes') || '[]');
    const newId = list.length > 0 ? Math.max(...list.map(c => c.IdCliente)) + 1 : 1;
    list.push({ ...cli, IdCliente: newId });
    localStorage.setItem('clientes', JSON.stringify(list));
  }

  async actualizarCliente(id: number, cli: Omit<Cliente, 'IdCliente'>): Promise<void> {
    if (this.isMySqlOnline) {
      try {
        await fetch(`/api/clientes/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(cli)
        });
        return;
      } catch (e) {
        console.warn('Fallback a local storage:', e);
      }
    }
    const list: Cliente[] = JSON.parse(localStorage.getItem('clientes') || '[]');
    const idx = list.findIndex(c => c.IdCliente === id);
    if (idx !== -1) {
      list[idx] = { ...cli, IdCliente: id };
      localStorage.setItem('clientes', JSON.stringify(list));
    }
  }

  async eliminarCliente(id: number): Promise<void> {
    if (this.isMySqlOnline) {
      try {
        await fetch(`/api/clientes/${id}`, { method: 'DELETE' });
        return;
      } catch (e) {
        console.warn('Fallback a local storage:', e);
      }
    }
    let list: Cliente[] = JSON.parse(localStorage.getItem('clientes') || '[]');
    list = list.filter(c => c.IdCliente !== id);
    localStorage.setItem('clientes', JSON.stringify(list));
  }

  // --- PRODUCTOS ---
  async getProductos(): Promise<Producto[]> {
    if (this.isMySqlOnline) {
      try {
        const res = await fetch('/api/productos');
        const data = await res.json();
        if (data.success) return data.data;
      } catch (e) {
        console.warn('Fallback a local storage:', e);
      }
    }
    return JSON.parse(localStorage.getItem('productos') || '[]');
  }

  async buscarProductoPorId(id: number): Promise<Producto | null> {
    if (this.isMySqlOnline) {
      try {
        const res = await fetch(`/api/productos/${id}`);
        const data = await res.json();
        if (data.success && data.data) return data.data;
      } catch (e) {
        console.warn('Fallback a local storage:', e);
      }
    }
    const list: Producto[] = JSON.parse(localStorage.getItem('productos') || '[]');
    return list.find(p => p.IdProducto === id) || null;
  }

  async agregarProducto(prod: Omit<Producto, 'IdProducto'>): Promise<void> {
    if (this.isMySqlOnline) {
      try {
        await fetch('/api/productos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(prod)
        });
        return;
      } catch (e) {
        console.warn('Fallback a local storage:', e);
      }
    }
    const list: Producto[] = JSON.parse(localStorage.getItem('productos') || '[]');
    const newId = list.length > 0 ? Math.max(...list.map(p => p.IdProducto)) + 1 : 1;
    list.push({ ...prod, IdProducto: newId });
    localStorage.setItem('productos', JSON.stringify(list));
  }

  async actualizarProducto(id: number, prod: Omit<Producto, 'IdProducto'>): Promise<void> {
    if (this.isMySqlOnline) {
      try {
        await fetch(`/api/productos/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(prod)
        });
        return;
      } catch (e) {
        console.warn('Fallback a local storage:', e);
      }
    }
    const list: Producto[] = JSON.parse(localStorage.getItem('productos') || '[]');
    const idx = list.findIndex(p => p.IdProducto === id);
    if (idx !== -1) {
      list[idx] = { ...prod, IdProducto: id };
      localStorage.setItem('productos', JSON.stringify(list));
    }
  }

  async eliminarProducto(id: number): Promise<void> {
    if (this.isMySqlOnline) {
      try {
        await fetch(`/api/productos/${id}`, { method: 'DELETE' });
        return;
      } catch (e) {
        console.warn('Fallback a local storage:', e);
      }
    }
    let list: Producto[] = JSON.parse(localStorage.getItem('productos') || '[]');
    list = list.filter(p => p.IdProducto !== id);
    localStorage.setItem('productos', JSON.stringify(list));
  }

  // --- VENTAS Y CORRELATIVO (Prácticas 09 y 10) ---
  async getNumeroSerie(): Promise<string> {
    if (this.isMySqlOnline) {
      try {
        const res = await fetch('/api/ventas/serie');
        const data = await res.json();
        if (data.success) return data.serie;
      } catch (e) {
        console.warn('Fallback a local storage:', e);
      }
    }
    return localStorage.getItem('nro_serie') || '00000001';
  }

  async generarVenta(idcliente: number, idempleado: number, numserie: string, total: number, items: ItemCarrito[]): Promise<boolean> {
    if (this.isMySqlOnline) {
      try {
        const res = await fetch('/api/ventas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idcliente, idempleado, numserie, total, items })
        });
        const data = await res.json();
        if (data.success) return true;
      } catch (e) {
        console.warn('Fallback a local storage para venta:', e);
      }
    }

    // Modo local / Fallback
    // 1. Reducir stock (Práctica 10)
    const productos: Producto[] = JSON.parse(localStorage.getItem('productos') || '[]');
    for (const item of items) {
      const p = productos.find(prod => prod.IdProducto === item.idproducto);
      if (p) {
        p.Stock = Math.max(0, p.Stock - item.cantidad);
      }
    }
    localStorage.setItem('productos', JSON.stringify(productos));

    // 2. Incrementar número de serie correlativo
    const currentNum = parseInt(numserie, 10);
    const nextSerie = String(currentNum + 1).padStart(8, '0');
    localStorage.setItem('nro_serie', nextSerie);

    return true;
  }
}

export const api = new ApiService();
