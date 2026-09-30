import './styles/main.css';
import { Empleado } from './types';
import { renderLogin } from './views/loginView';
import { renderMainLayout } from './views/mainLayout';
import { renderProducto } from './views/productoView';
import { renderEmpleado } from './views/empleadoView';
import { renderCliente } from './views/clienteView';
import { renderRegistrarVenta } from './views/registrarVentaView';
import { api } from './services/api';

class App {
  private appContainer: HTMLElement;
  private currentUser: Empleado | null = null;
  private currentModule: 'Producto' | 'Empleado' | 'Clientes' | 'RegistrarVenta' = 'RegistrarVenta';

  constructor() {
    this.appContainer = document.getElementById('app') as HTMLElement;
    this.init();
  }

  private async init() {
    // Verificar conexión MySQL al arrancar
    await api.checkConnection();

    // Comprobar si hay sesión iniciada previamente
    const savedUser = sessionStorage.getItem('usuario_conectado');
    if (savedUser) {
      try {
        this.currentUser = JSON.parse(savedUser);
        this.renderApp();
        return;
      } catch (e) {
        sessionStorage.removeItem('usuario_conectado');
      }
    }

    this.showLogin();
  }

  private showLogin() {
    renderLogin(this.appContainer, (user: Empleado) => {
      this.currentUser = user;
      this.renderApp();
    });
  }

  private renderApp() {
    if (!this.currentUser) return;

    renderMainLayout(
      this.appContainer,
      this.currentUser,
      (module) => {
        this.currentModule = module;
        this.loadModule();
      },
      () => {
        // Logout
        sessionStorage.removeItem('usuario_conectado');
        this.currentUser = null;
        this.showLogin();
      }
    );

    this.loadModule();
  }

  private loadModule() {
    const mainContent = document.getElementById('mainContent');
    if (!mainContent) return;

    // Destacar botón activo en navbar
    document.querySelectorAll('.nav-module-btn').forEach(btn => {
      const mod = btn.getAttribute('data-module');
      if (mod === this.currentModule) {
        btn.classList.add('btn-light', 'text-info');
      } else {
        btn.classList.remove('btn-light', 'text-info');
      }
    });

    switch (this.currentModule) {
      case 'Producto':
        renderProducto(mainContent);
        break;
      case 'Empleado':
        renderEmpleado(mainContent);
        break;
      case 'Clientes':
        renderCliente(mainContent);
        break;
      case 'RegistrarVenta':
      default:
        renderRegistrarVenta(mainContent, this.currentUser!);
        break;
    }
  }
}

// Inicializar la aplicación
new App();
