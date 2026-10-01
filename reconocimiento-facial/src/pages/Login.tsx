import { useEffect, useRef, useState } from 'react';
import * as faceapi from '@vladmandic/face-api';
import API from '../services/api';

interface Usuario {
  id: number;
  dni: string;
  nombre: string;
  rol: string;
  estado: string;
  tiene_rostro?: boolean;
  fecha_registro?: string;
}

interface LoginProps {
  onLogin: (usuario: Usuario) => void;
}

type EstadoCamara =
  | 'apagada'
  | 'cargando'
  | 'activa'
  | 'detectando'
  | 'error';

const GRIS_PRINCIPAL = '#4B5563';
const GRIS_OSCURO = '#2F3337';
const GRIS_MEDIO = '#6B7280';
const GRIS_SUAVE = '#E5E7EB';
const GRIS_FONDO = '#F3F4F6';
const BLANCO = '#FFFFFF';
const NEGRO = '#111111';

export default function Login({ onLogin }: LoginProps) {
  const [dni, setDni] = useState('');
  const [usuario, setUsuario] = useState<Usuario | null>(null);

  const [estadoCamara, setEstadoCamara] =
    useState<EstadoCamara>('apagada');

  const [modelosCargados, setModelosCargados] = useState(false);
  const [rostroDetectado, setRostroDetectado] = useState(false);

  const [registrando, setRegistrando] = useState(false);
  const [verificando, setVerificando] = useState(false);

  const [rostroRegistrado, setRostroRegistrado] = useState(false);
  const [rostroVerificado, setRostroVerificado] = useState(false);

  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  const [cargandoDni, setCargandoDni] = useState(false);

  const [distanciaFacial, setDistanciaFacial] =
    useState<number | null>(null);

  const videoDesktopRef = useRef<HTMLVideoElement | null>(null);
  const videoMobileRef = useRef<HTMLVideoElement | null>(null);

  const streamRef = useRef<MediaStream | null>(null);
  const intervaloDeteccionRef =
    useRef<ReturnType<typeof setInterval> | null>(null);

  const obtenerVideoVisible = () => {
    if (
      videoDesktopRef.current &&
      videoDesktopRef.current.offsetParent !== null
    ) {
      return videoDesktopRef.current;
    }

    return videoMobileRef.current;
  };

  useEffect(() => {
    return () => {
      detenerCamara();
    };
  }, []);

  const hablar = (texto: string) => {
    if (!('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();

    const mensajeVoz = new SpeechSynthesisUtterance(texto);
    mensajeVoz.lang = 'es-PE';
    mensajeVoz.rate = 0.9;
    mensajeVoz.pitch = 1;

    window.speechSynthesis.speak(mensajeVoz);
  };

  const detenerCamara = () => {
    if (intervaloDeteccionRef.current) {
      clearInterval(intervaloDeteccionRef.current);
      intervaloDeteccionRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });

      streamRef.current = null;
    }

    if (videoDesktopRef.current) {
      videoDesktopRef.current.srcObject = null;
    }

    if (videoMobileRef.current) {
      videoMobileRef.current.srcObject = null;
    }

    setRostroDetectado(false);
    setEstadoCamara('apagada');
  };

  const cargarModelosFaciales = async () => {
    if (modelosCargados) return true;

    try {
      await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
      await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
      await faceapi.nets.faceRecognitionNet.loadFromUri('/models');

      setModelosCargados(true);

      return true;
    } catch (err) {
      console.error('Error cargando modelos faciales:', err);

      setError(
        'No se pudieron cargar los modelos de reconocimiento facial.'
      );

      setEstadoCamara('error');

      return false;
    }
  };

  const buscarUsuario = async () => {
    const dniLimpio = dni.trim();

    setError('');
    setMensaje('');
    setUsuario(null);
    setRostroRegistrado(false);
    setRostroVerificado(false);
    setDistanciaFacial(null);

    if (!/^\d{8}$/.test(dniLimpio)) {
      setError('Ingrese un DNI válido de 8 dígitos.');
      hablar('Ingrese un DNI válido de 8 dígitos.');
      return;
    }

    setCargandoDni(true);

    try {
      const respuesta = await fetch(
        `${API}/usuarios/biometria/dni/${dniLimpio}`
      );

      if (!respuesta.ok) {
        throw new Error('Usuario no encontrado');
      }

      const datos: Usuario = await respuesta.json();

      if (
        datos.estado &&
        datos.estado.toLowerCase() !== 'activo'
      ) {
        setError('El usuario se encuentra inactivo.');
        hablar('El usuario se encuentra inactivo.');
        return;
      }

      setUsuario(datos);

      if (datos.tiene_rostro) {
        setMensaje(
          'Usuario encontrado. Verifique su identidad mediante reconocimiento facial.'
        );

        hablar(
          `Bienvenido ${datos.nombre}. Verifique su identidad mediante reconocimiento facial.`
        );
      } else {
        setMensaje(
          'Usuario encontrado. Registre su rostro para continuar.'
        );

        hablar(
          `Hola ${datos.nombre}. Registre su rostro para continuar.`
        );
      }
    } catch (err) {
      console.error(err);

      setError(
        'No se encontró un usuario autorizado con ese DNI.'
      );

      hablar('DNI no autorizado en el sistema.');
    } finally {
      setCargandoDni(false);
    }
  };

  const iniciarCamara = async () => {
    if (!usuario) {
      setError('Primero debe ingresar y validar su DNI.');
      return;
    }

    setError('');
    setMensaje('');
    setEstadoCamara('cargando');

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error(
          'El navegador no permite acceder a la cámara.'
        );
      }

      const stream =
        await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user',
            width: {
              ideal: 640,
            },
            height: {
              ideal: 480,
            },
          },
          audio: false,
        });

      streamRef.current = stream;

      if (videoDesktopRef.current) {
        videoDesktopRef.current.srcObject = stream;
        videoDesktopRef.current.muted = true;
      }

      if (videoMobileRef.current) {
        videoMobileRef.current.srcObject = stream;
        videoMobileRef.current.muted = true;
      }

      const video = obtenerVideoVisible();

      if (!video) {
        throw new Error(
          'No se encontró el elemento de video.'
        );
      }

      await video.play();

      setEstadoCamara('activa');

      const modelosOK = await cargarModelosFaciales();

      if (!modelosOK) return;

      iniciarDeteccion();
    } catch (err) {
      console.error('Error iniciando cámara:', err);

      setEstadoCamara('error');

      setError(
        'No se pudo acceder a la cámara. Verifique los permisos del navegador.'
      );

      hablar(
        'No se pudo acceder a la cámara. Verifique los permisos del navegador.'
      );
    }
  };

  const iniciarDeteccion = () => {
    if (intervaloDeteccionRef.current) {
      clearInterval(intervaloDeteccionRef.current);
    }

    intervaloDeteccionRef.current = setInterval(async () => {
      const video = obtenerVideoVisible();

      if (!video) return;

      if (
        video.readyState < 2 ||
        video.videoWidth === 0 ||
        video.videoHeight === 0
      ) {
        return;
      }

      try {
        setEstadoCamara('detectando');

        const deteccion =
          await faceapi
            .detectSingleFace(
              video,
              new faceapi.TinyFaceDetectorOptions({
                inputSize: 320,
                scoreThreshold: 0.5,
              })
            )
            .withFaceLandmarks()
            .withFaceDescriptor();

        if (deteccion) {
          setRostroDetectado(true);
        } else {
          setRostroDetectado(false);
        }
      } catch (err) {
        console.error(
          'Error durante detección facial:',
          err
        );
      }
    }, 700);
  };

  const obtenerDescriptorActual = async () => {
    const video = obtenerVideoVisible();

    if (!video) {
      throw new Error('La cámara no está disponible.');
    }

    const deteccion =
      await faceapi
        .detectSingleFace(
          video,
          new faceapi.TinyFaceDetectorOptions({
            inputSize: 320,
            scoreThreshold: 0.5,
          })
        )
        .withFaceLandmarks()
        .withFaceDescriptor();

    if (!deteccion) {
      throw new Error(
        'No se detectó ningún rostro. Coloque su rostro frente a la cámara.'
      );
    }

    return Array.from(deteccion.descriptor);
  };

  const registrarRostro = async () => {
    if (!usuario) return;

    setError('');
    setMensaje('');

    if (!rostroDetectado) {
      setError(
        'Primero debe colocar su rostro frente a la cámara.'
      );

      hablar(
        'Coloque su rostro frente a la cámara.'
      );

      return;
    }

    setRegistrando(true);

    try {
      const descriptor = await obtenerDescriptorActual();

      const respuesta = await fetch(
        `${API}/usuarios/${usuario.id}/rostro`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            descriptor,
          }),
        }
      );

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          datos?.detail ||
            'No se pudo registrar el rostro.'
        );
      }

      setRostroRegistrado(true);

      setMensaje(
        '¡Rostro registrado correctamente en MATAS PERU EIRL!'
      );

      hablar(
        'Rostro registrado correctamente en MATAS PERU EIRL.'
      );

      detenerCamara();
    } catch (err: any) {
      console.error(err);

      setError(
        err?.message ||
          'No se pudo registrar el rostro.'
      );

      hablar(
        'No se pudo registrar el rostro.'
      );
    } finally {
      setRegistrando(false);
    }
  };

  const verificarRostro = async () => {
    if (!usuario) return;

    setError('');
    setMensaje('');

    if (!rostroDetectado) {
      setError(
        'No se detectó ningún rostro frente a la cámara.'
      );

      hablar(
        'Coloque su rostro frente a la cámara.'
      );

      return;
    }

    setVerificando(true);

    try {
      const descriptor = await obtenerDescriptorActual();

      const respuesta = await fetch(
        `${API}/usuarios/${usuario.id}/rostro/verificar`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            descriptor,
          }),
        }
      );

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          datos?.detail ||
            'No se pudo verificar el rostro.'
        );
      }

      if (typeof datos.distancia === 'number') {
        setDistanciaFacial(datos.distancia);
      }

      if (!datos.coincide) {
        setRostroVerificado(false);

        setError(
          'El rostro no coincide con el usuario registrado.'
        );

        hablar(
          'El rostro no coincide con el usuario registrado.'
        );

        return;
      }

      setRostroVerificado(true);

      setMensaje(
        'Acceso autorizado. Ingresando a MATAS PERU EIRL...'
      );

      hablar(
        `Acceso autorizado. Bienvenido a MATAS PERU EIRL, ${usuario.nombre}.`
      );

      detenerCamara();

      setTimeout(() => {
        onLogin(usuario);
      }, 800);
    } catch (err: any) {
      console.error(err);

      setError(
        err?.message ||
          'No se pudo verificar el rostro.'
      );

      hablar(
        'No se pudo verificar el rostro.'
      );
    } finally {
      setVerificando(false);
    }
  };

  const entrarDespuesDelRegistro = () => {
    if (!usuario) return;

    hablar(
      `Bienvenido a MATAS PERU EIRL, ${usuario.nombre}.`
    );

    onLogin(usuario);
  };

  const limpiarTodo = () => {
    detenerCamara();

    setDni('');
    setUsuario(null);
    setMensaje('');
    setError('');
    setRostroRegistrado(false);
    setRostroVerificado(false);
    setRostroDetectado(false);
    setDistanciaFacial(null);
  };

  const botonDeshabilitado =
    cargandoDni ||
    !/^\d{8}$/.test(dni.trim());

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        background: GRIS_FONDO,
        color: NEGRO,
        fontFamily:
          'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      {/* =========================================================
          PANEL IZQUIERDO / IMAGEN
      ========================================================= */}
      <div
        className="login-imagen-panel"
        style={{
          flex: 1,
          minHeight: '100vh',
          position: 'relative',
          overflow: 'hidden',
          backgroundImage:
            "url('/images/LOGIN-MATASPERUEIRL.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          alignItems: 'flex-end',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(to top, rgba(0,0,0,0.78), rgba(0,0,0,0.08))',
          }}
        />

        <div
          style={{
            position: 'relative',
            zIndex: 2,
            padding: '48px',
            color: BLANCO,
            maxWidth: '650px',
          }}
        >
          <div
            style={{
              fontSize: '14px',
              fontWeight: 700,
              letterSpacing: '3px',
              marginBottom: '10px',
              opacity: 0.9,
            }}
          >
            MATAS PERU EIRL
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: 'clamp(32px, 4vw, 58px)',
              lineHeight: 1.05,
              fontWeight: 800,
              letterSpacing: '-1px',
            }}
          >
            Electricidad
            <br />
            y soluciones integrales
          </h1>

          <p
            style={{
              marginTop: '18px',
              marginBottom: 0,
              fontSize: '16px',
              lineHeight: 1.6,
              color: '#E5E7EB',
            }}
          >
            Sistema empresarial de gestión, control,
            seguridad y administración.
          </p>

          <div
            style={{
              marginTop: '24px',
              fontSize: '13px',
              color: '#D1D5DB',
            }}
          >
            Gerente: GERARDO GARCIA MATAS
          </div>
        </div>
      </div>

      {/* =========================================================
          PANEL DERECHO
      ========================================================= */}
      <div
        style={{
          width: 'min(560px, 100%)',
          minHeight: '100vh',
          background: BLANCO,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 28px',
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '430px',
          }}
        >
          {/* LOGO */}
          <div
            style={{
              textAlign: 'center',
              marginBottom: '30px',
            }}
          >
            <div
              style={{
                fontSize: '28px',
                fontWeight: 900,
                letterSpacing: '2px',
                color: NEGRO,
              }}
            >
              MATAS PERU EIRL
            </div>

            <div
              style={{
                marginTop: '7px',
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '1.8px',
                color: GRIS_MEDIO,
                textTransform: 'uppercase',
              }}
            >
              Electricidad y soluciones integrales
            </div>
          </div>

          {/* TÍTULO */}
          <div style={{ marginBottom: '24px' }}>
            <h2
              style={{
                margin: 0,
                fontSize: '28px',
                fontWeight: 800,
                color: NEGRO,
              }}
            >
              Acceso seguro
            </h2>

            <p
              style={{
                marginTop: '8px',
                marginBottom: 0,
                color: GRIS_MEDIO,
                fontSize: '14px',
                lineHeight: 1.5,
              }}
            >
              Ingrese su DNI para acceder al sistema.
            </p>
          </div>

          {/* DNI */}
          <div style={{ marginBottom: '16px' }}>
            <label
              style={{
                display: 'block',
                marginBottom: '7px',
                fontSize: '13px',
                fontWeight: 700,
                color: GRIS_OSCURO,
              }}
            >
              DNI
            </label>

            <input
              type="text"
              inputMode="numeric"
              maxLength={8}
              value={dni}
              onChange={(e) => {
                const valor = e.target.value
                  .replace(/\D/g, '')
                  .slice(0, 8);

                setDni(valor);
                setError('');
                setMensaje('');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  buscarUsuario();
                }
              }}
              placeholder="Ingrese su DNI"
              style={{
                width: '100%',
                boxSizing: 'border-box',
                height: '50px',
                borderRadius: '10px',
                border: `1px solid ${GRIS_SUAVE}`,
                background: BLANCO,
                padding: '0 15px',
                fontSize: '15px',
                color: NEGRO,
                outline: 'none',
              }}
            />
          </div>

          {/* BOTÓN BUSCAR */}
          {!usuario && (
            <button
              onClick={buscarUsuario}
              disabled={botonDeshabilitado}
              style={{
                width: '100%',
                height: '50px',
                border: 'none',
                borderRadius: '10px',
                background: botonDeshabilitado
                  ? '#D1D5DB'
                  : GRIS_OSCURO,
                color: BLANCO,
                fontWeight: 700,
                fontSize: '14px',
                cursor: botonDeshabilitado
                  ? 'not-allowed'
                  : 'pointer',
              }}
            >
              {cargandoDni
                ? 'Verificando DNI...'
                : 'Continuar'}
            </button>
          )}

          {/* USUARIO ENCONTRADO */}
          {usuario && (
            <div
              style={{
                border: `1px solid ${GRIS_SUAVE}`,
                borderRadius: '14px',
                padding: '18px',
                marginTop: '20px',
                background: '#FAFAFA',
              }}
            >
              <div
                style={{
                  fontSize: '12px',
                  color: GRIS_MEDIO,
                  marginBottom: '5px',
                }}
              >
                Usuario autorizado
              </div>

              <div
                style={{
                  fontSize: '18px',
                  fontWeight: 800,
                  color: NEGRO,
                }}
              >
                {usuario.nombre}
              </div>

              <div
                style={{
                  marginTop: '5px',
                  fontSize: '13px',
                  color: GRIS_MEDIO,
                }}
              >
                DNI: {usuario.dni}
              </div>

              <div
                style={{
                  marginTop: '3px',
                  fontSize: '13px',
                  color: GRIS_MEDIO,
                }}
              >
                Rol: {usuario.rol}
              </div>
            </div>
          )}

          {/* MENSAJE */}
          {mensaje && (
            <div
              style={{
                marginTop: '16px',
                padding: '13px 15px',
                borderRadius: '10px',
                background: '#F3F4F6',
                border: `1px solid ${GRIS_SUAVE}`,
                color: GRIS_OSCURO,
                fontSize: '13px',
                lineHeight: 1.5,
              }}
            >
              {mensaje}
            </div>
          )}

          {/* ERROR */}
          {error && (
            <div
              style={{
                marginTop: '16px',
                padding: '13px 15px',
                borderRadius: '10px',
                background: '#F3F4F6',
                border: '1px solid #D1D5DB',
                color: '#1F2937',
                fontSize: '13px',
                lineHeight: 1.5,
              }}
            >
              {error}
            </div>
          )}

          {/* =====================================================
              CÁMARA DESKTOP
          ===================================================== */}
          {usuario && (
            <div style={{ marginTop: '22px' }}>
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  aspectRatio: '4 / 3',
                  borderRadius: '14px',
                  overflow: 'hidden',
                  background: NEGRO,
                  border: `1px solid ${GRIS_SUAVE}`,
                }}
              >
                <video
                  ref={videoDesktopRef}
                  autoPlay
                  muted
                  playsInline
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transform: 'scaleX(-1)',
                    display:
                      estadoCamara === 'apagada'
                        ? 'none'
                        : 'block',
                  }}
                />

                {estadoCamara === 'apagada' && (
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: BLANCO,
                      textAlign: 'center',
                      padding: '20px',
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: '15px',
                          fontWeight: 700,
                        }}
                      >
                        Reconocimiento facial
                      </div>

                      <div
                        style={{
                          marginTop: '7px',
                          fontSize: '12px',
                          color: '#D1D5DB',
                        }}
                      >
                        Active la cámara para continuar
                      </div>
                    </div>
                  </div>
                )}

                {estadoCamara === 'cargando' && (
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'rgba(0,0,0,0.7)',
                      color: BLANCO,
                      fontWeight: 700,
                    }}
                  >
                    Iniciando cámara...
                  </div>
                )}

                {estadoCamara !== 'apagada' &&
                  rostroDetectado && (
                    <div
                      style={{
                        position: 'absolute',
                        left: '15px',
                        right: '15px',
                        bottom: '15px',
                        padding: '11px',
                        borderRadius: '9px',
                        background:
                          'rgba(255,255,255,0.94)',
                        color: NEGRO,
                        textAlign: 'center',
                        fontSize: '13px',
                        fontWeight: 700,
                      }}
                    >
                      Rostro detectado correctamente
                    </div>
                  )}
              </div>

              {/* BOTONES */}
              <div
                style={{
                  display: 'flex',
                  gap: '10px',
                  marginTop: '14px',
                }}
              >
                {estadoCamara === 'apagada' && (
                  <button
                    onClick={iniciarCamara}
                    style={{
                      flex: 1,
                      height: '48px',
                      border: 'none',
                      borderRadius: '10px',
                      background: GRIS_OSCURO,
                      color: BLANCO,
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Activar cámara
                  </button>
                )}

                {estadoCamara !== 'apagada' &&
                  !rostroRegistrado &&
                  !rostroVerificado && (
                    <>
                      {!usuario.tiene_rostro ? (
                        <button
                          onClick={registrarRostro}
                          disabled={
                            registrando ||
                            !rostroDetectado
                          }
                          style={{
                            flex: 1,
                            height: '48px',
                            border: 'none',
                            borderRadius: '10px',
                            background:
                              registrando ||
                              !rostroDetectado
                                ? '#D1D5DB'
                                : GRIS_PRINCIPAL,
                            color: BLANCO,
                            fontWeight: 700,
                            cursor:
                              registrando ||
                              !rostroDetectado
                                ? 'not-allowed'
                                : 'pointer',
                          }}
                        >
                          {registrando
                            ? 'Registrando...'
                            : 'Registrar rostro'}
                        </button>
                      ) : (
                        <button
                          onClick={verificarRostro}
                          disabled={
                            verificando ||
                            !rostroDetectado
                          }
                          style={{
                            flex: 1,
                            height: '48px',
                            border: 'none',
                            borderRadius: '10px',
                            background:
                              verificando ||
                              !rostroDetectado
                                ? '#D1D5DB'
                                : GRIS_OSCURO,
                            color: BLANCO,
                            fontWeight: 700,
                            cursor:
                              verificando ||
                              !rostroDetectado
                                ? 'not-allowed'
                                : 'pointer',
                          }}
                        >
                          {verificando
                            ? 'Verificando...'
                            : 'Verificar rostro'}
                        </button>
                      )}

                      <button
                        onClick={detenerCamara}
                        style={{
                          width: '110px',
                          height: '48px',
                          border: `1px solid ${GRIS_SUAVE}`,
                          borderRadius: '10px',
                          background: BLANCO,
                          color: GRIS_OSCURO,
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        Detener
                      </button>
                    </>
                  )}
              </div>
            </div>
          )}

          {/* ROSTRO REGISTRADO */}
          {rostroRegistrado && (
            <div
              style={{
                marginTop: '20px',
                padding: '18px',
                borderRadius: '12px',
                background: GRIS_FONDO,
                border: `1px solid ${GRIS_SUAVE}`,
              }}
            >
              <div
                style={{
                  fontSize: '15px',
                  fontWeight: 800,
                  color: NEGRO,
                }}
              >
                Rostro registrado correctamente
              </div>

              <p
                style={{
                  margin: '7px 0 15px',
                  fontSize: '13px',
                  color: GRIS_MEDIO,
                  lineHeight: 1.5,
                }}
              >
                Su información biométrica fue guardada
                de forma segura en MATAS PERU EIRL.
              </p>

              <button
                onClick={entrarDespuesDelRegistro}
                style={{
                  width: '100%',
                  height: '46px',
                  border: 'none',
                  borderRadius: '10px',
                  background: GRIS_OSCURO,
                  color: BLANCO,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Continuar a MATAS PERU EIRL
              </button>
            </div>
          )}

          {/* VERIFICACIÓN EXITOSA */}
          {rostroVerificado && (
            <div
              style={{
                marginTop: '20px',
                padding: '18px',
                borderRadius: '12px',
                background: GRIS_FONDO,
                border: `1px solid ${GRIS_SUAVE}`,
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  fontSize: '17px',
                  fontWeight: 800,
                  color: NEGRO,
                }}
              >
                Acceso autorizado
              </div>

              <div
                style={{
                  marginTop: '7px',
                  fontSize: '13px',
                  color: GRIS_MEDIO,
                }}
              >
                Ingresando al sistema...
              </div>

              {distanciaFacial !== null && (
                <div
                  style={{
                    marginTop: '10px',
                    fontSize: '11px',
                    color: GRIS_MEDIO,
                  }}
                >
                  Coincidencia facial verificada
                </div>
              )}
            </div>
          )}

          {/* VOLVER */}
          {usuario && !rostroVerificado && (
            <button
              onClick={limpiarTodo}
              style={{
                width: '100%',
                marginTop: '16px',
                height: '42px',
                border: 'none',
                background: 'transparent',
                color: GRIS_MEDIO,
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Cambiar usuario
            </button>
          )}

          {/* FOOTER */}
          <div
            style={{
              marginTop: '34px',
              paddingTop: '18px',
              borderTop: `1px solid ${GRIS_SUAVE}`,
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontSize: '11px',
                color: GRIS_MEDIO,
              }}
            >
              MATAS PERU EIRL
            </div>

            <div
              style={{
                marginTop: '4px',
                fontSize: '10px',
                color: '#9CA3AF',
              }}
            >
              GERARDO GARCIA MATAS · GERENTE
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================
          ESTILOS RESPONSIVOS
      ========================================================= */}
      <style>
        {`
          @media (max-width: 900px) {
            .login-imagen-panel {
              display: none !important;
            }
          }

          @media (max-width: 500px) {
            body {
              margin: 0;
            }
          }
        `}
      </style>
    </div>
  );
}
