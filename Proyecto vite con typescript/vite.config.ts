import { defineConfig } from 'vite';
import mysql from 'mysql2/promise';

function mysqlApiPlugin() {
  let pool: mysql.Pool | null = null;

  try {
    pool = mysql.createPool({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: '',
      database: 'bd_ventas',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
  } catch (err) {
    console.warn('MySQL pool could not be initialized:', err);
  }

  return {
    name: 'vite-mysql-api-middleware',
    configureServer(server: any) {
      server.middlewares.use(async (req: any, res: any, next: any) => {
        if (!req.url?.startsWith('/api/')) {
          return next();
        }

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        if (req.method === 'OPTIONS') {
          res.statusCode = 200;
          return res.end();
        }

        const url = new URL(req.url, 'http://localhost');
        const pathname = url.pathname;

        // Leer body en peticiones POST / PUT
        let body: any = null;
        if (req.method === 'POST' || req.method === 'PUT') {
          try {
            const buffers = [];
            for await (const chunk of req) {
              buffers.push(chunk);
            }
            const data = Buffer.concat(buffers).toString();
            if (data) {
              body = JSON.parse(data);
            }
          } catch (e) {
            body = {};
          }
        }

        if (!pool) {
          res.statusCode = 503;
          return res.end(JSON.stringify({ success: false, error: 'mysql_offline' }));
        }

        try {
          // --- ENDPOINT: Test de Conexión ---
          if (pathname === '/api/status' && req.method === 'GET') {
            await pool.query('SELECT 1');
            return res.end(JSON.stringify({ success: true, db: 'bd_ventas' }));
          }

          // --- ENDPOINT: Login / Autenticación ---
          if (pathname === '/api/auth/login' && req.method === 'POST') {
            const { user, pass } = body || {};
            const [rows]: any = await pool.query(
              'SELECT * FROM empleado WHERE User = ? AND Dni = ?',
              [user, pass]
            );
            if (rows.length > 0) {
              return res.end(JSON.stringify({ success: true, empleado: rows[0] }));
            } else {
              return res.end(JSON.stringify({ success: false, message: 'Usuario o contraseña incorrectos' }));
            }
          }

          // --- ENDPOINTS: Empleados ---
          if (pathname === '/api/empleados' && req.method === 'GET') {
            const [rows] = await pool.query('SELECT * FROM empleado');
            return res.end(JSON.stringify({ success: true, data: rows }));
          }
          if (pathname === '/api/empleados' && req.method === 'POST') {
            const { Dni, Nombres, Telefono, Estado, User } = body;
            const [result]: any = await pool.query(
              'INSERT INTO empleado(Dni, Nombres, Telefono, Estado, User) VALUES (?,?,?,?,?)',
              [Dni, Nombres, Telefono, Estado, User]
            );
            return res.end(JSON.stringify({ success: true, id: result.insertId }));
          }
          if (pathname.startsWith('/api/empleados/') && req.method === 'PUT') {
            const id = pathname.split('/')[3];
            const { Dni, Nombres, Telefono, Estado, User } = body;
            await pool.query(
              'UPDATE empleado SET Dni=?, Nombres=?, Telefono=?, Estado=?, User=? WHERE IdEmpleado=?',
              [Dni, Nombres, Telefono, Estado, User, id]
            );
            return res.end(JSON.stringify({ success: true }));
          }
          if (pathname.startsWith('/api/empleados/') && req.method === 'DELETE') {
            const id = pathname.split('/')[3];
            await pool.query('DELETE FROM empleado WHERE IdEmpleado=?', [id]);
            return res.end(JSON.stringify({ success: true }));
          }

          // --- ENDPOINTS: Clientes ---
          if (pathname === '/api/clientes' && req.method === 'GET') {
            const [rows] = await pool.query('SELECT * FROM cliente');
            return res.end(JSON.stringify({ success: true, data: rows }));
          }
          if (pathname.startsWith('/api/clientes/dni/') && req.method === 'GET') {
            const dni = pathname.split('/')[4];
            const [rows]: any = await pool.query('SELECT * FROM cliente WHERE Dni = ?', [dni]);
            return res.end(JSON.stringify({ success: true, data: rows[0] || null }));
          }
          if (pathname === '/api/clientes' && req.method === 'POST') {
            const { Dni, Nombres, Direccion, Estado } = body;
            const [result]: any = await pool.query(
              'INSERT INTO cliente(Dni, Nombres, Direccion, Estado) VALUES (?,?,?,?)',
              [Dni, Nombres, Direccion, Estado]
            );
            return res.end(JSON.stringify({ success: true, id: result.insertId }));
          }
          if (pathname.startsWith('/api/clientes/') && req.method === 'PUT') {
            const id = pathname.split('/')[3];
            const { Dni, Nombres, Direccion, Estado } = body;
            await pool.query(
              'UPDATE cliente SET Dni=?, Nombres=?, Direccion=?, Estado=? WHERE IdCliente=?',
              [Dni, Nombres, Direccion, Estado, id]
            );
            return res.end(JSON.stringify({ success: true }));
          }
          if (pathname.startsWith('/api/clientes/') && req.method === 'DELETE') {
            const id = pathname.split('/')[3];
            await pool.query('DELETE FROM cliente WHERE IdCliente=?', [id]);
            return res.end(JSON.stringify({ success: true }));
          }

          // --- ENDPOINTS: Productos ---
          if (pathname === '/api/productos' && req.method === 'GET') {
            const [rows] = await pool.query('SELECT * FROM producto');
            return res.end(JSON.stringify({ success: true, data: rows }));
          }
          if (pathname.startsWith('/api/productos/') && req.method === 'GET') {
            const id = pathname.split('/')[3];
            const [rows]: any = await pool.query('SELECT * FROM producto WHERE IdProducto=?', [id]);
            return res.end(JSON.stringify({ success: true, data: rows[0] || null }));
          }
          if (pathname === '/api/productos' && req.method === 'POST') {
            const { Nombres, Precio, Stock, Estado } = body;
            const [result]: any = await pool.query(
              'INSERT INTO producto(Nombres, Precio, Stock, Estado) VALUES (?,?,?,?)',
              [Nombres, Precio, Stock, Estado]
            );
            return res.end(JSON.stringify({ success: true, id: result.insertId }));
          }
          if (pathname.startsWith('/api/productos/') && req.method === 'PUT') {
            const id = pathname.split('/')[3];
            const { Nombres, Precio, Stock, Estado } = body;
            await pool.query(
              'UPDATE producto SET Nombres=?, Precio=?, Stock=?, Estado=? WHERE IdProducto=?',
              [Nombres, Precio, Stock, Estado, id]
            );
            return res.end(JSON.stringify({ success: true }));
          }
          if (pathname.startsWith('/api/productos/') && req.method === 'DELETE') {
            const id = pathname.split('/')[3];
            await pool.query('DELETE FROM producto WHERE IdProducto=?', [id]);
            return res.end(JSON.stringify({ success: true }));
          }

          // --- ENDPOINTS: Ventas y Serie (Prácticas 09 y 10) ---
          if (pathname === '/api/ventas/serie' && req.method === 'GET') {
            const [rows]: any = await pool.query('SELECT max(NumeroSerie) as maxSerie FROM ventas');
            const maxSerie = rows[0]?.maxSerie;
            let nextNum = 1;
            if (maxSerie) {
              nextNum = parseInt(maxSerie, 10) + 1;
            }
            const serie = String(nextNum).padStart(8, '0');
            return res.end(JSON.stringify({ success: true, serie }));
          }

          if (pathname === '/api/ventas' && req.method === 'POST') {
            const { idcliente, idempleado, numserie, total, items } = body;
            const today = new Date().toISOString().slice(0, 10);

            // 1. Descontar stock de cada producto vendido (Paso 2 Práctica 10)
            for (const it of items) {
              await pool.query(
                'UPDATE producto SET Stock = Stock - ? WHERE IdProducto = ?',
                [it.cantidad, it.idproducto]
              );
            }

            // 2. Guardar Venta (Paso 1 Práctica 09)
            const [vResult]: any = await pool.query(
              'INSERT INTO ventas(IdCliente, IdEmpleado, NumeroSerie, FechaVentas, Monto, Estado) VALUES (?,?,?,?,?,?)',
              [idcliente, idempleado || 2, numserie, today, total, '1']
            );
            const idVenta = vResult.insertId;

            // 3. Guardar Detalle de Ventas
            for (const it of items) {
              await pool.query(
                'INSERT INTO detalle_ventas(IdVentas, IdProducto, Cantidad, PrecioVenta) VALUES (?,?,?,?)',
                [idVenta, it.idproducto, it.cantidad, it.precio]
              );
            }

            return res.end(JSON.stringify({ success: true, idVenta }));
          }

          res.statusCode = 404;
          return res.end(JSON.stringify({ success: false, message: 'Endpoint no encontrado' }));
        } catch (dbErr: any) {
          console.error('Error procesando API:', dbErr.message);
          res.statusCode = 500;
          return res.end(JSON.stringify({ success: false, error: dbErr.message }));
        }
      });
    }
  };
}

export default defineConfig({
  plugins: [mysqlApiPlugin()],
  server: {
    port: 5173,
    open: true
  }
});
