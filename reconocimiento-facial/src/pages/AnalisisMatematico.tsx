import { useEffect, useState } from 'react';
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
  RefreshCw,
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

type ValorNumerico = string;

type Resultado =
  | ValorNumerico
  | ValorNumerico[]
  | ValorNumerico[][];

export default function AnalisisMatematico() {
  const [operacion, setOperacion] = useState('suma');

  // ============================================================
  // DATOS REALES DE VENTAS
  // ============================================================

  const [ventas, setVentas] = useState<any[]>([]);
  const [cargandoVentas, setCargandoVentas] =
    useState(true);

  // ============================================================
  // DATOS PARA LAS OPERACIONES
  // ============================================================

  const [vectorA, setVectorA] = useState('');
  const [vectorB, setVectorB] = useState('');

  const [escalar, setEscalar] =
    useState('2');

  const [escalares, setEscalares] =
    useState('2,3');

  const [matrizA, setMatrizA] =
    useState('1,2\n3,4');

  const [matrizB, setMatrizB] =
    useState('5,6\n7,8');

  const [resultado, setResultado] =
    useState<Resultado | null>(null);

  const [error, setError] =
    useState('');

  const [cargando, setCargando] =
    useState(false);

  // ============================================================
  // VALIDAR NÚMERO
  // ============================================================

  const esNumeroValido = (
    valor: string
  ): boolean => {
    const texto = valor.trim();

    if (!texto) {
      return false;
    }

    return /^[+-]?(?:\d+\.?\d*|\.\d+)$/.test(
      texto
    );
  };

  // ============================================================
  // CARGAR VENTAS REALES
  // ============================================================

  useEffect(() => {
    cargarVentas();
  }, []);

  const cargarVentas = async () => {
    try {
      setCargandoVentas(true);
      setError('');

      const respuesta = await fetch(
        `${API}/ventas`
      );

      if (!respuesta.ok) {
        throw new Error(
          'No se pudieron cargar las ventas.'
        );
      }

      const datos =
        await respuesta.json();

      const listaVentas =
        Array.isArray(datos)
          ? datos
          : Array.isArray(datos?.ventas)
          ? datos.ventas
          : [];

      setVentas(listaVentas);

      const valoresVentas =
        listaVentas
          .map((venta: any) => {
            const valor =
              venta?.total;

            if (
              valor === null ||
              valor === undefined
            ) {
              return null;
            }

            const texto =
              String(valor).trim();

            return esNumeroValido(texto)
              ? texto
              : null;
          })
         .filter(
  (
    valor: string | null
  ): valor is string =>
    valor !== null
);

      if (
        valoresVentas.length > 0
      ) {
        setVectorA(
          valoresVentas.join(',')
        );
      } else {
        setVectorA('');
      }
    } catch (err) {
      console.error(
        'Error cargando ventas:',
        err
      );

      setVentas([]);
      setVectorA('');

      setError(
        err instanceof Error
          ? err.message
          : 'No se pudieron cargar las ventas.'
      );
    } finally {
      setCargandoVentas(false);
    }
  };

  // ============================================================
  // PARSEAR VECTOR
  // ============================================================

  const parseVector = (
    texto: string,
    nombre: string
  ): string[] => {
    if (!texto.trim()) {
      throw new Error(
        `${nombre} no contiene valores.`
      );
    }

    const partes =
      texto
        .split(',')
        .map((x) => x.trim());

    const valores: string[] = [];

    for (
      let i = 0;
      i < partes.length;
      i++
    ) {
      const valor = partes[i];

      if (!valor) {
        throw new Error(
          `${nombre}: hay un valor vacío en la posición ${
            i + 1
          }.`
        );
      }

      if (
        !esNumeroValido(valor)
      ) {
        throw new Error(
          `${nombre}: "${valor}" no es un número válido.`
        );
      }

      valores.push(valor);
    }

    return valores;
  };

  // ============================================================
  // PARSEAR MATRIZ
  // ============================================================

  const parseMatriz = (
    texto: string,
    nombre: string
  ): string[][] => {
    if (!texto.trim()) {
      throw new Error(
        `${nombre} no contiene valores.`
      );
    }

    const filas =
      texto
        .trim()
        .split(/\r?\n/);

    const matriz: string[][] = [];

    for (
      let i = 0;
      i < filas.length;
      i++
    ) {
      const partes =
        filas[i]
          .split(',')
          .map((x) => x.trim());

      if (
        partes.length === 0
      ) {
        continue;
      }

      const fila: string[] = [];

      for (
        let j = 0;
        j < partes.length;
        j++
      ) {
        const valor =
          partes[j];

        if (!valor) {
          throw new Error(
            `${nombre}: hay un valor vacío en la fila ${
              i + 1
            }.`
          );
        }

        if (
          !esNumeroValido(valor)
        ) {
          throw new Error(
            `${nombre}: "${valor}" no es un número válido en la fila ${
              i + 1
            }.`
          );
        }

        fila.push(valor);
      }

      matriz.push(fila);
    }

    return matriz;
  };

  // ============================================================
  // VALIDAR VECTOR
  // ============================================================

  const validarVector = (
    vector: string[],
    nombre: string
  ) => {
    if (vector.length === 0) {
      throw new Error(
        `${nombre} no contiene valores válidos.`
      );
    }
  };

  // ============================================================
  // VALIDAR MATRIZ
  // ============================================================

  const validarMatriz = (
    matriz: string[][],
    nombre: string
  ) => {
    if (matriz.length === 0) {
      throw new Error(
        `${nombre} no contiene valores válidos.`
      );
    }

    const columnas =
      matriz[0].length;

    if (columnas === 0) {
      throw new Error(
        `${nombre} no contiene columnas válidas.`
      );
    }

    const esRectangular =
      matriz.every(
        (fila) =>
          fila.length === columnas
      );

    if (!esRectangular) {
      throw new Error(
        `${nombre} debe tener la misma cantidad de columnas en todas sus filas.`
      );
    }
  };

  // ============================================================
  // EJECUTAR OPERACIÓN
  // ============================================================

  const ejecutar = async () => {
    setError('');
    setResultado(null);
    setCargando(true);

    try {
      let endpoint = '';

      let body: Record<
        string,
        unknown
      > = {};

      const a =
        parseVector(
          vectorA,
          'Vector A'
        );

      let b: string[] = [];

      if (necesitaVectorB) {
        b =
          parseVector(
            vectorB,
            'Vector B'
          );
      }

      const A =
        necesitaMatriz
          ? parseMatriz(
              matrizA,
              'Matriz A'
            )
          : [];

      const B =
        operacion ===
        'matrices'
          ? parseMatriz(
              matrizB,
              'Matriz B'
            )
          : [];

      switch (operacion) {
        case 'suma':
          validarVector(
            a,
            'Vector A'
          );

          validarVector(
            b,
            'Vector B'
          );

          if (
            a.length !==
            b.length
          ) {
            throw new Error(
              `Los vectores A y B deben tener la misma cantidad de elementos. A tiene ${a.length} y B tiene ${b.length}.`
            );
          }

          endpoint =
            '/matematicas/suma-vectores';

          body = {
            vector_a: a,
            vector_b: b,
          };

          break;

        case 'resta':
          validarVector(
            a,
            'Vector A'
          );

          validarVector(
            b,
            'Vector B'
          );

          if (
            a.length !==
            b.length
          ) {
            throw new Error(
              `Los vectores A y B deben tener la misma cantidad de elementos. A tiene ${a.length} y B tiene ${b.length}.`
            );
          }

          endpoint =
            '/matematicas/resta-vectores';

          body = {
            vector_a: a,
            vector_b: b,
          };

          break;

        case 'punto':
          validarVector(
            a,
            'Vector A'
          );

          validarVector(
            b,
            'Vector B'
          );

          if (
            a.length !==
            b.length
          ) {
            throw new Error(
              `Los vectores A y B deben tener la misma cantidad de elementos. A tiene ${a.length} y B tiene ${b.length}.`
            );
          }

          endpoint =
            '/matematicas/producto-punto';

          body = {
            vector_a: a,
            vector_b: b,
          };

          break;

        case 'escalar':
          validarVector(
            a,
            'Vector A'
          );

          if (
            !esNumeroValido(
              escalar
            )
          ) {
            throw new Error(
              'El escalar debe ser un número válido.'
            );
          }

          endpoint =
            '/matematicas/escalar';

          body = {
            vector: a,
            escalar:
              escalar.trim(),
          };

          break;

        case 'transpuesta':
          validarMatriz(
            A,
            'Matriz A'
          );

          endpoint =
            '/matematicas/transpuesta';

          body = {
            matriz: A,
          };

          break;

        case 'matrices':
          validarMatriz(
            A,
            'Matriz A'
          );

          validarMatriz(
            B,
            'Matriz B'
          );

          if (
            A[0].length !==
            B.length
          ) {
            throw new Error(
              `No se pueden multiplicar las matrices. La Matriz A tiene ${A[0].length} columnas y la Matriz B tiene ${B.length} filas.`
            );
          }

          endpoint =
            '/matematicas/multiplicacion-matrices';

          body = {
            matriz_a: A,
            matriz_b: B,
          };

          break;

        case 'combinacion': {
          validarVector(
            a,
            'Vector A'
          );

          validarVector(
            b,
            'Vector B'
          );

          const valoresEscalares =
            escalares
              .split(',')
              .map((x) =>
                x.trim()
              );

          if (
            valoresEscalares.length !==
            2
          ) {
            throw new Error(
              'La combinación lineal necesita exactamente 2 escalares.'
            );
          }

          for (
            const valor of valoresEscalares
          ) {
            if (
              !esNumeroValido(
                valor
              )
            ) {
              throw new Error(
                `El escalar "${valor}" no es válido.`
              );
            }
          }

          if (
            a.length !==
            b.length
          ) {
            throw new Error(
              `Los vectores A y B deben tener la misma cantidad de elementos. A tiene ${a.length} y B tiene ${b.length}.`
            );
          }

          endpoint =
            '/matematicas/combinacion-lineal';

          body = {
            vectores: [
              a,
              b,
            ],
            escalares:
              valoresEscalares,
          };

          break;
        }

        default:
          throw new Error(
            'Operación no válida.'
          );
      }

      const respuesta =
        await fetch(
          `${API}${endpoint}`,
          {
            method: 'POST',

            headers: {
              'Content-Type':
                'application/json',
            },

            body: JSON.stringify(
              body
            ),
          }
        );

      const datos =
        await respuesta
          .json()
          .catch(() => null);

      if (!respuesta.ok) {
        let detalle =
          'No se pudo realizar la operación.';

        if (datos?.detail) {
          if (
            typeof datos.detail ===
            'string'
          ) {
            detalle =
              datos.detail;
          } else if (
            Array.isArray(
              datos.detail
            )
          ) {
            detalle =
              datos.detail
                .map(
                  (item: any) =>
                    item.msg ||
                    JSON.stringify(
                      item
                    )
                )
                .join(', ');
          } else {
            detalle =
              JSON.stringify(
                datos.detail
              );
          }
        }

        throw new Error(
          detalle
        );
      }

      const resultadoFinal =
        datos?.resultado ??
        datos?.result ??
        datos;

      setResultado(
        normalizarResultado(
          resultadoFinal
        )
      );

      // ========================================================
      // GUARDAR EN HISTORIAL
      // ========================================================

      const nombreOperacion: Record<
        string,
        string
      > = {
        suma:
          'SUMA_VECTORES',

        resta:
          'RESTA_VECTORES',

        punto:
          'PRODUCTO_PUNTO',

        escalar:
          'MULTIPLICACION_ESCALAR',

        transpuesta:
          'MATRIZ_TRANSPUESTA',

        matrices:
          'MULTIPLICACION_MATRICES',

        combinacion:
          'COMBINACION_LINEAL',
      };

      const tipoOperacion =
        nombreOperacion[
          operacion
        ];

      try {
        const operacionGuardada =
          await fetch(
            `${API}/operaciones?tipo=${encodeURIComponent(
              tipoOperacion
            )}`,
            {
              method: 'POST',

              headers: {
                'Content-Type':
                  'application/json',
              },
            }
          );

        if (
          !operacionGuardada.ok
        ) {
          console.warn(
            'La operación matemática funcionó, pero no se pudo guardar en historial.'
          );

          return;
        }

        const operacionData =
          await operacionGuardada.json();

        if (
          !operacionData?.id
        ) {
          console.warn(
            'El backend no devolvió el ID de la operación.'
          );

          return;
        }

        const resultadoGuardado =
          await fetch(
            `${API}/resultados-operaciones`,
            {
              method: 'POST',

              headers: {
                'Content-Type':
                  'application/json',
              },

              body: JSON.stringify({
                operacion_id:
                  operacionData.id,

                resultado:
                  JSON.stringify(
                    normalizarResultado(
                      resultadoFinal
                    )
                  ),
              }),
            }
          );

        if (
          !resultadoGuardado.ok
        ) {
          console.warn(
            'La operación se guardó, pero el resultado no pudo guardarse.'
          );
        }
      } catch (
        historialError
      ) {
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

  // ============================================================
  // NORMALIZAR RESULTADO
  // ============================================================

  const normalizarResultado = (
    valor: any
  ): Resultado => {
    if (
      Array.isArray(valor)
    ) {
      return valor.map(
        (item) =>
          normalizarResultado(
            item
          ) as any
      ) as any;
    }

    if (
      valor !== null &&
      typeof valor ===
        'object'
    ) {
      if (
        'resultado' in valor
      ) {
        return normalizarResultado(
          valor.resultado
        );
      }

      if (
        'result' in valor
      ) {
        return normalizarResultado(
          valor.result
        );
      }

      return JSON.stringify(
        valor
      );
    }

    return String(valor);
  };

  // ============================================================
  // LIMPIAR
  // ============================================================

  const limpiar = () => {
    setResultado(null);
    setError('');
  };

  // ============================================================
  // OPERACIONES
  // ============================================================

  const operaciones = [
    {
      id: 'suma',
      nombre:
        'Suma de vectores',
      icono: (
        <Plus size={18} />
      ),
    },

    {
      id: 'resta',
      nombre:
        'Resta de vectores',
      icono: (
        <Minus size={18} />
      ),
    },

    {
      id: 'punto',
      nombre:
        'Producto punto',
      icono: (
        <Dot size={20} />
      ),
    },

    {
      id: 'escalar',
      nombre:
        'Multiplicación por escalar',
      icono: (
        <Sigma size={18} />
      ),
    },

    {
      id: 'transpuesta',
      nombre:
        'Matriz transpuesta',
      icono: (
        <RotateCcw size={18} />
      ),
    },

    {
      id: 'matrices',
      nombre:
        'Multiplicación de matrices',
      icono: (
        <Grid3X3 size={18} />
      ),
    },

    {
      id: 'combinacion',
      nombre:
        'Combinación lineal',
      icono: (
        <Combine size={18} />
      ),
    },
  ];

  const necesitaVectorB =
    operacion === 'suma' ||
    operacion === 'resta' ||
    operacion === 'punto' ||
    operacion === 'combinacion';

  const necesitaMatriz =
    operacion ===
      'transpuesta' ||
    operacion === 'matrices';

  // ============================================================
  // TOTAL DE VENTAS
  // ============================================================

  const totalVentas =
    ventas.reduce(
      (
        total: number,
        venta: any
      ) => {
        const valor =
          Number(
            venta?.total ?? 0
          );

        if (
          Number.isFinite(
            valor
          )
        ) {
          return total + valor;
        }

        return total;
      },
      0
    );

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div
      className="min-h-full space-y-6 p-1"
      style={{
        backgroundColor:
          GRIS_FONDO,
      }}
    >
      {/* ENCABEZADO */}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div
            className="rounded-2xl p-3 shadow-sm"
            style={{
              backgroundColor:
                GRIS_SUAVE,
              color: GRIS_MARCA,
            }}
          >
            <Calculator
              size={25}
            />
          </div>

          <div>
            <h2
              className="text-2xl font-bold"
              style={{
                color: NEGRO,
              }}
            >
              Análisis Matemático
            </h2>

            <p
              className="mt-1 text-sm"
              style={{
                color: GRIS_MEDIO,
              }}
            >
              Análisis y cálculo a partir
              de los datos reales de ventas
            </p>

            <p
              className="mt-1 text-xs font-medium"
              style={{
                color: GRIS_MARCA,
              }}
            >
              {EMPRESA_NOMBRE} · {EMPRESA_RUBRO}
            </p>

            <p
              className="text-xs"
              style={{
                color: GRIS_MEDIO,
              }}
            >
              Gerente: {EMPRESA_GERENTE}
            </p>
          </div>
        </div>
      </div>

      {/* RESUMEN DE VENTAS */}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
            className="text-xs font-medium"
            style={{
              color: GRIS_MEDIO,
            }}
          >
            Ventas registradas
          </p>

          <p
            className="mt-2 text-2xl font-bold"
            style={{
              color:
                GRIS_OSCURO,
            }}
          >
            {ventas.length}
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
            className="text-xs font-medium"
            style={{
              color: GRIS_MEDIO,
            }}
          >
            Total vendido
          </p>

          <p
            className="mt-2 text-2xl font-bold"
            style={{
              color:
                GRIS_OSCURO,
            }}
          >
            S/{' '}
            {totalVentas.toFixed(
              2
            )}
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
            className="text-xs font-medium"
            style={{
              color: GRIS_MEDIO,
            }}
          >
            Vector de ventas
          </p>

          <p
            className="mt-2 truncate font-mono text-sm font-semibold"
            style={{
              color: GRIS_MARCA,
            }}
          >
            {vectorA
              ? `[${vectorA}]`
              : 'Sin datos'}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">

        {/* MENÚ */}

        <div
          className="rounded-2xl border p-5 shadow-sm"
          style={{
            borderColor:
              GRIS_SUAVE,
            backgroundColor:
              BLANCO,
          }}
        >
          <div className="mb-5">
            <h3
              className="text-base font-semibold"
              style={{
                color: NEGRO,
              }}
            >
              Operación
            </h3>

            <p
              className="mt-1 text-xs"
              style={{
                color: GRIS_MEDIO,
              }}
            >
              Selecciona el cálculo que deseas realizar
            </p>
          </div>

          <div className="space-y-2">
            {operaciones.map(
              (item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setOperacion(
                      item.id
                    );
                    limpiar();
                  }}
                  className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition"
                  style={
                    operacion ===
                    item.id
                      ? {
                          backgroundColor:
                            GRIS_OSCURO,
                          color:
                            BLANCO,
                        }
                      : {
                          backgroundColor:
                            GRIS_MUY_SUAVE,
                          color:
                            NEGRO,
                        }
                  }
                >
                  <span
                    className="flex h-8 w-8 items-center justify-center rounded-lg"
                    style={{
                      backgroundColor:
                        operacion ===
                        item.id
                          ? 'rgba(255,255,255,0.14)'
                          : GRIS_SUAVE,
                      color:
                        operacion ===
                        item.id
                          ? BLANCO
                          : GRIS_MARCA,
                    }}
                  >
                    {item.icono}
                  </span>

                  {item.nombre}
                </button>
              )
            )}
          </div>
        </div>

        {/* DATOS */}

        <div
          className="rounded-2xl border p-6 shadow-sm lg:col-span-2"
          style={{
            borderColor:
              GRIS_SUAVE,
            backgroundColor:
              BLANCO,
          }}
        >

          {/* DATOS REALES */}

          <div
            className="mb-6 rounded-2xl border p-5"
            style={{
              borderColor:
                GRIS_SUAVE,
              backgroundColor:
                GRIS_MUY_SUAVE,
            }}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3
                  className="text-base font-semibold"
                  style={{
                    color:
                      GRIS_OSCURO,
                  }}
                >
                  Datos reales de ventas
                </h3>

                <p
                  className="mt-1 text-xs"
                  style={{
                    color: GRIS_MEDIO,
                  }}
                >
                  Los valores se obtienen
                  automáticamente del módulo
                  de Ventas.
                </p>
              </div>

              <button
                type="button"
                onClick={
                  cargarVentas
                }
                disabled={
                  cargandoVentas
                }
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
                style={{
                  backgroundColor:
                    GRIS_OSCURO,
                }}
              >
                <RefreshCw
                  size={14}
                />

                {cargandoVentas
                  ? 'Cargando...'
                  : 'Actualizar'}
              </button>
            </div>

            {cargandoVentas ? (
              <p
                className="mt-4 text-sm"
                style={{
                  color: GRIS_MEDIO,
                }}
              >
                Cargando ventas...
              </p>
            ) : ventas.length ===
              0 ? (
              <p
                className="mt-4 text-sm"
                style={{
                  color: GRIS_MEDIO,
                }}
              >
                No hay ventas registradas
                todavía.
              </p>
            ) : (
              <>
                <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {ventas.map(
                    (
                      venta: any,
                      index: number
                    ) => (
                      <div
                        key={
                          venta.id ??
                          index
                        }
                        className="rounded-xl border p-3"
                        style={{
                          borderColor:
                            GRIS_SUAVE,
                          backgroundColor:
                            BLANCO,
                        }}
                      >
                        <div
                          className="text-xs"
                          style={{
                            color:
                              GRIS_MEDIO,
                          }}
                        >
                          Venta #
                          {venta.id ??
                            index +
                              1}
                        </div>

                        <div
                          className="mt-1 text-lg font-bold"
                          style={{
                            color:
                              GRIS_OSCURO,
                          }}
                        >
                          S/{' '}
                          {String(
                            venta.total ??
                              0
                          )}
                        </div>
                      </div>
                    )
                  )}
                </div>

                <div
                  className="mt-4 rounded-xl border p-4"
                  style={{
                    borderColor:
                      GRIS_SUAVE,
                    backgroundColor:
                      BLANCO,
                  }}
                >
                  <div
                    className="text-xs font-medium"
                    style={{
                      color: GRIS_MEDIO,
                    }}
                  >
                    Vector generado
                    automáticamente
                  </div>

                  <div
                    className="mt-2 break-all font-mono text-sm font-semibold"
                    style={{
                      color: NEGRO,
                    }}
                  >
                    [
                    {ventas
                      .map(
                        (
                          venta: any
                        ) =>
                          String(
                            venta.total ??
                              0
                          )
                      )
                      .join(
                        ', '
                      )}
                    ]
                  </div>
                </div>
              </>
            )}
          </div>

          {/* DATOS DE ENTRADA */}

          <div className="mb-6">
            <h3
              className="text-lg font-semibold"
              style={{
                color: NEGRO,
              }}
            >
              Datos de entrada
            </h3>

            <p
              className="mt-1 text-sm"
              style={{
                color: GRIS_MEDIO,
              }}
            >
              Escribe los valores separados
              por comas. Los números grandes
              se conservan como texto para
              evitar pérdida de precisión.
            </p>
          </div>

          {!necesitaMatriz ? (
            <div className="space-y-5">

              {/* VECTOR A */}

              <div>
                <label
                  className="mb-2 block text-sm font-medium"
                  style={{
                    color: NEGRO,
                  }}
                >
                  Vector A
                </label>

                <input
                  value={vectorA}
                  onChange={(e) =>
                    setVectorA(
                      e.target.value
                    )
                  }
                  placeholder="Ejemplo: 999999999999999999,888888888888888888"
                  className="w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none"
                  style={{
                    borderColor:
                      '#D1D5DB',
                    color: NEGRO,
                  }}
                />

                <p
                  className="mt-1.5 text-xs"
                  style={{
                    color: GRIS_MEDIO,
                  }}
                >
                  Se carga automáticamente
                  con los totales de las ventas.
                </p>
              </div>

              {/* VECTOR B */}

              {necesitaVectorB && (
                <div>
                  <label
                    className="mb-2 block text-sm font-medium"
                    style={{
                      color: NEGRO,
                    }}
                  >
                    Vector B
                  </label>

                  <input
                    value={vectorB}
                    onChange={(e) =>
                      setVectorB(
                        e.target.value
                      )
                    }
                    placeholder="Ejemplo: 111111111111111111,222222222222222222"
                    className="w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none"
                    style={{
                      borderColor:
                        '#D1D5DB',
                      color: NEGRO,
                    }}
                  />

                  <p
                    className="mt-1.5 text-xs"
                    style={{
                      color: GRIS_MEDIO,
                    }}
                  >
                    Para suma, resta y
                    producto punto debe tener
                    la misma cantidad de elementos
                    que Vector A.
                  </p>
                </div>
              )}

              {/* ESCALAR */}

              {operacion ===
                'escalar' && (
                <div>
                  <label
                    className="mb-2 block text-sm font-medium"
                    style={{
                      color: NEGRO,
                    }}
                  >
                    Escalar
                  </label>

                  <input
                    type="text"
                    inputMode="decimal"
                    value={escalar}
                    onChange={(e) =>
                      setEscalar(
                        e.target.value
                      )
                    }
                    placeholder="Ejemplo: 999999999999999999999"
                    className="w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none"
                    style={{
                      borderColor:
                        '#D1D5DB',
                      color: NEGRO,
                    }}
                  />
                </div>
              )}

              {/* ESCALARES */}

              {operacion ===
                'combinacion' && (
                <div>
                  <label
                    className="mb-2 block text-sm font-medium"
                    style={{
                      color: NEGRO,
                    }}
                  >
                    Escalares
                  </label>

                  <input
                    type="text"
                    value={escalares}
                    onChange={(e) =>
                      setEscalares(
                        e.target.value
                      )
                    }
                    placeholder="Ejemplo: 2,3"
                    className="w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none"
                    style={{
                      borderColor:
                        '#D1D5DB',
                      color: NEGRO,
                    }}
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-5">

              {/* MATRIZ A */}

              <div>
                <label
                  className="mb-2 block text-sm font-medium"
                  style={{
                    color: NEGRO,
                  }}
                >
                  Matriz A
                </label>

                <textarea
                  value={matrizA}
                  onChange={(e) =>
                    setMatrizA(
                      e.target.value
                    )
                  }
                  rows={4}
                  placeholder={
                    '1,2\n3,4'
                  }
                  className="w-full resize-none rounded-xl border bg-white px-4 py-3 font-mono text-sm outline-none"
                  style={{
                    borderColor:
                      '#D1D5DB',
                    color: NEGRO,
                  }}
                />

                <p
                  className="mt-1.5 text-xs"
                  style={{
                    color: GRIS_MEDIO,
                  }}
                >
                  Una fila por línea y valores
                  separados por comas.
                </p>
              </div>

              {/* MATRIZ B */}

              {operacion ===
                'matrices' && (
                <div>
                  <label
                    className="mb-2 block text-sm font-medium"
                    style={{
                      color: NEGRO,
                    }}
                  >
                    Matriz B
                  </label>

                  <textarea
                    value={matrizB}
                    onChange={(e) =>
                      setMatrizB(
                        e.target.value
                      )
                    }
                    rows={4}
                    placeholder={
                      '5,6\n7,8'
                    }
                    className="w-full resize-none rounded-xl border bg-white px-4 py-3 font-mono text-sm outline-none"
                    style={{
                      borderColor:
                        '#D1D5DB',
                      color: NEGRO,
                    }}
                  />

                  <p
                    className="mt-1.5 text-xs"
                    style={{
                      color: GRIS_MEDIO,
                    }}
                  >
                    Una fila por línea y valores
                    separados por comas.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* BOTONES */}

          <div className="mt-7 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={
                ejecutar
              }
              disabled={
                cargando
              }
              className="rounded-xl px-6 py-3 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50"
              style={{
                backgroundColor:
                  GRIS_OSCURO,
              }}
            >
              {cargando
                ? 'Calculando...'
                : 'Calcular'}
            </button>

            <button
              type="button"
              onClick={
                limpiar
              }
              className="rounded-xl border bg-white px-6 py-3 text-sm font-semibold"
              style={{
                borderColor:
                  '#D1D5DB',
                color: NEGRO,
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
                borderColor:
                  '#D1D5DB',
                backgroundColor:
                  GRIS_MUY_SUAVE,
                color:
                  GRIS_OSCURO,
              }}
            >
              <div className="font-semibold">
                No se pudo realizar la operación
              </div>

              <div className="mt-1">
                {error}
              </div>
            </div>
          )}

          {/* RESULTADO */}

          {resultado !== null && (
            <div
              className="mt-6 rounded-2xl border p-5"
              style={{
                borderColor:
                  GRIS_SUAVE,
                backgroundColor:
                  GRIS_MUY_SUAVE,
              }}
            >
              <div className="mb-3 flex items-center gap-2">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-lg"
                  style={{
                    backgroundColor:
                      GRIS_MARCA,
                    color:
                      BLANCO,
                  }}
                >
                  <Calculator
                    size={16}
                  />
                </div>

                <h3
                  className="font-semibold"
                  style={{
                    color:
                      GRIS_OSCURO,
                  }}
                >
                  Resultado
                </h3>
              </div>

              <pre
                className="overflow-auto rounded-xl border bg-white p-4 font-mono text-sm"
                style={{
                  borderColor:
                    GRIS_SUAVE,
                  color: NEGRO,
                }}
              >
                {JSON.stringify(
                  resultado,
                  null,
                  2
                )}
              </pre>

              <p
                className="mt-3 text-xs font-medium"
                style={{
                  color:
                    GRIS_MARCA,
                }}
              >
                ✓ Operación realizada
                correctamente.
              </p>
            </div>
          )}

          {/* IDENTIDAD EMPRESARIAL */}

          <div
            className="mt-6 rounded-xl border px-4 py-3"
            style={{
              borderColor:
                GRIS_SUAVE,
              backgroundColor:
                GRIS_MUY_SUAVE,
            }}
          >
            <p
              className="text-xs font-semibold"
              style={{
                color: GRIS_OSCURO,
              }}
            >
              {EMPRESA_NOMBRE}
            </p>

            <p
              className="mt-1 text-xs"
              style={{
                color: GRIS_MEDIO,
              }}
            >
              {EMPRESA_RUBRO} · Gerente: {EMPRESA_GERENTE}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

