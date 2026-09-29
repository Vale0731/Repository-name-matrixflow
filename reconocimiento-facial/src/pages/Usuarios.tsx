import { useEffect, useState } from 'react';
import API from '../services/api';
import {
  Users,
  Plus,
  RefreshCw,
  Search,
  X,
  UserRound,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';

/* =========================================================
   PALETA MATRIXFLOW
========================================================= */

const VINO = '#775b66';
const VINO_OSCURO = '#6B4652';
const VINO_SUAVE = '#F8E9EE';
const GRIS_FONDO = '#F3F3F1';
const GRIS = '#6B7280';
const NEGRO = '#111111';

/* =========================================================
   TIPOS
========================================================= */

interface Usuario {
  id: number;
  dni: string;
  nombre: string;
  rol: string;
  estado: string;
}

const ROLES = [
  'Administrador',
  'Analista',
  'Consulta',
];

/* =========================================================
   COMPONENTE
========================================================= */

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [modal, setModal] = useState(false);

  const [cargando, setCargando] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');

  const [dni, setDni] = useState('');
  const [nombre, setNombre] = useState('');
  const [rol, setRol] = useState('Consulta');
  const [estado, setEstado] = useState('Activo');

  /* =======================================================
     CARGAR USUARIOS
  ======================================================= */

  const cargarUsuarios = async () => {
    setCargando(true);
    setError('');

    try {
      const respuesta = await fetch(
        `${API}/usuarios`
      );

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          typeof datos.detail === 'string'
            ? datos.detail
            : 'No se pudieron cargar los usuarios'
        );
      }

      setUsuarios(
        Array.isArray(datos)
          ? datos
          : datos.usuarios ?? []
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo conectar con el backend'
      );
    } finally {
      setCargando(false);
    }
  };

  /* =======================================================
     CARGA INICIAL
  ======================================================= */

  useEffect(() => {
    cargarUsuarios();
  }, []);

  /* =======================================================
     GUARDAR USUARIO
  ======================================================= */

  const guardarUsuario = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setError('');
    setMensaje('');

    if (!dni.trim() || !nombre.trim()) {
      setError(
        'DNI y nombre son obligatorios'
      );
      return;
    }

    setGuardando(true);

    try {
      const respuesta = await fetch(
        `${API}/usuarios`,
        {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify({
            dni: dni.trim(),
            nombre: nombre.trim(),
            rol,
            estado,
          }),
        }
      );

      const datos =
        await respuesta.json();

      if (!respuesta.ok) {
        const detalle =
          typeof datos.detail === 'string'
            ? datos.detail
            : JSON.stringify(
                datos.detail
              );

        throw new Error(
          detalle ||
            'No se pudo registrar el usuario'
        );
      }

      setMensaje(
        'Usuario registrado correctamente'
      );

      setDni('');
      setNombre('');
      setRol('Consulta');
      setEstado('Activo');

      setModal(false);

      await cargarUsuarios();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo registrar el usuario'
      );
    } finally {
      setGuardando(false);
    }
  };

  /* =======================================================
     FILTRO
  ======================================================= */

  const usuariosFiltrados =
    usuarios.filter((usuario) => {
      const texto =
        busqueda
          .trim()
          .toLowerCase();

      if (!texto) {
        return true;
      }

      return (
        usuario.dni
          .toLowerCase()
          .includes(texto) ||
        usuario.nombre
          .toLowerCase()
          .includes(texto) ||
        usuario.rol
          .toLowerCase()
          .includes(texto) ||
        usuario.estado
          .toLowerCase()
          .includes(texto)
      );
    });

  /* =======================================================
     KPIs
  ======================================================= */

  const usuariosActivos =
    usuarios.filter(
      (usuario) =>
        usuario.estado
          .toLowerCase() ===
        'activo'
    ).length;

  const administradores =
    usuarios.filter(
      (usuario) =>
        usuario.rol ===
        'Administrador'
    ).length;

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div
      className="min-h-full space-y-6"
      style={{
        backgroundColor:
          GRIS_FONDO,
      }}
    >

      {/* ===================================================
          ENCABEZADO
      =================================================== */}

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

        <div className="flex items-center gap-3">

          <div
            className="rounded-xl p-3"
            style={{
              backgroundColor:
                VINO_SUAVE,
              color: VINO,
            }}
          >
            <Users size={24} />
          </div>

          <div>

            <h2
              className="text-2xl font-bold"
              style={{
                color: NEGRO,
              }}
            >
              Usuarios
            </h2>

            <p
              className="text-sm"
              style={{
                color: GRIS,
              }}
            >
              Administración de usuarios y roles del sistema.
            </p>

          </div>

        </div>

        <div className="flex gap-2">

          <button
            type="button"
            onClick={cargarUsuarios}
            disabled={cargando}
            className="flex items-center gap-2 rounded-xl border bg-white px-4 py-3 text-sm font-medium transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
            style={{
              borderColor:
                '#E5E5E3',
              color: NEGRO,
            }}
          >

            <RefreshCw
              size={17}
              className={
                cargando
                  ? 'animate-spin'
                  : ''
              }
            />

            Actualizar

          </button>

          <button
            type="button"
            onClick={() => {
              setError('');
              setMensaje('');
              setDni('');
              setNombre('');
              setRol('Consulta');
              setEstado('Activo');
              setModal(true);
            }}
            className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-white transition hover:opacity-90"
            style={{
              backgroundColor:
                VINO,
              boxShadow:
                '0 8px 18px rgba(119,91,102,0.18)',
            }}
          >

            <Plus size={18} />

            Nuevo usuario

          </button>

        </div>

      </div>

      {/* ===================================================
          MENSAJE ÉXITO
      =================================================== */}

      {mensaje && (
        <div
          className="flex items-center gap-3 rounded-xl border p-4 text-sm"
          style={{
            borderColor:
              '#D8C5CC',
            backgroundColor:
              VINO_SUAVE,
            color: VINO_OSCURO,
          }}
        >

          <UserCheck size={18} />

          {mensaje}

        </div>
      )}

      {/* ===================================================
          ERROR
      =================================================== */}

      {error && !modal && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* ===================================================
          KPIs
      =================================================== */}

      <div className="grid gap-5 md:grid-cols-3">

        {/* USUARIOS */}

        <div
          className="rounded-2xl border bg-white p-5 shadow-sm"
          style={{
            borderColor:
              '#E5E5E3',
          }}
        >

          <div className="flex items-center justify-between">

            <div>

              <p
                className="text-sm"
                style={{
                  color: GRIS,
                }}
              >
                Usuarios registrados
              </p>

              <p
                className="mt-2 text-3xl font-bold"
                style={{
                  color: NEGRO,
                }}
              >
                {usuarios.length}
              </p>

            </div>

            <div
              className="rounded-xl p-3"
              style={{
                backgroundColor:
                  VINO_SUAVE,
                color: VINO,
              }}
            >
              <Users size={21} />
            </div>

          </div>

          <p
            className="mt-3 text-xs"
            style={{
              color: '#9CA3AF',
            }}
          >
            Total de usuarios del sistema
          </p>

        </div>

        {/* ACTIVOS */}

        <div
          className="rounded-2xl border bg-white p-5 shadow-sm"
          style={{
            borderColor:
              '#E5E5E3',
          }}
        >

          <div className="flex items-center justify-between">

            <div>

              <p
                className="text-sm"
                style={{
                  color: GRIS,
                }}
              >
                Usuarios activos
              </p>

              <p
                className="mt-2 text-3xl font-bold"
                style={{
                  color: NEGRO,
                }}
              >
                {usuariosActivos}
              </p>

            </div>

            <div
              className="rounded-xl p-3"
              style={{
                backgroundColor:
                  VINO_SUAVE,
                color: VINO,
              }}
            >
              <UserCheck size={21} />
            </div>

          </div>

          <p
            className="mt-3 text-xs"
            style={{
              color: '#9CA3AF',
            }}
          >
            Usuarios habilitados
          </p>

        </div>

        {/* ADMINISTRADORES */}

        <div
          className="rounded-2xl border bg-white p-5 shadow-sm"
          style={{
            borderColor:
              '#E5E5E3',
          }}
        >

          <div className="flex items-center justify-between">

            <div>

              <p
                className="text-sm"
                style={{
                  color: GRIS,
                }}
              >
                Administradores
              </p>

              <p
                className="mt-2 text-3xl font-bold"
                style={{
                  color: NEGRO,
                }}
              >
                {administradores}
              </p>

            </div>

            <div
              className="rounded-xl p-3"
              style={{
                backgroundColor:
                  VINO_SUAVE,
                color: VINO,
              }}
            >
              <ShieldCheck size={21} />
            </div>

          </div>

          <p
            className="mt-3 text-xs"
            style={{
              color: '#9CA3AF',
            }}
          >
            Usuarios con rol administrador
          </p>

        </div>

      </div>

      {/* ===================================================
          TABLA
      =================================================== */}

      <div
        className="rounded-2xl border bg-white shadow-sm"
        style={{
          borderColor:
            '#E5E5E3',
        }}
      >

        {/* CABECERA TABLA */}

        <div
          className="flex flex-col gap-4 border-b p-5 sm:flex-row sm:items-center sm:justify-between"
          style={{
            borderColor:
              '#EEEEEC',
          }}
        >

          <div>

            <h3
              className="font-semibold"
              style={{
                color: NEGRO,
              }}
            >
              Lista de usuarios
            </h3>

            <p
              className="mt-1 text-xs"
              style={{
                color: GRIS,
              }}
            >
              Usuarios registrados en el sistema.
            </p>

          </div>

          <div className="relative">

            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{
                color: '#9CA3AF',
              }}
            />

            <input
              value={busqueda}
              onChange={(e) =>
                setBusqueda(
                  e.target.value
                )
              }
              placeholder="Buscar usuario..."
              className="w-full rounded-xl border bg-[#F8F8F7] py-2.5 pl-10 pr-4 text-sm outline-none transition sm:w-72"
              style={{
                borderColor:
                  '#E5E5E3',
                color: NEGRO,
              }}
            />

          </div>

        </div>

        {/* CONTENIDO */}

        {usuariosFiltrados.length ===
        0 ? (

          <div className="p-12 text-center">

            <div
              className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl"
              style={{
                backgroundColor:
                  VINO_SUAVE,
                color: VINO,
              }}
            >
              <UserRound size={28} />
            </div>

            <p
              className="mt-4 font-medium"
              style={{
                color: NEGRO,
              }}
            >
              No hay usuarios registrados
            </p>

            <p
              className="mt-1 text-sm"
              style={{
                color: GRIS,
              }}
            >
              Registra un nuevo usuario para comenzar.
            </p>

          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full text-left">

              <thead>

                <tr
                  className="border-b"
                  style={{
                    borderColor:
                      '#EEEEEC',
                    backgroundColor:
                      '#FAFAF9',
                  }}
                >

                  <th
                    className="px-5 py-4 text-xs font-semibold uppercase tracking-wide"
                    style={{
                      color: GRIS,
                    }}
                  >
                    ID
                  </th>

                  <th
                    className="px-5 py-4 text-xs font-semibold uppercase tracking-wide"
                    style={{
                      color: GRIS,
                    }}
                  >
                    DNI
                  </th>

                  <th
                    className="px-5 py-4 text-xs font-semibold uppercase tracking-wide"
                    style={{
                      color: GRIS,
                    }}
                  >
                    Nombre
                  </th>

                  <th
                    className="px-5 py-4 text-xs font-semibold uppercase tracking-wide"
                    style={{
                      color: GRIS,
                    }}
                  >
                    Rol
                  </th>

                  <th
                    className="px-5 py-4 text-xs font-semibold uppercase tracking-wide"
                    style={{
                      color: GRIS,
                    }}
                  >
                    Estado
                  </th>

                </tr>

              </thead>

              <tbody>

                {usuariosFiltrados.map(
                  (usuario) => (

                    <tr
                      key={usuario.id}
                      className="border-b last:border-0 transition hover:bg-[#FCFAFB]"
                      style={{
                        borderColor:
                          '#F0F0EE',
                      }}
                    >

                      {/* ID */}

                      <td
                        className="px-5 py-4 text-sm font-semibold"
                        style={{
                          color: NEGRO,
                        }}
                      >
                        #{usuario.id}
                      </td>

                      {/* DNI */}

                      <td
                        className="px-5 py-4 text-sm"
                        style={{
                          color: GRIS,
                        }}
                      >
                        {usuario.dni}
                      </td>

                      {/* NOMBRE */}

                      <td className="px-5 py-4">

                        <div className="flex items-center gap-3">

                          <div
                            className="flex h-9 w-9 items-center justify-center rounded-lg"
                            style={{
                              backgroundColor:
                                VINO_SUAVE,
                              color: VINO,
                            }}
                          >
                            <UserRound
                              size={17}
                            />
                          </div>

                          <p
                            className="text-sm font-semibold"
                            style={{
                              color: NEGRO,
                            }}
                          >
                            {usuario.nombre}
                          </p>

                        </div>

                      </td>

                      {/* ROL */}

                      <td className="px-5 py-4">

                        <span
                          className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold"
                          style={
                            usuario.rol ===
                            'Administrador'
                              ? {
                                  backgroundColor:
                                    VINO_SUAVE,
                                  color:
                                    VINO_OSCURO,
                                }
                              : usuario.rol ===
                                  'Analista'
                                ? {
                                    backgroundColor:
                                      '#F1E8EC',
                                    color:
                                      VINO,
                                  }
                                : {
                                    backgroundColor:
                                      '#F3F3F1',
                                    color:
                                      GRIS,
                                  }
                          }
                        >
                          {usuario.rol}
                        </span>

                      </td>

                      {/* ESTADO */}

                      <td className="px-5 py-4">

                        <span
                          className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold"
                          style={
                            usuario.estado
                              .toLowerCase() ===
                            'activo'
                              ? {
                                  backgroundColor:
                                    VINO_SUAVE,
                                  color:
                                    VINO_OSCURO,
                                }
                              : {
                                  backgroundColor:
                                    '#F3F3F1',
                                  color:
                                    GRIS,
                                }
                          }
                        >

                          <span
                            className="h-1.5 w-1.5 rounded-full"
                            style={{
                              backgroundColor:
                                usuario.estado
                                  .toLowerCase() ===
                                'activo'
                                  ? VINO
                                  : GRIS,
                            }}
                          />

                          {usuario.estado}

                        </span>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>

      {/* ===================================================
          MODAL NUEVO USUARIO
      =================================================== */}

      {modal && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

          <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">

            {/* CABECERA */}

            <div
              className="flex items-center justify-between border-b p-5"
              style={{
                borderColor:
                  '#EEEEEC',
              }}
            >

              <div className="flex items-center gap-3">

                <div
                  className="rounded-xl p-2.5"
                  style={{
                    backgroundColor:
                      VINO_SUAVE,
                    color: VINO,
                  }}
                >
                  <UserRound size={20} />
                </div>

                <div>

                  <h3
                    className="text-lg font-semibold"
                    style={{
                      color: NEGRO,
                    }}
                  >
                    Registrar usuario
                  </h3>

                  <p
                    className="text-sm"
                    style={{
                      color: GRIS,
                    }}
                  >
                    Completa los datos del nuevo usuario.
                  </p>

                </div>

              </div>

              <button
                type="button"
                onClick={() => {
                  if (!guardando) {
                    setModal(false);
                  }
                }}
                className="rounded-lg p-2 transition hover:bg-gray-100"
                style={{
                  color: GRIS,
                }}
              >
                <X size={20} />
              </button>

            </div>

            {/* FORMULARIO */}

            <form
              onSubmit={guardarUsuario}
              className="space-y-5 p-5"
            >

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              {/* DNI */}

              <div>

                <label
                  className="mb-2 block text-sm font-medium"
                  style={{
                    color: NEGRO,
                  }}
                >
                  DNI
                </label>

                <input
                  value={dni}
                  onChange={(e) =>
                    setDni(
                      e.target.value
                    )
                  }
                  placeholder="Ejemplo: 12345678"
                  maxLength={8}
                  disabled={guardando}
                  className="w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none transition disabled:opacity-60"
                  style={{
                    borderColor:
                      '#D9D9D6',
                    color: NEGRO,
                  }}
                />

              </div>

              {/* NOMBRE */}

              <div>

                <label
                  className="mb-2 block text-sm font-medium"
                  style={{
                    color: NEGRO,
                  }}
                >
                  Nombre completo
                </label>

                <input
                  value={nombre}
                  onChange={(e) =>
                    setNombre(
                      e.target.value
                    )
                  }
                  placeholder="Nombre del usuario"
                  disabled={guardando}
                  className="w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none transition disabled:opacity-60"
                  style={{
                    borderColor:
                      '#D9D9D6',
                    color: NEGRO,
                  }}
                />

              </div>

              {/* ROL */}

              <div>

                <label
                  className="mb-2 block text-sm font-medium"
                  style={{
                    color: NEGRO,
                  }}
                >
                  Rol
                </label>

                <select
                  value={rol}
                  onChange={(e) =>
                    setRol(
                      e.target.value
                    )
                  }
                  disabled={guardando}
                  className="w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none transition disabled:opacity-60"
                  style={{
                    borderColor:
                      '#D9D9D6',
                    color: NEGRO,
                  }}
                >

                  {ROLES.map(
                    (rolDisponible) => (
                      <option
                        key={
                          rolDisponible
                        }
                        value={
                          rolDisponible
                        }
                      >
                        {rolDisponible}
                      </option>
                    )
                  )}

                </select>

              </div>

              {/* ESTADO */}

              <div>

                <label
                  className="mb-2 block text-sm font-medium"
                  style={{
                    color: NEGRO,
                  }}
                >
                  Estado
                </label>

                <select
                  value={estado}
                  onChange={(e) =>
                    setEstado(
                      e.target.value
                    )
                  }
                  disabled={guardando}
                  className="w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none transition disabled:opacity-60"
                  style={{
                    borderColor:
                      '#D9D9D6',
                    color: NEGRO,
                  }}
                >

                  <option value="Activo">
                    Activo
                  </option>

                  <option value="Inactivo">
                    Inactivo
                  </option>

                </select>

              </div>

              {/* INFORMACIÓN */}

              <div
                className="rounded-2xl p-4"
                style={{
                  backgroundColor:
                    VINO_SUAVE,
                }}
              >

                <div className="flex items-start gap-3">

                  <ShieldCheck
                    size={19}
                    style={{
                      color: VINO,
                    }}
                  />

                  <div>

                    <p
                      className="text-sm font-semibold"
                      style={{
                        color:
                          VINO_OSCURO,
                      }}
                    >
                      Acceso al sistema
                    </p>

                    <p
                      className="mt-1 text-xs leading-5"
                      style={{
                        color: GRIS,
                      }}
                    >
                      El rol asignado determina las
                      opciones disponibles para el usuario.
                    </p>

                  </div>

                </div>

              </div>

              {/* BOTONES */}

              <div className="flex justify-end gap-3 pt-2">

                <button
                  type="button"
                  onClick={() =>
                    setModal(false)
                  }
                  disabled={guardando}
                  className="rounded-xl border px-5 py-3 text-sm font-medium transition hover:bg-gray-50 disabled:opacity-60"
                  style={{
                    borderColor:
                      '#D9D9D6',
                    color: GRIS,
                  }}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={
                    guardando ||
                    !dni.trim() ||
                    !nombre.trim()
                  }
                  className="flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-60"
                  style={{
                    backgroundColor:
                      VINO,
                  }}
                >

                  {guardando ? (
                    <>
                      <RefreshCw
                        size={17}
                        className="animate-spin"
                      />

                      Guardando...
                    </>
                  ) : (
                    <>
                      <Plus size={17} />

                      Guardar usuario
                    </>
                  )}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}