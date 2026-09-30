import { api } from '../services/api';
import { Cliente, Producto, ItemCarrito, Empleado } from '../types';

export async function renderRegistrarVenta(container: HTMLElement, usuario: Empleado) {
  let clienteSeleccionado: Cliente | null = null;
  let productoSeleccionado: Producto | null = null;
  let listaCarrito: ItemCarrito[] = [];
  let itemCounter = 0;
  let nroSerie = await api.getNumeroSerie();

  container.innerHTML = `
    <div class="d-flex mt-4 container-fluid">
      <!-- COLUMNA IZQUIERDA: Búsqueda de Cliente y Producto (parte01) -->
      <div class="col-sm-5 parte01">
        <div class="card shadow-sm">
          <div class="card-body">
            
            <!-- Datos del Cliente -->
            <div class="form-group mb-2">
              <label class="font-weight-bold text-info"><i class="fas fa-user mr-1"></i> Datos del Cliente</label>
            </div>
            <div class="form-group d-flex">
              <div class="col-sm-6 d-flex pl-0">
                <input type="text" id="codigocliente" class="form-control mr-1" placeholder="DNI Cliente" value="71234567">
                <button type="button" id="btnBuscarCliente" class="btn btn-outline-info">
                  <i class="fas fa-search"></i>
                </button>
              </div>
              <div class="col-sm-6 pr-0">
                <input type="text" id="nombrescliente" placeholder="Nombre del Cliente" class="form-control" readonly>
              </div>
            </div>

            <!-- Datos del Producto -->
            <div class="form-group mb-2 mt-3">
              <label class="font-weight-bold text-info"><i class="fas fa-box-open mr-1"></i> Datos del Producto</label>
            </div>
            <div class="form-group d-flex">
              <div class="col-sm-6 d-flex pl-0">
                <input type="number" id="codigoproducto" class="form-control mr-1" placeholder="Código ID" value="1">
                <button type="button" id="btnBuscarProducto" class="btn btn-outline-info">
                  <i class="fas fa-search"></i>
                </button>
              </div>
              <div class="col-sm-6 pr-0">
                <input type="text" id="nomproducto" placeholder="Datos Producto" class="form-control" readonly>
              </div>
            </div>

            <div class="form-group d-flex">
              <div class="col-sm-6 d-flex pl-0">
                <input type="text" id="precio" class="form-control" placeholder="S/. 0.00" readonly>
              </div>
              <div class="col-sm-3">
                <input type="number" id="cant" value="1" placeholder="Cant" class="form-control" min="1">
              </div>
              <div class="col-sm-3 pr-0">
                <input type="text" id="stock" placeholder="Stock" class="form-control" readonly>
              </div>
            </div>

            <div class="form-group mb-0 mt-3">
              <button type="button" id="btnAgregarCarrito" class="btn btn-outline-info btn-block">
                <i class="fas fa-cart-plus mr-1"></i> Agregar al Carrito
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- COLUMNA DERECHA: Detalle de Venta -->
      <div class="col-sm-7">
        <div class="card shadow-sm">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h4 class="mb-0 text-info"><i class="fas fa-receipt mr-1"></i> Carrito de Ventas</h4>
              <div class="d-flex align-items-center">
                <label class="mr-2 font-weight-bold mb-0">Nro&nbsp;Serie:</label>
                <input type="text" id="NroSerie" value="${nroSerie}" class="form-control text-center font-weight-bold" style="width: 140px;">
              </div>
            </div>

            <table class="table table-hover table-striped">
              <thead class="thead-light">
                <tr class="text-center">
                  <th>Nro</th>
                  <th>Codigo</th>
                  <th>Descripcion</th>
                  <th>Precio</th>
                  <th>Cantidad</th>
                  <th>SubTotal</th>
                  <th class="parte02">Acciones</th>
                </tr>
              </thead>
              <tbody id="tbodyCarrito">
                <tr><td colspan="7" class="text-center text-muted p-4">El carrito de compras está vacío</td></tr>
              </tbody>
            </table>
          </div>

          <!-- Pie de tarjeta idéntico al Paso 4 de la Práctica 09 y Práctica 10 -->
          <div class="card-footer d-flex">
            <div class="col-sm-6">
              <button type="button" id="btnGenerarVenta" class="btn btn-success mr-2">
                <i class="fas fa-check-circle mr-1"></i> Generar Venta
              </button>
              <button type="button" id="btnCancelarVenta" class="btn btn-danger">
                <i class="fas fa-times-circle mr-1"></i> Cancelar
              </button>
            </div>
            <div class="col-sm-4 ml-auto d-flex align-items-center justify-content-end">
              <h5 class="mb-0 mr-2 font-weight-bold">TOTAL:</h5>
              <input type="text" id="txtTotal" value="S/. 0.00" class="form-control text-center font-weight-bold text-success" style="width: 130px;" readonly>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  const txtCodigoCli = document.getElementById('codigocliente') as HTMLInputElement;
  const txtNombresCli = document.getElementById('nombrescliente') as HTMLInputElement;
  const btnBuscarCli = document.getElementById('btnBuscarCliente') as HTMLButtonElement;

  const txtCodigoProd = document.getElementById('codigoproducto') as HTMLInputElement;
  const txtNomProd = document.getElementById('nomproducto') as HTMLInputElement;
  const txtPrecio = document.getElementById('precio') as HTMLInputElement;
  const txtCant = document.getElementById('cant') as HTMLInputElement;
  const txtStock = document.getElementById('stock') as HTMLInputElement;
  const btnBuscarProd = document.getElementById('btnBuscarProducto') as HTMLButtonElement;
  const btnAgregarCarrito = document.getElementById('btnAgregarCarrito') as HTMLButtonElement;

  const inputNroSerie = document.getElementById('NroSerie') as HTMLInputElement;
  const tbodyCarrito = document.getElementById('tbodyCarrito') as HTMLElement;
  const txtTotal = document.getElementById('txtTotal') as HTMLInputElement;
  const btnGenerarVenta = document.getElementById('btnGenerarVenta') as HTMLButtonElement;
  const btnCancelarVenta = document.getElementById('btnCancelarVenta') as HTMLButtonElement;

  // 1. Buscar Cliente
  async function buscarCliente() {
    const dni = txtCodigoCli.value.trim();
    if (!dni) {
      alert('Ingrese un DNI de cliente');
      return;
    }
    const cli = await api.buscarClientePorDni(dni);
    if (cli) {
      clienteSeleccionado = cli;
      txtNombresCli.value = cli.Nombres;
    } else {
      alert('Cliente no encontrado en la base de datos');
      clienteSeleccionado = null;
      txtNombresCli.value = '';
    }
  }

  btnBuscarCli.addEventListener('click', buscarCliente);
  txtCodigoCli.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      buscarCliente();
    }
  });

  // 2. Buscar Producto
  async function buscarProducto() {
    const id = Number(txtCodigoProd.value);
    if (!id) {
      alert('Ingrese un código de producto válido');
      return;
    }
    const prod = await api.buscarProductoPorId(id);
    if (prod) {
      productoSeleccionado = prod;
      txtNomProd.value = prod.Nombres;
      txtPrecio.value = `S/. ${Number(prod.Precio).toFixed(2)}`;
      txtStock.value = String(prod.Stock);
    } else {
      alert('Producto no encontrado');
      productoSeleccionado = null;
      txtNomProd.value = '';
      txtPrecio.value = '';
      txtStock.value = '';
    }
  }

  btnBuscarProd.addEventListener('click', buscarProducto);
  txtCodigoProd.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      buscarProducto();
    }
  });

  // 3. Agregar al Carrito
  btnAgregarCarrito.addEventListener('click', () => {
    if (!productoSeleccionado) {
      alert('Primero debe buscar y seleccionar un producto');
      return;
    }

    const cantidad = Number(txtCant.value);
    if (cantidad <= 0) {
      alert('La cantidad debe ser mayor a 0');
      return;
    }

    if (cantidad > productoSeleccionado.Stock) {
      alert(`Stock insuficiente. Solo quedan ${productoSeleccionado.Stock} unidades.`);
      return;
    }

    itemCounter++;
    const precio = Number(productoSeleccionado.Precio);
    const subtotal = precio * cantidad;

    listaCarrito.push({
      item: itemCounter,
      idproducto: productoSeleccionado.IdProducto,
      descripcionP: productoSeleccionado.Nombres,
      precio: precio,
      cantidad: cantidad,
      subtotal: subtotal
    });

    actualizarTablaCarrito();
  });

  function actualizarTablaCarrito() {
    if (listaCarrito.length === 0) {
      tbodyCarrito.innerHTML = `<tr><td colspan="7" class="text-center text-muted p-4">El carrito de compras está vacío</td></tr>`;
      txtTotal.value = 'S/. 0.00';
      return;
    }

    let total = 0;
    tbodyCarrito.innerHTML = listaCarrito
      .map(v => {
        total += v.subtotal;
        return `
          <tr class="text-center align-middle">
            <td>${v.item}</td>
            <td>${v.idproducto}</td>
            <td class="text-left font-weight-bold">${v.descripcionP}</td>
            <td>S/. ${v.precio.toFixed(2)}</td>
            <td><span class="badge badge-secondary px-2 py-1">${v.cantidad}</span></td>
            <td class="font-weight-bold">S/. ${v.subtotal.toFixed(2)}</td>
            <td class="parte02">
              <button class="btn btn-sm btn-outline-danger btn-eliminar-item" data-item="${v.item}">
                <i class="fas fa-trash-alt"></i>
              </button>
            </td>
          </tr>
        `;
      })
      .join('');

    txtTotal.value = `S/. ${total.toFixed(2)}`;

    // Eventos para eliminar ítems
    document.querySelectorAll('.btn-eliminar-item').forEach(btn => {
      btn.addEventListener('click', e => {
        const itemNum = Number((e.currentTarget as HTMLElement).getAttribute('data-item'));
        listaCarrito = listaCarrito.filter(it => it.item !== itemNum);
        actualizarTablaCarrito();
      });
    });
  }

  // 4. Cancelar Venta
  btnCancelarVenta.addEventListener('click', () => {
    listaCarrito = [];
    itemCounter = 0;
    clienteSeleccionado = null;
    productoSeleccionado = null;
    txtCodigoCli.value = '';
    txtNombresCli.value = '';
    txtCodigoProd.value = '';
    txtNomProd.value = '';
    txtPrecio.value = '';
    txtStock.value = '';
    txtCant.value = '1';
    actualizarTablaCarrito();
  });

  // 5. Generar Venta (Práctica 09 y 10)
  btnGenerarVenta.addEventListener('click', async () => {
    if (listaCarrito.length === 0) {
      alert('Debe agregar al menos un producto al carrito');
      return;
    }

    if (!clienteSeleccionado) {
      alert('Debe buscar y seleccionar un cliente antes de generar la venta');
      return;
    }

    const currentSerie = inputNroSerie.value.trim() || nroSerie;
    let totalPagar = 0;
    listaCarrito.forEach(it => (totalPagar += it.subtotal));

    // Impresión según Paso 4 y 7 de Práctica 10
    window.print();

    // Guardado en BD y reducción de stock
    const success = await api.generarVenta(
      clienteSeleccionado.IdCliente,
      usuario.IdEmpleado || 2,
      currentSerie,
      totalPagar,
      listaCarrito
    );

    if (success) {
      alert(`¡Venta generada con éxito con la Serie Nro: ${currentSerie}!`);
      // Obtener nueva serie correlativa y reiniciar
      listaCarrito = [];
      itemCounter = 0;
      clienteSeleccionado = null;
      productoSeleccionado = null;
      txtCodigoCli.value = '';
      txtNombresCli.value = '';
      txtCodigoProd.value = '';
      txtNomProd.value = '';
      txtPrecio.value = '';
      txtStock.value = '';
      actualizarTablaCarrito();

      nroSerie = await api.getNumeroSerie();
      inputNroSerie.value = nroSerie;
    }
  });

  // Ejecutar búsqueda inicial para comodidad
  buscarCliente();
  buscarProducto();
}
