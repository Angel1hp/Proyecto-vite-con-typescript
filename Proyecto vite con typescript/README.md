# Sistema de Ventas Web - Réplica en TypeScript Puro con Vite

Este proyecto es la réplica exacta en **TypeScript Puro con Vite** del sistema Java JSP/Servlets de NetBeans, manteniendo el mismo diseño visual, lógica de negocio y compatibilidad con la base de datos MySQL `bd_ventas`.

---

## 🚀 Cómo Ejecutar el Proyecto

1. Abre una terminal dentro de esta carpeta (`proyecto vite con typescript`):
   ```bash
   cd "proyecto vite con typescript"
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```

3. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

4. Abre tu navegador en la URL mostrada (usualmente `http://localhost:5173`).

---

## 🗄️ Base de Datos MySQL (`bd_ventas`)

* El proyecto se conecta automáticamente a **MySQL** en `localhost:3306`, base de datos `bd_ventas`, usuario `root` sin contraseña.
* El script para crear la base de datos se encuentra en la carpeta principal:
  📁 `../bd_ventas.sql`
* **Modo Offline / Respaldo:** Si MySQL no está iniciado, la aplicación funcionará de manera automática en modo local con los datos precargados, permitiéndote probar login, ventas y CRUDs sin interrupciones.

---

## 🔐 Credenciales de Acceso (Login)

La contraseña corresponde al DNI del empleado:

| Usuario | Contraseña (DNI) | Rol / Nombre |
| :--- | :--- | :--- |
| **`emp01`** | **`87654321`** | Empleado de Ventas |
| **`admin`** | **`12345678`** | Administrador General |

---

## 📋 Módulos Replicados

1. **Login:** Conmutador de visibilidad de contraseña ("ojito") y validación contra tabla `empleado`.
2. **Menú Superior:** Barra de navegación `#17a2b8` idéntica a `Principal.jsp` con menú de usuario y botón salir.
3. **Mantenimiento de Empleados:** Formulario + Tabla con listado, agregar, editar y eliminar.
4. **Mantenimiento de Clientes:** Formulario + Tabla con listado, agregar, editar y eliminar.
5. **Mantenimiento de Productos:** Formulario + Tabla con listado, agregar, editar y eliminar.
6. **Registrar Venta (Prácticas 09 y 10):**
   * Búsqueda de cliente por DNI.
   * Búsqueda de producto por Código ID con stock disponible.
   * Carrito de compras con cálculo de subtotales y total general.
   * Generación y formato del número de serie correlativo (`00000001`).
   * Botón **Generar Venta** con apertura de cuadro de diálogo de impresión (`window.print()`), ocultamiento de elementos no imprimibles con `@media print`, reducción automática de stock en la tabla `producto` e inserción en las tablas `ventas` y `detalle_ventas`.
