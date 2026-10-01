import { useEffect, useState } from 'react';
import {
  Target,
  Plus,
  X,
  RefreshCw,
  CheckCircle2,
  TrendingUp,
  CalendarDays,
  Building2,
} from 'lucide-react';
import API from '../services/api';

interface Meta {
  id: number;
  nombre: string;
  tipo: string;
  valor_objetivo: number;
  periodo: string;
  sucursal_id: number | null;
  estado: string;
}

/* =========================================================
   PALETA MATAS PERU EIRL
========================================================= */

const EMPRESA_NOMBRE = 'MATAS PERU EIRL';
const EMPRESA_GERENTE = 'GERARDO GARCIA MATAS';
const EMPRESA_RUBRO = 'Electricidad y Soluciones Integrales';

const GRIS_MARCA = '#4B5563';
const GRIS_OSCURO = '#2F3337';
const GRIS_MEDIO = '#6B7280';
const GRIS_SUAVE = '#E5E7EB';
const GRIS_FONDO = '#F3F4F6';
const GRIS_MUY_SUAVE = '#F9FAFB';
const BLANCO = '#FFFFFF';
const NEGRO = '#111111';

export default function Metas() {
  const [metas, setMetas] = useState<Meta[]>([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mostrarModal, setMostrarModal] = useState(false);

  const [nombre, setNombre] = useState('');
  const [tipo, setTipo] = useState('Ventas');
  const [valorObjetivo, setValorObjetivo] =
    useState('');
  const [periodo, setPeriodo] =
    useState('Mensual');
  const [sucursalId, setSucursalId] =
    useState('1');

  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');

  // =========================
  // CARGAR METAS
  // =========================

  const cargarMetas = async () => {
    try {
      setCargando(true);
      setError('');

      const response = await fetch(
        `${API}/metas`
      );

      const data = await response
        .json()
        .catch(() => null);

      if (!response.ok) {
        const detalle =
          typeof data?.detail === 'string'
            ? data.detail
            : JSON.stringify(data?.detail);

        throw new Error(
          detalle ||
            'No se pudieron cargar las metas'
        );
      }

      setMetas(
        Array.isArray(data) ? data : []
      );
    } catch (error) {
      console.error(
        'Error cargando metas:',
        error
      );

      setMetas([]);

      setError(
        error instanceof Error
          ? error.message
          : 'No se pudieron cargar las metas'
      );
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarMetas();
  }, []);

  // =========================
  // LIMPIAR FORMULARIO
  // =========================

  const limpiarFormulario = () => {
    setNombre('');
    setTipo('Ventas');
    setValorObjetivo('');
    setPeriodo('Mensual');
    setSucursalId('1');
  };

  // =========================
  // ABRIR MODAL
  // =========================

  const abrirModal = () => {
    limpiarFormulario();
    setError('');
    setMensaje('');
    setMostrarModal(true);
  };

  // =========================
  // CERRAR MODAL
  // =========================

  const cerrarModal = () => {
    if (guardando) return;

    setMostrarModal(false);
    limpiarFormulario();
  };

  // =========================
  // GUARDAR META
  // =========================

  const guardarMeta = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setError('');
    setMensaje('');

    if (!nombre.trim()) {
      setError('Ingresa el nombre de la meta.');
      return;
    }

    const valor = Number(valorObjetivo);

    if (
      !valorObjetivo ||
      !Number.isFinite(valor) ||
      valor <= 0
    ) {
      setError(
        'Ingresa un valor objetivo válido mayor que cero.'
      );
      return;
    }

    try {
      setGuardando(true);

      const response = await fetch(
        `${API}/metas`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            nombre: nombre.trim(),
            tipo,
            valor_objetivo: valor,
            periodo,
            sucursal_id: Number(sucursalId),
            estado: 'Activo',
          }),
        }
      );

      const data = await response
        .json()
        .catch(() => null);

      if (!response.ok) {
        const detalle =
          typeof data?.detail === 'string'
            ? data.detail
            : JSON.stringify(data?.detail);

        throw new Error(
          detalle ||
            'No se pudo registrar la meta'
        );
      }

      setMensaje(
        'Meta registrada correctamente.'
      );

      setMostrarModal(false);
      limpiarFormulario();

      await cargarMetas();
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : 'No se pudo registrar la meta'
      );
    } finally {
      setGuardando(false);
    }
  };

  // =========================
  // INDICADORES
  // =========================

  const metasActivas = metas.filter(
    (meta) =>
      meta.estado?.toLowerCase() === 'activo'
  ).length;

  const metasVentas = metas.filter(
    (meta) => meta.tipo === 'Ventas'
  ).length;

  const metasUnidades = metas.filter(
    (meta) => meta.tipo === 'Unidades'
  ).length;

  // =========================
  // FORMATO OBJETIVO
  // =========================

  const formatearObjetivo = (
    meta: Meta
  ) => {
    const valor = Number(
      meta.valor_objetivo || 0
    ).toLocaleString('es-PE');

    if (meta.tipo === 'Ventas') {
      return `S/ ${valor}`;
    }

    return valor;
  };

  return (
    <div
      className="min-h-full"
      style={{
        backgroundColor: GRIS_FONDO,
      }}
    >
      <div className="mx-auto max-w-[1500px] space-y-6 p-5 lg:p-7">

        {/* =========================
            ENCABEZADO
        ========================= */}

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

          <div className="flex items-center gap-3">

            <div
              className="flex h-12 w-12 items-center justify-center rounded-xl"
              style={{
                backgroundColor: GRIS_SUAVE,
                color: GRIS_OSCURO,
              }}
            >
              <Target size={24} />
            </div>

            <div>

              <p
                className="text-[11px] font-semibold uppercase tracking-[0.18em]"
                style={{ color: GRIS_MARCA }}
              >
                Planificación comercial
              </p>

              <h1
                className="mt-1 text-2xl font-bold tracking-tight"
                style={{ color: NEGRO }}
              >
                Metas y Objetivos
              </h1>

              <p
                className="mt-1 text-sm"
                style={{ color: GRIS_MEDIO }}
              >
                Administra los objetivos comerciales de{' '}
                {EMPRESA_NOMBRE}
              </p>

              <p
                className="mt-1 text-xs"
                style={{ color: GRIS_MEDIO }}
              >
                {EMPRESA_RUBRO} · Gerente: {EMPRESA_GERENTE}
              </p>

            </div>

          </div>

          <div className="flex flex-wrap gap-2">

            <button
              type="button"
              onClick={cargarMetas}
              disabled={cargando}
              className="inline-flex items-center gap-2 rounded-xl border bg-white px-4 py-2.5 text-sm font-medium shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              style={{
                borderColor: GRIS_SUAVE,
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

            <button
              type="button"
              onClick={abrirModal}
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
              style={{
                backgroundColor: GRIS_OSCURO,
              }}
            >
              <Plus className="h-4 w-4" />

              Nueva meta
            </button>

          </div>
        </div>

        {/* =========================
            MENSAJE
        ========================= */}

        {mensaje && (
          <div
            className="flex items-center gap-3 rounded-xl border px-4 py-3 text-sm"
            style={{
              borderColor: GRIS_SUAVE,
              backgroundColor: BLANCO,
              color: GRIS_OSCURO,
            }}
          >
            <CheckCircle2 className="h-5 w-5 shrink-0" />

            {mensaje}
          </div>
        )}

        {/* =========================
            ERROR
        ========================= */}

        {error && !mostrarModal && (
          <div
            className="flex items-center justify-between gap-4 rounded-xl border px-4 py-3 text-sm"
            style={{
              borderColor: GRIS_SUAVE,
              backgroundColor: BLANCO,
              color: NEGRO,
            }}
          >
            <span>{error}</span>

            <button
              type="button"
              onClick={() => setError('')}
              className="transition hover:opacity-70"
              style={{ color: GRIS_MEDIO }}
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* =========================
            INDICADORES
        ========================= */}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

          {/* TOTAL */}

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md">

            <div className="flex items-start justify-between">

              <div>

                <p
                  className="text-xs font-medium uppercase tracking-wide"
                  style={{ color: GRIS_MEDIO }}
                >
                  Metas registradas
                </p>

                <p
                  className="mt-3 text-3xl font-bold"
                  style={{ color: NEGRO }}
                >
                  {metas.length}
                </p>

              </div>

              <div
                className="rounded-xl p-2.5"
                style={{
                  backgroundColor: GRIS_SUAVE,
                  color: GRIS_OSCURO,
                }}
              >
                <Target className="h-5 w-5" />
              </div>

            </div>

            <p
              className="mt-3 text-xs"
              style={{ color: GRIS_MEDIO }}
            >
              Total de objetivos registrados
            </p>

          </div>

          {/* ACTIVAS */}

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md">

            <div className="flex items-start justify-between">

              <div>

                <p
                  className="text-xs font-medium uppercase tracking-wide"
                  style={{ color: GRIS_MEDIO }}
                >
                  Metas activas
                </p>

                <p
                  className="mt-3 text-3xl font-bold"
                  style={{ color: GRIS_OSCURO }}
                >
                  {metasActivas}
                </p>

              </div>

              <div
                className="rounded-xl p-2.5"
                style={{
                  backgroundColor: GRIS_SUAVE,
                  color: GRIS_OSCURO,
                }}
              >
                <CheckCircle2 className="h-5 w-5" />
              </div>

            </div>

            <p
              className="mt-3 text-xs"
              style={{ color: GRIS_MEDIO }}
            >
              Objetivos actualmente activos
            </p>

          </div>

          {/* VENTAS */}

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md">

            <div className="flex items-start justify-between">

              <div>

                <p
                  className="text-xs font-medium uppercase tracking-wide"
                  style={{ color: GRIS_MEDIO }}
                >
                  Metas de ventas
                </p>

                <p
                  className="mt-3 text-3xl font-bold"
                  style={{ color: NEGRO }}
                >
                  {metasVentas}
                </p>

              </div>

              <div
                className="rounded-xl p-2.5"
                style={{
                  backgroundColor: GRIS_SUAVE,
                  color: GRIS_MEDIO,
                }}
              >
                <TrendingUp className="h-5 w-5" />
              </div>

            </div>

            <p
              className="mt-3 text-xs"
              style={{ color: GRIS_MEDIO }}
            >
              {metasUnidades} metas de unidades
            </p>

          </div>

        </div>

        {/* =========================
            TABLA
        ========================= */}

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5">

            <div>

              <h3
                className="font-semibold"
                style={{ color: NEGRO }}
              >
                Objetivos registrados
              </h3>

              <p
                className="mt-1 text-xs"
                style={{ color: GRIS_MEDIO }}
              >
                Metas comerciales configuradas en{' '}
                {EMPRESA_NOMBRE}
              </p>

            </div>

            <div
              className="rounded-lg px-3 py-1.5 text-xs font-semibold"
              style={{
                backgroundColor: GRIS_SUAVE,
                color: GRIS_OSCURO,
              }}
            >
              {metas.length} registros
            </div>

          </div>

          {cargando ? (

            <div className="px-6 py-16 text-center">

              <RefreshCw
                className="mx-auto h-6 w-6 animate-spin"
                style={{ color: GRIS_OSCURO }}
              />

              <p
                className="mt-3 text-sm"
                style={{ color: GRIS_MEDIO }}
              >
                Cargando metas...
              </p>

            </div>

          ) : metas.length === 0 ? (

            <div className="px-6 py-16 text-center">

              <div
                className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl"
                style={{
                  backgroundColor: GRIS_SUAVE,
                  color: GRIS_OSCURO,
                }}
              >
                <Target className="h-7 w-7" />
              </div>

              <p
                className="mt-4 font-medium"
                style={{ color: NEGRO }}
              >
                No hay metas registradas.
              </p>

              <p
                className="mt-1 text-sm"
                style={{ color: GRIS_MEDIO }}
              >
                Registra una nueva meta para comenzar.
              </p>

              <button
                type="button"
                onClick={abrirModal}
                className="mt-5 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
                style={{
                  backgroundColor: GRIS_OSCURO,
                }}
              >
                Registrar meta
              </button>

            </div>

          ) : (

            <div className="overflow-x-auto">

              <table className="w-full text-left">

                <thead
                  style={{
                    backgroundColor: GRIS_MUY_SUAVE,
                    color: GRIS_MEDIO,
                  }}
                >
                  <tr>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide">
                      Meta
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide">
                      Tipo
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide">
                      Objetivo
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide">
                      Periodo
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide">
                      Sucursal
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide">
                      Estado
                    </th>

                  </tr>
                </thead>

                <tbody>

                  {metas.map((meta) => (

                    <tr
                      key={meta.id}
                      className="border-t border-gray-100 transition hover:bg-gray-50"
                    >

                      {/* META */}

                      <td className="px-6 py-4">

                        <div className="flex items-center gap-3">

                          <div
                            className="flex h-9 w-9 items-center justify-center rounded-lg"
                            style={{
                              backgroundColor: GRIS_SUAVE,
                              color: GRIS_OSCURO,
                            }}
                          >
                            <Target className="h-4 w-4" />
                          </div>

                          <div>

                            <p
                              className="font-semibold"
                              style={{
                                color: NEGRO,
                              }}
                            >
                              {meta.nombre}
                            </p>

                            <p
                              className="mt-0.5 text-xs"
                              style={{
                                color: GRIS_MEDIO,
                              }}
                            >
                              Meta #{meta.id}
                            </p>

                          </div>

                        </div>

                      </td>

                      {/* TIPO */}

                      <td
                        className="px-6 py-4 text-sm"
                        style={{ color: GRIS_MEDIO }}
                      >
                        <span
                          className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold"
                          style={{
                            backgroundColor: GRIS_SUAVE,
                            color: GRIS_OSCURO,
                          }}
                        >
                          {meta.tipo}
                        </span>
                      </td>

                      {/* OBJETIVO */}

                      <td
                        className="px-6 py-4 text-sm font-semibold"
                        style={{ color: NEGRO }}
                      >
                        {formatearObjetivo(meta)}
                      </td>

                      {/* PERIODO */}

                      <td className="px-6 py-4">

                        <div className="flex items-center gap-2">

                          <CalendarDays
                            className="h-4 w-4"
                            style={{
                              color: GRIS_OSCURO,
                            }}
                          />

                          <span
                            className="text-sm"
                            style={{
                              color: GRIS_MEDIO,
                            }}
                          >
                            {meta.periodo}
                          </span>

                        </div>

                      </td>

                      {/* SUCURSAL */}

                      <td className="px-6 py-4">

                        <div className="flex items-center gap-2">

                          <Building2
                            className="h-4 w-4"
                            style={{
                              color: GRIS_OSCURO,
                            }}
                          />

                          <span
                            className="text-sm"
                            style={{
                              color: GRIS_MEDIO,
                            }}
                          >
                            {meta.sucursal_id
                              ? `Sucursal ${meta.sucursal_id}`
                              : 'Todas'}
                          </span>

                        </div>

                      </td>

                      {/* ESTADO */}

                      <td className="px-6 py-4">

                        <span
                          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
                          style={
                            meta.estado?.toLowerCase() ===
                            'activo'
                              ? {
                                  backgroundColor:
                                    GRIS_SUAVE,
                                  color:
                                    GRIS_OSCURO,
                                }
                              : {
                                  backgroundColor:
                                    '#F3F4F6',
                                  color: GRIS_MEDIO,
                                }
                          }
                        >

                          <span
                            className="h-1.5 w-1.5 rounded-full"
                            style={{
                              backgroundColor:
                                meta.estado?.toLowerCase() ===
                                'activo'
                                  ? GRIS_OSCURO
                                  : GRIS_MEDIO,
                            }}
                          />

                          {meta.estado}

                        </span>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          )}

        </div>

      </div>

      {/* =========================
          MODAL
      ========================= */}

      {mostrarModal && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]">

          <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">

            {/* CABECERA */}

            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5">

              <div className="flex items-center gap-3">

                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{
                    backgroundColor: GRIS_SUAVE,
                    color: GRIS_OSCURO,
                  }}
                >
                  <Target className="h-5 w-5" />
                </div>

                <div>

                  <h2
                    className="text-lg font-semibold"
                    style={{ color: NEGRO }}
                  >
                    Nueva meta
                  </h2>

                  <p
                    className="mt-1 text-sm"
                    style={{ color: GRIS_MEDIO }}
                  >
                    Configura un nuevo objetivo comercial
                  </p>

                </div>

              </div>

              <button
                type="button"
                onClick={cerrarModal}
                disabled={guardando}
                className="rounded-xl p-2 transition hover:bg-gray-100 disabled:opacity-50"
                style={{ color: GRIS_MEDIO }}
              >
                <X className="h-5 w-5" />
              </button>

            </div>

            {/* FORMULARIO */}

            <form
              onSubmit={guardarMeta}
              className="space-y-5 p-6"
            >

              {/* NOMBRE */}

              <div>

                <label
                  className="mb-2 block text-sm font-medium"
                  style={{ color: NEGRO }}
                >
                  Nombre
                </label>

                <input
                  value={nombre}
                  onChange={(e) =>
                    setNombre(e.target.value)
                  }
                  required
                  placeholder="Ej. Meta de ventas mensual"
                  disabled={guardando}
                  className="w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 disabled:bg-gray-50"
                  style={{
                    borderColor: '#D1D5DB',
                    color: NEGRO,
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor =
                      GRIS_MARCA;
                    e.currentTarget.style.boxShadow =
                      `0 0 0 3px ${GRIS_SUAVE}`;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor =
                      '#D1D5DB';
                    e.currentTarget.style.boxShadow =
                      'none';
                  }}
                />

              </div>

              {/* TIPO */}

              <div>

                <label
                  className="mb-2 block text-sm font-medium"
                  style={{ color: NEGRO }}
                >
                  Tipo
                </label>

                <select
                  value={tipo}
                  onChange={(e) =>
                    setTipo(e.target.value)
                  }
                  disabled={guardando}
                  className="w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none transition disabled:bg-gray-50"
                  style={{
                    borderColor: '#D1D5DB',
                    color: NEGRO,
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor =
                      GRIS_MARCA;
                    e.currentTarget.style.boxShadow =
                      `0 0 0 3px ${GRIS_SUAVE}`;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor =
                      '#D1D5DB';
                    e.currentTarget.style.boxShadow =
                      'none';
                  }}
                >
                  <option value="Ventas">
                    Ventas
                  </option>

                  <option value="Unidades">
                    Unidades
                  </option>

                  <option value="Inventario">
                    Inventario
                  </option>

                  <option value="Operaciones">
                    Operaciones
                  </option>
                </select>

              </div>

              {/* VALOR */}

              <div>

                <label
                  className="mb-2 block text-sm font-medium"
                  style={{ color: NEGRO }}
                >
                  Valor objetivo
                </label>

                <input
                  type="number"
                  min="1"
                  value={valorObjetivo}
                  onChange={(e) =>
                    setValorObjetivo(
                      e.target.value
                    )
                  }
                  required
                  disabled={guardando}
                  placeholder="Ej. 10000"
                  className="w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 disabled:bg-gray-50"
                  style={{
                    borderColor: '#D1D5DB',
                    color: NEGRO,
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor =
                      GRIS_MARCA;
                    e.currentTarget.style.boxShadow =
                      `0 0 0 3px ${GRIS_SUAVE}`;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor =
                      '#D1D5DB';
                    e.currentTarget.style.boxShadow =
                      'none';
                  }}
                />

              </div>

              {/* PERIODO */}

              <div>

                <label
                  className="mb-2 block text-sm font-medium"
                  style={{ color: NEGRO }}
                >
                  Periodo
                </label>

                <select
                  value={periodo}
                  onChange={(e) =>
                    setPeriodo(e.target.value)
                  }
                  disabled={guardando}
                  className="w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none transition disabled:bg-gray-50"
                  style={{
                    borderColor: '#D1D5DB',
                    color: NEGRO,
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor =
                      GRIS_MARCA;
                    e.currentTarget.style.boxShadow =
                      `0 0 0 3px ${GRIS_SUAVE}`;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor =
                      '#D1D5DB';
                    e.currentTarget.style.boxShadow =
                      'none';
                  }}
                >
                  <option value="Mensual">
                    Mensual
                  </option>

                  <option value="Trimestral">
                    Trimestral
                  </option>

                  <option value="Semestral">
                    Semestral
                  </option>

                  <option value="Anual">
                    Anual
                  </option>
                </select>

              </div>

              {/* SUCURSAL */}

              <div>

                <label
                  className="mb-2 block text-sm font-medium"
                  style={{ color: NEGRO }}
                >
                  Sucursal
                </label>

                <select
                  value={sucursalId}
                  onChange={(e) =>
                    setSucursalId(
                      e.target.value
                    )
                  }
                  disabled={guardando}
                  className="w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none transition disabled:bg-gray-50"
                  style={{
                    borderColor: '#D1D5DB',
                    color: NEGRO,
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor =
                      GRIS_MARCA;
                    e.currentTarget.style.boxShadow =
                      `0 0 0 3px ${GRIS_SUAVE}`;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor =
                      '#D1D5DB';
                    e.currentTarget.style.boxShadow =
                      'none';
                  }}
                >
                  <option value="1">
                    Sucursal 1
                  </option>
                </select>

              </div>

              {/* ERROR DEL MODAL */}

              {error && (

                <div
                  className="rounded-xl border px-4 py-3 text-sm"
                  style={{
                    borderColor: GRIS_SUAVE,
                    backgroundColor: GRIS_MUY_SUAVE,
                    color: NEGRO,
                  }}
                >
                  {error}
                </div>

              )}

              {/* BOTONES */}

              <div className="flex justify-end gap-3 border-t border-gray-200 pt-5">

                <button
                  type="button"
                  onClick={cerrarModal}
                  disabled={guardando}
                  className="rounded-xl border bg-white px-5 py-2.5 text-sm font-medium transition hover:bg-gray-50 disabled:opacity-50"
                  style={{
                    borderColor: '#D1D5DB',
                    color: NEGRO,
                  }}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={guardando}
                  className="rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                  style={{
                    backgroundColor: GRIS_OSCURO,
                  }}
                >
                  {guardando
                    ? 'Guardando...'
                    : 'Guardar meta'}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}
