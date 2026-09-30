import { api } from '../services/api';
import { Empleado } from '../types';

export function renderLogin(container: HTMLElement, onLoginSuccess: (user: Empleado) => void) {
  container.innerHTML = `
    <div class="login-container">
      <div class="card login-card col-sm-10 col-md-6 col-lg-4">
        <div class="card-body">
          <form id="formLogin">
            <div class="form-group text-center">
              <h3>Login</h3>
              <div class="my-2">
                <i class="fas fa-user-circle fa-4x text-info"></i>
              </div>
              <label class="text-muted">Bienvenido al Sistema de Ventas</label>
              <div id="loginStatusBadge" class="mt-1"></div>
            </div>
            
            <div id="loginError" class="alert alert-danger d-none py-1 small text-center" role="alert"></div>

            <div class="form-group">
              <label class="font-weight-bold">Usuario:</label>
              <input class="form-control" type="text" id="txtuser" name="txtuser" placeholder="Ingrese su Usuario" required autofocus value="emp01">
            </div>

            <div class="form-group">
              <label class="font-weight-bold">Contraseña:</label>
              <div class="input-group">
                <input id="txtpass" type="password" class="form-control" name="txtpass" placeholder="Ingrese su Contraseña" required value="87654321">
                <div class="input-group-append">
                  <button id="btnOjito" class="btn btn-primary" type="button">
                    <i class="fas fa-eye-slash" id="iconoOjito"></i>
                  </button>
                </div>
              </div>
              <small class="form-text text-muted">Nota: La contraseña corresponde al DNI del empleado.</small>
            </div>

            <div class="form-group mb-0">
              <button class="btn btn-primary btn-block" type="submit" id="btnIngresar">
                <i class="fas fa-sign-in-alt mr-1"></i> Ingresar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;

  // Indicador de conexión a Base de Datos
  const badgeContainer = document.getElementById('loginStatusBadge');
  if (badgeContainer) {
    if (api.getIsMySqlOnline()) {
      badgeContainer.innerHTML = '<span class="badge badge-success db-badge"><i class="fas fa-database mr-1"></i> Conectado a MySQL (bd_ventas)</span>';
    } else {
      badgeContainer.innerHTML = '<span class="badge badge-info db-badge"><i class="fas fa-laptop-code mr-1"></i> Modo Local (Datos sincronizados)</span>';
    }
  }

  // Lógica del ojito (mostrar / ocultar contraseña)
  const txtPass = document.getElementById('txtpass') as HTMLInputElement;
  const btnOjito = document.getElementById('btnOjito') as HTMLButtonElement;
  const iconoOjito = document.getElementById('iconoOjito') as HTMLElement;

  btnOjito?.addEventListener('click', () => {
    if (txtPass.type === 'password') {
      txtPass.type = 'text';
      iconoOjito.className = 'fas fa-eye';
    } else {
      txtPass.type = 'password';
      iconoOjito.className = 'fas fa-eye-slash';
    }
  });

  // Envío del Formulario
  const form = document.getElementById('formLogin') as HTMLFormElement;
  const loginError = document.getElementById('loginError') as HTMLElement;

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    loginError.classList.add('d-none');

    const user = (document.getElementById('txtuser') as HTMLInputElement).value.trim();
    const pass = (document.getElementById('txtpass') as HTMLInputElement).value.trim();

    const emp = await api.login(user, pass);
    if (emp) {
      sessionStorage.setItem('usuario_conectado', JSON.stringify(emp));
      onLoginSuccess(emp);
    } else {
      loginError.textContent = 'Usuario o contraseña incorrectos.';
      loginError.classList.remove('d-none');
    }
  });
}
