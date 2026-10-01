import { useState } from 'react';
import {
  Activity,
  BarChart3,
  Bell,
  Boxes,
  Building2,
  Calculator,
  ChevronDown,
  History,
  LayoutDashboard,
  LogOut,
  Package,
  Search,
  Settings,
  ShoppingCart,
  Store,
  Target,
  Users,
} from 'lucide-react';

import Dashboard from './pages/Dashboard';
import Productos from './pages/Productos';
import Inventario from './pages/Inventario';
import Ventas from './pages/Ventas';
import Empresa from './pages/Empresa';
import Sucursales from './pages/Sucursales';
import AnalisisMatematico from './pages/AnalisisMatematico';
import Historial from './pages/Historial';
import Reportes from './pages/Reportes';
import Usuarios from './pages/Usuarios';
import Configuracion from './pages/Configuracion';
import Metas from './pages/Metas';
import Login from './pages/Login';

/* =========================================================
   TIPOS
========================================================= */

type Rol =
  | 'ADMIN'
  | 'ANALISTA'
  | 'CONSULTA';

type Usuario = {
  id: number;
  dni: string;
  nombre: string;
  rol: string;
  estado: string;
  tiene_rostro?: boolean;
  fecha_registro?: string | null;
};

type Vista =
  | 'dashboard'
  | 'empresa'
  | 'sucursales'
  | 'productos'
  | 'ventas'
  | 'inventario'
  | 'metas'
  | 'analisis'
  | 'historial'
  | 'reportes'
  | 'usuarios'
  | 'configuracion';

type MenuItem = {
  id: Vista;
  nombre: string;
  icono: any;
  roles: Rol[];
};

type MenuSection = {
  nombre: string;
  items: MenuItem[];
};

/* =========================================================
   IDENTIDAD MATAS PERU EIRL
========================================================= */

const EMPRESA_NOMBRE = 'MATAS PERU EIRL';
const EMPRESA_GERENTE = 'GERARDO GARCIA MATAS';
const EMPRESA_RUBRO =
  'Electricidad y Soluciones Integrales';

/* =========================================================
   PALETA ACTUAL
========================================================= */

const VINO = '#7c636c';
const VINO_SUAVE = '#F8E9EE';

const SIDEBAR = '#E8EAEC';
const SIDEBAR_BORDE = '#D9DCDF';

const FONDO = '#F3F3F1';
const BLANCO = '#FFFFFF';

const NEGRO = '#111111';
const TEXTO = '#374151';
const GRIS = '#6B7280';
const ICONO = '#69717C';

/* =========================================================
   MENÚ
========================================================= */

const menuSecciones: MenuSection[] = [
  {
    nombre: 'GENERAL',
    items: [
      {
        id: 'dashboard',
        nombre: 'Dashboard',
        icono: LayoutDashboard,
        roles: [
          'ADMIN',
          'ANALISTA',
          'CONSULTA',
        ],
      },
    ],
  },

  {
    nombre: 'EMPRESA',
    items: [
      {
        id: 'empresa',
        nombre: 'Empresa',
        icono: Building2,
        roles: [
          'ADMIN',
          'CONSULTA',
        ],
      },

      {
        id: 'sucursales',
        nombre: 'Sucursales',
        icono: Store,
        roles: [
          'ADMIN',
          'CONSULTA',
        ],
      },

      {
        id: 'productos',
        nombre: 'Productos',
        icono: Package,
        roles: [
          'ADMIN',
          'ANALISTA',
          'CONSULTA',
        ],
      },

      {
        id: 'ventas',
        nombre: 'Ventas',
        icono: ShoppingCart,
        roles: [
          'ADMIN',
          'ANALISTA',
        ],
      },

      {
        id: 'inventario',
        nombre: 'Inventario',
        icono: Boxes,
        roles: [
          'ADMIN',
          'ANALISTA',
        ],
      },

      {
        id: 'metas',
        nombre: 'Metas y Objetivos',
        icono: Target,
        roles: [
          'ADMIN',
          'ANALISTA',
        ],
      },
    ],
  },

  {
    nombre: 'ANÁLISIS MATEMÁTICO',
    items: [
      {
        id: 'analisis',
        nombre: 'Análisis Matemático',
        icono: Calculator,
        roles: [
          'ADMIN',
          'ANALISTA',
        ],
      },

      {
        id: 'historial',
        nombre: 'Historial',
        icono: History,
        roles: [
          'ADMIN',
          'ANALISTA',
        ],
      },

      {
        id: 'reportes',
        nombre: 'Reportes',
        icono: BarChart3,
        roles: [
          'ADMIN',
          'ANALISTA',
          'CONSULTA',
        ],
      },
    ],
  },

  {
    nombre: 'GESTIÓN',
    items: [
      {
        id: 'usuarios',
        nombre: 'Usuarios',
        icono: Users,
        roles: ['ADMIN'],
      },

      {
        id: 'configuracion',
        nombre: 'Configuración',
        icono: Settings,
        roles: ['ADMIN'],
      },
    ],
  },
];

