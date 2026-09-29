import { useEffect, useState } from 'react';
import API from '../services/api';
import {
  BarChart3,
  RefreshCw,
  ShoppingCart,
  Boxes,
  Calculator,
  TrendingUp,
} from 'lucide-react';

const VINO = '#775b66';
const VINO_OSCURO = '#6B4652';
const VINO_SUAVE = '#F8E9EE';
const GRIS_FONDO = '#F3F3F1';
const GRIS = '#6B7280';
const NEGRO = '#111111';

interface Venta {
  id: number;
  total: number;
  estado?: string;
}

interface Inventario {
  id: number;
  producto_id: number;
  cantidad: number;
  estado?: string;
}

interface Operacion {
  id?: number;
  tipo?: string;
  operacion?: string;
  estado?: string;
}

export default function Reportes() {
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [inventario, setInventario] = useState<Inventario[]>([]);
  const [operaciones, setOperaciones] = useState<Operacion[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  const cargarDatos = async () => {
    setCargando(true);
    setError('');

    try {
      const [ventasRes, inventarioRes, operacionesRes] =
        await Promise.all([
          fetch(`${API}/ventas`),
          fetch(`${API}/inventario`),
          fetch(`${API}/operaciones`),
        ]);

      const ventasData = await ventasRes.json();
      const inventarioData = await inventarioRes.json();
      const operacionesData = await operacionesRes.json();

      if (!ventasRes.ok) {
        throw new Error('No se pudieron cargar las ventas');
      }

      if (!inventarioRes.ok) {
        throw new Error('No se pudo cargar el inventario');
      }

      if (!operacionesRes.ok) {
        throw new Error('No se pudo cargar el historial');
      }

      setVentas(
        Array.isArray(ventasData)
          ? ventasData
          : ventasData.ventas ?? []
      );

      setInventario(
        Array.isArray(inventarioData)
          ? inventarioData
          : inventarioData.inventarios ?? []
      );

      setOperaciones(
        Array.isArray(operacionesData)
          ? operacionesData
          : operacionesData.operaciones ?? []
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

  useEffect(() => {
    cargarDatos();
  }, []);

  const totalVentas = ventas.reduce(
    (total, venta) => total + Number(venta.total || 0),
    0
  );

  const unidadesInventario = inventario.reduce(
    (total, item) => total + Number(item.cantidad || 0),
    0
  );

  const ventasCompletadas = ventas.filter(
    (venta) =>
      String(venta.estado ?? '').toLowerCase() === 'completada'
  ).length;

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
            <BarChart3 size={25} />
          </div>

          <div>
            <h2
              className="text-2xl font-bold"
              style={{ color: NEGRO }}
            >
              Reportes
            </h2>

            <p
              className="mt-1 text-sm"
              style={{ color: GRIS }}
            >
              Resumen general de MatrixFlow Enterprise
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={cargarDatos}
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
          className="rounded-xl border p-4 text-sm"
          style={{
            borderColor: '#E8C9D1',
            backgroundColor: '#FDF3F5',
            color: '#8A3D4F',
          }}
        >
          {error}
        </div>
      )}

      {/* KPIs */}

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {/* VENTAS */}

        <div
          className="rounded-2xl border bg-white p-5 shadow-sm"
          style={{ borderColor: '#E5E5E5' }}
        >
          <div className="flex items-center justify-between">
            <p
              className="text-sm"
              style={{ color: GRIS }}
            >
              Ventas registradas
            </p>

            <div
              className="flex h-9 w-9 items-center justify-center rounded-xl"
              style={{
                backgroundColor: VINO_SUAVE,
                color: VINO,
              }}
            >
              <ShoppingCart size={19} />
            </div>
          </div>

          <p
            className="mt-3 text-3xl font-bold"
            style={{ color: NEGRO }}
          >
            {ventas.length}
          </p>

          <p
            className="mt-1 text-xs"
            style={{ color: GRIS }}
          >
            Registros de ventas
          </p>
        </div>

        {/* TOTAL VENDIDO */}

        <div
          className="rounded-2xl border bg-white p-5 shadow-sm"
          style={{ borderColor: '#E5E5E5' }}
        >
          <div className="flex items-center justify-between">
            <p
              className="text-sm"
              style={{ color: GRIS }}
            >
              Total vendido
            </p>

            <div
              className="flex h-9 w-9 items-center justify-center rounded-xl"
              style={{
                backgroundColor: VINO_SUAVE,
                color: VINO_OSCURO,
              }}
            >
              <TrendingUp size={19} />
            </div>
          </div>

          <p
            className="mt-3 text-3xl font-bold"
            style={{ color: VINO_OSCURO }}
          >
            S/ {totalVentas.toFixed(2)}
          </p>

          <p
            className="mt-1 text-xs"
            style={{ color: GRIS }}
          >
            Suma de ventas registradas
          </p>
        </div>

        {/* INVENTARIO */}

        <div
          className="rounded-2xl border bg-white p-5 shadow-sm"
          style={{ borderColor: '#E5E5E5' }}
        >
          <div className="flex items-center justify-between">
            <p
              className="text-sm"
              style={{ color: GRIS }}
            >
              Unidades en inventario
            </p>

            <div
              className="flex h-9 w-9 items-center justify-center rounded-xl"
              style={{
                backgroundColor: VINO_SUAVE,
                color: VINO,
              }}
            >
              <Boxes size={19} />
            </div>
          </div>

          <p
            className="mt-3 text-3xl font-bold"
            style={{ color: NEGRO }}
          >
            {unidadesInventario}
          </p>

          <p
            className="mt-1 text-xs"
            style={{ color: GRIS }}
          >
            Stock registrado
          </p>
        </div>

        {/* OPERACIONES */}

        <div
          className="rounded-2xl border bg-white p-5 shadow-sm"
          style={{ borderColor: '#E5E5E5' }}
        >
          <div className="flex items-center justify-between">
            <p
              className="text-sm"
              style={{ color: GRIS }}
            >
              Operaciones matemáticas
            </p>

            <div
              className="flex h-9 w-9 items-center justify-center rounded-xl"
              style={{
                backgroundColor: VINO_SUAVE,
                color: VINO,
              }}
            >
              <Calculator size={19} />
            </div>
          </div>

          <p
            className="mt-3 text-3xl font-bold"
            style={{ color: VINO }}
          >
            {operaciones.length}
          </p>

          <p
            className="mt-1 text-xs"
            style={{ color: GRIS }}
          >
            Operaciones registradas
          </p>
        </div>
      </div>

      {/* RESÚMENES */}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* RESUMEN DE VENTAS */}

        <div
          className="rounded-2xl border bg-white p-6 shadow-sm"
          style={{ borderColor: '#E5E5E5' }}
        >
          <div className="mb-5">
            <h3
              className="text-lg font-semibold"
              style={{ color: NEGRO }}
            >
              Resumen de ventas
            </h3>

            <p
              className="mt-1 text-xs"
              style={{ color: GRIS }}
            >
              Información general de las ventas registradas.
            </p>
          </div>

          <div className="space-y-3">
            <div
              className="flex items-center justify-between rounded-xl border p-4"
              style={{
                borderColor: '#E9E3E6',
                backgroundColor: '#FCFAFB',
              }}
            >
              <span
                className="text-sm"
                style={{ color: GRIS }}
              >
                Ventas totales
              </span>

              <span
                className="font-semibold"
                style={{ color: NEGRO }}
              >
                {ventas.length}
              </span>
            </div>

            <div
              className="flex items-center justify-between rounded-xl border p-4"
              style={{
                borderColor: '#E9E3E6',
                backgroundColor: '#FCFAFB',
              }}
            >
              <span
                className="text-sm"
                style={{ color: GRIS }}
              >
                Ventas completadas
              </span>

              <span
                className="rounded-full px-3 py-1 text-sm font-semibold"
                style={{
                  backgroundColor: VINO_SUAVE,
                  color: VINO_OSCURO,
                }}
              >
                {ventasCompletadas}
              </span>
            </div>

            <div
              className="flex items-center justify-between rounded-xl border p-4"
              style={{
                borderColor: '#E9E3E6',
                backgroundColor: '#FCFAFB',
              }}
            >
              <span
                className="text-sm"
                style={{ color: GRIS }}
              >
                Importe acumulado
              </span>

              <span
                className="font-semibold"
                style={{ color: VINO_OSCURO }}
              >
                S/ {totalVentas.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* RESUMEN DE INVENTARIO */}

        <div
          className="rounded-2xl border bg-white p-6 shadow-sm"
          style={{ borderColor: '#E5E5E5' }}
        >
          <div className="mb-5">
            <h3
              className="text-lg font-semibold"
              style={{ color: NEGRO }}
            >
              Resumen de inventario
            </h3>

            <p
              className="mt-1 text-xs"
              style={{ color: GRIS }}
            >
              Información general del stock registrado.
            </p>
          </div>

          <div className="space-y-3">
            <div
              className="flex items-center justify-between rounded-xl border p-4"
              style={{
                borderColor: '#E9E3E6',
                backgroundColor: '#FCFAFB',
              }}
            >
              <span
                className="text-sm"
                style={{ color: GRIS }}
              >
                Registros de inventario
              </span>

              <span
                className="font-semibold"
                style={{ color: NEGRO }}
              >
                {inventario.length}
              </span>
            </div>

            <div
              className="flex items-center justify-between rounded-xl border p-4"
              style={{
                borderColor: '#E9E3E6',
                backgroundColor: '#FCFAFB',
              }}
            >
              <span
                className="text-sm"
                style={{ color: GRIS }}
              >
                Unidades disponibles
              </span>

              <span
                className="rounded-full px-3 py-1 text-sm font-semibold"
                style={{
                  backgroundColor: VINO_SUAVE,
                  color: VINO,
                }}
              >
                {unidadesInventario}
              </span>
            </div>

            <div
              className="flex items-center justify-between rounded-xl border p-4"
              style={{
                borderColor: '#E9E3E6',
                backgroundColor: '#FCFAFB',
              }}
            >
              <span
                className="text-sm"
                style={{ color: GRIS }}
              >
                Operaciones registradas
              </span>

              <span
                className="font-semibold"
                style={{ color: VINO }}
              >
                {operaciones.length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* DETALLE DE VENTAS */}

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
              <ShoppingCart size={18} />
            </div>

            <div>
              <h3
                className="font-semibold"
                style={{ color: NEGRO }}
              >
                Detalle de ventas
              </h3>

              <p
                className="mt-1 text-xs"
                style={{ color: GRIS }}
              >
                Registro de las ventas realizadas.
              </p>
            </div>
          </div>
        </div>

        {ventas.length === 0 ? (
          <div className="p-10 text-center">
            <div
              className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl"
              style={{
                backgroundColor: VINO_SUAVE,
                color: VINO,
              }}
            >
              <ShoppingCart size={28} />
            </div>

            <p
              className="mt-4 text-sm font-medium"
              style={{ color: NEGRO }}
            >
              No hay ventas registradas.
            </p>

            <p
              className="mt-1 text-xs"
              style={{ color: GRIS }}
            >
              Las ventas realizadas aparecerán aquí.
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
                    Total
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
                {ventas.map((venta) => (
                  <tr
                    key={venta.id}
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
                      #{venta.id}
                    </td>

                    <td
                      className="px-5 py-4 font-semibold"
                      style={{ color: NEGRO }}
                    >
                      S/ {Number(venta.total).toFixed(2)}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className="inline-flex rounded-full px-3 py-1 text-xs font-semibold"
                        style={{
                          backgroundColor: VINO_SUAVE,
                          color: VINO_OSCURO,
                        }}
                      >
                        {venta.estado ?? 'Registrada'}
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
  );
}