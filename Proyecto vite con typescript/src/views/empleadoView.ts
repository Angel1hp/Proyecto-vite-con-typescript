import { api } from '../services/api';
import { Empleado } from '../types';

export async function renderEmpleado(container: HTMLElement) {
  let editId: number | null = null;
  const empleados = await api.getEmpleados();

  container.innerHTML = `
    <div class="d-flex mt-4 container-fluid">
      <!-- Formulario Empleado (col-sm-5) -->
      <div class="card col-sm-5 shadow-sm">
        <div class="card-body">
          <h5 class="card-title text-info mb-3"><i class="fas fa-user-tie mr-1"></i> Formulario de Empleado</h5>
          <form id="formEmpleado">
            <div class="form-group">
              <label class="font-weight-bold">DNI</label>
              <input type="text" id="txtDni" class="form-control" placeholder="DNI del Empleado" required>
            </div>
            <div class="form-group">
              <label class="font-weight-bold">Nombres</label>
              <input type="text" id="txtNombres" class="form-control" placeholder="Nombres completos" required>
            </div>
            <div class="form-group">
              <label class="font-weight-bold">Teléfono</label>
              <input type="text" id="txtTel" class="form-control" placeholder="Número de celular" required>
            </div>
            <div class="form-group">
              <label class="font-weight-bold">Estado</label>
              <input type="text" id="txtEstado" class="form-control" value="1" placeholder="1 = Activo, 0 = Inactivo" required>
            </div>
            <div class="form-group">
              <label class="font-weight-bold">Usuario</label>
              <input type="text" id="txtUser" class="form-control" placeholder="Nombre de usuario para login" required>
            </div>
            <div class="d-flex mt-3">
              <button type="button" id="btnAgregar" class="btn btn-info mr-2">
                <i class="fas fa-plus-circle mr-1"></i> Agregar
              </button>
              <button type="button" id="btnActualizar" class="btn btn-success" disabled>
                <i class="fas fa-sync-alt mr-1"></i> Actualizar
              </button>
              <button type="button" id="btnLimpiar" class="btn btn-secondary ml-auto">
                <i class="fas fa-eraser mr-1"></i> Limpiar
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Tabla de lista de empleados (col-sm-7) -->
      <div class="col-sm-7">
        <div class="card shadow-sm">
          <div class="card-body p-0">
            <table class="table table-hover table-striped mb-0">
              <thead class="thead-dark">
                <tr>
                  <th>ID</th>
                  <th>DNI</th>
                  <th>NOMBRES</th>
                  <th>TELÉFONO</th>
                  <th>ESTADO</th>
                  <th>USUARIO</th>
                  <th class="text-center">ACCIONES</th>
                </tr>
              </thead>
              <tbody id="tbodyEmpleados">
                ${renderFilas(empleados)}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `;

  function renderFilas(lista: Empleado[]): string {
    if (lista.length === 0) {
      return `<tr><td colspan="7" class="text-center text-muted p-3">No hay empleados registrados</td></tr>`;
    }
    return lista
      .map(
        em => `
        <tr>
          <td>${em.IdEmpleado}</td>
          <td>${em.Dni}</td>
          <td>${em.Nombres}</td>
          <td>${em.Telefono}</td>
          <td><span class="badge ${em.Estado === '1' ? 'badge-success' : 'badge-danger'}">${em.Estado === '1' ? 'Activo' : 'Inactivo'}</span></td>
          <td>${em.User}</td>
          <td class="text-center">
            <button class="btn btn-warning btn-sm btn-edit" data-id="${em.IdEmpleado}">
              <i class="fas fa-edit mr-1"></i> Editar
            </button>
            <button class="btn btn-danger btn-sm btn-delete" data-id="${em.IdEmpleado}">
              <i class="fas fa-trash-alt mr-1"></i> Eliminar
            </button>
          </td>
        </tr>
      `
      )
      .join('');
  }

  const txtDni = document.getElementById('txtDni') as HTMLInputElement;
  const txtNombres = document.getElementById('txtNombres') as HTMLInputElement;
  const txtTel = document.getElementById('txtTel') as HTMLInputElement;
  const txtEstado = document.getElementById('txtEstado') as HTMLInputElement;
  const txtUser = document.getElementById('txtUser') as HTMLInputElement;
  const btnAgregar = document.getElementById('btnAgregar') as HTMLButtonElement;
  const btnActualizar = document.getElementById('btnActualizar') as HTMLButtonElement;
  const btnLimpiar = document.getElementById('btnLimpiar') as HTMLButtonElement;

  function limpiarFormulario() {
    txtDni.value = '';
    txtNombres.value = '';
    txtTel.value = '';
    txtEstado.value = '1';
    txtUser.value = '';
    editId = null;
    btnAgregar.disabled = false;
    btnActualizar.disabled = true;
  }

  async function refrescarTabla() {
    const list = await api.getEmpleados();
    const tbody = document.getElementById('tbodyEmpleados');
    if (tbody) tbody.innerHTML = renderFilas(list);
    asociarEventosTabla();
  }

  btnLimpiar.addEventListener('click', limpiarFormulario);

  btnAgregar.addEventListener('click', async () => {
    if (!txtDni.value || !txtNombres.value || !txtUser.value) {
      alert('Por favor complete todos los campos obligatorios');
      return;
    }
    await api.agregarEmpleado({
      Dni: txtDni.value.trim(),
      Nombres: txtNombres.value.trim(),
      Telefono: txtTel.value.trim(),
      Estado: txtEstado.value.trim() || '1',
      User: txtUser.value.trim()
    });
    limpiarFormulario();
    await refrescarTabla();
  });

  btnActualizar.addEventListener('click', async () => {
    if (editId === null) return;
    await api.actualizarEmpleado(editId, {
      Dni: txtDni.value.trim(),
      Nombres: txtNombres.value.trim(),
      Telefono: txtTel.value.trim(),
      Estado: txtEstado.value.trim() || '1',
      User: txtUser.value.trim()
    });
    limpiarFormulario();
    await refrescarTabla();
  });

  function asociarEventosTabla() {
    document.querySelectorAll('.btn-edit').forEach(btn => {
      btn.addEventListener('click', async e => {
        const id = Number((e.currentTarget as HTMLElement).getAttribute('data-id'));
        const list = await api.getEmpleados();
        const emp = list.find(x => x.IdEmpleado === id);
        if (emp) {
          editId = emp.IdEmpleado;
          txtDni.value = emp.Dni;
          txtNombres.value = emp.Nombres;
          txtTel.value = emp.Telefono;
          txtEstado.value = emp.Estado;
          txtUser.value = emp.User;
          btnAgregar.disabled = true;
          btnActualizar.disabled = false;
        }
      });
    });

    document.querySelectorAll('.btn-delete').forEach(btn => {
      btn.addEventListener('click', async e => {
        const id = Number((e.currentTarget as HTMLElement).getAttribute('data-id'));
        if (confirm('¿Está seguro de eliminar este empleado?')) {
          await api.eliminarEmpleado(id);
          await refrescarTabla();
        }
      });
    });
  }

  asociarEventosTabla();
}
