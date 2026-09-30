import { api } from '../services/api';
import { Producto } from '../types';

export async function renderProducto(container: HTMLElement) {
  let editId: number | null = null;
  const productos = await api.getProductos();

  container.innerHTML = `
    <div class="d-flex mt-4 container-fluid">
      <!-- Formulario Producto (col-sm-4) -->
      <div class="card col-sm-4 shadow-sm">
        <div class="card-body">
          <h5 class="card-title text-info mb-3"><i class="fas fa-boxes mr-1"></i> Formulario de Producto</h5>
          <form id="formProducto">
            <div class="form-group">
              <label class="font-weight-bold">Nombres</label>
              <input type="text" id="txtNomProd" class="form-control" placeholder="Nombre o descripción del producto" required>
            </div>
            <div class="form-group">
              <label class="font-weight-bold">Precio (S/.)</label>
              <input type="number" step="0.01" id="txtPrecioProd" class="form-control" placeholder="0.00" required>
            </div>
            <div class="form-group">
              <label class="font-weight-bold">Stock</label>
              <input type="number" id="txtStockProd" class="form-control" placeholder="Cantidad disponible" required>
            </div>
            <div class="form-group">
              <label class="font-weight-bold">Estado</label>
              <input type="text" id="txtEstadoProd" class="form-control" value="1" placeholder="1 = Activo, 0 = Inactivo" required>
            </div>
            <div class="d-flex mt-3">
              <button type="button" id="btnAgregarProd" class="btn btn-info mr-2">
                <i class="fas fa-plus-circle mr-1"></i> Agregar
              </button>
              <button type="button" id="btnActualizarProd" class="btn btn-success" disabled>
                <i class="fas fa-sync-alt mr-1"></i> Actualizar
              </button>
              <button type="button" id="btnLimpiarProd" class="btn btn-secondary ml-auto">
                <i class="fas fa-eraser mr-1"></i> Limpiar
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Tabla de Productos (col-sm-8) -->
      <div class="col-sm-8">
        <div class="card shadow-sm">
          <div class="card-body p-0">
            <table class="table table-hover table-striped mb-0">
              <thead class="thead-dark">
                <tr>
                  <th>ID</th>
                  <th>NOMBRES</th>
                  <th>PRECIO</th>
                  <th>STOCK</th>
                  <th>ESTADO</th>
                  <th class="text-center">ACCIONES</th>
                </tr>
              </thead>
              <tbody id="tbodyProductos">
                ${renderFilas(productos)}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `;

  function renderFilas(lista: Producto[]): string {
    if (lista.length === 0) {
      return `<tr><td colspan="6" class="text-center text-muted p-3">No hay productos registrados</td></tr>`;
    }
    return lista
      .map(
        p => `
        <tr>
          <td>${p.IdProducto}</td>
          <td>${p.Nombres}</td>
          <td>S/. ${Number(p.Precio).toFixed(2)}</td>
          <td><span class="badge ${p.Stock > 5 ? 'badge-primary' : 'badge-warning'}">${p.Stock}</span></td>
          <td><span class="badge ${p.Estado === '1' ? 'badge-success' : 'badge-danger'}">${p.Estado === '1' ? 'Activo' : 'Inactivo'}</span></td>
          <td class="text-center">
            <button class="btn btn-warning btn-sm btn-edit-prod" data-id="${p.IdProducto}">
              <i class="fas fa-edit mr-1"></i> Editar
            </button>
            <button class="btn btn-danger btn-sm btn-delete-prod" data-id="${p.IdProducto}">
              <i class="fas fa-trash-alt mr-1"></i> Eliminar
            </button>
          </td>
        </tr>
      `
      )
      .join('');
  }

  const txtNom = document.getElementById('txtNomProd') as HTMLInputElement;
  const txtPrecio = document.getElementById('txtPrecioProd') as HTMLInputElement;
  const txtStock = document.getElementById('txtStockProd') as HTMLInputElement;
  const txtEstado = document.getElementById('txtEstadoProd') as HTMLInputElement;
  const btnAgregar = document.getElementById('btnAgregarProd') as HTMLButtonElement;
  const btnActualizar = document.getElementById('btnActualizarProd') as HTMLButtonElement;
  const btnLimpiar = document.getElementById('btnLimpiarProd') as HTMLButtonElement;

  function limpiarFormulario() {
    txtNom.value = '';
    txtPrecio.value = '';
    txtStock.value = '';
    txtEstado.value = '1';
    editId = null;
    btnAgregar.disabled = false;
    btnActualizar.disabled = true;
  }

  async function refrescarTabla() {
    const list = await api.getProductos();
    const tbody = document.getElementById('tbodyProductos');
    if (tbody) tbody.innerHTML = renderFilas(list);
    asociarEventosTabla();
  }

  btnLimpiar.addEventListener('click', limpiarFormulario);

  btnAgregar.addEventListener('click', async () => {
    if (!txtNom.value || !txtPrecio.value || !txtStock.value) {
      alert('Por favor complete todos los datos del producto');
      return;
    }
    await api.agregarProducto({
      Nombres: txtNom.value.trim(),
      Precio: Number(txtPrecio.value),
      Stock: Number(txtStock.value),
      Estado: txtEstado.value.trim() || '1'
    });
    limpiarFormulario();
    await refrescarTabla();
  });

  btnActualizar.addEventListener('click', async () => {
    if (editId === null) return;
    await api.actualizarProducto(editId, {
      Nombres: txtNom.value.trim(),
      Precio: Number(txtPrecio.value),
      Stock: Number(txtStock.value),
      Estado: txtEstado.value.trim() || '1'
    });
    limpiarFormulario();
    await refrescarTabla();
  });

  function asociarEventosTabla() {
    document.querySelectorAll('.btn-edit-prod').forEach(btn => {
      btn.addEventListener('click', async e => {
        const id = Number((e.currentTarget as HTMLElement).getAttribute('data-id'));
        const list = await api.getProductos();
        const prod = list.find(x => x.IdProducto === id);
        if (prod) {
          editId = prod.IdProducto;
          txtNom.value = prod.Nombres;
          txtPrecio.value = String(prod.Precio);
          txtStock.value = String(prod.Stock);
          txtEstado.value = prod.Estado;
          btnAgregar.disabled = true;
          btnActualizar.disabled = false;
        }
      });
    });

    document.querySelectorAll('.btn-delete-prod').forEach(btn => {
      btn.addEventListener('click', async e => {
        const id = Number((e.currentTarget as HTMLElement).getAttribute('data-id'));
        if (confirm('¿Está seguro de eliminar este producto?')) {
          await api.eliminarProducto(id);
          await refrescarTabla();
        }
      });
    });
  }

  asociarEventosTabla();
}
