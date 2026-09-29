import { useEffect, useState } from 'react';
import API from '../services/api';
import {
  History,
  RefreshCw,
  Calculator,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

const VINO = '#775b66';
const VINO_OSCURO = '#6B4652';
const VINO_SUAVE = '#F8E9EE';
const GRIS_FONDO = '#F3F3F1';
const GRIS = '#6B7280';
const NEGRO = '#111111';

interface Registro {
  id?: number;
  tipo?: string;
  operacion?: string;
  nombre?: string;
  fecha?: string;
  created_at?: string;
  estado?: string;
  resultado?: unknown;
  [key: string]: unknown;
}

export default function Historial() {
  const [operaciones, setOperaciones] = useState<Registro[]>([]);
  const [resultados, setResultados] = useState<Registro[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  const cargarHistorial = async () => {
    setCargando(true);
    setError('');

    try {
      const [respuestaOperaciones, respuestaResultados] =
        await Promise.all([
          fetch(`${API}/operaciones`),
          fetch(`${API}/resultados-operaciones`),
        ]);

      const datosOperaciones = await respuestaOperaciones.json();
      const datosResultados = await respuestaResultados.json();

      if (!respuestaOperaciones.ok) {
        throw new Error(
          typeof datosOperaciones.detail === 'string'
            ? datosOperaciones.detail
            : 'No se pudo cargar el historial de operaciones'
        );
      }

      if (!respuestaResultados.ok) {
        throw new Error(
          typeof datosResultados.detail === 'string'
            ? datosResultados.detail
            : 'No se pudieron cargar los resultados'
        );
      }

      const listaOperaciones = Array.isArray(datosOperaciones)
        ? datosOperaciones
        : datosOperaciones.operaciones ??
          datosOperaciones.data ??
          [];

      const listaResultados = Array.isArray(datosResultados)
        ? datosResultados
        : datosResultados.resultados ??
          datosResultados.data ??
          [];

      setOperaciones(listaOperaciones);
      setResultados(listaResultados);
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

  useEffect(() => {
    cargarHistorial();
  }, []);

  const obtenerTipo = (registro: Registro) =>
    String(
      registro.tipo ??
        registro.operacion ??
        registro.nombre ??
        'Operación'
    );

  const obtenerFecha = (registro: Registro) => {
    const fecha = registro.fecha ?? registro.created_at;

    if (!fecha) return '—';

    const fechaObjeto = new Date(String(fecha));

    if (Number.isNaN(fechaObjeto.getTime())) {
      return String(fecha);
    }

    return fechaObjeto.toLocaleString('es-PE');
  };

  const totalRegistros =
    operaciones.length + resultados.length;

  return (
    <div
      className="min-h-full space-y-6 p-1"
      style={{ backgroundColor: GRIS_FONDO }}
    >
      {/* ENCABEZADO */}

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          <div
            className="rounded-2xl p-3 shadow-sm"
            style={{
              backgroundColor: VINO_SUAVE,
              color: VINO,
            }}
          >
            <History size={25} />
          </div>

          <div>
            <h2
              className="text-2xl font-bold"
              style={{ color: NEGRO }}
            >
              Historial
            </h2>

            <p
              className="mt-1 text-sm"
              style={{ color: GRIS }}
            >
              Registro de operaciones matemáticas realizadas
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={cargarHistorial}
          disabled={cargando}
          className="flex items-center justify-center gap-2 rounded-xl border bg-white px-5 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50"
          style={{
            borderColor: '#D8D8D8',
            color: NEGRO,
          }}
          onMouseEnter={(e) => {
            if (!cargando) {
              e.currentTarget.style.backgroundColor = VINO_SUAVE;
              e.currentTarget.style.borderColor = VINO;
              e.currentTarget.style.color = VINO_OSCURO;
            }
          }}
          onMouseLeave={(e) => {
            if (!cargando) {
              e.currentTarget.style.backgroundColor = '#FFFFFF';
              e.currentTarget.style.borderColor = '#D8D8D8';
              e.currentTarget.style.color = NEGRO;
            }
          }}
        >
          <RefreshCw
            size={17}
            className={cargando ? 'animate-spin' : ''}
          />

          {cargando ? 'Actualizando...' : 'Actualizar'}
        </button>
      </div>

      {/* ERROR */}

      {error && (
        <div
          className="flex items-center gap-3 rounded-xl border p-4 text-sm"
          style={{
            borderColor: '#E8C9D1',
            backgroundColor: '#FDF3F5',
            color: '#8A3D4F',
          }}
        >
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* KPIs */}

      <div className="grid gap-5 md:grid-cols-3">
        <div
          className="rounded-2xl border bg-white p-5 shadow-sm"
          style={{ borderColor: '#E5E5E5' }}
        >
          <p
            className="text-sm"
            style={{ color: GRIS }}
          >
            Registros totales
          </p>

          <p
            className="mt-2 text-3xl font-bold"
            style={{ color: NEGRO }}
          >
            {totalRegistros}
          </p>

          <p
            className="mt-2 text-xs"
            style={{ color: GRIS }}
          >
            Operaciones y resultados almacenados
          </p>
        </div>

        <div
          className="rounded-2xl border bg-white p-5 shadow-sm"
          style={{ borderColor: '#E5E5E5' }}
        >
          <p
            className="text-sm"
            style={{ color: GRIS }}
          >
            Operaciones
          </p>

          <p
            className="mt-2 text-3xl font-bold"
            style={{ color: VINO }}
          >
            {operaciones.length}
          </p>

          <p
            className="mt-2 text-xs"
            style={{ color: GRIS }}
          >
            Cálculos registrados
          </p>
        </div>

        <div
          className="rounded-2xl border bg-white p-5 shadow-sm"
          style={{ borderColor: '#E5E5E5' }}
        >
          <p
            className="text-sm"
            style={{ color: GRIS }}
          >
            Resultados
          </p>

          <p
            className="mt-2 text-3xl font-bold"
            style={{ color: VINO_OSCURO }}
          >
            {resultados.length}
          </p>

          <p
            className="mt-2 text-xs"
            style={{ color: GRIS }}
          >
            Resultados almacenados
          </p>
        </div>
      </div>

      {/* OPERACIONES */}

      <div
        className="overflow-hidden rounded-2xl border bg-white shadow-sm"
        style={{ borderColor: '#E5E5E5' }}
      >
        <div
          className="border-b p-5"
          style={{ borderColor: '#E5E5E5' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-xl"
              style={{
                backgroundColor: VINO_SUAVE,
                color: VINO,
              }}
            >
              <Calculator size={19} />
            </div>

            <div>
              <h3
                className="font-semibold"
                style={{ color: NEGRO }}
              >
                Operaciones registradas
              </h3>

              <p
                className="mt-0.5 text-xs"
                style={{ color: GRIS }}
              >
                Historial de cálculos realizados
              </p>
            </div>
          </div>
        </div>

        {operaciones.length === 0 ? (
          <div className="p-10 text-center">
            <div
              className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl"
              style={{
                backgroundColor: VINO_SUAVE,
                color: VINO,
              }}
            >
              <History size={28} />
            </div>

            <p
              className="mt-4 text-sm font-medium"
              style={{ color: NEGRO }}
            >
              No hay operaciones registradas todavía.
            </p>

            <p
              className="mt-1 text-xs"
              style={{ color: GRIS }}
            >
              Las operaciones realizadas aparecerán aquí.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr
                  className="border-b"
                  style={{
                    borderColor: '#E5E5E5',
                    backgroundColor: '#FAFAFA',
                  }}
                >
                  <th
                    className="px-5 py-4 text-xs font-semibold uppercase tracking-wide"
                    style={{ color: GRIS }}
                  >
                    ID
                  </th>

                  <th
                    className="px-5 py-4 text-xs font-semibold uppercase tracking-wide"
                    style={{ color: GRIS }}
                  >
                    Operación
                  </th>

                  <th
                    className="px-5 py-4 text-xs font-semibold uppercase tracking-wide"
                    style={{ color: GRIS }}
                  >
                    Fecha
                  </th>

                  <th
                    className="px-5 py-4 text-xs font-semibold uppercase tracking-wide"
                    style={{ color: GRIS }}
                  >
                    Estado
                  </th>
                </tr>
              </thead>

              <tbody>
                {operaciones.map((registro, index) => (
                  <tr
                    key={String(registro.id ?? index)}
                    className="border-b transition last:border-0"
                    style={{ borderColor: '#F0F0F0' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor =
                        '#FCF8FA';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor =
                        '#FFFFFF';
                    }}
                  >
                    <td
                      className="px-5 py-4 text-sm font-medium"
                      style={{ color: GRIS }}
                    >
                      #{registro.id ?? index + 1}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="flex h-8 w-8 items-center justify-center rounded-lg"
                          style={{
                            backgroundColor: VINO_SUAVE,
                            color: VINO,
                          }}
                        >
                          <Calculator size={15} />
                        </div>

                        <span
                          className="font-medium"
                          style={{ color: NEGRO }}
                        >
                          {obtenerTipo(registro)}
                        </span>
                      </div>
                    </td>

                    <td
                      className="px-5 py-4 text-sm"
                      style={{ color: GRIS }}
                    >
                      {obtenerFecha(registro)}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
                        style={{
                          backgroundColor: '#F3F8F5',
                          color: '#47705A',
                        }}
                      >
                        <CheckCircle2 size={14} />

                        {String(
                          registro.estado ?? 'Registrada'
                        )}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* RESULTADOS */}

      <div
        className="overflow-hidden rounded-2xl border bg-white shadow-sm"
        style={{ borderColor: '#E5E5E5' }}
      >
        <div
          className="border-b p-5"
          style={{ borderColor: '#E5E5E5' }}
        >
          <div>
            <h3
              className="font-semibold"
              style={{ color: NEGRO }}
            >
              Resultados almacenados
            </h3>

            <p
              className="mt-1 text-xs"
              style={{ color: GRIS }}
            >
              Valores obtenidos en las operaciones matemáticas.
            </p>
          </div>
        </div>

        {resultados.length === 0 ? (
          <div
            className="p-8 text-center text-sm"
            style={{ color: GRIS }}
          >
            No hay resultados almacenados todavía.
          </div>
        ) : (
          <div className="space-y-3 p-5">
            {resultados.map((registro, index) => (
              <div
                key={String(registro.id ?? index)}
                className="rounded-2xl border p-4 transition"
                style={{
                  borderColor: '#E9E3E6',
                  backgroundColor: '#FCFAFB',
                }}
              >
                <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-8 w-8 items-center justify-center rounded-lg"
                      style={{
                        backgroundColor: VINO_SUAVE,
                        color: VINO,
                      }}
                    >
                      <Calculator size={15} />
                    </div>

                    <span
                      className="font-medium"
                      style={{ color: NEGRO }}
                    >
                      {obtenerTipo(registro)}
                    </span>
                  </div>

                  <span
                    className="text-xs"
                    style={{ color: GRIS }}
                  >
                    {obtenerFecha(registro)}
                  </span>
                </div>

                {registro.resultado !== undefined && (
                  <pre
                    className="mt-4 overflow-auto rounded-xl border bg-white p-4 font-mono text-xs"
                    style={{
                      borderColor: '#E5E5E5',
                      color: NEGRO,
                    }}
                  >
                    {JSON.stringify(
                      registro.resultado,
                      null,
                      2
                    )}
                  </pre>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}