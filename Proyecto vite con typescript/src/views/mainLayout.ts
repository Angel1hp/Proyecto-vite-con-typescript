import { Empleado } from '../types';

export function renderMainLayout(
  container: HTMLElement,
  usuario: Empleado,
  onNavigate: (module: 'Producto' | 'Empleado' | 'Clientes' | 'RegistrarVenta') => void,
  onLogout: () => void
) {
  container.innerHTML = `
    <!-- Barra de Navegación Horizontal Superior idéntica a Principal.jsp -->
    <nav class="navbar navbar-expand-lg navbar-dark navbar-custom">
      <div class="container-fluid">
        <a class="navbar-brand font-weight-bold" href="#" id="navHome">
          <i class="fas fa-cash-register mr-1"></i> VentasWeb
        </a>
        
        <div class="collapse navbar-collapse show" id="navbarNav">
          <ul class="navbar-nav mr-auto">
            <li class="nav-item">
              <button class="btn btn-outline-light ml-2 border-0 nav-module-btn" data-module="Producto">
                <i class="fas fa-boxes mr-1"></i> Producto
              </button>
            </li>
            <li class="nav-item">
              <button class="btn btn-outline-light ml-2 border-0 nav-module-btn" data-module="Empleado">
                <i class="fas fa-user-tie mr-1"></i> Empleado
              </button>
            </li>
            <li class="nav-item">
              <button class="btn btn-outline-light ml-2 border-0 nav-module-btn" data-module="Clientes">
                <i class="fas fa-users mr-1"></i> Clientes
              </button>
            </li>
            <li class="nav-item">
              <button class="btn btn-outline-light ml-2 border-0 nav-module-btn font-weight-bold" data-module="RegistrarVenta">
                <i class="fas fa-shopping-cart mr-1"></i> Nueva Venta
              </button>
            </li>
          </ul>

          <!-- Menú desplegable del Usuario -->
          <div class="d-flex align-items-center">
            <div class="dropdown show mr-2">
              <button class="btn btn-outline-light dropdown-toggle border-0" type="button" id="btnUserMenu" data-toggle="dropdown">
                <i class="fas fa-user-circle mr-1"></i> ${usuario.User || 'Usuario'}
              </button>
              <div class="dropdown-menu dropdown-menu-right text-center shadow p-2" id="userMenuDropdown" style="display: none; position: absolute; right: 0;">
                <i class="fas fa-user-circle fa-3x text-info mb-2"></i>
                <p class="font-weight-bold mb-0">${usuario.Nombres || 'Administrador'}</p>
                <small class="text-muted d-block mb-2">${usuario.User || 'admin'}</small>
                <div class="dropdown-divider"></div>
                <button class="dropdown-item text-danger btn-sm" id="btnLogout">
                  <i class="fas fa-sign-out-alt mr-1"></i> Salir
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <!-- Contenedor dinámico donde cargan los módulos -->
    <main id="mainContent" class="container-fluid p-3"></main>
  `;

  // Toggle del menú de usuario
  const btnUserMenu = document.getElementById('btnUserMenu');
  const userMenuDropdown = document.getElementById('userMenuDropdown');
  btnUserMenu?.addEventListener('click', (e) => {
    e.stopPropagation();
    if (userMenuDropdown) {
      userMenuDropdown.style.display = userMenuDropdown.style.display === 'none' ? 'block' : 'none';
    }
  });

  document.addEventListener('click', () => {
    if (userMenuDropdown) {
      userMenuDropdown.style.display = 'none';
    }
  });

  // Botón Salir
  document.getElementById('btnLogout')?.addEventListener('click', () => {
    onLogout();
  });

  // Botones de navegación
  const navButtons = document.querySelectorAll('.nav-module-btn');
  navButtons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const target = e.currentTarget as HTMLElement;
      const mod = target.getAttribute('data-module') as 'Producto' | 'Empleado' | 'Clientes' | 'RegistrarVenta';
      
      navButtons.forEach(b => b.classList.remove('active', 'btn-light', 'text-info'));
      target.classList.add('btn-light', 'text-info');
      onNavigate(mod);
    });
  });
}
