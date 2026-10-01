import { useEffect, useState } from 'react';
import API from '../services/api';
import {
  History,
  RefreshCw,
  Calculator,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

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
      const [
        respuestaOperaciones,
        respuestaResultados,
      ] = await Promise.all([
        fetch(`${API}/operaciones`),
        fetch(`${API}/resultados-operaciones`),
      ]);

      const datosOperaciones =
        await respuestaOperaciones.json();

      const datosResultados =
        await respuestaResultados.json();

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

      const listaOperaciones =
        Array.isArray(datosOperaciones)
          ? datosOperaciones
          : datosOperaciones.operaciones ??
            datosOperaciones.data ??
            [];

      const listaResultados =
        Array.isArray(datosResultados)
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
    const fecha =
      registro.fecha ??
      registro.created_at;

    if (!fecha) return '—';

    const fechaObjeto =
      new Date(String(fecha));

    if (
      Number.isNaN(
        fechaObjeto.getTime()
      )
    ) {
      return String(fecha);
    }

    return fechaObjeto.toLocaleString(
      'es-PE'
    );
  };

  const totalRegistros =
    operaciones.length +
    resultados.length;

  return (
    <div
      className="min-h-full space-y-6 p-1"
      style={{
        backgroundColor:
          GRIS_FONDO,
      }}
    >
      {/* ENCABEZADO */}

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          <div
            className="rounded-2xl p-3 shadow-sm"
            style={{
              backgroundColor:
                GRIS_SUAVE,
              color:
                GRIS_MARCA,
            }}
          >
            <History size={25} />
          </div>

          <div>
            <h2
              className="text-2xl font-bold"
              style={{
                color: NEGRO,
              }}
            >
              Historial
            </h2>

            <p
              className="mt-1 text-sm"
              style={{
                color:
                  GRIS_MEDIO,
              }}
            >
              Registro de operaciones matemáticas realizadas
            </p>

            <p
              className="mt-1 text-xs font-medium"
              style={{
                color:
                  GRIS_MARCA,
              }}
            >
              {EMPRESA_NOMBRE} · {EMPRESA_RUBRO}
            </p>

            <p
              className="text-xs"
              style={{
                color:
                  GRIS_MEDIO,
              }}
            >
              Gerente: {EMPRESA_GERENTE}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={cargarHistorial}
          disabled={cargando}
          className="flex items-center justify-center gap-2 rounded-xl border bg-white px-5 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50"
          style={{
            borderColor:
              '#D1D5DB',
            color: NEGRO,
          }}
          onMouseEnter={(e) => {
            if (!cargando) {
              e.currentTarget.style.backgroundColor =
                GRIS_SUAVE;

              e.currentTarget.style.borderColor =
                GRIS_MARCA;

              e.currentTarget.style.color =
                GRIS_OSCURO;
            }
          }}
          onMouseLeave={(e) => {
            if (!cargando) {
              e.currentTarget.style.backgroundColor =
                BLANCO;

              e.currentTarget.style.borderColor =
                '#D1D5DB';

              e.currentTarget.style.color =
                NEGRO;
            }
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

          {cargando
            ? 'Actualizando...'
            : 'Actualizar'}
        </button>
      </div>

      {/* ERROR */}

      {error && (
        <div
          className="flex items-center gap-3 rounded-xl border p-4 text-sm"
          style={{
            borderColor:
              '#D1D5DB',
            backgroundColor:
              GRIS_MUY_SUAVE,
            color:
              GRIS_OSCURO,
          }}
        >
          <AlertCircle size={20} />

          <span>{error}</span>
        </div>
      )}

      {/* KPIs */}

      <div className="grid gap-5 md:grid-cols-3">
        <div
          className="rounded-2xl border p-5 shadow-sm"
          style={{
            borderColor:
              GRIS_SUAVE,
            backgroundColor:
              BLANCO,
          }}
        >
          <p
            className="text-sm"
            style={{
              color:
                GRIS_MEDIO,
            }}
          >
            Registros totales
          </p>

          <p
            className="mt-2 text-3xl font-bold"
            style={{
              color:
                NEGRO,
            }}
          >
            {totalRegistros}
          </p>

          <p
            className="mt-2 text-xs"
            style={{
              color:
                GRIS_MEDIO,
            }}
          >
            Operaciones y resultados almacenados
          </p>
        </div>

        <div
          className="rounded-2xl border p-5 shadow-sm"
          style={{
            borderColor:
              GRIS_SUAVE,
            backgroundColor:
              BLANCO,
          }}
        >
          <p
            className="text-sm"
            style={{
              color:
                GRIS_MEDIO,
            }}
          >
            Operaciones
          </p>

          <p
            className="mt-2 text-3xl font-bold"
            style={{
              color:
                GRIS_MARCA,
            }}
          >
            {operaciones.length}
          </p>

          <p
            className="mt-2 text-xs"
            style={{
              color:
                GRIS_MEDIO,
            }}
          >
            Cálculos registrados
          </p>
        </div>

        <div
          className="rounded-2xl border p-5 shadow-sm"
          style={{
            borderColor:
              GRIS_SUAVE,
            backgroundColor:
              BLANCO,
          }}
        >
          <p
            className="text-sm"
            style={{
              color:
                GRIS_MEDIO,
            }}
          >
            Resultados
          </p>

          <p
            className="mt-2 text-3xl font-bold"
            style={{
              color:
                GRIS_OSCURO,
            }}
          >
            {resultados.length}
          </p>

          <p
            className="mt-2 text-xs"
            style={{
              color:
                GRIS_MEDIO,
            }}
          >
            Resultados almacenados
          </p>
        </div>
      </div>

      {/* OPERACIONES */}

      <div
        className="overflow-hidden rounded-2xl border shadow-sm"
        style={{
          borderColor:
            GRIS_SUAVE,
          backgroundColor:
            BLANCO,
        }}
      >
        <div
          className="border-b p-5"
          style={{
            borderColor:
              GRIS_SUAVE,
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-xl"
              style={{
                backgroundColor:
                  GRIS_SUAVE,
                color:
                  GRIS_MARCA,
              }}
            >
              <Calculator size={19} />
            </div>

            <div>
              <h3
                className="font-semibold"
                style={{
                  color:
                    NEGRO,
                }}
              >
                Operaciones registradas
              </h3>

              <p
                className="mt-0.5 text-xs"
                style={{
                  color:
                    GRIS_MEDIO,
                }}
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
                backgroundColor:
                  GRIS_SUAVE,
                color:
                  GRIS_MARCA,
              }}
            >
              <History size={28} />
            </div>

            <p
              className="mt-4 text-sm font-medium"
              style={{
                color:
                  NEGRO,
              }}
            >
              No hay operaciones registradas todavía.
            </p>

            <p
              className="mt-1 text-xs"
              style={{
                color:
                  GRIS_MEDIO,
              }}
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
                    borderColor:
                      GRIS_SUAVE,
                    backgroundColor:
                      GRIS_MUY_SUAVE,
                  }}
                >
                  <th
                    className="px-5 py-4 text-xs font-semibold uppercase tracking-wide"
                    style={{
                      color:
                        GRIS_MEDIO,
                    }}
                  >
                    ID
                  </th>

                  <th
                    className="px-5 py-4 text-xs font-semibold uppercase tracking-wide"
                    style={{
                      color:
                        GRIS_MEDIO,
                    }}
                  >
                    Operación
                  </th>

                  <th
                    className="px-5 py-4 text-xs font-semibold uppercase tracking-wide"
                    style={{
                      color:
                        GRIS_MEDIO,
                    }}
                  >
                    Fecha
                  </th>

                  <th
                    className="px-5 py-4 text-xs font-semibold uppercase tracking-wide"
                    style={{
                      color:
                        GRIS_MEDIO,
                    }}
                  >
                    Estado
                  </th>
                </tr>
              </thead>

              <tbody>
                {operaciones.map(
                  (
                    registro,
                    index
                  ) => (
                    <tr
                      key={String(
                        registro.id ??
                          index
                      )}
                      className="border-b transition last:border-0"
                      style={{
                        borderColor:
                          '#F0F0F0',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor =
                          GRIS_MUY_SUAVE;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor =
                          BLANCO;
                      }}
                    >
                      <td
                        className="px-5 py-4 text-sm font-medium"
                        style={{
                          color:
                            GRIS_MEDIO,
                        }}
                      >
                        #{registro.id ??
                          index + 1}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="flex h-8 w-8 items-center justify-center rounded-lg"
                            style={{
                              backgroundColor:
                                GRIS_SUAVE,
                              color:
                                GRIS_MARCA,
                            }}
                          >
                            <Calculator
                              size={15}
                            />
                          </div>

                          <span
                            className="font-medium"
                            style={{
                              color:
                                NEGRO,
                            }}
                          >
                            {obtenerTipo(
                              registro
                            )}
                          </span>
                        </div>
                      </td>

                      <td
                        className="px-5 py-4 text-sm"
                        style={{
                          color:
                            GRIS_MEDIO,
                        }}
                      >
                        {obtenerFecha(
                          registro
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
                          style={{
                            backgroundColor:
                              GRIS_SUAVE,
                            color:
                              GRIS_OSCURO,
                          }}
                        >
                          <CheckCircle2
                            size={14}
                          />

                          {String(
                            registro.estado ??
                              'Registrada'
                          )}
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

      {/* RESULTADOS */}

      <div
        className="overflow-hidden rounded-2xl border shadow-sm"
        style={{
          borderColor:
            GRIS_SUAVE,
          backgroundColor:
            BLANCO,
        }}
      >
        <div
          className="border-b p-5"
          style={{
            borderColor:
              GRIS_SUAVE,
          }}
        >
          <div>
            <h3
              className="font-semibold"
              style={{
                color:
                  NEGRO,
              }}
            >
              Resultados almacenados
            </h3>

            <p
              className="mt-1 text-xs"
              style={{
                color:
                  GRIS_MEDIO,
              }}
            >
              Valores obtenidos en las operaciones matemáticas.
            </p>
          </div>
        </div>

        {resultados.length === 0 ? (
          <div
            className="p-8 text-center text-sm"
            style={{
              color:
                GRIS_MEDIO,
            }}
          >
            No hay resultados almacenados todavía.
          </div>
        ) : (
          <div className="space-y-3 p-5">
            {resultados.map(
              (
                registro,
                index
              ) => (
                <div
                  key={String(
                    registro.id ??
                      index
                  )}
                  className="rounded-2xl border p-4 transition"
                  style={{
                    borderColor:
                      GRIS_SUAVE,
                    backgroundColor:
                      GRIS_MUY_SUAVE,
                  }}
                >
                  <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-8 w-8 items-center justify-center rounded-lg"
                        style={{
                          backgroundColor:
                            GRIS_SUAVE,
                          color:
                            GRIS_MARCA,
                        }}
                      >
                        <Calculator
                          size={15}
                        />
                      </div>

                      <span
                        className="font-medium"
                        style={{
                          color:
                            NEGRO,
                        }}
                      >
                        {obtenerTipo(
                          registro
                        )}
                      </span>
                    </div>

                    <span
                      className="text-xs"
                      style={{
                        color:
                          GRIS_MEDIO,
                      }}
                    >
                      {obtenerFecha(
                        registro
                      )}
                    </span>
                  </div>

                  {registro.resultado !==
                    undefined && (
                    <pre
                      className="mt-4 overflow-auto rounded-xl border bg-white p-4 font-mono text-xs"
                      style={{
                        borderColor:
                          GRIS_SUAVE,
                        color:
                          NEGRO,
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
              )
            )}
          </div>
        )}
      </div>

      {/* IDENTIDAD EMPRESARIAL */}

      <div
        className="rounded-2xl border p-5"
        style={{
          borderColor:
            GRIS_SUAVE,
          backgroundColor:
            BLANCO,
        }}
      >
        <p
          className="text-sm font-bold"
          style={{
            color:
              GRIS_OSCURO,
          }}
        >
          {EMPRESA_NOMBRE}
        </p>

        <p
          className="mt-1 text-xs"
          style={{
            color:
              GRIS_MEDIO,
          }}
        >
        {EMPRESA_RUBRO} · Gerente: {EMPRESA_GERENTE} 
        </p>
      </div>
    </div> 
  ); 
}
