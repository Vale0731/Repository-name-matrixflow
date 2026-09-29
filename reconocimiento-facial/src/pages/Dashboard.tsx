import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Bell,
  Box,
  Calculator,
  CircleDollarSign,
  Package,
  RefreshCw,
  Target,
  TrendingUp,
} from 'lucide-react';

import API from '../services/api';

/* =========================================================
   PALETA MATRIXFLOW
========================================================= */

const VINO = '#5c4a51';
const VINO_OSCURO = '#756168';
const VINO_SUAVE = '#F8E9EE';
const GRIS_FONDO = '#F3F3F1';
const GRIS = '#6B7280';
const NEGRO = '#111111';

/* =========================================================
   TIPOS
========================================================= */

type Venta = {
  id: number;
  sucursal_id: number;
  total: number;
  estado: string;
};

type Inventario = {
  id: number;
  sucursal_id: number;
  producto_id: number;
  cantidad: number;
  estado: string;
};

type Producto = {
  id: number;
  nombre: string;
  categoria: string;
  precio: number;
  estado: string;
};

type Sucursal = {
  id: number;
  nombre: string;
  ciudad: string;
  direccion: string;
  estado: string;
};

type Meta = {
  id: number;
  nombre: string;
  tipo: string;
  valor_objetivo: number;
  periodo: string;
  sucursal_id: number;
  estado: string;
};

type Operacion = {
  id: number;
  tipo: string;
  estado: string;
};

type DashboardData = {
  ventas: Venta[];
  inventario: Inventario[];
  productos: Producto[];
  sucursales: Sucursal[];
  metas: Meta[];
  operaciones: Operacion[];
};

const emptyData: DashboardData = {
  ventas: [],
  inventario: [],
  productos: [],
  sucursales: [],
  metas: [],
  operaciones: [],
};

/* =========================================================
   FORMATOS
========================================================= */

const money = new Intl.NumberFormat('es-PE', {
  style: 'currency',
  currency: 'PEN',
  minimumFractionDigits: 2,
});

const number = new Intl.NumberFormat('es-PE');

function formatMoney(value: number) {
  return money.format(value || 0);
}

function formatNumber(value: number) {
  return number.format(value || 0);
}

/* =========================================================
   OPERACIONES
========================================================= */

function getOperationLabel(tipo: string) {
  const labels: Record<string, string> = {
    SUMA_VECTORES: 'Suma de vectores',
    RESTA_VECTORES: 'Resta de vectores',
    PRODUCTO_PUNTO: 'Producto punto',
    MULTIPLICACION_ESCALAR: 'Multiplicación por escalar',
    TRANSPUESTA: 'Transpuesta',
    MULTIPLICACION_MATRICES: 'Multiplicación de matrices',
    COMBINACION_LINEAL: 'Combinación lineal',
  };

  return labels[tipo] || tipo.replaceAll('_', ' ');
}

/* =========================================================
   DASHBOARD
========================================================= */

