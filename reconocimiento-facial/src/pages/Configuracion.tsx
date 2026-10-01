import { useState } from 'react';
import {
  Settings,
  Bell,
  Shield,
  Database,
  Moon,
  Save,
  CheckCircle2,
} from 'lucide-react';

/* =========================================================
   PALETA MATAS PERU EIRL
========================================================= */

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

export default function Configuracion() {
  const [notificaciones, setNotificaciones] = useState(true);
  const [modoOscuro, setModoOscuro] = useState(false);
  const [confirmacion, setConfirmacion] = useState(true);
  const [guardado, setGuardado] = useState(false);

  const guardarConfiguracion = () => {
    localStorage.setItem(
      'matrixflow_configuracion',
      JSON.stringify({
        notificaciones,
        modoOscuro,
        confirmacion,
      }),
    );

    setGuardado(true);

    setTimeout(() => {
      setGuardado(false);
    }, 2500);
  };

  return (
    <div
      className="min-h-full space-y-6"
      style={{
        backgroundColor: GRIS_FONDO,
      }}
    >
      {/* =================================================
          ENCABEZADO
      ================================================= */}

      <div>
        <div className="flex items-center gap-3">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-xl"
            style={{
              backgroundColor: GRIS_SUAVE,
              color: GRIS_OSCURO,
            }}
          >
            <Settings
              size={23}
              strokeWidth={1.9}
            />
          </div>

          <div>
            <h1
              className="text-2xl font-bold"
              style={{
                color: NEGRO,
              }}
            >
              Configuración
            </h1>

            <p
              className="text-sm"
              style={{
                color: GRIS_MEDIO,
              }}
            >
              Administra las preferencias generales de{' '}
              {EMPRESA_NOMBRE}.
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

      {/* =================================================
          MENSAJE DE GUARDADO
      ================================================= */}

      {guardado && (
        <div
          className="flex items-center gap-3 rounded-xl border p-4 text-sm font-medium"
          style={{
            borderColor: GRIS_SUAVE,
            backgroundColor: BLANCO,
            color: GRIS_OSCURO,
          }}
        >
          <CheckCircle2 size={18} />

          Configuración guardada correctamente.
        </div>
      )}

      {/* =================================================
          TARJETAS
      ================================================= */}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">

        {/* =================================================
            NOTIFICACIONES
        ================================================= */}

        <div
          className="rounded-2xl border bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
          style={{
            borderColor: GRIS_SUAVE,
          }}
        >
          <div className="mb-6 flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl"
              style={{
                backgroundColor: GRIS_SUAVE,
                color: GRIS_OSCURO,
              }}
            >
              <Bell
                size={19}
                strokeWidth={1.9}
              />
            </div>

            <div>
              <h2
                className="font-semibold"
                style={{
                  color: NEGRO,
                }}
              >
                Notificaciones
              </h2>

              <p
                className="text-sm"
                style={{
                  color: GRIS_MEDIO,
                }}
              >
                Controla los avisos del sistema.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between gap-5">
            <div>
              <p
                className="font-medium"
                style={{
                  color: NEGRO,
                }}
              >
                Activar notificaciones
              </p>

              <p
                className="mt-1 text-sm"
                style={{
                  color: GRIS_MEDIO,
                }}
              >
                Mostrar avisos importantes del sistema.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setNotificaciones(!notificaciones)
              }
              aria-label="Activar o desactivar notificaciones"
              className="relative h-6 w-11 shrink-0 rounded-full transition-all"
              style={{
                backgroundColor: notificaciones
                  ? GRIS_OSCURO
                  : '#D1D5DB',
              }}
            >
              <span
                className="absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-all"
                style={{
                  left: notificaciones
                    ? '24px'
                    : '4px',
                }}
              />
            </button>
          </div>
        </div>

        {/* =================================================
            SEGURIDAD
        ================================================= */}

        <div
          className="rounded-2xl border bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
          style={{
            borderColor: GRIS_SUAVE,
          }}
        >
          <div className="mb-6 flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl"
              style={{
                backgroundColor: GRIS_SUAVE,
                color: GRIS_OSCURO,
              }}
            >
              <Shield
                size={19}
                strokeWidth={1.9}
              />
            </div>

            <div>
              <h2
                className="font-semibold"
                style={{
                  color: NEGRO,
                }}
              >
                Seguridad
              </h2>

              <p
                className="text-sm"
                style={{
                  color: GRIS_MEDIO,
                }}
              >
                Preferencias de seguridad del sistema.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between gap-5">
            <div>
              <p
                className="font-medium"
                style={{
                  color: NEGRO,
                }}
              >
                Confirmar operaciones
              </p>

              <p
                className="mt-1 text-sm"
                style={{
                  color: GRIS_MEDIO,
                }}
              >
                Solicitar confirmación antes de
                operaciones importantes.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setConfirmacion(!confirmacion)
              }
              aria-label="Activar o desactivar confirmaciones"
              className="relative h-6 w-11 shrink-0 rounded-full transition-all"
              style={{
                backgroundColor: confirmacion
                  ? GRIS_OSCURO
                  : '#D1D5DB',
              }}
            >
              <span
                className="absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-all"
                style={{
                  left: confirmacion
                    ? '24px'
                    : '4px',
                }}
              />
            </button>
          </div>
        </div>

        {/* =================================================
            APARIENCIA
        ================================================= */}

        <div
          className="rounded-2xl border bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
          style={{
            borderColor: GRIS_SUAVE,
          }}
        >
          <div className="mb-6 flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl"
              style={{
                backgroundColor: GRIS_SUAVE,
                color: GRIS_OSCURO,
              }}
            >
              <Moon
                size={19}
                strokeWidth={1.9}
              />
            </div>

            <div>
              <h2
                className="font-semibold"
                style={{
                  color: NEGRO,
                }}
              >
                Apariencia
              </h2>

              <p
                className="text-sm"
                style={{
                  color: GRIS_MEDIO,
                }}
              >
                Configura la apariencia de la aplicación.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between gap-5">
            <div>
              <p
                className="font-medium"
                style={{
                  color: NEGRO,
                }}
              >
                Modo oscuro
              </p>

              <p
                className="mt-1 text-sm"
                style={{
                  color: GRIS_MEDIO,
                }}
              >
                Activar la interfaz en modo oscuro.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setModoOscuro(!modoOscuro)
              }
              aria-label="Activar o desactivar modo oscuro"
              className="relative h-6 w-11 shrink-0 rounded-full transition-all"
              style={{
                backgroundColor: modoOscuro
                  ? GRIS_OSCURO
                  : '#D1D5DB',
              }}
            >
              <span
                className="absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-all"
                style={{
                  left: modoOscuro
                    ? '24px'
                    : '4px',
                }}
              />
            </button>
          </div>
        </div>

        {/* =================================================
            SISTEMA
        ================================================= */}

        <div
          className="rounded-2xl border bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
          style={{
            borderColor: GRIS_SUAVE,
          }}
        >
          <div className="mb-6 flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl"
              style={{
                backgroundColor: GRIS_SUAVE,
                color: GRIS_OSCURO,
              }}
            >
              <Database
                size={19}
                strokeWidth={1.9}
              />
            </div>

            <div>
              <h2
                className="font-semibold"
                style={{
                  color: NEGRO,
                }}
              >
                Sistema
              </h2>

              <p
                className="text-sm"
                style={{
                  color: GRIS_MEDIO,
                }}
              >
                Información del sistema {EMPRESA_NOMBRE}.
              </p>
            </div>
          </div>

          <div
            className="space-y-3 text-sm"
            style={{
              color: GRIS_MEDIO,
            }}
          >
            <div
              className="flex justify-between border-b pb-3"
              style={{
                borderColor: GRIS_SUAVE,
              }}
            >
              <span>Aplicación</span>

              <span
                className="font-medium"
                style={{
                  color: NEGRO,
                }}
              >
                {EMPRESA_NOMBRE}
              </span>
            </div>

            <div
              className="flex justify-between border-b pb-3"
              style={{
                borderColor: GRIS_SUAVE,
              }}
            >
              <span>Versión</span>

              <span
                className="font-medium"
                style={{
                  color: NEGRO,
                }}
              >
                1.0.0
              </span>
            </div>

            <div
              className="flex justify-between border-b pb-3"
              style={{
                borderColor: GRIS_SUAVE,
              }}
            >
              <span>Gerente</span>

              <span
                className="font-medium text-right"
                style={{
                  color: NEGRO,
                }}
              >
                {EMPRESA_GERENTE}
              </span>
            </div>

            <div className="flex justify-between">
              <span>Estado</span>

              <span
                className="flex items-center gap-2 font-medium"
                style={{
                  color: GRIS_OSCURO,
                }}
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{
                    backgroundColor: GRIS_OSCURO,
                  }}
                />

                Sistema operativo
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* =================================================
          BOTÓN GUARDAR
      ================================================= */}

      <div className="flex justify-end">
        <button
          type="button"
          onClick={guardarConfiguracion}
          className="flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-medium text-white shadow-sm transition-all hover:opacity-90"
          style={{
            backgroundColor: GRIS_OSCURO,
            boxShadow:
              '0 7px 18px rgba(47,51,55,0.18)',
          }}
        >
          <Save size={18} />

          Guardar configuración
        </button>
      </div>
    </div>
  );
}
