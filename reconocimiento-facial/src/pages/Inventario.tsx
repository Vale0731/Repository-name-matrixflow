import { useEffect, useMemo, useState } from 'react';
import {
  Package,
  Plus,
  RefreshCw,
  X,
  Search,
  Trash2,
  AlertTriangle,
  Boxes,
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

interface Inventario {
  id: number;
  producto_id: number;
  sucursal_id: number;
  cantidad: number;
}

interface Producto {
  id: number;
  nombre: string;
  precio: number;
  categoria?: string;
  estado?: string;
}

/* =========================================================
   COMPONENTE
========================================================= */

export default function Inventario() {
  const [inventario, setInventario] = useState<Inventario[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);

  const [modal, setModal] = useState(false);
  const [modalEliminar, setModalEliminar] = useState(false);

  const [productoId, setProductoId] = useState('');
  const [cantidad, setCantidad] = useState('');

  const [inventarioEliminar, setInventarioEliminar] =
    useState<Inventario | null>(null);

  const [busqueda, setBusqueda] = useState('');

  const [cargando, setCargando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [eliminando, setEliminando] = useState(false);

  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');

  /* =======================================================
     CARGAR INVENTARIO
  ======================================================= */

  const cargarInventario = async () => {
    setCargando(true);
    setError('');

    try {
      const respuesta = await fetch(`${API}/inventario`);
      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          typeof datos.detail === 'string'
            ? datos.detail
            : 'No se pudo cargar el inventario'
        );
      }

      setInventario(
        Array.isArray(datos)
          ? datos
          : datos.inventario ?? []
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
     CARGA INICIAL
  ======================================================= */

  useEffect(() => {
    cargarInventario();
    cargarProductos();
  }, []);

  /* =======================================================
     MAPA DE PRODUCTOS
  ======================================================= */

  const productosMap = useMemo(() => {
    const mapa = new Map<number, Producto>();

    productos.forEach((producto) => {
      mapa.set(producto.id, producto);
    });

    return mapa;
  }, [productos]);

  /* =======================================================
     INVENTARIO CON PRODUCTO
  ======================================================= */

  const inventarioConProducto = useMemo(() => {
    return inventario.map((item) => ({
      ...item,
      producto: productosMap.get(item.producto_id),
    }));
  }, [inventario, productosMap]);

  /* =======================================================
     FILTRAR
  ======================================================= */

  const inventarioFiltrado = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    if (!texto) {
      return inventarioConProducto;
    }

    return inventarioConProducto.filter((item) => {
      const nombre =
        item.producto?.nombre?.toLowerCase() ?? '';

      const idProducto =
        String(item.producto_id).toLowerCase();

      const idInventario =
        String(item.id).toLowerCase();

      return (
        nombre.includes(texto) ||
        idProducto.includes(texto) ||
        idInventario.includes(texto)
      );
    });
  }, [inventarioConProducto, busqueda]);

  /* =======================================================
     TOTALES
  ======================================================= */

  const totalUnidades = inventario.reduce(
    (total, item) =>
      total + Number(item.cantidad || 0),
    0
  );

  const productosConInventario = inventario.filter(
    (item) => Number(item.cantidad || 0) > 0
  ).length;

  const inventarioBajo = inventario.filter(
    (item) => {
      const cantidadItem = Number(item.cantidad || 0);
      return cantidadItem > 0 && cantidadItem <= 10;
    }
  ).length;

  /* =======================================================
     REGISTRAR INVENTARIO
  ======================================================= */

  const registrarInventario = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setError('');
    setMensaje('');

    const cantidadNumero = Number(cantidad);

    if (!productoId) {
      setError('Selecciona un producto');
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
      const respuesta = await fetch(
        `${API}/inventario`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            producto_id: Number(productoId),
            sucursal_id: 1,
            cantidad: cantidadNumero,
          }),
        }
      );

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        const detalle =
          typeof datos.detail === 'string'
            ? datos.detail
            : JSON.stringify(datos.detail);

        throw new Error(
          detalle || 'No se pudo registrar el inventario'
        );
      }

      setMensaje(
        'Inventario registrado correctamente'
      );

      setProductoId('');
      setCantidad('');
      setModal(false);

      await cargarInventario();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo registrar el inventario'
      );
    } finally {
      setGuardando(false);
    }
  };

  /* =======================================================
     ELIMINAR INVENTARIO
  ======================================================= */

  const confirmarEliminar = async () => {
    if (!inventarioEliminar) {
      return;
    }

    setEliminando(true);
    setError('');
    setMensaje('');

    try {
      const respuesta = await fetch(
        `${API}/inventario/${inventarioEliminar.id}`,
        {
          method: 'DELETE',
        }
      );

      const datos =
        respuesta.status !== 204
          ? await respuesta.json()
          : null;

      if (!respuesta.ok) {
        const detalle =
          datos &&
          typeof datos.detail === 'string'
            ? datos.detail
            : 'No se pudo eliminar el registro';

        throw new Error(detalle);
      }

      setMensaje(
        'Registro de inventario eliminado correctamente'
      );

      setModalEliminar(false);
      setInventarioEliminar(null);

      await cargarInventario();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo eliminar el registro'
      );
    } finally {
      setEliminando(false);
    }
  };

  /* =======================================================
     FORMATO NÚMERO
  ======================================================= */

  const formatoNumero = (valor: number) => {
    return Number(valor || 0).toLocaleString('es-PE');
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
            <Package size={24} />
          </div>

          <div>

            <h2
              className="text-2xl font-bold"
              style={{
                color: NEGRO,
              }}
            >
              Inventario
            </h2>

            <p
              className="text-sm"
              style={{
                color: GRIS,
              }}
            >
              Control y administración del stock de productos.
            </p>

          </div>

        </div>

        <div className="flex gap-2">

          <button
            type="button"
            onClick={() => {
              cargarInventario();
              cargarProductos();
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
              setCantidad('');
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

            Registrar inventario

          </button>

        </div>

      </div>

      {/* ===================================================
          MENSAJE ÉXITO
      =================================================== */}

      {mensaje && (
        <div
          className="rounded-xl border p-4 text-sm"
          style={{
            borderColor: '#D8C5CC',
            backgroundColor: VINO_SUAVE,
            color: VINO_OSCURO,
          }}
        >
          {mensaje}
        </div>
      )}

      {/* ===================================================
          ERROR
      =================================================== */}

      {error &&
        !modal &&
        !modalEliminar && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

      {/* ===================================================
          KPIs
      =================================================== */}

      <div className="grid gap-5 md:grid-cols-3">

        {/* TOTAL UNIDADES */}

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
                Unidades en stock
              </p>

              <p
                className="mt-2 text-3xl font-bold"
                style={{
                  color: NEGRO,
                }}
              >
                {formatoNumero(totalUnidades)}
              </p>

            </div>

            <div
              className="rounded-xl p-3"
              style={{
                backgroundColor: VINO_SUAVE,
                color: VINO,
              }}
            >
              <Boxes size={21} />
            </div>

          </div>

          <p
            className="mt-3 text-xs"
            style={{
              color: '#9CA3AF',
            }}
          >
            Total de unidades registradas
          </p>

        </div>

        {/* PRODUCTOS */}

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
                Productos con stock
              </p>

              <p
                className="mt-2 text-3xl font-bold"
                style={{
                  color: NEGRO,
                }}
              >
                {productosConInventario}
              </p>

            </div>

            <div
              className="rounded-xl p-3"
              style={{
                backgroundColor: VINO_SUAVE,
                color: VINO,
              }}
            >
              <Package size={21} />
            </div>

          </div>

          <p
            className="mt-3 text-xs"
            style={{
              color: '#9CA3AF',
            }}
          >
            Registros disponibles
          </p>

        </div>

        {/* STOCK BAJO */}

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
                Stock bajo
              </p>

              <p
                className="mt-2 text-3xl font-bold"
                style={{
                  color: NEGRO,
                }}
              >
                {inventarioBajo}
              </p>

            </div>

            <div
              className="rounded-xl p-3"
              style={{
                backgroundColor: VINO_SUAVE,
                color: VINO,
              }}
            >
              <AlertTriangle size={21} />
            </div>

          </div>

          <p
            className="mt-3 text-xs"
            style={{
              color: '#9CA3AF',
            }}
          >
            Registros con 10 unidades o menos
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

        {/* CABECERA */}

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
              Inventario registrado
            </h3>

            <p
              className="mt-1 text-xs"
              style={{
                color: GRIS,
              }}
            >
              Consulta y administra las existencias.
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
              placeholder="Buscar producto..."
              className="w-full rounded-xl border bg-[#F8F8F7] py-2.5 pl-10 pr-4 text-sm outline-none transition sm:w-72"
              style={{
                borderColor: '#E5E5E3',
                color: NEGRO,
              }}
            />

          </div>

        </div>

        {/* TABLA */}

        {inventarioFiltrado.length === 0 ? (

          <div className="p-12 text-center">

            <div
              className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl"
              style={{
                backgroundColor: VINO_SUAVE,
                color: VINO,
              }}
            >
              <Package size={28} />
            </div>

            <p
              className="mt-4 font-medium"
              style={{
                color: NEGRO,
              }}
            >
              No hay registros de inventario
            </p>

            <p
              className="mt-1 text-sm"
              style={{
                color: GRIS,
              }}
            >
              Registra existencias para comenzar.
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
                    Producto
                  </th>

                  <th
                    className="px-5 py-4 text-xs font-semibold uppercase tracking-wide"
                    style={{
                      color: GRIS,
                    }}
                  >
                    Categoría
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
                    Cantidad
                  </th>

                  <th
                    className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-right"
                    style={{
                      color: GRIS,
                    }}
                  >
                    Acción
                  </th>

                </tr>

              </thead>

              <tbody>

                {inventarioFiltrado.map(
                  (item) => {

                    const producto =
                      item.producto;

                    const cantidadItem =
                      Number(
                        item.cantidad || 0
                      );

                    const stockBajo =
                      cantidadItem > 0 &&
                      cantidadItem <= 10;

                    return (
                      <tr
                        key={item.id}
                        className="border-b last:border-0 transition hover:bg-[#FCFAFB]"
                        style={{
                          borderColor: '#F0F0EE',
                        }}
                      >

                        {/* ID */}

                        <td
                          className="px-5 py-4 text-sm font-semibold"
                          style={{
                            color: NEGRO,
                          }}
                        >
                          #{item.id}
                        </td>

                        {/* PRODUCTO */}

                        <td className="px-5 py-4">

                          <div className="flex items-center gap-3">

                            <div
                              className="flex h-9 w-9 items-center justify-center rounded-lg"
                              style={{
                                backgroundColor:
                                  VINO_SUAVE,
                                color: VINO,
                              }}
                            >
                              <Package size={17} />
                            </div>

                            <div>

                              <p
                                className="text-sm font-semibold"
                                style={{
                                  color: NEGRO,
                                }}
                              >
                                {producto?.nombre ??
                                  `Producto #${item.producto_id}`}
                              </p>

                              <p
                                className="text-xs"
                                style={{
                                  color: GRIS,
                                }}
                              >
                                ID producto:{' '}
                                {item.producto_id}
                              </p>

                            </div>

                          </div>

                        </td>

                        {/* CATEGORÍA */}

                        <td
                          className="px-5 py-4 text-sm"
                          style={{
                            color: GRIS,
                          }}
                        >
                          {producto?.categoria ??
                            '—'}
                        </td>

                        {/* SUCURSAL */}

                        <td
                          className="px-5 py-4 text-sm"
                          style={{
                            color: GRIS,
                          }}
                        >
                          Sucursal{' '}
                          {item.sucursal_id}
                        </td>

                        {/* CANTIDAD */}

                        <td className="px-5 py-4">

                          <span
                            className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold"
                            style={
                              stockBajo
                                ? {
                                    backgroundColor:
                                      '#FFF4E5',
                                    color:
                                      '#9A6700',
                                  }
                                : {
                                    backgroundColor:
                                      VINO_SUAVE,
                                    color:
                                      VINO_OSCURO,
                                  }
                            }
                          >

                            <span
                              className="h-1.5 w-1.5 rounded-full"
                              style={{
                                backgroundColor:
                                  stockBajo
                                    ? '#9A6700'
                                    : VINO,
                              }}
                            />

                            {formatoNumero(
                              cantidadItem
                            )}

                            {stockBajo &&
                              ' · Bajo'}

                          </span>

                        </td>

                        {/* ACCIÓN */}

                        <td className="px-5 py-4 text-right">

                          <button
                            type="button"
                            onClick={() => {
                              setInventarioEliminar(
                                item
                              );
                              setError('');
                              setModalEliminar(
                                true
                              );
                            }}
                            className="rounded-lg p-2 transition hover:bg-red-50"
                            style={{
                              color: '#9B4D5A',
                            }}
                            title="Eliminar"
                          >
                            <Trash2 size={17} />
                          </button>

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

      {/* ===================================================
          MODAL REGISTRAR
      =================================================== */}

      {modal && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

          <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">

            {/* CABECERA */}

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
                  <Package size={20} />
                </div>

                <div>

                  <h3
                    className="text-lg font-semibold"
                    style={{
                      color: NEGRO,
                    }}
                  >
                    Registrar inventario
                  </h3>

                  <p
                    className="text-sm"
                    style={{
                      color: GRIS,
                    }}
                  >
                    Agrega existencias a un producto.
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
              onSubmit={registrarInventario}
              className="space-y-5 p-5"
            >

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {error}
                </div>
              )}

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

                <select
                  value={productoId}
                  onChange={(e) =>
                    setProductoId(
                      e.target.value
                    )
                  }
                  disabled={guardando}
                  className="w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none transition disabled:opacity-60"
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
                        {producto.nombre}
                      </option>
                    )
                  )}

                </select>

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
                  placeholder="Ej. 100"
                  className="w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none transition disabled:opacity-60"
                  style={{
                    borderColor: '#D9D9D6',
                    color: NEGRO,
                  }}
                />

              </div>

              {/* INFORMACIÓN */}

              <div
                className="rounded-2xl p-4"
                style={{
                  backgroundColor:
                    VINO_SUAVE,
                }}
              >

                <div className="flex items-start gap-3">

                  <Boxes
                    size={19}
                    style={{
                      color: VINO,
                    }}
                  />

                  <div>

                    <p
                      className="text-sm font-semibold"
                      style={{
                        color: VINO_OSCURO,
                      }}
                    >
                      Control de stock
                    </p>

                    <p
                      className="mt-1 text-xs leading-5"
                      style={{
                        color: GRIS,
                      }}
                    >
                      La cantidad registrada se asociará
                      a la sucursal principal del sistema.
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
                    !cantidad
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

                      Registrar
                    </>
                  )}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

      {/* ===================================================
          MODAL ELIMINAR
      =================================================== */}

      {modalEliminar &&
        inventarioEliminar && (

          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">

              <div className="flex items-start gap-4">

                <div
                  className="rounded-xl p-3"
                  style={{
                    backgroundColor:
                      VINO_SUAVE,
                    color: VINO_OSCURO,
                  }}
                >
                  <AlertTriangle size={22} />
                </div>

                <div className="flex-1">

                  <h3
                    className="text-lg font-semibold"
                    style={{
                      color: NEGRO,
                    }}
                  >
                    Eliminar registro
                  </h3>

                  <p
                    className="mt-2 text-sm leading-6"
                    style={{
                      color: GRIS,
                    }}
                  >
                    ¿Estás seguro de que deseas eliminar
                    este registro del inventario?
                  </p>

                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (!eliminando) {
                      setModalEliminar(false);
                      setInventarioEliminar(null);
                    }
                  }}
                  className="rounded-lg p-2 hover:bg-gray-100"
                  style={{
                    color: GRIS,
                  }}
                >
                  <X size={19} />
                </button>

              </div>

              <div
                className="mt-5 rounded-xl p-4"
                style={{
                  backgroundColor:
                    '#FAFAF9',
                }}
              >

                <p
                  className="text-sm font-semibold"
                  style={{
                    color: NEGRO,
                  }}
                >
                  {productosMap.get(
                    inventarioEliminar.producto_id
                  )?.nombre ??
                    `Producto #${inventarioEliminar.producto_id}`}
                </p>

                <p
                  className="mt-1 text-xs"
                  style={{
                    color: GRIS,
                  }}
                >
                  Cantidad:{' '}
                  {formatoNumero(
                    inventarioEliminar.cantidad
                  )}{' '}
                  · Sucursal{' '}
                  {inventarioEliminar.sucursal_id}
                </p>

              </div>

              <div className="mt-6 flex justify-end gap-3">

                <button
                  type="button"
                  onClick={() => {
                    setModalEliminar(false);
                    setInventarioEliminar(null);
                  }}
                  disabled={eliminando}
                  className="rounded-xl border px-5 py-3 text-sm font-medium transition hover:bg-gray-50 disabled:opacity-60"
                  style={{
                    borderColor: '#D9D9D6',
                    color: GRIS,
                  }}
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  onClick={confirmarEliminar}
                  disabled={eliminando}
                  className="flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-60"
                  style={{
                    backgroundColor: VINO_OSCURO,
                  }}
                >

                  {eliminando ? (
                    <>
                      <RefreshCw
                        size={17}
                        className="animate-spin"
                      />

                      Eliminando...
                    </>
                  ) : (
                    <>
                      <Trash2 size={17} />

                      Eliminar
                    </>
                  )}

                </button>

              </div>

            </div>

          </div>
        )}

    </div>
  );
}