import { useState } from 'react';
import API from '../services/api';
import {
  Calculator,
  Plus,
  Minus,
  Dot,
  Sigma,
  RotateCcw,
  Grid3X3,
  Combine,
} from 'lucide-react';

const VINO = '#775b66';
const VINO_OSCURO = '#6B4652';
const VINO_SUAVE = '#F8E9EE';
const GRIS_FONDO = '#F3F3F1';
const GRIS = '#6B7280';
const NEGRO = '#111111';

type Resultado = number[] | number[][] | number;

export default function AnalisisMatematico() {
  const [operacion, setOperacion] = useState('suma');

  const [vectorA, setVectorA] = useState('1,2,3');
  const [vectorB, setVectorB] = useState('4,5,6');
  const [escalar, setEscalar] = useState('2');
  const [escalares, setEscalares] = useState('2,3');

  const [matrizA, setMatrizA] = useState('1,2\n3,4');
  const [matrizB, setMatrizB] = useState('5,6\n7,8');

  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const parseVector = (texto: string): number[] => {
    return texto
      .split(',')
      .map((x) => Number(x.trim()))
      .filter((x) => Number.isFinite(x));
  };

  const parseMatriz = (texto: string): number[][] => {
    return texto
      .trim()
      .split('\n')
      .map((fila) =>
        fila
          .split(',')
          .map((x) => Number(x.trim()))
          .filter((x) => Number.isFinite(x))
      )
      .filter((fila) => fila.length > 0);
  };

  const validarVector = (vector: number[], nombre: string) => {
    if (vector.length === 0) {
      throw new Error(`${nombre} no contiene valores válidos.`);
    }
  };

  const validarMatriz = (matriz: number[][], nombre: string) => {
    if (matriz.length === 0) {
      throw new Error(`${nombre} no contiene valores válidos.`);
    }

    const columnas = matriz[0].length;

    if (columnas === 0) {
      throw new Error(`${nombre} no contiene columnas válidas.`);
    }

    const esRectangular = matriz.every(
      (fila) => fila.length === columnas
    );

    if (!esRectangular) {
      throw new Error(
        `${nombre} debe tener la misma cantidad de columnas en todas sus filas.`
      );
    }
  };

  const ejecutar = async () => {
    setError('');
    setResultado(null);
    setCargando(true);

    try {
      let endpoint = '';
      let body: Record<string, unknown> = {};

      const a = parseVector(vectorA);
      const b = parseVector(vectorB);
      const A = parseMatriz(matrizA);
      const B = parseMatriz(matrizB);

      switch (operacion) {
        case 'suma':
          validarVector(a, 'Vector A');
          validarVector(b, 'Vector B');

          if (a.length !== b.length) {
            throw new Error(
              'Los vectores A y B deben tener la misma cantidad de elementos.'
            );
          }

          endpoint = '/matematicas/suma-vectores';
          body = {
            vector_a: a,
            vector_b: b,
          };
          break;

        case 'resta':
          validarVector(a, 'Vector A');
          validarVector(b, 'Vector B');

          if (a.length !== b.length) {
            throw new Error(
              'Los vectores A y B deben tener la misma cantidad de elementos.'
            );
          }

          endpoint = '/matematicas/resta-vectores';
          body = {
            vector_a: a,
            vector_b: b,
          };
          break;

        case 'punto':
          validarVector(a, 'Vector A');
          validarVector(b, 'Vector B');

          if (a.length !== b.length) {
            throw new Error(
              'Los vectores A y B deben tener la misma cantidad de elementos.'
            );
          }

          endpoint = '/matematicas/producto-punto';
          body = {
            vector_a: a,
            vector_b: b,
          };
          break;

        case 'escalar':
          validarVector(a, 'Vector A');

          if (!Number.isFinite(Number(escalar))) {
            throw new Error('El escalar debe ser un número válido.');
          }

          endpoint = '/matematicas/escalar';
          body = {
            vector: a,
            escalar: Number(escalar),
          };
          break;

        case 'transpuesta':
          validarMatriz(A, 'Matriz A');

          endpoint = '/matematicas/transpuesta';
          body = {
            matriz: A,
          };
          break;

        case 'matrices':
          validarMatriz(A, 'Matriz A');
          validarMatriz(B, 'Matriz B');

          if (A[0].length !== B.length) {
            throw new Error(
              `No se pueden multiplicar las matrices. La Matriz A tiene ${A[0].length} columnas y la Matriz B tiene ${B.length} filas.`
            );
          }

          endpoint = '/matematicas/multiplicacion-matrices';
          body = {
            matriz_a: A,
            matriz_b: B,
          };
          break;

        case 'combinacion': {
          validarVector(a, 'Vector A');
          validarVector(b, 'Vector B');

          const valoresEscalares = escalares
            .split(',')
            .map((x) => Number(x.trim()))
            .filter((x) => Number.isFinite(x));

          if (valoresEscalares.length !== 2) {
            throw new Error(
              'La combinación lineal necesita exactamente 2 escalares.'
            );
          }

          if (a.length !== b.length) {
            throw new Error(
              'Los vectores A y B deben tener la misma cantidad de elementos.'
            );
          }

          endpoint = '/matematicas/combinacion-lineal';

          body = {
            vectores: [a, b],
            escalares: valoresEscalares,
          };

          break;
        }

        default:
          throw new Error('Operación no válida.');
      }

      const respuesta = await fetch(`${API}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const datos = await respuesta.json().catch(() => null);

      if (!respuesta.ok) {
        let detalle = 'No se pudo realizar la operación.';

        if (datos?.detail) {
          if (typeof datos.detail === 'string') {
            detalle = datos.detail;
          } else if (Array.isArray(datos.detail)) {
            detalle = datos.detail
              .map((item: any) => item.msg || JSON.stringify(item))
              .join(', ');
          } else {
            detalle = JSON.stringify(datos.detail);
          }
        }

        throw new Error(detalle);
      }

      const resultadoFinal =
        datos?.resultado ??
        datos?.result ??
        datos;

      setResultado(resultadoFinal);

      const nombreOperacion: Record<string, string> = {
        suma: 'SUMA_VECTORES',
        resta: 'RESTA_VECTORES',
        punto: 'PRODUCTO_PUNTO',
        escalar: 'MULTIPLICACION_ESCALAR',
        transpuesta: 'MATRIZ_TRANSPUESTA',
        matrices: 'MULTIPLICACION_MATRICES',
        combinacion: 'COMBINACION_LINEAL',
      };

      const tipoOperacion = nombreOperacion[operacion];

      try {
        const operacionGuardada = await fetch(
          `${API}/operaciones?tipo=${encodeURIComponent(tipoOperacion)}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        if (!operacionGuardada.ok) {
          console.warn(
            'La operación matemática funcionó, pero no se pudo guardar en historial.'
          );
          return;
        }

        const operacionData = await operacionGuardada.json();

        if (!operacionData?.id) {
          console.warn(
            'El backend no devolvió el ID de la operación.'
          );
          return;
        }

        const resultadoGuardado = await fetch(
          `${API}/resultados-operaciones`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              operacion_id: operacionData.id,
              resultado: JSON.stringify(resultadoFinal),
            }),
          }
        );

        if (!resultadoGuardado.ok) {
          console.warn(
            'La operación se guardó, pero el resultado no pudo guardarse.'
          );
        }
      } catch (historialError) {
        console.warn(
          'La operación matemática funcionó, pero ocurrió un problema al guardar el historial.',
          historialError
        );
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Error al realizar la operación.'
      );
    } finally {
      setCargando(false);
    }
  };

  const limpiar = () => {
    setResultado(null);
    setError('');
  };

  const operaciones = [
    {
      id: 'suma',
      nombre: 'Suma de vectores',
      icono: <Plus size={18} />,
    },
    {
      id: 'resta',
      nombre: 'Resta de vectores',
      icono: <Minus size={18} />,
    },
    {
      id: 'punto',
      nombre: 'Producto punto',
      icono: <Dot size={20} />,
    },
    {
      id: 'escalar',
      nombre: 'Multiplicación por escalar',
      icono: <Sigma size={18} />,
    },
    {
      id: 'transpuesta',
      nombre: 'Matriz transpuesta',
      icono: <RotateCcw size={18} />,
    },
    {
      id: 'matrices',
      nombre: 'Multiplicación de matrices',
      icono: <Grid3X3 size={18} />,
    },
    {
      id: 'combinacion',
      nombre: 'Combinación lineal',
      icono: <Combine size={18} />,
    },
  ];

  const necesitaVectorB =
    operacion === 'suma' ||
    operacion === 'resta' ||
    operacion === 'punto' ||
    operacion === 'combinacion';

  const necesitaMatriz =
    operacion === 'transpuesta' ||
    operacion === 'matrices';

  return (
    <div
      className="min-h-full space-y-6 p-1"
      style={{ backgroundColor: GRIS_FONDO }}
    >
      {/* ENCABEZADO */}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div
            className="rounded-2xl p-3 shadow-sm"
            style={{
              backgroundColor: VINO_SUAVE,
              color: VINO,
            }}
          >
            <Calculator size={25} />
          </div>

          <div>
            <h2
              className="text-2xl font-bold"
              style={{ color: NEGRO }}
            >
              Análisis Matemático
            </h2>

            <p
              className="mt-1 text-sm"
              style={{ color: GRIS }}
            >
              Operaciones con vectores y matrices
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* MENÚ DE OPERACIONES */}

        <div
          className="rounded-2xl border bg-white p-5 shadow-sm"
          style={{ borderColor: '#E5E5E5' }}
        >
          <div className="mb-5">
            <h3
              className="text-base font-semibold"
              style={{ color: NEGRO }}
            >
              Operación
            </h3>

            <p
              className="mt-1 text-xs"
              style={{ color: GRIS }}
            >
              Selecciona el cálculo que deseas realizar
            </p>
          </div>

          <div className="space-y-2">
            {operaciones.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setOperacion(item.id);
                  limpiar();
                }}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition"
                style={
                  operacion === item.id
                    ? {
                        backgroundColor: VINO_OSCURO,
                        color: '#FFFFFF',
                        boxShadow: '0 4px 10px rgba(107, 70, 82, 0.18)',
                      }
                    : {
                        backgroundColor: '#FAFAFA',
                        color: NEGRO,
                      }
                }
                onMouseEnter={(e) => {
                  if (operacion !== item.id) {
                    e.currentTarget.style.backgroundColor = VINO_SUAVE;
                    e.currentTarget.style.color = VINO_OSCURO;
                  }
                }}
                onMouseLeave={(e) => {
                  if (operacion !== item.id) {
                    e.currentTarget.style.backgroundColor = '#FAFAFA';
                    e.currentTarget.style.color = NEGRO;
                  }
                }}
              >
                <span
                  className="flex h-8 w-8 items-center justify-center rounded-lg"
                  style={{
                    backgroundColor:
                      operacion === item.id
                        ? 'rgba(255,255,255,0.14)'
                        : VINO_SUAVE,
                    color:
                      operacion === item.id
                        ? '#FFFFFF'
                        : VINO,
                  }}
                >
                  {item.icono}
                </span>

                {item.nombre}
              </button>
            ))}
          </div>
        </div>

        {/* DATOS */}

        <div
          className="rounded-2xl border bg-white p-6 shadow-sm lg:col-span-2"
          style={{ borderColor: '#E5E5E5' }}
        >
          <div className="mb-6">
            <h3
              className="text-lg font-semibold"
              style={{ color: NEGRO }}
            >
              Datos de entrada
            </h3>

            <p
              className="mt-1 text-sm"
              style={{ color: GRIS }}
            >
              Ingresa los valores que deseas utilizar en la operación.
            </p>
          </div>

          {!necesitaMatriz ? (
            <div className="space-y-5">
              {/* VECTOR A */}

              <div>
                <label
                  className="mb-2 block text-sm font-medium"
                  style={{ color: NEGRO }}
                >
                  Vector A
                </label>

                <input
                  value={vectorA}
                  onChange={(e) => setVectorA(e.target.value)}
                  placeholder="Ejemplo: 1,2,3"
                  className="w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none transition"
                  style={{
                    borderColor: '#D8D8D8',
                    color: NEGRO,
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = VINO;
                    e.currentTarget.style.boxShadow =
                      `0 0 0 3px ${VINO_SUAVE}`;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#D8D8D8';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />

                <p
                  className="mt-1.5 text-xs"
                  style={{ color: GRIS }}
                >
                  Separa los valores con comas.
                </p>
              </div>

              {/* VECTOR B */}

              {necesitaVectorB && (
                <div>
                  <label
                    className="mb-2 block text-sm font-medium"
                    style={{ color: NEGRO }}
                  >
                    Vector B
                  </label>

                  <input
                    value={vectorB}
                    onChange={(e) => setVectorB(e.target.value)}
                    placeholder="Ejemplo: 4,5,6"
                    className="w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none transition"
                    style={{
                      borderColor: '#D8D8D8',
                      color: NEGRO,
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = VINO;
                      e.currentTarget.style.boxShadow =
                        `0 0 0 3px ${VINO_SUAVE}`;
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#D8D8D8';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />

                  <p
                    className="mt-1.5 text-xs"
                    style={{ color: GRIS }}
                  >
                    Ingresa la misma cantidad de valores que en el Vector A.
                  </p>
                </div>
              )}

              {/* ESCALAR */}

              {operacion === 'escalar' && (
                <div>
                  <label
                    className="mb-2 block text-sm font-medium"
                    style={{ color: NEGRO }}
                  >
                    Escalar
                  </label>

                  <input
                    type="number"
                    value={escalar}
                    onChange={(e) => setEscalar(e.target.value)}
                    className="w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none transition"
                    style={{
                      borderColor: '#D8D8D8',
                      color: NEGRO,
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = VINO;
                      e.currentTarget.style.boxShadow =
                        `0 0 0 3px ${VINO_SUAVE}`;
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#D8D8D8';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />

                  <p
                    className="mt-1.5 text-xs"
                    style={{ color: GRIS }}
                  >
                    Número por el cual se multiplicará cada elemento.
                  </p>
                </div>
              )}

              {/* ESCALARES */}

              {operacion === 'combinacion' && (
                <div>
                  <label
                    className="mb-2 block text-sm font-medium"
                    style={{ color: NEGRO }}
                  >
                    Escalares
                  </label>

                  <input
                    value={escalares}
                    onChange={(e) => setEscalares(e.target.value)}
                    placeholder="Ejemplo: 2,3"
                    className="w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none transition"
                    style={{
                      borderColor: '#D8D8D8',
                      color: NEGRO,
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = VINO;
                      e.currentTarget.style.boxShadow =
                        `0 0 0 3px ${VINO_SUAVE}`;
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#D8D8D8';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />

                  <p
                    className="mt-1.5 text-xs"
                    style={{ color: GRIS }}
                  >
                    Un escalar por cada vector.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-5">
              {/* MATRIZ A */}

              <div>
                <label
                  className="mb-2 block text-sm font-medium"
                  style={{ color: NEGRO }}
                >
                  Matriz A
                </label>

                <textarea
                  value={matrizA}
                  onChange={(e) => setMatrizA(e.target.value)}
                  rows={4}
                  placeholder={'1,2\n3,4'}
                  className="w-full resize-none rounded-xl border bg-white px-4 py-3 font-mono text-sm outline-none transition"
                  style={{
                    borderColor: '#D8D8D8',
                    color: NEGRO,
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = VINO;
                    e.currentTarget.style.boxShadow =
                      `0 0 0 3px ${VINO_SUAVE}`;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#D8D8D8';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />

                <p
                  className="mt-1.5 text-xs"
                  style={{ color: GRIS }}
                >
                  Una fila por línea y valores separados por comas.
                </p>
              </div>

              {/* MATRIZ B */}

              {operacion === 'matrices' && (
                <div>
                  <label
                    className="mb-2 block text-sm font-medium"
                    style={{ color: NEGRO }}
                  >
                    Matriz B
                  </label>

                  <textarea
                    value={matrizB}
                    onChange={(e) => setMatrizB(e.target.value)}
                    rows={4}
                    placeholder={'5,6\n7,8'}
                    className="w-full resize-none rounded-xl border bg-white px-4 py-3 font-mono text-sm outline-none transition"
                    style={{
                      borderColor: '#D8D8D8',
                      color: NEGRO,
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = VINO;
                      e.currentTarget.style.boxShadow =
                        `0 0 0 3px ${VINO_SUAVE}`;
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#D8D8D8';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />

                  <p
                    className="mt-1.5 text-xs"
                    style={{ color: GRIS }}
                  >
                    Una fila por línea y valores separados por comas.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* BOTONES */}

          <div className="mt-7 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={ejecutar}
              disabled={cargando}
              className="rounded-xl px-6 py-3 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50"
              style={{
                backgroundColor: VINO_OSCURO,
                boxShadow: '0 4px 10px rgba(107, 70, 82, 0.16)',
              }}
              onMouseEnter={(e) => {
                if (!cargando) {
                  e.currentTarget.style.backgroundColor = VINO;
                }
              }}
              onMouseLeave={(e) => {
                if (!cargando) {
                  e.currentTarget.style.backgroundColor = VINO_OSCURO;
                }
              }}
            >
              {cargando ? 'Calculando...' : 'Calcular'}
            </button>

            <button
              type="button"
              onClick={limpiar}
              className="rounded-xl border bg-white px-6 py-3 text-sm font-semibold transition"
              style={{
                borderColor: '#D8D8D8',
                color: NEGRO,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = VINO_SUAVE;
                e.currentTarget.style.borderColor = VINO;
                e.currentTarget.style.color = VINO_OSCURO;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#FFFFFF';
                e.currentTarget.style.borderColor = '#D8D8D8';
                e.currentTarget.style.color = NEGRO;
              }}
            >
              Limpiar
            </button>
          </div>

          {/* ERROR */}

          {error && (
            <div
              className="mt-6 rounded-xl border p-4 text-sm"
              style={{
                borderColor: '#E8C9D1',
                backgroundColor: '#FDF3F5',
                color: '#8A3D4F',
              }}
            >
              <div className="font-semibold">No se pudo realizar la operación</div>
              <div className="mt-1">{error}</div>
            </div>
          )}

          {/* RESULTADO */}

          {resultado !== null && (
            <div
              className="mt-6 rounded-2xl border p-5"
              style={{
                borderColor: '#DCC8CF',
                backgroundColor: VINO_SUAVE,
              }}
            >
              <div className="mb-3 flex items-center gap-2">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-lg"
                  style={{
                    backgroundColor: VINO,
                    color: '#FFFFFF',
                  }}
                >
                  <Calculator size={16} />
                </div>

                <h3
                  className="font-semibold"
                  style={{ color: VINO_OSCURO }}
                >
                  Resultado
                </h3>
              </div>

              <pre
                className="overflow-auto rounded-xl border bg-white p-4 font-mono text-sm"
                style={{
                  borderColor: '#E5DDE0',
                  color: NEGRO,
                }}
              >
                {JSON.stringify(resultado, null, 2)}
              </pre>

              <p
                className="mt-3 text-xs font-medium"
                style={{ color: VINO_OSCURO }}
              >
                ✓ Operación realizada correctamente.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}