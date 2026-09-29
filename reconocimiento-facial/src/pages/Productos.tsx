import { useEffect, useState } from 'react';
import { Package, Plus, RefreshCw, Search, X } from 'lucide-react';
import API from '../services/api';

interface Producto {
  id: number;
  nombre: string;
  precio: number;
  categoria?: number | string;
  categoria_id?: number;
  estado: string;
}

const VINO = '#775b66';
const VINO_OSCURO = '#6B4652';
const VINO_SUAVE = '#F8E9EE';
const GRIS_FONDO = '#F3F3F1';
const GRIS = '#6B7280';
const NEGRO = '#111111';

export default function Productos() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const [nombre, setNombre] = useState('');
  const [precio, setPrecio] = useState('');
  const [categoria, setCategoria] = useState('');

  const cargarProductos = async () => {
    try {
      setCargando(true);
      setError('');

      const respuesta = await fetch(`${API}/productos`);
      const datos = await respuesta.json().catch(() => null);

      if (!respuesta.ok) {
        let mensaje = 'No se pudieron cargar los productos.';

        if (typeof datos?.detail === 'string') {
          mensaje = datos.detail;
        } else if (Array.isArray(datos?.detail)) {
          mensaje = datos.detail
            .map((item: any) => item?.msg || 'Error de validación')
            .join(', ');
        }

        throw new Error(mensaje);
      }

      const lista = Array.isArray(datos)
        ? datos
        : Array.isArray(datos?.productos)
          ? datos.productos
          : [];

      setProductos(lista);
    } catch (err) {
      console.error('Error cargando productos:', err);

      setError(
        err instanceof Error
          ? err.message
          : 'No se pudieron cargar los productos.'
      );

      setProductos([]);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarProductos();
  }, []);

  const crearProducto = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    setError('');

    if (!nombre.trim()) {
      setError('Ingresa el nombre del producto.');
      return;
    }

    if (!precio || Number(precio) < 0) {
      setError('Ingresa un precio válido.');
      return;
    }

    if (!categoria || Number(categoria) <= 0) {
      setError('Ingresa un ID de categoría válido.');
      return;
    }

    try {
      const cuerpo = {
        nombre: nombre.trim(),
        precio: Number(precio),
        categoria: categoria.trim(),
        estado: 'Activo',
      };

      console.log('Enviando producto:', cuerpo);

      const respuesta = await fetch(`${API}/productos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cuerpo),
      });

      const datos = await respuesta.json().catch(() => null);

      if (!respuesta.ok) {
        let mensaje = 'No se pudo crear el producto.';

        if (typeof datos?.detail === 'string') {
          mensaje = datos.detail;
        } else if (Array.isArray(datos?.detail)) {
          mensaje = datos.detail
            .map((item: any) => {
              const campo = Array.isArray(item?.loc)
                ? item.loc.join('.')
                : '';

              const texto =
                item?.msg || 'Error de validación';

              return campo
                ? `${campo}: ${texto}`
                : texto;
            })
            .join(', ');
        }

        throw new Error(mensaje);
      }

      setNombre('');
      setPrecio('');
      setCategoria('');
      setMostrarFormulario(false);

      await cargarProductos();
    } catch (err) {
      console.error('Error creando producto:', err);

      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo crear el producto.'
      );
    }
  };

  const desactivarProducto = async (id: number) => {
    try {
      setError('');

      const respuesta = await fetch(
        `${API}/productos/${id}/desactivar`,
        {
          method: 'PUT',
        }
      );

      const datos = await respuesta.json().catch(() => null);

      if (!respuesta.ok) {
        let mensaje =
          'No se pudo desactivar el producto.';

        if (typeof datos?.detail === 'string') {
          mensaje = datos.detail;
        } else if (Array.isArray(datos?.detail)) {
          mensaje = datos.detail
            .map(
              (item: any) =>
                item?.msg || 'Error de validación'
            )
            .join(', ');
        }

        throw new Error(mensaje);
      }

      await cargarProductos();
    } catch (err) {
      console.error(
        'Error desactivando producto:',
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo desactivar el producto.'
      );
    }
  };

  const productosFiltrados = productos.filter(
    (producto) =>
      producto.nombre
        .toLowerCase()
        .includes(busqueda.toLowerCase())
  );

  return (
    <div
      className="min-h-full"
      style={{
        backgroundColor: GRIS_FONDO,
      }}
    >
      <div className="mx-auto max-w-[1500px] space-y-6 p-5 lg:p-7">

        {/* ENCABEZADO */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-xl"
              style={{
                backgroundColor: VINO_SUAVE,
                color: VINO_OSCURO,
              }}
            >
              <Package size={24} />
            </div>

            <div>
              <h1
                className="text-2xl font-bold"
                style={{ color: NEGRO }}
              >
                Productos
              </h1>

              <p
                className="mt-1 text-sm"
                style={{ color: GRIS }}
              >
                Gestión de productos de MatrixFlow Enterprise
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {/* ACTUALIZAR */}
            <button
              type="button"
              onClick={cargarProductos}
              disabled={cargando}
              className="flex items-center gap-2 rounded-xl border bg-white px-4 py-2.5 text-sm font-medium shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              style={{
                borderColor: '#E5E7EB',
                color: NEGRO,
              }}
            >
              <RefreshCw
                size={17}
                className={
                  cargando ? 'animate-spin' : ''
                }
              />

              Actualizar
            </button>

            {/* NUEVO PRODUCTO */}
            <button
              type="button"
              onClick={() => {
                setError('');
                setMostrarFormulario(true);
              }}
              className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:opacity-90"
              style={{
                backgroundColor: VINO_OSCURO,
              }}
            >
              <Plus size={18} />

              Nuevo producto
            </button>
          </div>
        </div>

        {/* ERROR */}
        {error && (
          <div
            className="flex items-start justify-between gap-4 rounded-xl border px-4 py-3 text-sm"
            style={{
              backgroundColor: '#FEF2F2',
              borderColor: '#FECACA',
              color: '#B91C1C',
            }}
          >
            <span>{error}</span>

            <button
              type="button"
              onClick={() => setError('')}
              className="transition hover:opacity-70"
              style={{ color: '#DC2626' }}
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* BUSCADOR */}
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: GRIS }}
            />

            <input
              type="text"
              value={busqueda}
              onChange={(e) =>
                setBusqueda(e.target.value)
              }
              placeholder="Buscar producto..."
              className="w-full rounded-xl border bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition"
              style={{
                borderColor: '#D1D5DB',
                color: NEGRO,
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor =
                  VINO;
                e.currentTarget.style.boxShadow =
                  `0 0 0 3px ${VINO_SUAVE}`;
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor =
                  '#D1D5DB';
                e.currentTarget.style.boxShadow =
                  'none';
              }}
            />
          </div>
        </div>

        {/* TABLA */}
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

          {/* CABECERA */}
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5">
            <div>
              <h2
                className="font-semibold"
                style={{ color: NEGRO }}
              >
                Lista de productos
              </h2>

              <p
                className="mt-1 text-xs"
                style={{ color: GRIS }}
              >
                {productosFiltrados.length} producto
                {productosFiltrados.length !== 1
                  ? 's'
                  : ''}
              </p>
            </div>

            <div
              className="hidden rounded-lg px-3 py-1.5 text-xs font-medium sm:block"
              style={{
                backgroundColor: VINO_SUAVE,
                color: VINO_OSCURO,
              }}
            >
              {productos.filter(
                (producto) =>
                  producto.estado === 'Activo'
              ).length}{' '}
              activos
            </div>
          </div>

          {/* CARGANDO */}
          {cargando ? (
            <div
              className="p-12 text-center text-sm"
              style={{ color: GRIS }}
            >
              <div className="mb-3 flex justify-center">
                <RefreshCw
                  size={24}
                  className="animate-spin"
                  style={{ color: VINO }}
                />
              </div>

              Cargando productos...
            </div>

          ) : productosFiltrados.length === 0 ? (

            /* SIN PRODUCTOS */
            <div className="p-12 text-center">
              <div
                className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full"
                style={{
                  backgroundColor: VINO_SUAVE,
                  color: VINO_OSCURO,
                }}
              >
                <Package size={25} />
              </div>

              <p
                className="text-sm font-medium"
                style={{ color: NEGRO }}
              >
                {busqueda
                  ? 'No se encontraron productos con esa búsqueda.'
                  : 'No hay productos registrados.'}
              </p>

              {!busqueda && (
                <p
                  className="mt-1 text-xs"
                  style={{ color: GRIS }}
                >
                  Agrega tu primer producto usando el
                  botón "Nuevo producto".
                </p>
              )}
            </div>

          ) : (

            /* TABLA */
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">

                <thead
                  style={{
                    backgroundColor: '#FAFAF9',
                    color: GRIS,
                  }}
                >
                  <tr>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide">
                      ID
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide">
                      Producto
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide">
                      Precio
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide">
                      Categoría
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide">
                      Estado
                    </th>

                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide">
                      Acciones
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {productosFiltrados.map(
                    (producto) => {
                      const categoriaProducto =
                        producto.categoria ??
                        producto.categoria_id ??
                        '-';

                      return (
                        <tr
                          key={producto.id}
                          className="border-t border-gray-100 transition hover:bg-gray-50"
                        >

                          {/* ID */}
                          <td
                            className="px-6 py-4 font-medium"
                            style={{ color: GRIS }}
                          >
                            #{producto.id}
                          </td>

                          {/* PRODUCTO */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div
                                className="flex h-9 w-9 items-center justify-center rounded-lg"
                                style={{
                                  backgroundColor:
                                    VINO_SUAVE,
                                  color:
                                    VINO_OSCURO,
                                }}
                              >
                                <Package size={17} />
                              </div>

                              <span
                                className="font-medium"
                                style={{
                                  color: NEGRO,
                                }}
                              >
                                {producto.nombre}
                              </span>
                            </div>
                          </td>

                          {/* PRECIO */}
                          <td
                            className="px-6 py-4 font-medium"
                            style={{ color: NEGRO }}
                          >
                            S/{' '}
                            {Number(
                              producto.precio
                            ).toFixed(2)}
                          </td>

                          {/* CATEGORÍA */}
                          <td
                            className="px-6 py-4"
                            style={{ color: GRIS }}
                          >
                            {categoriaProducto}
                          </td>

                          {/* ESTADO */}
                          <td className="px-6 py-4">
                            <span
                              className="inline-flex rounded-full px-3 py-1 text-xs font-semibold"
                              style={
                                producto.estado ===
                                'Activo'
                                  ? {
                                      backgroundColor:
                                        VINO_SUAVE,
                                      color:
                                        VINO_OSCURO,
                                    }
                                  : {
                                      backgroundColor:
                                        '#F3F4F6',
                                      color: GRIS,
                                    }
                              }
                            >
                              {producto.estado}
                            </span>
                          </td>

                          {/* ACCIONES */}
                          <td className="px-6 py-4 text-right">
                            {producto.estado ===
                              'Activo' && (
                              <button
                                type="button"
                                onClick={() =>
                                  desactivarProducto(
                                    producto.id
                                  )
                                }
                                className="rounded-lg px-3 py-1.5 text-sm font-medium transition hover:bg-red-50"
                                style={{
                                  color: '#B91C1C',
                                }}
                              >
                                Desactivar
                              </button>
                            )}
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
      </div>

      {/* MODAL NUEVO PRODUCTO */}
      {mostrarFormulario && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]">

          <div className="w-full max-w-md overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">

            {/* HEADER MODAL */}
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5">
              <div>
                <h2
                  className="text-lg font-semibold"
                  style={{ color: NEGRO }}
                >
                  Nuevo producto
                </h2>

                <p
                  className="mt-1 text-xs"
                  style={{ color: GRIS }}
                >
                  Registra un nuevo producto en el
                  sistema.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setMostrarFormulario(false);
                  setError('');
                }}
                className="rounded-lg p-2 transition hover:bg-gray-100"
                style={{ color: GRIS }}
              >
                <X size={20} />
              </button>
            </div>

            {/* FORMULARIO */}
            <form
              onSubmit={crearProducto}
              className="space-y-5 p-6"
            >

              {/* NOMBRE */}
              <div>
                <label
                  className="mb-1.5 block text-sm font-medium"
                  style={{ color: NEGRO }}
                >
                  Nombre
                </label>

                <input
                  type="text"
                  value={nombre}
                  onChange={(e) =>
                    setNombre(e.target.value)
                  }
                  className="w-full rounded-xl border bg-white px-3 py-2.5 text-sm outline-none transition"
                  style={{
                    borderColor: '#D1D5DB',
                    color: NEGRO,
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor =
                      VINO;
                    e.currentTarget.style.boxShadow =
                      `0 0 0 3px ${VINO_SUAVE}`;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor =
                      '#D1D5DB';
                    e.currentTarget.style.boxShadow =
                      'none';
                  }}
                  placeholder="Nombre del producto"
                  required
                />
              </div>

              {/* PRECIO */}
              <div>
                <label
                  className="mb-1.5 block text-sm font-medium"
                  style={{ color: NEGRO }}
                >
                  Precio
                </label>

                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={precio}
                  onChange={(e) =>
                    setPrecio(e.target.value)
                  }
                  className="w-full rounded-xl border bg-white px-3 py-2.5 text-sm outline-none transition"
                  style={{
                    borderColor: '#D1D5DB',
                    color: NEGRO,
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor =
                      VINO;
                    e.currentTarget.style.boxShadow =
                      `0 0 0 3px ${VINO_SUAVE}`;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor =
                      '#D1D5DB';
                    e.currentTarget.style.boxShadow =
                      'none';
                  }}
                  placeholder="0.00"
                  required
                />
              </div>

              {/* CATEGORÍA */}
              <div>
                <label
                  className="mb-1.5 block text-sm font-medium"
                  style={{ color: NEGRO }}
                >
                  ID de categoría
                </label>

                <input
                  type="number"
                  min="1"
                  value={categoria}
                  onChange={(e) =>
                    setCategoria(e.target.value)
                  }
                  className="w-full rounded-xl border bg-white px-3 py-2.5 text-sm outline-none transition"
                  style={{
                    borderColor: '#D1D5DB',
                    color: NEGRO,
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor =
                      VINO;
                    e.currentTarget.style.boxShadow =
                      `0 0 0 3px ${VINO_SUAVE}`;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor =
                      '#D1D5DB';
                    e.currentTarget.style.boxShadow =
                      'none';
                  }}
                  placeholder="Ejemplo: 1"
                  required
                />

                <p
                  className="mt-1.5 text-xs"
                  style={{ color: GRIS }}
                >
                  Ingresa el ID de una categoría
                  existente.
                </p>
              </div>

              {/* BOTONES */}
              <div className="flex justify-end gap-3 border-t border-gray-100 pt-5">

                <button
                  type="button"
                  onClick={() => {
                    setMostrarFormulario(false);
                    setError('');
                  }}
                  className="rounded-xl border bg-white px-4 py-2.5 text-sm font-medium transition hover:bg-gray-50"
                  style={{
                    borderColor: '#D1D5DB',
                    color: NEGRO,
                  }}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="rounded-xl px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:opacity-90"
                  style={{
                    backgroundColor: VINO_OSCURO,
                  }}
                >
                  Guardar producto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}