import { useEffect, useMemo, useState } from 'react';
import {
  ShoppingCart,
  Plus,
  RefreshCw,
  X,
  Search,
  Receipt,
  Package,
  CheckCircle2,
  Building2,
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

interface Venta {
  id: number;
  sucursal_id?: number;
  total: number;
  estado: string;
  fecha?: string;
  fecha_venta?: string;
}

interface Producto {
  id: number;
  nombre: string;
  precio: number;
  categoria?: string;
  estado?: string;
}

interface Sucursal {
  id: number;
  nombre: string;
  direccion?: string;
  estado?: string;
}

/* =========================================================
   COMPONENTE
========================================================= */

export default function Ventas() {
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);

  const [modal, setModal] = useState(false);

  const [productoId, setProductoId] = useState('');
  const [sucursalId, setSucursalId] = useState('');
  const [cantidad, setCantidad] = useState('1');

  const [busqueda, setBusqueda] = useState('');

  const [cargando, setCargando] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');

  /* =======================================================
     CARGAR VENTAS
  ======================================================= */

  const cargarVentas = async () => {
    setCargando(true);
    setError('');

    try {
      const respuesta = await fetch(`${API}/ventas`);
      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          typeof datos.detail === 'string'
            ? datos.detail
            : 'No se pudieron cargar las ventas'
        );
      }

      setVentas(
        Array.isArray(datos)
          ? datos
          : datos.ventas ?? []
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

  /* =======================================================
     CARGAR PRODUCTOS
  ======================================================= */

  const cargarProductos = async () => {
    try {
      const respuesta = await fetch(`${API}/productos`);
      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          typeof datos.detail === 'string'
            ? datos.detail
            : 'No se pudieron cargar los productos'
        );
      }

      setProductos(
        Array.isArray(datos)
          ? datos
          : datos.productos ?? []
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudieron cargar los productos'
      );
    }
  };

  /* =======================================================
     CARGAR SUCURSALES
  ======================================================= */

  const cargarSucursales = async () => {
    try {
      const respuesta = await fetch(`${API}/sucursales`);
      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          typeof datos.detail === 'string'
            ? datos.detail
            : 'No se pudieron cargar las sucursales'
        );
      }

      const listaSucursales: Sucursal[] =
        Array.isArray(datos)
          ? datos
          : datos.sucursales ?? [];

      setSucursales(listaSucursales);

      /*
       * Si existe una sola sucursal, la seleccionamos
       * automáticamente para facilitar el registro.
       */
      if (
        listaSucursales.length === 1 &&
        !sucursalId
      ) {
        setSucursalId(
          String(listaSucursales[0].id)
        );
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudieron cargar las sucursales'
      );
    }
  };

  /* =======================================================
     CARGA INICIAL
  ======================================================= */

  useEffect(() => {
    cargarVentas();
    cargarProductos();
    cargarSucursales();
  }, []);

  /* =======================================================
     PRODUCTO SELECCIONADO
  ======================================================= */

  const productoSeleccionado = useMemo(() => {
    return productos.find(
      (producto) =>
        producto.id === Number(productoId)
    );
  }, [productos, productoId]);

  /* =======================================================
     SUCURSAL SELECCIONADA
  ======================================================= */

  const sucursalSeleccionada = useMemo(() => {
    return sucursales.find(
      (sucursal) =>
        sucursal.id === Number(sucursalId)
    );
  }, [sucursales, sucursalId]);

  /* =======================================================
     TOTAL DE LA NUEVA VENTA
  ======================================================= */

  const cantidadNumero = Math.max(
    1,
    Number(cantidad) || 1
  );

  const subtotalNuevo = productoSeleccionado
    ? Number(productoSeleccionado.precio) *
      cantidadNumero
    : 0;

  /* =======================================================
     REGISTRAR VENTA
  ======================================================= */

  const registrarVenta = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setError('');
    setMensaje('');

    if (!sucursalId) {
      setError('Selecciona una sucursal');
      return;
    }

    if (!sucursalSeleccionada) {
      setError('La sucursal seleccionada no es válida');
      return;
    }

    if (!productoId) {
      setError('Selecciona un producto');
      return;
    }

    if (!productoSeleccionado) {
      setError('El producto seleccionado no es válido');
      return;
    }

    if (
      !Number.isFinite(cantidadNumero) ||
      cantidadNumero <= 0
    ) {
      setError('La cantidad debe ser mayor que 0');
      return;
    }

    setGuardando(true);

    try {
      /* ===================================================
         1. CREAR VENTA
      =================================================== */

      const respuestaVenta = await fetch(
        `${API}/ventas`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sucursal_id: Number(sucursalId),
            total: subtotalNuevo,
            estado: 'Completada',
          }),
        }
      );

      const datosVenta =
        await respuestaVenta.json();

      if (!respuestaVenta.ok) {
        const detalle =
          typeof datosVenta.detail === 'string'
            ? datosVenta.detail
            : JSON.stringify(datosVenta.detail);

        throw new Error(
          detalle || 'No se pudo registrar la venta'
        );
      }

      /* ===================================================
         2. CREAR DETALLE DE VENTA
      =================================================== */

      const ventaId = datosVenta.id;

      if (!ventaId) {
        throw new Error(
          'La venta fue creada pero el backend no devolvió su ID'
        );
      }

      const respuestaDetalle = await fetch(
        `${API}/detalle-ventas`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            venta_id: ventaId,
            producto_id: Number(productoId),
            cantidad: cantidadNumero,
            precio_unitario:
              Number(productoSeleccionado.precio),
            subtotal: subtotalNuevo,
          }),
        }
      );

      const datosDetalle =
        await respuestaDetalle.json();

      if (!respuestaDetalle.ok) {
        const detalle =
          typeof datosDetalle.detail === 'string'
            ? datosDetalle.detail
            : JSON.stringify(datosDetalle.detail);

        throw new Error(
          detalle ||
            'La venta se creó, pero no se pudo registrar el detalle'
        );
      }

      /* ===================================================
         ÉXITO
      =================================================== */

      setMensaje(
        `Venta registrada correctamente en ${sucursalSeleccionada.nombre}`
      );

      setProductoId('');
      setCantidad('1');

      /*
       * Si hay una sola sucursal mantenemos esa selección.
       * Si hay varias, limpiamos el selector.
       */
      if (sucursales.length > 1) {
        setSucursalId('');
      }

      setModal(false);

      await cargarVentas();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo registrar la venta'
      );
    } finally {
      setGuardando(false);
    }
  };

  /* =======================================================
     FILTRAR VENTAS
  ======================================================= */

  const ventasFiltradas = ventas.filter(
    (venta) => {
      const texto =
        busqueda.trim().toLowerCase();

      if (!texto) {
        return true;
      }

      return (
        String(venta.id)
          .toLowerCase()
          .includes(texto) ||
        String(venta.estado)
          .toLowerCase()
          .includes(texto) ||
        String(venta.sucursal_id ?? '')
          .toLowerCase()
          .includes(texto)
      );
    }
  );

  /* =======================================================
     KPIs
  ======================================================= */

  const ventasCompletadas = ventas.filter(
    (venta) =>
      venta.estado
        ?.toLowerCase()
        .includes('complet')
  ).length;

  const totalVentas = ventas.reduce(
    (total, venta) =>
      total + Number(venta.total || 0),
    0
  );

  const promedioVenta =
    ventas.length > 0
      ? totalVentas / ventas.length
      : 0;

  /* =======================================================
     FORMATO MONEDA
  ======================================================= */

  const formatoMoneda = (valor: number) => {
    return `S/ ${Number(valor || 0).toLocaleString(
      'es-PE',
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    )}`;
  };

  /* =======================================================
     FORMATO FECHA
  ======================================================= */

  const formatoFecha = (
    fecha?: string
  ) => {
    if (!fecha) {
      return '—';
    }

    const fechaConvertida =
      new Date(fecha);

    if (
      Number.isNaN(
        fechaConvertida.getTime()
      )
    ) {
      return fecha;
    }

    return fechaConvertida.toLocaleDateString(
      'es-PE',
      {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }
    );
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div
      className="min-h-full space-y-6"
      style={{
        backgroundColor: GRIS_FONDO,
      }}
    >

      {/* ===================================================
          ENCABEZADO
      =================================================== */}

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

        <div className="flex items-center gap-3">

          <div
            className="rounded-xl p-3"
            style={{
              backgroundColor: VINO_SUAVE,
              color: VINO,
            }}
          >
            <ShoppingCart size={24} />
          </div>

          <div>

            <h2
              className="text-2xl font-bold"
              style={{
                color: NEGRO,
              }}
            >
              Ventas
            </h2>

            <p
              className="text-sm"
              style={{
                color: GRIS,
              }}
            >
              Registro y administración de ventas
              realizadas por la empresa.
            </p>

          </div>

        </div>

        <div className="flex gap-2">

          <button
            type="button"
            onClick={() => {
              cargarVentas();
              cargarProductos();
              cargarSucursales();
            }}
            disabled={cargando}
            className="flex items-center gap-2 rounded-xl border bg-white px-4 py-3 text-sm font-medium transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
            style={{
              borderColor: '#E5E5E3',
              color: NEGRO,
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

            Actualizar

          </button>

          <button
            type="button"
            onClick={() => {
              setError('');
              setMensaje('');
              setProductoId('');
              setCantidad('1');

              /*
               * Si hay una sola sucursal se conserva.
               * Si hay varias, se obliga a elegir.
               */
              if (sucursales.length !== 1) {
                setSucursalId('');
              }

              setModal(true);
            }}
            className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-white transition"
            style={{
              backgroundColor: VINO,
              boxShadow:
                '0 8px 18px rgba(119,91,102,0.18)',
            }}
          >

            <Plus size={18} />

            Nueva venta

          </button>

        </div>

      </div>

      {/* ===================================================
          MENSAJE ÉXITO
      =================================================== */}

      {mensaje && (
        <div
          className="flex items-center gap-3 rounded-xl border p-4 text-sm"
          style={{
            borderColor: '#D8C5CC',
            backgroundColor: '#F8E9EE',
            color: VINO_OSCURO,
          }}
        >

          <CheckCircle2 size={18} />

          {mensaje}

        </div>
      )}

      {/* ===================================================
          ERROR
      =================================================== */}

      {error && !modal && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* ===================================================
          KPIs
      =================================================== */}

      <div className="grid gap-5 md:grid-cols-3">

        {/* TOTAL VENTAS */}

        <div
          className="rounded-2xl border bg-white p-5 shadow-sm"
          style={{
            borderColor: '#E5E5E3',
          }}
        >

          <div className="flex items-center justify-between">

            <div>

              <p
                className="text-sm"
                style={{
                  color: GRIS,
                }}
              >
                Ventas registradas
              </p>

              <p
                className="mt-2 text-3xl font-bold"
                style={{
                  color: NEGRO,
                }}
              >
                {ventas.length}
              </p>

            </div>

            <div
              className="rounded-xl p-3"
              style={{
                backgroundColor: VINO_SUAVE,
                color: VINO,
              }}
            >
              <Receipt size={21} />
            </div>

          </div>

          <p
            className="mt-3 text-xs"
            style={{
              color: '#9CA3AF',
            }}
          >
            Operaciones registradas
          </p>

        </div>

        {/* COMPLETADAS */}

        <div
          className="rounded-2xl border bg-white p-5 shadow-sm"
          style={{
            borderColor: '#E5E5E3',
          }}
        >

          <div className="flex items-center justify-between">

            <div>

              <p
                className="text-sm"
                style={{
                  color: GRIS,
                }}
              >
                Ventas completadas
              </p>

              <p
                className="mt-2 text-3xl font-bold"
                style={{
                  color: NEGRO,
                }}
              >
                {ventasCompletadas}
              </p>

            </div>

            <div
              className="rounded-xl p-3"
              style={{
                backgroundColor: VINO_SUAVE,
                color: VINO,
              }}
            >
              <CheckCircle2 size={21} />
            </div>

          </div>

          <p
            className="mt-3 text-xs"
            style={{
              color: '#9CA3AF',
            }}
          >
            Operaciones finalizadas
          </p>

        </div>

        {/* TOTAL */}

        <div
          className="rounded-2xl border bg-white p-5 shadow-sm"
          style={{
            borderColor: '#E5E5E3',
          }}
        >

          <div className="flex items-center justify-between">

            <div>

              <p
                className="text-sm"
                style={{
                  color: GRIS,
                }}
              >
                Importe acumulado
              </p>

              <p
                className="mt-2 text-2xl font-bold"
                style={{
                  color: NEGRO,
                }}
              >
                {formatoMoneda(totalVentas)}
              </p>

            </div>

            <div
              className="rounded-xl p-3"
              style={{
                backgroundColor: VINO_SUAVE,
                color: VINO,
              }}
            >
              <ShoppingCart size={21} />
            </div>

          </div>

          <p
            className="mt-3 text-xs"
            style={{
              color: '#9CA3AF',
            }}
          >
            Promedio: {formatoMoneda(promedioVenta)}
          </p>

        </div>

      </div>

      {/* ===================================================
          TABLA
      =================================================== */}

      <div
        className="rounded-2xl border bg-white shadow-sm"
        style={{
          borderColor: '#E5E5E3',
        }}
      >

        <div
          className="flex flex-col gap-4 border-b p-5 sm:flex-row sm:items-center sm:justify-between"
          style={{
            borderColor: '#EEEEEC',
          }}
        >

          <div>

            <h3
              className="font-semibold"
              style={{
                color: NEGRO,
              }}
            >
              Registro de ventas
            </h3>

            <p
              className="mt-1 text-xs"
              style={{
                color: GRIS,
              }}
            >
              Historial de operaciones comerciales.
            </p>

          </div>

          <div className="relative">

            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{
                color: '#9CA3AF',
              }}
            />

            <input
              value={busqueda}
              onChange={(e) =>
                setBusqueda(e.target.value)
              }
              placeholder="Buscar venta..."
              className="w-full rounded-xl border bg-[#F8F8F7] py-2.5 pl-10 pr-4 text-sm outline-none transition sm:w-72"
              style={{
                borderColor: '#E5E5E3',
                color: NEGRO,
              }}
            />

          </div>

        </div>

        {ventasFiltradas.length === 0 ? (

          <div className="p-12 text-center">

            <div
              className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl"
              style={{
                backgroundColor: VINO_SUAVE,
                color: VINO,
              }}
            >
              <ShoppingCart size={28} />
            </div>

            <p
              className="mt-4 font-medium"
              style={{
                color: NEGRO,
              }}
            >
              No hay ventas registradas
            </p>

            <p
              className="mt-1 text-sm"
              style={{
                color: GRIS,
              }}
            >
              Registra una nueva venta para comenzar.
            </p>

          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full text-left">

              <thead>

                <tr
                  className="border-b"
                  style={{
                    borderColor: '#EEEEEC',
                    backgroundColor: '#FAFAF9',
                  }}
                >

                  <th
                    className="px-5 py-4 text-xs font-semibold uppercase tracking-wide"
                    style={{
                      color: GRIS,
                    }}
                  >
                    ID
                  </th>

                  <th
                    className="px-5 py-4 text-xs font-semibold uppercase tracking-wide"
                    style={{
                      color: GRIS,
                    }}
                  >
                    Sucursal
                  </th>

                  <th
                    className="px-5 py-4 text-xs font-semibold uppercase tracking-wide"
                    style={{
                      color: GRIS,
                    }}
                  >
                    Total
                  </th>

                  <th
                    className="px-5 py-4 text-xs font-semibold uppercase tracking-wide"
                    style={{
                      color: GRIS,
                    }}
                  >
                    Estado
                  </th>

                  <th
                    className="px-5 py-4 text-xs font-semibold uppercase tracking-wide"
                    style={{
                      color: GRIS,
                    }}
                  >
                    Fecha
                  </th>

                </tr>

              </thead>

              <tbody>

                {ventasFiltradas.map(
                  (venta) => (
                    <tr
                      key={venta.id}
                      className="border-b last:border-0 transition hover:bg-[#FCFAFB]"
                      style={{
                        borderColor: '#F0F0EE',
                      }}
                    >

                      <td
                        className="px-5 py-4 text-sm font-semibold"
                        style={{
                          color: NEGRO,
                        }}
                      >
                        #{venta.id}
                      </td>

                      <td
                        className="px-5 py-4 text-sm"
                        style={{
                          color: GRIS,
                        }}
                      >
                        Sucursal{' '}
                        {venta.sucursal_id ?? '—'}
                      </td>

                      <td
                        className="px-5 py-4 text-sm font-bold"
                        style={{
                          color: NEGRO,
                        }}
                      >
                        {formatoMoneda(
                          venta.total
                        )}
                      </td>

                      <td className="px-5 py-4">

                        <span
                          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
                          style={
                            venta.estado
                              ?.toLowerCase()
                              .includes('complet')
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
                                venta.estado
                                  ?.toLowerCase()
                                  .includes(
                                    'complet'
                                  )
                                  ? VINO
                                  : GRIS,
                            }}
                          />

                          {venta.estado}

                        </span>

                      </td>

                      <td
                        className="px-5 py-4 text-sm"
                        style={{
                          color: GRIS,
                        }}
                      >
                        {formatoFecha(
                          venta.fecha ??
                            venta.fecha_venta
                        )}
                      </td>

                    </tr>
                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>

      {/* ===================================================
          MODAL NUEVA VENTA
      =================================================== */}

      {modal && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

          <div
            className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl"
          >

            {/* CABECERA MODAL */}

            <div
              className="flex items-center justify-between border-b p-5"
              style={{
                borderColor: '#EEEEEC',
              }}
            >

              <div className="flex items-center gap-3">

                <div
                  className="rounded-xl p-2.5"
                  style={{
                    backgroundColor:
                      VINO_SUAVE,
                    color: VINO,
                  }}
                >
                  <ShoppingCart size={20} />
                </div>

                <div>

                  <h3
                    className="text-lg font-semibold"
                    style={{
                      color: NEGRO,
                    }}
                  >
                    Registrar venta
                  </h3>

                  <p
                    className="text-sm"
                    style={{
                      color: GRIS,
                    }}
                  >
                    Selecciona sucursal, producto y cantidad.
                  </p>

                </div>

              </div>

              <button
                type="button"
                onClick={() => {
                  if (!guardando) {
                    setModal(false);
                  }
                }}
                className="rounded-lg p-2 transition hover:bg-gray-100"
                style={{
                  color: GRIS,
                }}
              >
                <X size={20} />
              </button>

            </div>

            {/* FORMULARIO */}

            <form
              onSubmit={registrarVenta}
              className="space-y-5 p-5"
            >

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              {/* SUCURSAL */}

              <div>

                <label
                  className="mb-2 block text-sm font-medium"
                  style={{
                    color: NEGRO,
                  }}
                >
                  Sucursal
                </label>

                <div className="relative">

                  <Building2
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2"
                    style={{
                      color: GRIS,
                    }}
                  />

                  <select
                    value={sucursalId}
                    onChange={(e) =>
                      setSucursalId(
                        e.target.value
                      )
                    }
                    disabled={guardando}
                    className="w-full appearance-none rounded-xl border bg-white px-4 py-3 pl-10 text-sm outline-none transition disabled:opacity-60"
                    style={{
                      borderColor: '#D9D9D6',
                      color: NEGRO,
                    }}
                  >

                    <option value="">
                      Selecciona una sucursal
                    </option>

                    {sucursales.map(
                      (sucursal) => (
                        <option
                          key={sucursal.id}
                          value={sucursal.id}
                        >
                          {sucursal.nombre}
                        </option>
                      )
                    )}

                  </select>

                </div>

                {sucursales.length === 0 && (
                  <p className="mt-2 text-xs text-red-600">
                    No hay sucursales disponibles. Verifica el módulo de sucursales.
                  </p>
                )}

              </div>

              {/* PRODUCTO */}

              <div>

                <label
                  className="mb-2 block text-sm font-medium"
                  style={{
                    color: NEGRO,
                  }}
                >
                  Producto
                </label>

                <div className="relative">

                  <Package
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2"
                    style={{
                      color: GRIS,
                    }}
                  />

                  <select
                    value={productoId}
                    onChange={(e) =>
                      setProductoId(
                        e.target.value
                      )
                    }
                    disabled={guardando}
                    className="w-full appearance-none rounded-xl border bg-white px-4 py-3 pl-10 text-sm outline-none transition disabled:opacity-60"
                    style={{
                      borderColor: '#D9D9D6',
                      color: NEGRO,
                    }}
                  >

                    <option value="">
                      Selecciona un producto
                    </option>

                    {productos.map(
                      (producto) => (
                        <option
                          key={producto.id}
                          value={producto.id}
                        >
                          {producto.nombre} —{' '}
                          {formatoMoneda(
                            producto.precio
                          )}
                        </option>
                      )
                    )}

                  </select>

                </div>

              </div>

              {/* CANTIDAD */}

              <div>

                <label
                  className="mb-2 block text-sm font-medium"
                  style={{
                    color: NEGRO,
                  }}
                >
                  Cantidad
                </label>

                <input
                  type="number"
                  min="1"
                  step="1"
                  value={cantidad}
                  onChange={(e) =>
                    setCantidad(
                      e.target.value
                    )
                  }
                  disabled={guardando}
                  className="w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none transition disabled:opacity-60"
                  style={{
                    borderColor: '#D9D9D6',
                    color: NEGRO,
                  }}
                />

              </div>

              {/* RESUMEN */}

              <div
                className="rounded-2xl p-4"
                style={{
                  backgroundColor:
                    VINO_SUAVE,
                }}
              >

                <div className="flex items-center justify-between">

                  <div>

                    <p
                      className="text-xs font-medium"
                      style={{
                        color: VINO_OSCURO,
                      }}
                    >
                      Resumen de venta
                    </p>

                    <p
                      className="mt-1 text-sm"
                      style={{
                        color: GRIS,
                      }}
                    >
                      {sucursalSeleccionada
                        ? sucursalSeleccionada.nombre
                        : 'Selecciona una sucursal'}
                    </p>

                    <p
                      className="mt-1 text-sm"
                      style={{
                        color: GRIS,
                      }}
                    >
                      {productoSeleccionado
                        ? `${productoSeleccionado.nombre} × ${cantidadNumero}`
                        : 'Selecciona un producto'}
                    </p>

                  </div>

                  <div className="text-right">

                    <p
                      className="text-xs"
                      style={{
                        color: GRIS,
                      }}
                    >
                      Total
                    </p>

                    <p
                      className="text-xl font-bold"
                      style={{
                        color: VINO_OSCURO,
                      }}
                    >
                      {formatoMoneda(
                        subtotalNuevo
                      )}
                    </p>

                  </div>

                </div>

              </div>

              {/* BOTONES */}

              <div className="flex justify-end gap-3 pt-2">

                <button
                  type="button"
                  onClick={() =>
                    setModal(false)
                  }
                  disabled={guardando}
                  className="rounded-xl border px-5 py-3 text-sm font-medium transition hover:bg-gray-50 disabled:opacity-60"
                  style={{
                    borderColor: '#D9D9D6',
                    color: GRIS,
                  }}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={
                    guardando ||
                    !productoId ||
                    !sucursalId
                  }
                  className="flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-60"
                  style={{
                    backgroundColor: VINO,
                  }}
                >

                  {guardando ? (
                    <>
                      <RefreshCw
                        size={17}
                        className="animate-spin"
                      />

                      Guardando...
                    </>
                  ) : (
                    <>
                      <Plus size={17} />

                      Registrar venta
                    </>
                  )}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}