/* =========================================================
   NORMALIZAR ROL
========================================================= */

function normalizarRol(
  rol: string,
): Rol {
  const valor = rol
    .trim()
    .toUpperCase()
    .normalize('NFD')
    .replace(
      /[\u0300-\u036f]/g,
      '',
    );

  if (valor.includes('ADMIN')) {
    return 'ADMIN';
  }

  if (
    valor.includes('ANALISTA') ||
    valor.includes('ANALYTIC')
  ) {
    return 'ANALISTA';
  }

  return 'CONSULTA';
}

/* =========================================================
   INICIALES
========================================================= */

function obtenerIniciales(
  nombre: string,
): string {
  if (!nombre) {
    return 'MP';
  }

  const partes = nombre
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (partes.length === 1) {
    return partes[0]
      .slice(0, 2)
      .toUpperCase();
  }

  return (
    partes[0][0] +
    partes[partes.length - 1][0]
  ).toUpperCase();
}

/* =========================================================
   APP
========================================================= */

export default function App() {
  const [
    autenticado,
    setAutenticado,
  ] = useState(false);

  const [
    usuarioActual,
    setUsuarioActual,
  ] = useState<Usuario | null>(null);

  const [
    vista,
    setVista,
  ] = useState<Vista>('dashboard');

  const [
    busqueda,
    setBusqueda,
  ] = useState('');

  const [
    notificacionesAbiertas,
    setNotificacionesAbiertas,
  ] = useState(false);

  const [
    perfilAbierto,
    setPerfilAbierto,
  ] = useState(false);

  /* =======================================================
     LOGIN
  ======================================================= */

  if (!autenticado) {
    return (
      <Login
        onLogin={(usuario) => {
          setUsuarioActual(usuario);
          setAutenticado(true);
          setVista('dashboard');
        }}
      />
    );
  }

  /* =======================================================
     ROL
  ======================================================= */

  const rolActual: Rol =
    normalizarRol(
      usuarioActual?.rol ?? '',
    );

  /* =======================================================
     MENÚ PERMITIDO
  ======================================================= */

  const menuPermitido =
    menuSecciones
      .map((seccion) => ({
        ...seccion,

        items: seccion.items.filter(
          (item) =>
            item.roles.includes(
              rolActual,
            ),
        ),
      }))
      .filter(
        (seccion) =>
          seccion.items.length > 0,
      );

  /* =======================================================
     TODOS LOS ITEMS
  ======================================================= */

  const todosLosItems =
    menuPermitido.flatMap(
      (seccion) =>
        seccion.items,
    );

  /* =======================================================
     VISTA ACTUAL
  ======================================================= */

  const vistaPermitida =
    todosLosItems.some(
      (item) =>
        item.id === vista,
    );

  const vistaInicial =
    todosLosItems[0]?.id ??
    'dashboard';

  const vistaActual =
    vistaPermitida
      ? vista
      : vistaInicial;

  /* =======================================================
     BÚSQUEDA
  ======================================================= */

  const terminoBusqueda =
    busqueda
      .trim()
      .toLowerCase();

  const resultadosBusqueda =
    terminoBusqueda
      ? todosLosItems.filter(
          (item) =>
            item.nombre
              .toLowerCase()
              .includes(
                terminoBusqueda,
              ),
        )
      : [];

  /* =======================================================
     SELECCIONAR VISTA
  ======================================================= */

  const seleccionarVista = (
    nuevaVista: Vista,
  ) => {
    setVista(nuevaVista);
    setBusqueda('');
    setNotificacionesAbiertas(false);
    setPerfilAbierto(false);
  };

  /* =======================================================
     CERRAR SESIÓN
  ======================================================= */

  const cerrarSesion = () => {
    setUsuarioActual(null);
    setAutenticado(false);
    setVista('dashboard');
    setBusqueda('');
    setPerfilAbierto(false);
    setNotificacionesAbiertas(false);
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: FONDO,
        color: NEGRO,
      }}
    >

      {/* ===================================================
          SIDEBAR
      =================================================== */}

      <aside
        className="fixed inset-y-0 left-0 z-40 flex w-[230px] flex-col"
        style={{
          backgroundColor: SIDEBAR,
          borderRight:
            `1px solid ${SIDEBAR_BORDE}`,
        }}
      >

        {/* LOGO */}

        <div
          className="flex h-[94px] items-center px-5"
          style={{
            borderBottom:
              `1px solid ${SIDEBAR_BORDE}`,
          }}
        >

          <div className="flex items-center gap-3">

            <div
              className="flex h-11 w-11 items-center justify-center rounded-xl text-white"
              style={{
                backgroundColor: VINO,
                boxShadow:
                  '0 5px 12px rgba(80,80,80,0.20)',
              }}
            >
              <Activity
                size={22}
                strokeWidth={2.3}
              />
            </div>

            <div>

              <h1
                className="text-[16px] font-bold tracking-wide"
                style={{
                  color: VINO,
                }}
              >
                {EMPRESA_NOMBRE}
              </h1>

              <p
                className="text-[8px] font-semibold uppercase tracking-[0.16em]"
                style={{
                  color: GRIS,
                }}
              >
                {EMPRESA_RUBRO}
              </p>

            </div>

          </div>

        </div>

        {/* NAVEGACIÓN */}

        <div className="flex-1 overflow-y-auto px-3 py-5">

          {menuPermitido.map(
            (seccion) => (
              <div
                key={
                  seccion.nombre
                }
                className="mb-6"
              >

                <p
                  className="mb-2 px-3 text-[9px] font-bold tracking-[0.16em]"
                  style={{
                    color: '#737A83',
                  }}
                >
                  {seccion.nombre}
                </p>

                <nav className="space-y-1">

                  {seccion.items.map(
                    (item) => {
                      const Icono =
                        item.icono;

                      const activo =
                        vistaActual ===
                        item.id;

                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() =>
                            seleccionarVista(
                              item.id,
                            )
                          }
                          className="group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[13px] font-medium transition-all"
                          style={
                            activo
                              ? {
                                  backgroundColor:
                                    VINO,
                                  color:
                                    '#FFFFFF',
                                  boxShadow:
                                    '0 5px 12px rgba(80,80,80,0.20)',
                                }
                              : {
                                  color:
                                    TEXTO,
                                }
                          }
                        >

                          <Icono
                            size={17}
                            strokeWidth={1.9}
                            style={{
                              color: activo
                                ? '#FFFFFF'
                                : ICONO,
                            }}
                          />

                          <span className="truncate">
                            {
                              item.nombre
                            }
                          </span>

                        </button>
                      );
                    },
                  )}

                </nav>

              </div>
            ),
          )}

        </div>

        {/* USUARIO INFERIOR */}

        <div
          className="p-3"
          style={{
            borderTop:
              `1px solid ${SIDEBAR_BORDE}`,
          }}
        >

          <div
            className="mb-2 flex items-center gap-3 rounded-xl p-3"
            style={{
              backgroundColor:
                '#DDE0E3',
            }}
          >

            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
              style={{
                backgroundColor:
                  VINO,
              }}
            >
              {obtenerIniciales(
                usuarioActual?.nombre ??
                  '',
              )}
            </div>

            <div className="min-w-0">

              <p
                className="truncate text-xs font-bold"
                style={{
                  color:
                    NEGRO,
                }}
              >
                {
                  usuarioActual?.nombre
                }
              </p>

              <p
                className="mt-0.5 text-[10px] uppercase"
                style={{
                  color:
                    GRIS,
                }}
              >
                {rolActual}
              </p>

            </div>

          </div>

          <button
            type="button"
            onClick={
              cerrarSesion
            }
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition"
            style={{
              color:
                '#4B5563',
            }}
          >

            <LogOut
              size={16}
              style={{
                color:
                  '#555E68',
              }}
            />

            Cerrar sesión

          </button>

        </div>

      </aside>

      {/* CONTENIDO */}

      <main
        className="ml-[230px] min-h-screen"
        style={{
          backgroundColor:
            FONDO,
        }}
      >

        {/* HEADER */}

        <header
          className="sticky top-0 z-30 flex h-[74px] items-center justify-between px-6"
          style={{
            backgroundColor:
              BLANCO,
            borderBottom:
              '1px solid #E5E5E2',
          }}
        >

          {/* BUSCADOR */}

          <div className="relative w-full max-w-[440px]">

            <div
              className="flex h-10 items-center rounded-xl border px-3"
              style={{
                backgroundColor:
                  '#F5F5F4',
                borderColor:
                  '#E1E2E3',
              }}
            >

              <Search
                size={17}
                style={{
                  color:
                    '#9CA3AF',
                }}
              />

              <input
                type="text"
                value={busqueda}
                onChange={(e) =>
                  setBusqueda(
                    e.target.value,
                  )
                }
                placeholder="Buscar módulos y registros..."
                className="ml-2 w-full bg-transparent text-sm outline-none"
                style={{
                  color:
                    NEGRO,
                }}
              />

            </div>

            {busqueda &&
              resultadosBusqueda.length >
                0 && (
                <div
                  className="absolute left-0 right-0 top-12 z-50 overflow-hidden rounded-xl border bg-white p-1.5 shadow-xl"
                  style={{
                    borderColor:
                      '#E5E5E2',
                  }}
                >

                  {resultadosBusqueda.map(
                    (item) => {
                      const Icono =
                        item.icono;

                      return (
                        <button
                          key={
                            item.id
                          }
                          type="button"
                          onClick={() =>
                            seleccionarVista(
                              item.id,
                            )
                          }
                          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm hover:bg-[#EEEEEE]"
                          style={{
                            color:
                              TEXTO,
                          }}
                        >

                          <Icono
                            size={16}
                            style={{
                              color:
                                VINO,
                            }}
                          />

                          {
                            item.nombre
                          }

                        </button>
                      );
                    },
                  )}

                </div>
              )}

            {busqueda &&
              resultadosBusqueda.length ===
                0 && (
                <div
                  className="absolute left-0 right-0 top-12 z-50 rounded-xl border bg-white p-4 text-center text-sm shadow-xl"
                  style={{
                    borderColor:
                      '#E5E5E2',
                    color:
                      '#9CA3AF',
                  }}
                >
                  No se encontraron módulos.
                </div>
              )}

          </div>

          {/* DERECHA */}

          <div className="ml-6 flex items-center gap-4">

            {/* NOTIFICACIONES */}

            <div className="relative">

              <button
                type="button"
                onClick={() =>
                  setNotificacionesAbiertas(
                    !notificacionesAbiertas,
                  )
                }
                className="relative flex h-10 w-10 items-center justify-center rounded-xl"
                style={{
                  color:
                    '#6B7280',
                }}
              >

                <Bell size={18} />

                <span
                  className="absolute right-2.5 top-2 h-1.5 w-1.5 rounded-full"
                  style={{
                    backgroundColor:
                      VINO,
                  }}
                />

              </button>

              {notificacionesAbiertas && (
                <div
                  className="absolute right-0 top-12 z-50 w-72 rounded-xl border bg-white p-4 shadow-xl"
                  style={{
                    borderColor:
                      '#E5E5E2',
                  }}
                >

                  <div className="mb-3 flex items-center justify-between">

                    <p
                      className="text-sm font-bold"
                      style={{
                        color:
                          NEGRO,
                      }}
                    >
                      Notificaciones
                    </p>

                    <span
                      className="rounded-full px-2 py-1 text-[10px] font-semibold"
                      style={{
                        backgroundColor:
                          VINO_SUAVE,
                        color:
                          VINO,
                      }}
                    >
                      Sistema
                    </span>

                  </div>

                  <div
                    className="rounded-xl p-3"
                    style={{
                      backgroundColor:
                        '#F5F5F4',
                    }}
                  >

                    <div className="flex gap-3">

                      <div
                        className="rounded-lg p-2"
                        style={{
                          backgroundColor:
                            VINO_SUAVE,
                          color:
                            VINO,
                        }}
                      >
                        <Activity
                          size={15}
                        />
                      </div>

                      <div>

                        <p
                          className="text-xs font-semibold"
                          style={{
                            color:
                              TEXTO,
                          }}
                        >
                          Sistema activo
                        </p>

                        <p
                          className="mt-1 text-[11px]"
                          style={{
                            color:
                              '#9CA3AF',
                          }}
                        >
                          {EMPRESA_NOMBRE} está funcionando correctamente.
                        </p>

                      </div>

                    </div>

                  </div>

                </div>
              )}

            </div>

            {/* SEPARADOR */}

            <div
              className="h-8 w-px"
              style={{
                backgroundColor:
                  '#E5E5E2',
              }}
            />

            {/* PERFIL */}

            <div className="relative">

              <button
                type="button"
                onClick={() =>
                  setPerfilAbierto(
                    !perfilAbierto,
                  )
                }
                className="flex items-center gap-3 rounded-xl px-2 py-1.5"
              >

                <div className="text-right">

                  <p
                    className="text-xs font-semibold"
                    style={{
                      color:
                        NEGRO,
                    }}
                  >
                    {
                      usuarioActual?.nombre
                    }
                  </p>

                  <p
                    className="text-[10px]"
                    style={{
                      color:
                        '#9CA3AF',
                    }}
                  >
                    {rolActual}
                  </p>

                </div>

                <div
                  className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-white"
                  style={{
                    backgroundColor:
                      VINO,
                  }}
                >
                  {obtenerIniciales(
                    usuarioActual?.nombre ??
                      '',
                  )}
                </div>

                <ChevronDown
                  size={14}
                  style={{
                    color:
                      '#9CA3AF',
                  }}
                />

              </button>

              {perfilAbierto && (
                <div
                  className="absolute right-0 top-12 z-50 w-56 rounded-xl border bg-white p-2 shadow-xl"
                  style={{
                    borderColor:
                      '#E5E5E2',
                  }}
                >

                  <div
                    className="border-b px-3 py-3"
                    style={{
                      borderColor:
                        '#F0F0EE',
                    }}
                  >

                    <p
                      className="text-sm font-semibold"
                      style={{
                        color:
                          NEGRO,
                      }}
                    >
                      {
                        usuarioActual?.nombre
                      }
                    </p>

                    <p
                      className="mt-1 text-xs"
                      style={{
                        color:
                          '#9CA3AF',
                      }}
                    >
                      DNI:{' '}
                      {
                        usuarioActual?.dni
                      }
                    </p>

                    <p
                      className="mt-1 text-xs font-medium"
                      style={{
                        color:
                          VINO,
                      }}
                    >
                      {rolActual}
                    </p>

                  </div>

                  <button
                    type="button"
                    onClick={
                      cerrarSesion
                    }
                    className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm hover:bg-[#EEEEEE]"
                    style={{
                      color:
                        TEXTO,
                    }}
                  >

                    <LogOut
                      size={16}
                      style={{
                        color:
                          VINO,
                      }}
                    />

                    Cerrar sesión

                  </button>

                </div>
              )}

            </div>

          </div>

        </header>

        {/* PÁGINAS */}

        <div
          className="min-h-[calc(100vh-74px)]"
          style={{
            backgroundColor:
              FONDO,
          }}
        >

          {vistaActual ===
            'dashboard' && (
            <Dashboard />
          )}

          {vistaActual ===
            'empresa' && (
            <div className="p-6 lg:p-8">
              <Empresa />
            </div>
          )}

          {vistaActual ===
            'sucursales' && (
            <div className="p-6 lg:p-8">
              <Sucursales />
            </div>
          )}

          {vistaActual ===
            'productos' && (
            <div className="p-6 lg:p-8">
              <Productos />
            </div>
          )}

          {vistaActual ===
            'ventas' && (
            <div className="p-6 lg:p-8">
              <Ventas />
            </div>
          )}

          {vistaActual ===
            'inventario' && (
            <div className="p-6 lg:p-8">
              <Inventario />
            </div>
          )}

          {vistaActual ===
            'metas' && (
            <div className="p-6 lg:p-8">
              <Metas />
            </div>
          )}

          {vistaActual ===
            'analisis' && (
            <div className="p-6 lg:p-8">
              <AnalisisMatematico />
            </div>
          )}

          {vistaActual ===
            'historial' && (
            <div className="p-6 lg:p-8">
              <Historial />
            </div>
          )}

          {vistaActual ===
            'reportes' && (
            <div className="p-6 lg:p-8">
              <Reportes />
            </div>
          )}

          {vistaActual ===
            'usuarios' && (
            <div className="p-6 lg:p-8">
              <Usuarios />
            </div>
          )}

          {vistaActual ===
            'configuracion' && (
            <div className="p-6 lg:p-8">
              <Configuracion />
            </div>
          )}

        </div>

      </main>

    </div>
  );
}