export default function Dashboard() {
  const [data, setData] = useState<DashboardData>(emptyData);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState('');

  /* =======================================================
     CARGAR DATOS
  ======================================================= */

  async function cargarDashboard() {
    try {
      setLoading(true);
      setError('');

      const responses = await Promise.all([
        fetch(`${API}/ventas`),
        fetch(`${API}/inventario`),
        fetch(`${API}/productos`),
        fetch(`${API}/sucursales`),
        fetch(`${API}/metas`),
        fetch(`${API}/operaciones`),
      ]);

      for (const response of responses) {
        if (!response.ok) {
          throw new Error(
            'No se pudieron cargar los datos del dashboard.'
          );
        }
      }

      const [
        ventas,
        inventario,
        productos,
        sucursales,
        metas,
        operaciones,
      ] = await Promise.all(
        responses.map((response) => response.json())
      );

      setData({
        ventas: Array.isArray(ventas) ? ventas : [],
        inventario: Array.isArray(inventario) ? inventario : [],
        productos: Array.isArray(productos) ? productos : [],
        sucursales: Array.isArray(sucursales) ? sucursales : [],
        metas: Array.isArray(metas) ? metas : [],
        operaciones: Array.isArray(operaciones) ? operaciones : [],
      });
    } catch (err) {
      console.error(err);

      setError(
        'No se pudieron cargar los datos. Verifica que el backend esté activo.'
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    cargarDashboard();
  }, []);

  /* =======================================================
     MÉTRICAS
  ======================================================= */

  const ventasCompletadas = useMemo(
    () =>
      data.ventas.filter(
        (venta) =>
          venta.estado?.toLowerCase() === 'completada' ||
          venta.estado?.toLowerCase() === 'completado'
      ),
    [data.ventas]
  );

  const ventasAcumuladas = useMemo(
    () =>
      ventasCompletadas.reduce(
        (total, venta) => total + Number(venta.total || 0),
        0
      ),
    [ventasCompletadas]
  );

  const productosActivos = useMemo(
    () =>
      data.productos.filter(
        (producto) =>
          producto.estado?.toLowerCase() === 'activo'
      ).length,
    [data.productos]
  );

  const unidadesInventario = useMemo(
    () =>
      data.inventario.reduce(
        (total, item) =>
          total + Number(item.cantidad || 0),
        0
      ),
    [data.inventario]
  );

  const metaVentas = useMemo(() => {
    const metasVentas = data.metas.filter(
      (meta) =>
        meta.estado?.toLowerCase() === 'activo' &&
        meta.tipo?.toLowerCase().includes('venta') &&
        Number(meta.valor_objetivo) > 0
    );

    if (!metasVentas.length) {
      return null;
    }

    return metasVentas[0];
  }, [data.metas]);

  const cumplimientoMeta = useMemo(() => {
    if (!metaVentas) {
      return null;
    }

    const porcentaje =
      (ventasAcumuladas /
        Number(metaVentas.valor_objetivo)) *
      100;

    return Math.min(Math.max(porcentaje, 0), 100);
  }, [metaVentas, ventasAcumuladas]);

  /* =======================================================
     VENTAS POR SUCURSAL
  ======================================================= */

  const ventasPorSucursal = useMemo(() => {
    return data.sucursales
      .map((sucursal) => {
        const total = data.ventas
          .filter(
            (venta) =>
              venta.sucursal_id === sucursal.id
          )
          .reduce(
            (sum, venta) =>
              sum + Number(venta.total || 0),
            0
          );

        return {
          ...sucursal,
          total,
        };
      })
      .sort((a, b) => b.total - a.total);
  }, [data.sucursales, data.ventas]);

  const maxVentaSucursal = useMemo(
    () =>
      Math.max(
        ...ventasPorSucursal.map(
          (sucursal) => sucursal.total
        ),
        1
      ),
    [ventasPorSucursal]
  );

  /* =======================================================
     INVENTARIO POR PRODUCTO
  ======================================================= */

  const unidadesPorProducto = useMemo(() => {
    return data.productos
      .map((producto) => {
        const unidades = data.inventario
          .filter(
            (item) =>
              item.producto_id === producto.id
          )
          .reduce(
            (sum, item) =>
              sum + Number(item.cantidad || 0),
            0
          );

        return {
          id: producto.id,
          nombre: producto.nombre,
          unidades,
        };
      })
      .filter(
        (producto) => producto.unidades > 0
      )
      .sort(
        (a, b) =>
          b.unidades - a.unidades
      );
  }, [data.productos, data.inventario]);

  const maxUnidadesProducto = useMemo(
    () =>
      Math.max(
        ...unidadesPorProducto.map(
          (producto) => producto.unidades
        ),
        1
      ),
    [unidadesPorProducto]
  );

  /* =======================================================
     ALERTAS
  ======================================================= */

  const inventarioAlertas = useMemo(
    () =>
      data.inventario.filter(
        (item) =>
          Number(item.cantidad || 0) <= 5
      ).length,
    [data.inventario]
  );

  /* =======================================================
     OPERACIONES RECIENTES
  ======================================================= */

  const operacionesRecientes = useMemo(
    () =>
      [...data.operaciones]
        .reverse()
        .slice(0, 5),
    [data.operaciones]
  );

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <div
        className="flex min-h-[calc(100vh-74px)] items-center justify-center"
        style={{
          backgroundColor: GRIS_FONDO,
        }}
      >
        <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-6 py-4 shadow-sm">
          <RefreshCw
            className="h-5 w-5 animate-spin"
            style={{
              color: VINO,
            }}
          />

          <span
            className="text-sm font-medium"
            style={{
              color: GRIS,
            }}
          >
            Cargando dashboard...
          </span>
        </div>
      </div>
    );
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div
      className="min-h-full"
      style={{
        backgroundColor: GRIS_FONDO,
      }}
    >
      <div className="mx-auto max-w-[1500px] space-y-6 p-5 lg:p-7">

        {/* ENCABEZADO */}

        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <div
              className="mb-1 flex items-center gap-2 text-sm font-semibold"
              style={{
                color: VINO,
              }}
            >
              <BarChart3 className="h-4 w-4" />

              PANEL EJECUTIVO
            </div>

            <h1
              className="text-3xl font-bold tracking-tight"
              style={{
                color: NEGRO,
              }}
            >
              Dashboard
            </h1>

            <p
              className="mt-1 text-sm"
              style={{
                color: GRIS,
              }}
            >
              Resumen de ventas, inventario y actividad
              matemática de la empresa.
            </p>
          </div>

          <button
            type="button"
            onClick={cargarDashboard}
            className="inline-flex items-center justify-center gap-2 rounded-xl border bg-white px-4 py-2.5 text-sm font-semibold shadow-sm transition hover:shadow-md"
            style={{
              borderColor: '#E5E5E5',
              color: NEGRO,
            }}
          >
            <RefreshCw className="h-4 w-4" />

            Actualizar
          </button>
        </div>

        {/* ERROR */}

        {error && (
          <div
            className="flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm"
            style={{
              borderColor: '#E7C7D2',
              backgroundColor: VINO_SUAVE,
              color: VINO_OSCURO,
            }}
          >
            <AlertTriangle className="h-5 w-5 shrink-0" />

            {error}
          </div>
        )}

        {/* KPIs */}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

          <KpiCard
            title="Ventas acumuladas"
            value={formatMoney(ventasAcumuladas)}
            icon={
              <CircleDollarSign className="h-5 w-5" />
            }
            trend={
              ventasCompletadas.length
                ? `${ventasCompletadas.length} ventas registradas`
                : 'Sin ventas registradas'
            }
            positive={ventasCompletadas.length > 0}
          />

          <KpiCard
            title="Productos activos"
            value={formatNumber(productosActivos)}
            icon={
              <Package className="h-5 w-5" />
            }
            trend={`${data.productos.length} productos registrados`}
            positive={productosActivos > 0}
          />

          <KpiCard
            title="Inventario"
            value={formatNumber(unidadesInventario)}
            icon={
              <Box className="h-5 w-5" />
            }
            trend={
              inventarioAlertas > 0
                ? `${inventarioAlertas} alertas de stock`
                : 'Inventario sin alertas'
            }
            positive={inventarioAlertas === 0}
            warning={inventarioAlertas > 0}
          />

          <KpiCard
            title="Cumplimiento de meta"
            value={
              cumplimientoMeta === null
                ? '—'
                : `${cumplimientoMeta.toFixed(1)}%`
            }
            icon={
              <Target className="h-5 w-5" />
            }
            trend={
              metaVentas
                ? `Meta: ${formatMoney(
                    Number(metaVentas.valor_objetivo)
                  )}`
                : 'No hay una meta de ventas activa'
            }
            positive={cumplimientoMeta !== null}
          />
        </div>

        {/* BLOQUE PRINCIPAL */}

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.8fr_1fr]">

          {/* VENTAS POR SUCURSAL */}

          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

            <div className="mb-6 flex items-start justify-between">
              <div>
                <h2
                  className="text-base font-bold"
                  style={{
                    color: NEGRO,
                  }}
                >
                  Ventas por sucursal
                </h2>

                <p
                  className="mt-1 text-xs"
                  style={{
                    color: GRIS,
                  }}
                >
                  Importe acumulado por sede
                </p>
              </div>

              <div
                className="rounded-xl p-2.5"
                style={{
                  backgroundColor: VINO_SUAVE,
                  color: VINO,
                }}
              >
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>

            {ventasPorSucursal.length === 0 ? (
              <EmptyState message="Todavía no hay sucursales registradas." />
            ) : (
              <div className="space-y-5">
                {ventasPorSucursal
                  .slice(0, 6)
                  .map((sucursal) => (
                    <div key={sucursal.id}>

                      <div className="mb-2 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p
                            className="truncate text-sm font-semibold"
                            style={{
                              color: NEGRO,
                            }}
                          >
                            {sucursal.nombre}
                          </p>

                          <p
                            className="text-xs"
                            style={{
                              color: GRIS,
                            }}
                          >
                            {sucursal.ciudad}
                          </p>
                        </div>

                        <span
                          className="shrink-0 text-sm font-bold"
                          style={{
                            color: NEGRO,
                          }}
                        >
                          {formatMoney(sucursal.total)}
                        </span>
                      </div>

                      <div className="h-3 overflow-hidden rounded-full bg-gray-100">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${Math.max(
                              (sucursal.total /
                                maxVentaSucursal) *
                                100,
                              sucursal.total > 0
                                ? 3
                                : 0
                            )}%`,
                            backgroundColor: VINO,
                          }}
                        />
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </section>

          {/* INVENTARIO */}

          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

            <div className="mb-6 flex items-start justify-between">
              <div>
                <h2
                  className="text-base font-bold"
                  style={{
                    color: NEGRO,
                  }}
                >
                  Unidades por producto
                </h2>

                <p
                  className="mt-1 text-xs"
                  style={{
                    color: GRIS,
                  }}
                >
                  Distribución del inventario registrado
                </p>
              </div>

              <div
                className="rounded-xl p-2.5"
                style={{
                  backgroundColor: VINO_SUAVE,
                  color: VINO,
                }}
              >
                <Package className="h-5 w-5" />
              </div>
            </div>

            {unidadesPorProducto.length === 0 ? (
              <EmptyState message="Todavía no hay unidades de productos." />
            ) : (
              <div className="space-y-5">
                {unidadesPorProducto
                  .slice(0, 6)
                  .map((producto) => (
                    <div key={producto.id}>

                      <div className="mb-2 flex items-center justify-between gap-3">
                        <p
                          className="truncate text-sm font-semibold"
                          style={{
                            color: NEGRO,
                          }}
                        >
                          {producto.nombre}
                        </p>

                        <span
                          className="shrink-0 text-sm font-bold"
                          style={{
                            color: NEGRO,
                          }}
                        >
                          {formatNumber(producto.unidades)} und.
                        </span>
                      </div>

                      <div className="h-3 overflow-hidden rounded-full bg-gray-100">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${Math.max(
                              (producto.unidades /
                                maxUnidadesProducto) *
                                100,
                              3
                            )}%`,
                            backgroundColor: VINO_OSCURO,
                          }}
                        />
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </section>
        </div>

        {/* PARTE INFERIOR */}

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.5fr_1fr]">

          {/* ACTIVIDAD MATEMÁTICA */}

          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

            <div className="mb-5 flex items-start justify-between">
              <div>
                <h2
                  className="text-base font-bold"
                  style={{
                    color: NEGRO,
                  }}
                >
                  Actividad matemática reciente
                </h2>

                <p
                  className="mt-1 text-xs"
                  style={{
                    color: GRIS,
                  }}
                >
                  Últimas operaciones registradas
                </p>
              </div>

              <div
                className="rounded-xl p-2.5"
                style={{
                  backgroundColor: VINO_SUAVE,
                  color: VINO,
                }}
              >
                <Calculator className="h-5 w-5" />
              </div>
            </div>

            {operacionesRecientes.length === 0 ? (
              <EmptyState message="Todavía no hay operaciones registradas." />
            ) : (
              <div className="divide-y divide-gray-100">
                {operacionesRecientes.map((operacion) => (
                  <div
                    key={operacion.id}
                    className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
                  >
                    <div className="flex min-w-0 items-center gap-3">

                      <div
                        className="rounded-xl p-2.5"
                        style={{
                          backgroundColor: VINO_SUAVE,
                          color: VINO,
                        }}
                      >
                        <Activity className="h-4 w-4" />
                      </div>

                      <div className="min-w-0">
                        <p
                          className="truncate text-sm font-semibold"
                          style={{
                            color: NEGRO,
                          }}
                        >
                          {getOperationLabel(operacion.tipo)}
                        </p>

                        <p
                          className="text-xs"
                          style={{
                            color: GRIS,
                          }}
                        >
                          Operación #{operacion.id}
                        </p>
                      </div>
                    </div>

                    <span
                      className="shrink-0 rounded-full px-3 py-1 text-xs font-semibold"
                      style={{
                        backgroundColor: '#F1F1F1',
                        color: VINO_OSCURO,
                      }}
                    >
                      {operacion.estado || 'Completada'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* ESTADO OPERATIVO */}

          <section
            className="overflow-hidden rounded-2xl p-5 text-white shadow-sm"
            style={{
              backgroundColor: NEGRO,
            }}
          >
            <div className="mb-6 flex items-start justify-between">

              <div>
                <p
                  className="text-sm font-semibold"
                  style={{
                    color: '#D7A7B8',
                  }}
                >
                  Indicador destacado
                </p>

                <h2 className="mt-1 text-xl font-bold">
                  Estado operativo
                </h2>
              </div>

              <div
                className="rounded-xl p-2.5"
                style={{
                  backgroundColor: VINO,
                }}
              >
                <Bell className="h-5 w-5 text-white" />
              </div>
            </div>

            <div className="space-y-4">

              <SummaryRow
                label="Ventas registradas"
                value={formatNumber(data.ventas.length)}
              />

              <SummaryRow
                label="Sucursales"
                value={formatNumber(data.sucursales.length)}
              />

              <SummaryRow
                label="Productos"
                value={formatNumber(data.productos.length)}
              />

              <SummaryRow
                label="Alertas de inventario"
                value={formatNumber(inventarioAlertas)}
                danger={inventarioAlertas > 0}
              />
            </div>

            <div
              className="mt-6 rounded-xl border p-4"
              style={{
                borderColor: 'rgba(255,255,255,0.10)',
                backgroundColor: 'rgba(255,255,255,0.04)',
              }}
            >
              <div className="flex items-center gap-3">

                {inventarioAlertas > 0 ? (
                  <ArrowDownRight
                    className="h-5 w-5"
                    style={{
                      color: '#D7A7B8',
                    }}
                  />
                ) : (
                  <ArrowUpRight
                    className="h-5 w-5"
                    style={{
                      color: '#D7A7B8',
                    }}
                  />
                )}

                <div>
                  <p className="text-sm font-semibold">
                    {inventarioAlertas > 0
                      ? 'Revisar inventario'
                      : 'Operación estable'}
                  </p>

                  <p className="mt-0.5 text-xs text-gray-400">
                    {inventarioAlertas > 0
                      ? 'Hay productos con stock bajo.'
                      : 'No se detectaron alertas de stock.'}
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* MINI ESTADÍSTICAS */}

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">

          <MiniStat
            icon={
              <CircleDollarSign className="h-4 w-4" />
            }
            label="Total vendido"
            value={formatMoney(ventasAcumuladas)}
          />

          <MiniStat
            icon={
              <Package className="h-4 w-4" />
            }
            label="Productos activos"
            value={formatNumber(productosActivos)}
          />

          <MiniStat
            icon={
              <Box className="h-4 w-4" />
            }
            label="Unidades"
            value={formatNumber(unidadesInventario)}
          />

          <MiniStat
            icon={
              <Target className="h-4 w-4" />
            }
            label="Metas activas"
            value={formatNumber(
              data.metas.filter(
                (meta) =>
                  meta.estado?.toLowerCase() === 'activo'
              ).length
            )}
          />
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   KPI CARD
========================================================= */

function KpiCard({
  title,
  value,
  icon,
  trend,
  positive,
  warning = false,
}: {
  title: string;
  value: string;
  icon: ReactNode;
  trend: string;
  positive: boolean;
  warning?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">

      <div className="flex items-start justify-between">

        <div
          className="rounded-xl p-2.5"
          style={{
            backgroundColor: VINO_SUAVE,
            color: VINO,
          }}
        >
          {icon}
        </div>

        <div
          className="flex items-center gap-1 text-xs font-semibold"
          style={{
            color: warning
              ? VINO_OSCURO
              : positive
                ? VINO
                : '#9CA3AF',
          }}
        >
          {warning ? (
            <AlertTriangle className="h-3.5 w-3.5" />
          ) : positive ? (
            <ArrowUpRight className="h-3.5 w-3.5" />
          ) : null}

          {positive
            ? 'Activo'
            : warning
              ? 'Atención'
              : 'Información'}
        </div>
      </div>

      <p
        className="mt-5 text-xs font-medium"
        style={{
          color: GRIS,
        }}
      >
        {title}
      </p>

      <p
        className="mt-1 text-2xl font-bold tracking-tight"
        style={{
          color: NEGRO,
        }}
      >
        {value}
      </p>

      <p
        className="mt-2 truncate text-xs"
        style={{
          color: '#9CA3AF',
        }}
      >
        {trend}
      </p>
    </div>
  );
}

/* =========================================================
   SUMMARY ROW
========================================================= */

function SummaryRow({
  label,
  value,
  danger = false,
}: {
  label: string;
  value: string;
  danger?: boolean;
}) {
  return (
    <div className="flex items-center justify-between border-b border-white/10 pb-3 last:border-0 last:pb-0">

      <span className="text-sm text-gray-400">
        {label}
      </span>

      <span
        className="text-sm font-bold"
        style={{
          color: danger
            ? '#D7A7B8'
            : '#FFFFFF',
        }}
      >
        {value}
      </span>
    </div>
  );
}

/* =========================================================
   MINI STAT
========================================================= */

function MiniStat({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">

      <div
        className="rounded-xl p-2.5"
        style={{
          backgroundColor: VINO_SUAVE,
          color: VINO,
        }}
      >
        {icon}
      </div>

      <div className="min-w-0">

        <p
          className="truncate text-xs"
          style={{
            color: '#9CA3AF',
          }}
        >
          {label}
        </p>

        <p
          className="truncate text-sm font-bold"
          style={{
            color: NEGRO,
          }}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   EMPTY STATE
========================================================= */

function EmptyState({
  message,
}: {
  message: string;
}) {
  return (
    <div className="flex min-h-32 items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 text-center text-sm text-gray-400">
      {message}
    </div>
  );
}