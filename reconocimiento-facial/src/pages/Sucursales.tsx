import { useEffect, useState } from 'react';
import {
  Building2,
  Plus,
  RefreshCw,
  X,
  MapPin,
  CheckCircle2,
  Store,
} from 'lucide-react';

import API from '../services/api';

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

interface Sucursal {
  id: number;
  nombre: string;
  ciudad: string;
  direccion: string;
  estado: string;
}

/* =========================================================
   COMPONENTE
========================================================= */

export default function Sucursales() {
  const [sucursales, setSucursales] =
    useState<Sucursal[]>([]);

  const [cargando, setCargando] =
    useState(true);

  const [mostrarFormulario, setMostrarFormulario] =
    useState(false);

  const [nombre, setNombre] =
    useState('');

  const [ciudad, setCiudad] =
    useState('');

  const [direccion, setDireccion] =
    useState('');

  const [estado, setEstado] =
    useState('Activo');

  const [error, setError] =
    useState('');

  const [mensaje, setMensaje] =
    useState('');

  /* =========================================================
     CARGAR SUCURSALES
  ========================================================= */

  const cargarSucursales = async () => {
    try {
      setCargando(true);
      setError('');

      const respuesta = await fetch(
        `${API}/sucursales`
      );

      if (!respuesta.ok) {
        throw new Error(
          'No se pudieron obtener las sucursales.'
        );
      }

      const datos = await respuesta.json();

      setSucursales(
        Array.isArray(datos)
          ? datos
          : Array.isArray(datos?.sucursales)
          ? datos.sucursales
          : []
      );
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo conectar con el backend.'
      );
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarSucursales();
  }, []);

  /* =========================================================
     FORMULARIO
  ========================================================= */

  const limpiarFormulario = () => {
    setNombre('');
    setCiudad('');
    setDireccion('');
    setEstado('Activo');
  };

  const abrirFormulario = () => {
    limpiarFormulario();
    setError('');
    setMensaje('');
    setMostrarFormulario(true);
  };

  const cerrarFormulario = () => {
    setMostrarFormulario(false);
    limpiarFormulario();
    setError('');
  };

  /* =========================================================
     CREAR SUCURSAL
  ========================================================= */

  const crearSucursal = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setError('');
    setMensaje('');

    if (!nombre.trim()) {
      setError(
        'Ingresa el nombre de la sucursal.'
      );
      return;
    }

    if (!ciudad.trim()) {
      setError(
        'Ingresa la ciudad.'
      );
      return;
    }

    if (!direccion.trim()) {
      setError(
        'Ingresa la dirección.'
      );
      return;
    }

    try {
      const respuesta = await fetch(
        `${API}/sucursales`,
        {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify({
            nombre: nombre.trim(),
            ciudad: ciudad.trim(),
            direccion: direccion.trim(),
            estado: estado.trim(),
          }),
        }
      );

      const datos =
        await respuesta
          .json()
          .catch(() => null);

      if (!respuesta.ok) {
        const detalle =
          typeof datos?.detail ===
          'string'
            ? datos.detail
            : JSON.stringify(
                datos?.detail
              );

        throw new Error(
          detalle ||
            'No se pudo registrar la sucursal.'
        );
      }

      setMensaje(
        'Sucursal registrada correctamente.'
      );

      setMostrarFormulario(false);
      limpiarFormulario();

      await cargarSucursales();
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo registrar la sucursal.'
      );
    }
  };

  /* =========================================================
     ESTADÍSTICAS
  ========================================================= */

  const sucursalesActivas =
    sucursales.filter(
      (sucursal) =>
        sucursal.estado
          ?.toLowerCase() ===
        'activo'
    ).length;

  const ciudades =
    new Set(
      sucursales
        .map((sucursal) =>
          sucursal.ciudad
            ?.trim()
            .toLowerCase()
        )
        .filter(Boolean)
    ).size;

  /* =========================================================
     RENDER
  ========================================================= */

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

        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">

          <div>
            <div
              className="mb-1 flex items-center gap-2 text-sm font-semibold"
              style={{
                color: VINO,
              }}
            >
              <Building2 className="h-4 w-4" />

              EMPRESA
            </div>

            <h1
              className="text-3xl font-bold tracking-tight"
              style={{
                color: NEGRO,
              }}
            >
              Sucursales
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Gestión de las sedes de la empresa.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">

            {/* ACTUALIZAR */}

            <button
              type="button"
              onClick={cargarSucursales}
              disabled={cargando}
              className="inline-flex items-center justify-center gap-2 rounded-xl border bg-white px-4 py-2.5 text-sm font-semibold shadow-sm transition hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
              style={{
                borderColor:
                  '#E5E5E5',
                color: NEGRO,
              }}
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  cargando
                    ? 'animate-spin'
                    : ''
                }`}
              />

              Actualizar
            </button>

            {/* NUEVA SUCURSAL */}

            <button
              type="button"
              onClick={abrirFormulario}
              className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
              style={{
                backgroundColor:
                  VINO_OSCURO,
              }}
            >
              <Plus className="h-4 w-4" />

              Nueva sucursal
            </button>

          </div>
        </div>

        {/* =================================================
            MENSAJES
        ================================================= */}

        {mensaje && (
          <div
            className="flex items-center gap-3 rounded-xl border px-4 py-3 text-sm"
            style={{
              borderColor:
                '#E7D3D9',
              backgroundColor:
                VINO_SUAVE,
              color:
                VINO_OSCURO,
            }}
          >
            <CheckCircle2
              size={17}
            />

            {mensaje}
          </div>
        )}

        {error &&
          !mostrarFormulario && (
            <div
              className="rounded-xl border px-4 py-3 text-sm"
              style={{
                borderColor:
                  '#E7D3D9',
                backgroundColor:
                  VINO_SUAVE,
                color:
                  VINO_OSCURO,
              }}
            >
              {error}
            </div>
          )}

        {/* =================================================
            ESTADÍSTICAS
        ================================================= */}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

          {/* REGISTRADAS */}

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">

            <div className="flex items-start justify-between">

              <div>

                <p className="text-xs font-medium text-gray-500">
                  Sucursales registradas
                </p>

                <p
                  className="mt-3 text-3xl font-bold"
                  style={{
                    color: NEGRO,
                  }}
                >
                  {sucursales.length}
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
                <Store size={19} />
              </div>

            </div>

            <div className="mt-4 h-px bg-gray-100" />

            <p className="mt-3 text-[11px] text-gray-400">
              Total de sedes registradas
            </p>

          </div>

          {/* ACTIVAS */}

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">

            <div className="flex items-start justify-between">

              <div>

                <p className="text-xs font-medium text-gray-500">
                  Sucursales activas
                </p>

                <p
                  className="mt-3 text-3xl font-bold"
                  style={{
                    color: NEGRO,
                  }}
                >
                  {sucursalesActivas}
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
                <CheckCircle2 size={19} />
              </div>

            </div>

            <div className="mt-4 h-px bg-gray-100" />

            <p className="mt-3 text-[11px] text-gray-400">
              Sedes disponibles actualmente
            </p>

          </div>

          {/* CIUDADES */}

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">

            <div className="flex items-start justify-between">

              <div>

                <p className="text-xs font-medium text-gray-500">
                  Ciudades
                </p>

                <p
                  className="mt-3 text-3xl font-bold"
                  style={{
                    color: NEGRO,
                  }}
                >
                  {ciudades}
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
                <MapPin size={19} />
              </div>

            </div>

            <div className="mt-4 h-px bg-gray-100" />

            <p className="mt-3 text-[11px] text-gray-400">
              Ubicaciones con sucursales
            </p>

          </div>

        </div>

        {/* =================================================
            TABLA
        ================================================= */}

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

          {/* CABECERA */}

          <div className="flex flex-col gap-3 border-b border-gray-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <h3
                className="text-base font-bold"
                style={{
                  color: NEGRO,
                }}
              >
                Sucursales registradas
              </h3>

              <p className="mt-1 text-xs text-gray-500">
                Listado de sedes disponibles en el sistema.
              </p>

            </div>

            <div
              className="w-fit rounded-lg px-3 py-1.5 text-xs font-semibold"
              style={{
                backgroundColor:
                  VINO_SUAVE,
                color:
                  VINO_OSCURO,
              }}
            >
              {sucursales.length} registros
            </div>

          </div>

          {/* CARGANDO */}

          {cargando ? (
            <div className="flex flex-col items-center justify-center px-6 py-16">

              <RefreshCw
                className="mb-3 animate-spin"
                style={{
                  color: VINO,
                }}
                size={28}
              />

              <p className="text-sm text-gray-500">
                Cargando sucursales...
              </p>

            </div>
          ) : sucursales.length ===
            0 ? (

            /* SIN DATOS */

            <div className="px-6 py-16 text-center">

              <div
                className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl"
                style={{
                  backgroundColor:
                    VINO_SUAVE,
                  color: VINO,
                }}
              >
                <Building2 size={25} />
              </div>

              <p
                className="mt-4 text-sm font-semibold"
                style={{
                  color: NEGRO,
                }}
              >
                No hay sucursales registradas.
              </p>

              <p className="mt-1 text-xs text-gray-400">
                Registra la primera sucursal para comenzar.
              </p>

              <button
                type="button"
                onClick={abrirFormulario}
                className="mt-5 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
                style={{
                  backgroundColor:
                    VINO_OSCURO,
                }}
              >
                Registrar sucursal
              </button>

            </div>

          ) : (

            /* TABLA */

            <div className="overflow-x-auto">

              <table className="w-full text-left">

                <thead
                  className="border-b border-gray-200"
                  style={{
                    backgroundColor:
                      '#FAFAF9',
                  }}
                >

                  <tr>

                    <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                      ID
                    </th>

                    <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                      Sucursal
                    </th>

                    <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                      Ciudad
                    </th>

                    <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                      Dirección
                    </th>

                    <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                      Estado
                    </th>

                  </tr>

                </thead>

                <tbody className="divide-y divide-gray-100">

                  {sucursales.map(
                    (sucursal) => {

                      const activo =
                        sucursal.estado
                          ?.toLowerCase() ===
                        'activo';

                      return (
                        <tr
                          key={
                            sucursal.id
                          }
                          className="transition hover:bg-[#FAF7F8]"
                        >

                          {/* ID */}

                          <td className="px-6 py-5 text-sm text-gray-400">
                            #{sucursal.id}
                          </td>

                          {/* SUCURSAL */}

                          <td className="px-6 py-5">

                            <div className="flex items-center gap-3">

                              <div
                                className="flex h-9 w-9 items-center justify-center rounded-lg"
                                style={{
                                  backgroundColor:
                                    VINO_SUAVE,
                                  color:
                                    VINO,
                                }}
                              >
                                <Store size={16} />
                              </div>

                              <div>

                                <p
                                  className="text-sm font-semibold"
                                  style={{
                                    color:
                                      NEGRO,
                                  }}
                                >
                                  {
                                    sucursal.nombre
                                  }
                                </p>

                                <p className="mt-0.5 text-[11px] text-gray-400">
                                  Sucursal empresarial
                                </p>

                              </div>

                            </div>

                          </td>

                          {/* CIUDAD */}

                          <td className="px-6 py-5">

                            <div className="flex items-center gap-2 text-sm text-gray-600">

                              <MapPin
                                size={14}
                                style={{
                                  color:
                                    VINO,
                                }}
                              />

                              {
                                sucursal.ciudad
                              }

                            </div>

                          </td>

                          {/* DIRECCIÓN */}

                          <td className="px-6 py-5 text-sm text-gray-500">
                            {
                              sucursal.direccion
                            }
                          </td>

                          {/* ESTADO */}

                          <td className="px-6 py-5">

                            <span
                              className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold"
                              style={{
                                borderColor:
                                  activo
                                    ? '#E7D3D9'
                                    : '#E5E5E5',
                                backgroundColor:
                                  activo
                                    ? VINO_SUAVE
                                    : '#F5F5F5',
                                color:
                                  activo
                                    ? VINO_OSCURO
                                    : GRIS,
                              }}
                            >

                              <span
                                className="h-1.5 w-1.5 rounded-full"
                                style={{
                                  backgroundColor:
                                    activo
                                      ? VINO
                                      : GRIS,
                                }}
                              />

                              {
                                sucursal.estado
                              }

                            </span>

                          </td>

                        </tr>
                      );
                    }
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

      {mostrarFormulario && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">

          <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">

            {/* CABECERA MODAL */}

            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5">

              <div className="flex items-center gap-3">

                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{
                    backgroundColor:
                      VINO_SUAVE,
                    color: VINO,
                  }}
                >
                  <Building2 size={19} />
                </div>

                <div>

                  <h3
                    className="text-base font-bold"
                    style={{
                      color: NEGRO,
                    }}
                  >
                    Nueva sucursal
                  </h3>

                  <p className="mt-1 text-xs text-gray-500">
                    Registra una sede de la empresa.
                  </p>

                </div>

              </div>

              <button
                type="button"
                onClick={cerrarFormulario}
                className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
              >
                <X size={19} />
              </button>

            </div>

            {/* FORMULARIO */}

            <form
              onSubmit={crearSucursal}
              className="space-y-5 p-6"
            >

              {/* NOMBRE */}

              <div>

                <label
                  className="mb-2 block text-xs font-semibold uppercase tracking-wide"
                  style={{
                    color: GRIS,
                  }}
                >
                  Nombre de la sucursal
                </label>

                <input
                  type="text"
                  value={nombre}
                  onChange={(e) =>
                    setNombre(
                      e.target.value
                    )
                  }
                  placeholder="Ej. Sucursal Lima"
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:ring-2"
                  style={{
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
                />

              </div>

              {/* CIUDAD */}

              <div>

                <label
                  className="mb-2 block text-xs font-semibold uppercase tracking-wide"
                  style={{
                    color: GRIS,
                  }}
                >
                  Ciudad
                </label>

                <input
                  type="text"
                  value={ciudad}
                  onChange={(e) =>
                    setCiudad(
                      e.target.value
                    )
                  }
                  placeholder="Ej. Lima"
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-gray-400"
                  style={{
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
                />

              </div>

              {/* DIRECCIÓN */}

              <div>

                <label
                  className="mb-2 block text-xs font-semibold uppercase tracking-wide"
                  style={{
                    color: GRIS,
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
                  placeholder="Dirección de la sucursal"
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-gray-400"
                  style={{
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
                />

              </div>

              {/* ESTADO */}

              <div>

                <label
                  className="mb-2 block text-xs font-semibold uppercase tracking-wide"
                  style={{
                    color: GRIS,
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
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition"
                  style={{
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

              {/* ERROR */}

              {error && (
                <div
                  className="rounded-xl border px-4 py-3 text-sm"
                  style={{
                    borderColor:
                      '#E7D3D9',
                    backgroundColor:
                      VINO_SUAVE,
                    color:
                      VINO_OSCURO,
                  }}
                >
                  {error}
                </div>
              )}

              {/* BOTONES */}

              <div className="flex justify-end gap-3 border-t border-gray-200 pt-5">

                <button
                  type="button"
                  onClick={cerrarFormulario}
                  className="rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50 hover:text-gray-900"
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
                  Guardar sucursal
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
}