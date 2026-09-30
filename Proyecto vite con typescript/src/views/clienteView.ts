import { api } from '../services/api';
import { Cliente } from '../types';

export async function renderCliente(container: HTMLElement) {
  let editId: number | null = null;
  const clientes = await api.getClientes();

  container.innerHTML = `
    <div class="d-flex mt-4 container-fluid">
      <!-- Formulario Cliente (col-sm-4) -->
      <div class="card col-sm-4 shadow-sm">
        <div class="card-body">
          <h5 class="card-title text-info mb-3"><i class="fas fa-users mr-1"></i> Formulario de Clientes</h5>
          <form id="formCliente">
            <div class="form-group">
              <label class="font-weight-bold">DNI</label>
              <input type="text" id="txtDniCli" class="form-control" placeholder="DNI del Cliente" required>
            </div>
            <div class="form-group">
              <label class="font-weight-bold">Nombres</label>
              <input type="text" id="txtNombresCli" class="form-control" placeholder="Nombres completos" required>
            </div>
            <div class="form-group">
              <label class="font-weight-bold">Dirección</label>
              <input type="text" id="txtDirCli" class="form-control" placeholder="Dirección de domicilio" required>
            </div>
            <div class="form-group">
              <label class="font-weight-bold">Estado</label>
              <input type="text" id="txtEstadoCli" class="form-control" value="1" placeholder="1 = Activo, 0 = Inactivo" required>
            </div>
            <div class="d-flex mt-3">
              <button type="button" id="btnAgregarCli" class="btn btn-info mr-2">
                <i class="fas fa-plus-circle mr-1"></i> Agregar
              </button>
              <button type="button" id="btnActualizarCli" class="btn btn-success" disabled>
                <i class="fas fa-sync-alt mr-1"></i> Actualizar
              </button>
              <button type="button" id="btnLimpiarCli" class="btn btn-secondary ml-auto">
                <i class="fas fa-eraser mr-1"></i> Limpiar
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Tabla de Clientes (col-sm-8) -->
      <div class="col-sm-8">
        <div class="card shadow-sm">
          <div class="card-body p-0">
            <table class="table table-hover table-striped mb-0">
              <thead class="thead-dark">
                <tr>
                  <th>ID</th>
                  <th>DNI</th>
                  <th>NOMBRES</th>
                  <th>DIRECCIÓN</th>
                  <th>ESTADO</th>
                  <th class="text-center">ACCIONES</th>
                </tr>
              </thead>
              <tbody id="tbodyClientes">
                ${renderFilas(clientes)}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `;

  function renderFilas(lista: Cliente[]): string {
    if (lista.length === 0) {
      return `<tr><td colspan="6" class="text-center text-muted p-3">No hay clientes registrados</td></tr>`;
    }
    return lista
      .map(
        c => `
        <tr>
          <td>${c.IdCliente}</td>
          <td>${c.Dni}</td>
          <td>${c.Nombres}</td>
          <td>${c.Direccion}</td>
          <td><span class="badge ${c.Estado === '1' ? 'badge-success' : 'badge-danger'}">${c.Estado === '1' ? 'Activo' : 'Inactivo'}</span></td>
          <td class="text-center">
            <button class="btn btn-warning btn-sm btn-edit-cli" data-id="${c.IdCliente}">
              <i class="fas fa-edit mr-1"></i> Editar
            </button>
            <button class="btn btn-danger btn-sm btn-delete-cli" data-id="${c.IdCliente}">
              <i class="fas fa-trash-alt mr-1"></i> Eliminar
            </button>
          </td>
        </tr>
      `
      )
      .join('');
  }

  const txtDni = document.getElementById('txtDniCli') as HTMLInputElement;
  const txtNombres = document.getElementById('txtNombresCli') as HTMLInputElement;
  const txtDir = document.getElementById('txtDirCli') as HTMLInputElement;
  const txtEstado = document.getElementById('txtEstadoCli') as HTMLInputElement;
  const btnAgregar = document.getElementById('btnAgregarCli') as HTMLButtonElement;
  const btnActualizar = document.getElementById('btnActualizarCli') as HTMLButtonElement;
  const btnLimpiar = document.getElementById('btnLimpiarCli') as HTMLButtonElement;

  function limpiarFormulario() {
    txtDni.value = '';
    txtNombres.value = '';
    txtDir.value = '';
    txtEstado.value = '1';
    editId = null;
    btnAgregar.disabled = false;
    btnActualizar.disabled = true;
  }

  async function refrescarTabla() {
    const list = await api.getClientes();
    const tbody = document.getElementById('tbodyClientes');
    if (tbody) tbody.innerHTML = renderFilas(list);
    asociarEventosTabla();
  }

  btnLimpiar.addEventListener('click', limpiarFormulario);

  btnAgregar.addEventListener('click', async () => {
    if (!txtDni.value || !txtNombres.value) {
      alert('Por favor complete el DNI y los Nombres del cliente');
      return;
    }
    await api.agregarCliente({
      Dni: txtDni.value.trim(),
      Nombres: txtNombres.value.trim(),
      Direccion: txtDir.value.trim(),
      Estado: txtEstado.value.trim() || '1'
    });
    limpiarFormulario();
    await refrescarTabla();
  });

  btnActualizar.addEventListener('click', async () => {
    if (editId === null) return;
    await api.actualizarCliente(editId, {
      Dni: txtDni.value.trim(),
      Nombres: txtNombres.value.trim(),
      Direccion: txtDir.value.trim(),
      Estado: txtEstado.value.trim() || '1'
    });
    limpiarFormulario();
    await refrescarTabla();
  });

  function asociarEventosTabla() {
    document.querySelectorAll('.btn-edit-cli').forEach(btn => {
      btn.addEventListener('click', async e => {
        const id = Number((e.currentTarget as HTMLElement).getAttribute('data-id'));
        const list = await api.getClientes();
        const cli = list.find(x => x.IdCliente === id);
        if (cli) {
          editId = cli.IdCliente;
          txtDni.value = cli.Dni;
          txtNombres.value = cli.Nombres;
          txtDir.value = cli.Direccion;
          txtEstado.value = cli.Estado;
          btnAgregar.disabled = true;
          btnActualizar.disabled = false;
        }
      });
    });

    document.querySelectorAll('.btn-delete-cli').forEach(btn => {
      btn.addEventListener('click', async e => {
        const id = Number((e.currentTarget as HTMLElement).getAttribute('data-id'));
        if (confirm('¿Está seguro de eliminar este cliente?')) {
          await api.eliminarCliente(id);
          await refrescarTabla();
        }
      });
    });
  }

  asociarEventosTabla();
}
