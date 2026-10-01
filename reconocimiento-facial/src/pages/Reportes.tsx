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
              backgroundColor: GRIS_SUAVE,
              color: GRIS_OSCURO,
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
              style={{ color: GRIS_MEDIO }}
            >
              Resumen general de {EMPRESA_NOMBRE}
            </p>

            <p
              className="mt-1 text-xs"
              style={{ color: GRIS_MARCA }}
            >
              {EMPRESA_RUBRO} · Gerente: {EMPRESA_GERENTE}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={cargarDatos}
          disabled={cargando}
          className="flex items-center justify-center gap-2 rounded-xl border bg-white px-5 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50"
          style={{
            borderColor: '#D1D5DB',
            color: NEGRO,
          }}
          onMouseEnter={(e) => {
            if (!cargando) {
              e.currentTarget.style.backgroundColor = GRIS_SUAVE;
              e.currentTarget.style.borderColor = GRIS_MARCA;
              e.currentTarget.style.color = GRIS_OSCURO;
            }
          }}
          onMouseLeave={(e) => {
            if (!cargando) {
              e.currentTarget.style.backgroundColor = BLANCO;
              e.currentTarget.style.borderColor = '#D1D5DB';
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
            borderColor: '#9CA3AF',
            backgroundColor: '#E5E7EB',
            color: '#374151',
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
          style={{ borderColor: '#E5E7EB' }}
        >
          <div className="flex items-center justify-between">
            <p
              className="text-sm"
              style={{ color: GRIS_MEDIO }}
            >
              Ventas registradas
            </p>

            <div
              className="flex h-9 w-9 items-center justify-center rounded-xl"
              style={{
                backgroundColor: GRIS_SUAVE,
                color: GRIS_OSCURO,
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
            style={{ color: GRIS_MEDIO }}
          >
            Registros de ventas
          </p>
        </div>

        {/* TOTAL VENDIDO */}

        <div
          className="rounded-2xl border bg-white p-5 shadow-sm"
          style={{ borderColor: '#E5E7EB' }}
        >
          <div className="flex items-center justify-between">
            <p
              className="text-sm"
              style={{ color: GRIS_MEDIO }}
            >
              Total vendido
            </p>

            <div
              className="flex h-9 w-9 items-center justify-center rounded-xl"
              style={{
                backgroundColor: GRIS_SUAVE,
                color: GRIS_OSCURO,
              }}
            >
              <TrendingUp size={19} />
            </div>
          </div>

          <p
            className="mt-3 text-3xl font-bold"
            style={{ color: GRIS_OSCURO }}
          >
            S/ {totalVentas.toFixed(2)}
          </p>

          <p
            className="mt-1 text-xs"
            style={{ color: GRIS_MEDIO }}
          >
            Suma de ventas registradas
          </p>
        </div>

        {/* INVENTARIO */}

        <div
          className="rounded-2xl border bg-white p-5 shadow-sm"
          style={{ borderColor: '#E5E7EB' }}
        >
          <div className="flex items-center justify-between">
            <p
              className="text-sm"
              style={{ color: GRIS_MEDIO }}
            >
              Unidades en inventario
            </p>

            <div
              className="flex h-9 w-9 items-center justify-center rounded-xl"
              style={{
                backgroundColor: GRIS_SUAVE,
                color: GRIS_OSCURO,
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
            style={{ color: GRIS_MEDIO }}
          >
            Stock registrado
          </p>
        </div>

        {/* OPERACIONES */}

        <div
          className="rounded-2xl border bg-white p-5 shadow-sm"
          style={{ borderColor: '#E5E7EB' }}
        >
          <div className="flex items-center justify-between">
            <p
              className="text-sm"
              style={{ color: GRIS_MEDIO }}
            >
              Operaciones matemáticas
            </p>

            <div
              className="flex h-9 w-9 items-center justify-center rounded-xl"
              style={{
                backgroundColor: GRIS_SUAVE,
                color: GRIS_OSCURO,
              }}
            >
              <Calculator size={19} />
            </div>
          </div>

          <p
            className="mt-3 text-3xl font-bold"
            style={{ color: GRIS_OSCURO }}
          >
            {operaciones.length}
          </p>

          <p
            className="mt-1 text-xs"
            style={{ color: GRIS_MEDIO }}
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
          style={{ borderColor: '#E5E7EB' }}
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
              style={{ color: GRIS_MEDIO }}
            >
              Información general de las ventas registradas.
            </p>
          </div>

          <div className="space-y-3">
            <div
              className="flex items-center justify-between rounded-xl border p-4"
              style={{
                borderColor: '#E5E7EB',
                backgroundColor: GRIS_MUY_SUAVE,
              }}
            >
              <span
                className="text-sm"
                style={{ color: GRIS_MEDIO }}
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
                borderColor: '#E5E7EB',
                backgroundColor: GRIS_MUY_SUAVE,
              }}
            >
              <span
                className="text-sm"
                style={{ color: GRIS_MEDIO }}
              >
                Ventas completadas
              </span>

              <span
                className="rounded-full px-3 py-1 text-sm font-semibold"
                style={{
                  backgroundColor: GRIS_SUAVE,
                  color: GRIS_OSCURO,
                }}
              >
                {ventasCompletadas}
              </span>
            </div>

            <div
              className="flex items-center justify-between rounded-xl border p-4"
              style={{
                borderColor: '#E5E7EB',
                backgroundColor: GRIS_MUY_SUAVE,
              }}
            >
              <span
                className="text-sm"
                style={{ color: GRIS_MEDIO }}
              >
                Importe acumulado
              </span>

              <span
                className="font-semibold"
                style={{ color: GRIS_OSCURO }}
              >
                S/ {totalVentas.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* RESUMEN DE INVENTARIO */}

        <div
          className="rounded-2xl border bg-white p-6 shadow-sm"
          style={{ borderColor: '#E5E7EB' }}
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
              style={{ color: GRIS_MEDIO }}
            >
              Información general del stock registrado.
            </p>
          </div>

          <div className="space-y-3">
            <div
              className="flex items-center justify-between rounded-xl border p-4"
              style={{
                borderColor: '#E5E7EB',
                backgroundColor: GRIS_MUY_SUAVE,
              }}
            >
              <span
                className="text-sm"
                style={{ color: GRIS_MEDIO }}
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
                borderColor: '#E5E7EB',
                backgroundColor: GRIS_MUY_SUAVE,
              }}
            >
              <span
                className="text-sm"
                style={{ color: GRIS_MEDIO }}
              >
                Unidades disponibles
              </span>

              <span
                className="rounded-full px-3 py-1 text-sm font-semibold"
                style={{
                  backgroundColor: GRIS_SUAVE,
                  color: GRIS_OSCURO,
                }}
              >
                {unidadesInventario}
              </span>
            </div>

            <div
              className="flex items-center justify-between rounded-xl border p-4"
              style={{
                borderColor: '#E5E7EB',
                backgroundColor: GRIS_MUY_SUAVE,
              }}
            >
              <span
                className="text-sm"
                style={{ color: GRIS_MEDIO }}
              >
                Operaciones registradas
              </span>

              <span
                className="font-semibold"
                style={{ color: GRIS_OSCURO }}
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
        style={{ borderColor: '#E5E7EB' }}
      >
        <div
          className="border-b p-5"
          style={{ borderColor: '#E5E7EB' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-xl"
              style={{
                backgroundColor: GRIS_SUAVE,
                color: GRIS_OSCURO,
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
                style={{ color: GRIS_MEDIO }}
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
                backgroundColor: GRIS_SUAVE,
                color: GRIS_OSCURO,
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
              style={{ color: GRIS_MEDIO }}
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
                    borderColor: '#E5E7EB',
                    backgroundColor: '#FAFAFA',
                  }}
                >
                  <th
                    className="px-5 py-4 text-xs font-semibold uppercase tracking-wide"
                    style={{ color: GRIS_MEDIO }}
                  >
                    ID
                  </th>

                  <th
                    className="px-5 py-4 text-xs font-semibold uppercase tracking-wide"
                    style={{ color: GRIS_MEDIO }}
                  >
                    Total
                  </th>

                  <th
                    className="px-5 py-4 text-xs font-semibold uppercase tracking-wide"
                    style={{ color: GRIS_MEDIO }}
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
                        GRIS_MUY_SUAVE;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor =
                        BLANCO;
                    }}
                  >
                    <td
                      className="px-5 py-4 text-sm font-medium"
                      style={{ color: GRIS_MEDIO }}
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
                          backgroundColor: GRIS_SUAVE,
                          color: GRIS_OSCURO,
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
