import { useEffect, useState } from 'react';
import {
  Building2,
  Plus,
  RefreshCw,
  X,
  CheckCircle2,
  Ban,
} from 'lucide-react';
import API from '../services/api';

interface Empresa {
  id: number;
  nombre: string;
  ruc: string;
  direccion: string;
  estado: string;
}

/* =========================================================
   IDENTIDAD MATAS PERU EIRL
========================================================= */

const EMPRESA_NOMBRE = 'MATAS PERU EIRL';
const EMPRESA_GERENTE = 'GERARDO GARCIA MATAS';
const EMPRESA_RUBRO =
  'Electricidad y Soluciones Integrales';

/* =========================================================
   PALETA ACTUAL
   Se mantiene por ahora.
   El cambio a plomo/blanco/negro será en el siguiente paso.
========================================================= */

const VINO = '#775b66';
const VINO_OSCURO = '#6B4652';
const VINO_SUAVE = '#F8E9EE';
const GRIS_FONDO = '#F3F3F1';
const GRIS = '#6B7280';
const NEGRO = '#111111';

export default function Empresa() {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [cargando, setCargando] = useState(false);
  const [modalAbierto, setModalAbierto] = useState(false);

  const [nombre, setNombre] =
    useState(EMPRESA_NOMBRE);

  const [ruc, setRuc] = useState('');
  const [direccion, setDireccion] = useState('');
  const [estado, setEstado] =
    useState('Activo');

  const [mensaje, setMensaje] =
    useState('');

  const [error, setError] =
    useState('');

  /* =======================================================
     CARGAR EMPRESAS
  ======================================================= */

  const cargarEmpresas = async () => {
    setCargando(true);
    setError('');

    try {
      const respuesta = await fetch(
        `${API}/empresas`
      );

      if (!respuesta.ok) {
        throw new Error(
          'No se pudieron cargar las empresas'
        );
      }

      const datos =
        await respuesta.json();

      setEmpresas(
        Array.isArray(datos)
          ? datos
          : Array.isArray(
                datos.empresas
              )
            ? datos.empresas
            : []
      );
    } catch (err) {
      console.error(err);

      setError(
        'No se pudo conectar con el backend.'
      );
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarEmpresas();
  }, []);

  /* =======================================================
     LIMPIAR FORMULARIO
  ======================================================= */

  const limpiarFormulario = () => {
    setNombre(EMPRESA_NOMBRE);
    setRuc('');
    setDireccion('');
    setEstado('Activo');
  };

  /* =======================================================
     ABRIR MODAL
  ======================================================= */

  const abrirModal = () => {
    limpiarFormulario();
    setMensaje('');
    setError('');
    setModalAbierto(true);
  };

  /* =======================================================
     CERRAR MODAL
  ======================================================= */

  const cerrarModal = () => {
    setModalAbierto(false);
    limpiarFormulario();
  };

  /* =======================================================
     GUARDAR EMPRESA
  ======================================================= */

  const guardarEmpresa = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setMensaje('');
    setError('');

    if (!nombre.trim()) {
      setError(
        'Ingresa el nombre de la empresa.'
      );
      return;
    }

    if (!ruc.trim()) {
      setError(
        'Ingresa el RUC de la empresa.'
      );
      return;
    }

    if (!direccion.trim()) {
      setError(
        'Ingresa la dirección de la empresa.'
      );
      return;
    }

    try {
      const respuesta = await fetch(
        `${API}/empresas`,
        {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify({
            nombre: nombre.trim(),
            ruc: ruc.trim(),
            direccion:
              direccion.trim(),
            estado,
          }),
        }
      );

      const datos =
        await respuesta.json();

      if (!respuesta.ok) {
        const detalle =
          typeof datos.detail ===
          'string'
            ? datos.detail
            : JSON.stringify(
                datos.detail
              );

        throw new Error(
          detalle ||
            'No se pudo registrar la empresa'
        );
      }

      setMensaje(
        `${EMPRESA_NOMBRE} registrada correctamente.`
      );

      cerrarModal();

      await cargarEmpresas();
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo registrar la empresa.'
      );
    }
  };

  /* =======================================================
     ESTADÍSTICAS
  ======================================================= */

  const empresasActivas =
    empresas.filter(
      (empresa) =>
        empresa.estado
          ?.toLowerCase() ===
        'activo'
    ).length;

  const empresasInactivas =
    empresas.filter(
      (empresa) =>
        empresa.estado
          ?.toLowerCase() !==
        'activo'
    ).length;

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div
      className="min-h-full"
      style={{
        backgroundColor:
          GRIS_FONDO,
      }}
    >

      <div className="mx-auto max-w-[1500px] space-y-6 p-5 lg:p-7">

        {/* =================================================
            ENCABEZADO
        ================================================= */}

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

          <div className="flex items-center gap-3">

            <div
              className="flex h-12 w-12 items-center justify-center rounded-xl"
              style={{
                backgroundColor:
                  VINO_SUAVE,
                color:
                  VINO_OSCURO,
              }}
            >
              <Building2 size={24} />
            </div>

            <div>

              <p
                className="text-[11px] font-semibold uppercase tracking-[0.18em]"
                style={{
                  color: VINO,
                }}
              >
                {EMPRESA_RUBRO}
              </p>

              <h1
                className="mt-1 text-2xl font-bold tracking-tight"
                style={{
                  color: NEGRO,
                }}
              >
                {EMPRESA_NOMBRE}
              </h1>

              <p
                className="mt-1 text-sm"
                style={{
                  color: GRIS,
                }}
              >
                Gestión de la información empresarial
              </p>

              <p
                className="mt-1 text-xs font-medium"
                style={{
                  color: GRIS,
                }}
              >
                Gerente: {EMPRESA_GERENTE}
              </p>

            </div>

          </div>

          <div className="flex flex-wrap gap-2">

            {/* ACTUALIZAR */}

            <button
              type="button"
              onClick={
                cargarEmpresas
              }
              disabled={cargando}
              className="inline-flex items-center gap-2 rounded-xl border bg-white px-4 py-2.5 text-sm font-medium shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              style={{
                borderColor:
                  '#E5E7EB',
                color: NEGRO,
              }}
            >

              <RefreshCw
                className={
                  cargando
                    ? 'h-4 w-4 animate-spin'
                    : 'h-4 w-4'
                }
              />

              Actualizar

            </button>

            {/* NUEVA EMPRESA */}

            <button
              type="button"
              onClick={
                abrirModal
              }
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
              style={{
                backgroundColor:
                  VINO_OSCURO,
              }}
            >

              <Plus className="h-4 w-4" />

              Nueva empresa

            </button>

          </div>

        </div>

        {/* =================================================
            MENSAJE
        ================================================= */}

        {mensaje && (
          <div
            className="flex items-center gap-3 rounded-xl border px-4 py-3 text-sm"
            style={{
              borderColor:
                '#D8C3CB',
              backgroundColor:
                VINO_SUAVE,
              color:
                VINO_OSCURO,
            }}
          >

            <CheckCircle2 className="h-5 w-5 shrink-0" />

            {mensaje}

          </div>
        )}

        {/* =================================================
            ERROR
        ================================================= */}

        {error &&
          !modalAbierto && (
            <div
              className="flex items-center justify-between gap-4 rounded-xl border px-4 py-3 text-sm"
              style={{
                borderColor:
                  '#FECACA',
                backgroundColor:
                  '#FEF2F2',
                color:
                  '#B91C1C',
              }}
            >

              <span>
                {error}
              </span>

              <button
                type="button"
                onClick={() =>
                  setError('')
                }
                className="transition hover:opacity-70"
              >
                <X size={18} />
              </button>

            </div>
          )}

        {/* =================================================
            KPI
        ================================================= */}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

          {/* REGISTRADAS */}

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md">

            <div className="flex items-start justify-between">

              <div>

                <p
                  className="text-xs font-medium uppercase tracking-wide"
                  style={{
                    color: GRIS,
                  }}
                >
                  Empresas registradas
                </p>

                <p
                  className="mt-3 text-3xl font-bold"
                  style={{
                    color: NEGRO,
                  }}
                >
                  {empresas.length}
                </p>

              </div>

              <div
                className="rounded-xl p-2.5"
                style={{
                  backgroundColor:
                    VINO_SUAVE,
                  color:
                    VINO_OSCURO,
                }}
              >
                <Building2 className="h-5 w-5" />
              </div>

            </div>

            <p
              className="mt-3 text-xs"
              style={{
                color: GRIS,
              }}
            >
              Total de empresas en el sistema
            </p>

          </div>

          {/* ACTIVAS */}

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md">

            <div className="flex items-start justify-between">

              <div>

                <p
                  className="text-xs font-medium uppercase tracking-wide"
                  style={{
                    color: GRIS,
                  }}
                >
                  Empresas activas
                </p>

                <p
                  className="mt-3 text-3xl font-bold"
                  style={{
                    color:
                      VINO_OSCURO,
                  }}
                >
                  {empresasActivas}
                </p>

              </div>

              <div
                className="rounded-xl p-2.5"
                style={{
                  backgroundColor:
                    VINO_SUAVE,
                  color:
                    VINO_OSCURO,
                }}
              >
                <CheckCircle2 className="h-5 w-5" />
              </div>

            </div>

            <p
              className="mt-3 text-xs"
              style={{
                color: GRIS,
              }}
            >
              Empresas actualmente activas
            </p>

          </div>

          {/* INACTIVAS */}

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md">

            <div className="flex items-start justify-between">

              <div>

                <p
                  className="text-xs font-medium uppercase tracking-wide"
                  style={{
                    color: GRIS,
                  }}
                >
                  Empresas inactivas
                </p>

                <p
                  className="mt-3 text-3xl font-bold"
                  style={{
                    color: GRIS,
                  }}
                >
                  {empresasInactivas}
                </p>

              </div>

              <div
                className="rounded-xl p-2.5"
                style={{
                  backgroundColor:
                    '#F3F4F6',
                  color: GRIS,
                }}
              >
                <Ban className="h-5 w-5" />
              </div>

            </div>

            <p
              className="mt-3 text-xs"
              style={{
                color: GRIS,
              }}
            >
              Empresas desactivadas
            </p>

          </div>

        </div>

        {/* =================================================
            TABLA
        ================================================= */}

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5">

            <div>

              <h3
                className="font-semibold"
                style={{
                  color: NEGRO,
                }}
              >
                Empresas registradas
              </h3>

              <p
                className="mt-1 text-xs"
                style={{
                  color: GRIS,
                }}
              >
                Información empresarial registrada
                en {EMPRESA_NOMBRE}
              </p>

            </div>

            <div
              className="rounded-lg px-3 py-1.5 text-xs font-semibold"
              style={{
                backgroundColor:
                  VINO_SUAVE,
                color:
                  VINO_OSCURO,
              }}
            >
              {empresas.length} registros
            </div>

          </div>

          {empresas.length ===
          0 ? (

            <div className="px-6 py-16 text-center">

              <div
                className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl"
                style={{
                  backgroundColor:
                    VINO_SUAVE,
                  color:
                    VINO_OSCURO,
                }}
              >
                <Building2 className="h-7 w-7" />
              </div>

              <p
                className="mt-4 font-medium"
                style={{
                  color: NEGRO,
                }}
              >
                No hay empresas registradas.
              </p>

              <p
                className="mt-1 text-sm"
                style={{
                  color: GRIS,
                }}
              >
                Registra la empresa para comenzar.
              </p>

              <button
                type="button"
                onClick={
                  abrirModal
                }
                className="mt-5 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
                style={{
                  backgroundColor:
                    VINO_OSCURO,
                }}
              >
                Registrar empresa
              </button>

            </div>

          ) : (

            <div className="overflow-x-auto">

              <table className="w-full text-left">

                <thead
                  style={{
                    backgroundColor:
                      '#FAFAF9',
                    color: GRIS,
                  }}
                >

                  <tr>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide">
                      ID
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide">
                      Empresa
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide">
                      RUC
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide">
                      Dirección
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide">
                      Estado
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {empresas.map(
                    (empresa) => (

                      <tr
                        key={
                          empresa.id
                        }
                        className="border-t border-gray-100 transition hover:bg-gray-50"
                      >

                        <td
                          className="px-6 py-4 text-sm"
                          style={{
                            color: GRIS,
                          }}
                        >
                          #{empresa.id}
                        </td>

                        <td className="px-6 py-4">

                          <div className="flex items-center gap-3">

                            <div
                              className="flex h-9 w-9 items-center justify-center rounded-lg"
                              style={{
                                backgroundColor:
                                  VINO_SUAVE,
                                color:
                                  VINO_OSCURO,
                              }}
                            >
                              <Building2 className="h-4 w-4" />
                            </div>

                            <div>

                              <p
                                className="font-semibold"
                                style={{
                                  color:
                                    NEGRO,
                                }}
                              >
                                {
                                  empresa.nombre
                                }
                              </p>

                              <p
                                className="mt-0.5 text-xs"
                                style={{
                                  color:
                                    GRIS,
                                }}
                              >
                                Empresa de electricidad y soluciones integrales
                              </p>

                            </div>

                          </div>

                        </td>

                        <td
                          className="px-6 py-4 text-sm"
                          style={{
                            color: GRIS,
                          }}
                        >
                          {
                            empresa.ruc
                          }
                        </td>

                        <td
                          className="px-6 py-4 text-sm"
                          style={{
                            color: GRIS,
                          }}
                        >
                          {
                            empresa.direccion
                          }
                        </td>

                        <td className="px-6 py-4">

                          <span
                            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
                            style={
                              empresa.estado
                                ?.toLowerCase() ===
                              'activo'
                                ? {
                                    backgroundColor:
                                      VINO_SUAVE,
                                    color:
                                      VINO_OSCURO,
                                  }
                                : {
                                    backgroundColor:
                                      '#F3F4F6',
                                    color:
                                      GRIS,
                                  }
                            }
                          >

                            <span
                              className="h-1.5 w-1.5 rounded-full"
                              style={{
                                backgroundColor:
                                  empresa.estado
                                    ?.toLowerCase() ===
                                  'activo'
                                    ? VINO
                                    : GRIS,
                              }}
                            />

                            {
                              empresa.estado
                            }

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

      </div>

      {/* =================================================
          MODAL
      ================================================= */}

      {modalAbierto && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]">

          <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">

            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5">

              <div className="flex items-center gap-3">

                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{
                    backgroundColor:
                      VINO_SUAVE,
                    color:
                      VINO_OSCURO,
                  }}
                >
                  <Building2 className="h-5 w-5" />
                </div>

                <div>

                  <h3
                    className="text-lg font-semibold"
                    style={{
                      color: NEGRO,
                    }}
                  >
                    Registrar empresa
                  </h3>

                  <p
                    className="text-sm"
                    style={{
                      color: GRIS,
                    }}
                  >
                    {EMPRESA_NOMBRE}
                  </p>

                </div>

              </div>

              <button
                type="button"
                onClick={
                  cerrarModal
                }
                className="rounded-xl p-2 transition hover:bg-gray-100"
                style={{
                  color: GRIS,
                }}
              >
                <X className="h-5 w-5" />
              </button>

            </div>

            <form
              onSubmit={
                guardarEmpresa
              }
              className="space-y-5 p-6"
            >

              {/* NOMBRE */}

              <div>

                <label
                  className="mb-2 block text-sm font-medium"
                  style={{
                    color: NEGRO,
                  }}
                >
                  Nombre de la empresa
                </label>

                <input
                  type="text"
                  value={nombre}
                  onChange={(e) =>
                    setNombre(
                      e.target.value
                    )
                  }
                  placeholder={EMPRESA_NOMBRE}
                  className="w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none transition placeholder:text-gray-400"
                  style={{
                    borderColor:
                      '#D1D5DB',
                    color: NEGRO,
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor =
                      VINO;

                    e.currentTarget.style.boxShadow =
                      `0 0 0 3px ${VINO_SUAVE}`;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor =
                      '#D1D5DB';

                    e.currentTarget.style.boxShadow =
                      'none';
                  }}
                  required
                />

              </div>

              {/* RUC */}

              <div>

                <label
                  className="mb-2 block text-sm font-medium"
                  style={{
                    color: NEGRO,
                  }}
                >
                  RUC
                </label>

                <input
                  type="text"
                  value={ruc}
                  onChange={(e) =>
                    setRuc(
                      e.target.value
                    )
                  }
                  placeholder="Ingresa el RUC de MATAS PERU EIRL"
                  className="w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none transition placeholder:text-gray-400"
                  style={{
                    borderColor:
                      '#D1D5DB',
                    color: NEGRO,
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor =
                      VINO;

                    e.currentTarget.style.boxShadow =
                      `0 0 0 3px ${VINO_SUAVE}`;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor =
                      '#D1D5DB';

                    e.currentTarget.style.boxShadow =
                      'none';
                  }}
                  required
                />

              </div>

              {/* DIRECCIÓN */}

              <div>

                <label
                  className="mb-2 block text-sm font-medium"
                  style={{
                    color: NEGRO,
                  }}
                >
                  Dirección
                </label>

                <input
                  type="text"
                  value={direccion}
                  onChange={(e) =>
                    setDireccion(
                      e.target.value
                    )
                  }
                  placeholder="Dirección de MATAS PERU EIRL"
                  className="w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none transition placeholder:text-gray-400"
                  style={{
                    borderColor:
                      '#D1D5DB',
                    color: NEGRO,
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor =
                      VINO;

                    e.currentTarget.style.boxShadow =
                      `0 0 0 3px ${VINO_SUAVE}`;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor =
                      '#D1D5DB';

                    e.currentTarget.style.boxShadow =
                      'none';
                  }}
                  required
                />

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
                  className="w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none transition"
                  style={{
                    borderColor:
                      '#D1D5DB',
                    color: NEGRO,
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor =
                      VINO;

                    e.currentTarget.style.boxShadow =
                      `0 0 0 3px ${VINO_SUAVE}`;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor =
                      '#D1D5DB';

                    e.currentTarget.style.boxShadow =
                      'none';
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

              {/* INFORMACIÓN DEL GERENTE */}

              <div
                className="rounded-xl border px-4 py-3"
                style={{
                  borderColor:
                    '#E5E7EB',
                  backgroundColor:
                    '#F9FAFB',
                }}
              >

                <p
                  className="text-xs font-semibold uppercase tracking-wide"
                  style={{
                    color: GRIS,
                  }}
                >
                  Información empresarial
                </p>

                <p
                  className="mt-2 text-sm font-semibold"
                  style={{
                    color: NEGRO,
                  }}
                >
                  Gerente: {EMPRESA_GERENTE}
                </p>

                <p
                  className="mt-1 text-xs"
                  style={{
                    color: GRIS,
                  }}
                >
                  {EMPRESA_RUBRO}
                </p>

              </div>

              {/* ERROR */}

              {error && (

                <div
                  className="rounded-xl border px-4 py-3 text-sm"
                  style={{
                    borderColor:
                      '#FECACA',
                    backgroundColor:
                      '#FEF2F2',
                    color:
                      '#B91C1C',
                  }}
                >
                  {error}
                </div>

              )}

              {/* BOTONES */}

              <div className="flex justify-end gap-3 border-t border-gray-200 pt-5">

                <button
                  type="button"
                  onClick={
                    cerrarModal
                  }
                  className="rounded-xl border bg-white px-5 py-2.5 text-sm font-medium transition hover:bg-gray-50"
                  style={{
                    borderColor:
                      '#D1D5DB',
                    color: NEGRO,
                  }}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
                  style={{
                    backgroundColor:
                      VINO_OSCURO,
                  }}
                >
                  Guardar empresa
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}


