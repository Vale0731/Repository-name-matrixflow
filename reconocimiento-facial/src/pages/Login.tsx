import { useEffect, useRef, useState } from 'react';
import * as faceapi from '@vladmandic/face-api';
import API from '../services/api';

type Usuario = {
  id: number;
  dni: string;
  nombre: string;
  rol: string;
  estado: string;
  tiene_rostro?: boolean;
  fecha_registro?: string | null;
};

type LoginProps = {
  onLogin: (usuario: Usuario) => void;
};

type EstadoCamara =
  | 'apagada'
  | 'cargando'
  | 'activa'
  | 'detectando'
  | 'error';

export default function Login({ onLogin }: LoginProps) {
  const videoDesktopRef = useRef<HTMLVideoElement | null>(null);
  const videoMobileRef = useRef<HTMLVideoElement | null>(null);

  const obtenerVideoVisible = () => {
    if (typeof window === 'undefined') {
      return videoDesktopRef.current ?? videoMobileRef.current;
    }

    return window.innerWidth >= 1024
      ? videoDesktopRef.current
      : videoMobileRef.current;
  };
  const streamRef = useRef<MediaStream | null>(null);
  const intervaloRef = useRef<number | null>(null);

  const [dni, setDni] = useState('');
  const [usuario, setUsuario] = useState<Usuario | null>(null);

  const [estadoCamara, setEstadoCamara] =
    useState<EstadoCamara>('apagada');

  const [modelosCargados, setModelosCargados] =
    useState(false);

  const [rostroDetectado, setRostroDetectado] =
    useState(false);

  const [registrandoRostro, setRegistrandoRostro] =
    useState(false);

  const [verificandoRostro, setVerificandoRostro] =
    useState(false);

  const [rostroRegistrado, setRostroRegistrado] =
    useState(false);

  const [rostroVerificado, setRostroVerificado] =
    useState(false);

  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  const [cargandoDni, setCargandoDni] =
    useState(false);

  const [distanciaFacial, setDistanciaFacial] =
    useState<number | null>(null);

  // ============================================================
  // LIMPIEZA
  // ============================================================

  useEffect(() => {
    return () => {
      detenerCamara();
    };
  }, []);

  // ============================================================
  // VOZ
  // ============================================================

  const hablar = (texto: string) => {
    try {
      if (!('speechSynthesis' in window)) {
        return;
      }

      window.speechSynthesis.cancel();

      const voz =
        new SpeechSynthesisUtterance(texto);

      voz.lang = 'es-PE';
      voz.rate = 0.95;
      voz.pitch = 1;

      window.speechSynthesis.speak(voz);
    } catch {
      // La voz es opcional.
    }
  };

  // ============================================================
  // DETENER CÁMARA
  // ============================================================

  const detenerCamara = () => {
    if (intervaloRef.current !== null) {
      window.clearInterval(intervaloRef.current);
      intervaloRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current
        .getTracks()
        .forEach((track) => track.stop());

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

  // ============================================================
  // CARGAR MODELOS
  // ============================================================

  const cargarModelosFaciales = async () => {
    if (modelosCargados) {
      return;
    }

    setMensaje(
      'Cargando modelos de reconocimiento facial...'
    );

    setError('');

    try {
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(
          '/models'
        ),

        faceapi.nets.faceLandmark68Net.loadFromUri(
          '/models'
        ),

        faceapi.nets.faceRecognitionNet.loadFromUri(
          '/models'
        ),
      ]);

      setModelosCargados(true);

      setMensaje(
        'Modelos faciales cargados correctamente.'
      );
    } catch (error) {
      console.error(
        'Error cargando modelos:',
        error
      );

      setError(
        'No se pudieron cargar los modelos faciales. Verifique public/models.'
      );

      setEstadoCamara('error');

      throw error;
    }
  };

  // ============================================================
  // BUSCAR USUARIO POR DNI
  // ============================================================

  const buscarUsuario = async () => {
    const dniLimpio = dni.trim();

    if (!dniLimpio) {
      setError('Ingrese su DNI.');
      return;
    }

    if (!/^\d{8}$/.test(dniLimpio)) {
      setError(
        'El DNI debe contener exactamente 8 números.'
      );
      return;
    }

    setCargandoDni(true);
    setError('');
    setMensaje('');

    setUsuario(null);
    setRostroRegistrado(false);
    setRostroVerificado(false);
    setDistanciaFacial(null);

    detenerCamara();

    try {
      const respuesta = await fetch(
        `${API}/usuarios/biometria/dni/${encodeURIComponent(
          dniLimpio
        )}`
      );

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          datos?.detail ||
            'No se pudo consultar el DNI.'
        );
      }

      const usuarioEncontrado: Usuario = datos;

      if (
        String(usuarioEncontrado.estado).toLowerCase() !==
        'activo'
      ) {
        throw new Error(
          'El usuario está registrado, pero se encuentra inactivo.'
        );
      }

      setUsuario(usuarioEncontrado);

      if (usuarioEncontrado.tiene_rostro) {
        setMensaje(
          'Usuario encontrado. Debe verificar su rostro para ingresar.'
        );

        hablar(
          `Bienvenido ${usuarioEncontrado.nombre}. Verifique su rostro para ingresar.`
        );
      } else {
        setMensaje(
          'Usuario encontrado. Ahora registre su rostro con la cámara.'
        );

        hablar(
          `Bienvenido ${usuarioEncontrado.nombre}. Vamos a registrar su rostro.`
        );
      }
    } catch (error) {
      console.error(
        'Error consultando DNI:',
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : 'No se pudo consultar el usuario.'
      );
    } finally {
      setCargandoDni(false);
    }
  };

  // ============================================================
  // ACTIVAR CÁMARA
  // ============================================================

 const iniciarCamara = async () => {
  if (!usuario) {
    setError('Primero ingrese un DNI válido.');
    return;
  }

  setError('');
  setMensaje('Preparando cámara...');
  setEstadoCamara('cargando');

  try {
    // ============================================================
    // 1. PRIMERO ABRIMOS LA CÁMARA
    // ============================================================

    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error(
        'El navegador no permite acceder a la cámara.'
      );
    }

    detenerCamara();

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

    const videoVisible = obtenerVideoVisible();

    if (!videoVisible) {
      stream.getTracks().forEach((track) => track.stop());

      throw new Error(
        'No se pudo encontrar el elemento de video.'
      );
    }

    // Hay dos versiones del formulario (desktop y móvil).
    // El stream se conecta a ambas para evitar que el ref
    // apunte al video oculto mientras se muestra el otro.
    const videos = [
      videoDesktopRef.current,
      videoMobileRef.current,
    ].filter(
      (video): video is HTMLVideoElement => video !== null
    );

    for (const video of videos) {
      video.srcObject = stream;
      video.muted = true;
      video.playsInline = true;

      try {
        await video.play();
      } catch (playError) {
        console.warn(
          'No se pudo reproducir automáticamente un video:',
          playError
        );
      }
    }

    console.log('CÁMARA ACTIVA');
    console.log('Video visible width:', videoVisible.videoWidth);
    console.log('Video visible height:', videoVisible.videoHeight);
    console.log('Video visible readyState:', videoVisible.readyState);
    console.log(
      'Tracks de cámara:',
      stream.getVideoTracks().map((track) => ({
        label: track.label,
        enabled: track.enabled,
        readyState: track.readyState,
      }))
    );

setEstadoCamara('activa');

    setMensaje(
      usuario.tiene_rostro
        ? 'Cámara activa. Mire directamente a la cámara para verificar su identidad.'
        : 'Cámara activa. Coloque su rostro frente a la cámara.'
    );

    hablar(
      usuario.tiene_rostro
        ? 'Cámara activada. Mire directamente a la cámara.'
        : 'Cámara activada. Coloque su rostro frente a la cámara.'
    );

    // ============================================================
    // 2. DESPUÉS CARGAMOS LOS MODELOS
    // ============================================================

    try {
      await cargarModelosFaciales();
    } catch (error) {
      console.error(
        'No se pudieron cargar los modelos faciales:',
        error
      );

      // La cámara sigue abierta, pero avisamos del problema.
      setError(
        'La cámara funciona, pero no se pudieron cargar los modelos faciales. Verifique la carpeta public/models.'
      );

      setEstadoCamara('activa');

      return;
    }

    // ============================================================
    // 3. INICIAMOS DETECCIÓN
    // ============================================================

    iniciarDeteccion();

  } catch (error) {
    console.error(
      'Error iniciando cámara:',
      error
    );

    setEstadoCamara('error');

    if (
      error instanceof DOMException &&
      error.name === 'NotAllowedError'
    ) {
      setError(
        'El acceso a la cámara fue bloqueado. Permita el uso de la cámara en el navegador.'
      );
    } else if (
      error instanceof DOMException &&
      error.name === 'NotFoundError'
    ) {
      setError(
        'No se encontró ninguna cámara disponible en este equipo.'
      );
    } else if (
      error instanceof DOMException &&
      error.name === 'NotReadableError'
    ) {
      setError(
        'La cámara está siendo utilizada por otra aplicación. Cierre otras aplicaciones que estén usando la cámara.'
      );
    } else if (
      error instanceof DOMException &&
      error.name === 'SecurityError'
    ) {
      setError(
        'El navegador bloqueó el acceso a la cámara por motivos de seguridad.'
      );
    } else {
      setError(
        error instanceof Error
          ? error.message
          : 'No se pudo iniciar la cámara.'
      );
    }
  }
};
  // ============================================================
  // DETECCIÓN FACIAL
  // ============================================================

  const iniciarDeteccion = () => {
    if (intervaloRef.current !== null) {
      window.clearInterval(
        intervaloRef.current
      );
    }

    setEstadoCamara('detectando');

    intervaloRef.current =
      window.setInterval(
        async () => {
          const video = obtenerVideoVisible();

          if (!video) {
            return;
          }

          if (
            video.readyState < 2 ||
            video.videoWidth === 0 ||
            video.videoHeight === 0
          ) {
            return;
          }

          try {
            const resultado =
              await faceapi
                .detectSingleFace(
                  video,
                  new faceapi.TinyFaceDetectorOptions(
                    {
                      inputSize: 320,
                      scoreThreshold: 0.5,
                    }
                  )
                )
                .withFaceLandmarks()
                .withFaceDescriptor();

           if (
              resultado &&
              video.videoWidth > 0 &&
              video.videoHeight > 0
            ) {
  setRostroDetectado(true);

              if (usuario?.tiene_rostro) {
                setMensaje(
                  'Rostro detectado. Puede verificar su identidad.'
                );
              } else {
                setMensaje(
                  'Rostro detectado correctamente. Puede registrarlo.'
                );
              }
            } else {
              setRostroDetectado(false);

              setMensaje(
                'No se detecta un rostro. Coloque su cara frente a la cámara.'
              );
            }
          } catch (error) {
            console.error(
              'Error durante la detección facial:',
              error
            );
          }
        },
        700
      );
  };

  // ============================================================
  // OBTENER DESCRIPTOR
  // ============================================================

  const obtenerDescriptorActual =
    async (): Promise<number[]> => {
      const video = obtenerVideoVisible();

      if (!video) {
        throw new Error(
          'La cámara no está disponible.'
        );
      }

      if (!modelosCargados) {
        throw new Error(
          'Los modelos faciales todavía no están cargados.'
        );
      }

      const resultado =
        await faceapi
          .detectSingleFace(
            video,
            new faceapi.TinyFaceDetectorOptions(
              {
                inputSize: 320,
                scoreThreshold: 0.5,
              }
            )
          )
          .withFaceLandmarks()
          .withFaceDescriptor();

      if (!resultado) {
        throw new Error(
          'No se pudo detectar su rostro. Mire directamente a la cámara.'
        );
      }

      const descriptor =
        Array.from(resultado.descriptor);

      if (descriptor.length !== 128) {
        throw new Error(
          `El descriptor facial generado tiene ${descriptor.length} valores. Se esperaban 128.`
        );
      }

      return descriptor;
    };

  // ============================================================
  // REGISTRAR ROSTRO
  // ============================================================

  const registrarRostro = async () => {
    if (!usuario) {
      setError(
        'No hay un usuario seleccionado.'
      );
      return;
    }

    if (!rostroDetectado) {
      setError(
        'Primero debe colocar su rostro frente a la cámara.'
      );
      return;
    }

    setRegistrandoRostro(true);
    setError('');
    setMensaje(
      'Capturando descriptor facial...'
    );

    try {
      const descriptor =
        await obtenerDescriptorActual();

      setMensaje(
        'Descriptor generado. Guardando rostro en MatrixFlow...'
      );

      const respuesta = await fetch(
        `${API}/usuarios/${usuario.id}/rostro`,
        {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify({
            descriptor,
          }),
        }
      );

      const datos =
        await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          datos?.detail ||
            'No se pudo guardar el rostro.'
        );
      }

      setRostroRegistrado(true);

      setMensaje(
        '¡Rostro registrado correctamente en MatrixFlow!'
      );

      hablar(
        `Registro facial completado correctamente para ${usuario.nombre}.`
      );

      detenerCamara();
    } catch (error) {
      console.error(
        'Error registrando rostro:',
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : 'No se pudo registrar el rostro.'
      );
    } finally {
      setRegistrandoRostro(false);
    }
  };

  // ============================================================
  // VERIFICAR ROSTRO
  // ============================================================

  const verificarRostro = async () => {
    if (!usuario) {
      setError(
        'No hay un usuario seleccionado.'
      );
      return;
    }

    if (!usuario.tiene_rostro) {
      setError(
        'Este usuario todavía no tiene un rostro registrado.'
      );
      return;
    }

    if (!rostroDetectado) {
      setError(
        'Primero coloque su rostro frente a la cámara.'
      );
      return;
    }

    setVerificandoRostro(true);
    setError('');
    setMensaje(
      'Capturando rostro para verificar identidad...'
    );
    setDistanciaFacial(null);

    try {
      const descriptor =
        await obtenerDescriptorActual();

      setMensaje(
        'Comparando rostro con el registro biométrico...'
      );

      const respuesta = await fetch(
        `${API}/usuarios/${usuario.id}/rostro/verificar`,
        {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify({
            descriptor,
          }),
        }
      );

      const datos =
        await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          datos?.detail ||
            'No se pudo verificar el rostro.'
        );
      }

      setDistanciaFacial(
        typeof datos.distancia === 'number'
          ? datos.distancia
          : null
      );

      if (datos.coincide === true) {
        setRostroVerificado(true);

        setMensaje(
          `Identidad verificada correctamente. Distancia: ${datos.distancia}`
        );

        hablar(
          `Identidad verificada correctamente. Bienvenido ${usuario.nombre}.`
        );

        detenerCamara();

        setTimeout(() => {
          onLogin(usuario);
        }, 800);
      } else {
        setRostroVerificado(false);

        setError(
          `El rostro no coincide con el usuario. Distancia obtenida: ${datos.distancia}.`
        );

        setMensaje(
          'Verificación facial rechazada.'
        );

        hablar(
          'El rostro no coincide. No se puede autorizar el acceso.'
        );
      }
    } catch (error) {
      console.error(
        'Error verificando rostro:',
        error
      );

      setRostroVerificado(false);

      setError(
        error instanceof Error
          ? error.message
          : 'No se pudo verificar el rostro.'
      );
    } finally {
      setVerificandoRostro(false);
    }
  };

  // ============================================================
  // ENTRAR DESPUÉS DEL REGISTRO
  // ============================================================

  const entrarDespuesDelRegistro = () => {
    if (!usuario) {
      setError(
        'No hay un usuario válido.'
      );
      return;
    }

    hablar(
      `Registro correcto. Bienvenido a MatrixFlow, ${usuario.nombre}.`
    );

    onLogin(usuario);
  };

  // ============================================================
  // ESTADO DE CÁMARA
  // ============================================================

  const textoEstadoCamara = () => {
    switch (estadoCamara) {
      case 'cargando':
        return 'Cargando cámara...';

      case 'activa':
        return 'Cámara activa';

      case 'detectando':
        return rostroDetectado
          ? 'Rostro detectado'
          : 'Buscando rostro...';

      case 'error':
        return 'Error de cámara';

      default:
        return 'Cámara apagada';
    }
  };

  // ============================================================
  // INTERFAZ
  // ============================================================

  return (
    <div className="min-h-screen bg-white">

      {/* ======================================================
          ESCRITORIO
      ======================================================= */}

      <div className="hidden min-h-screen items-center justify-center p-4 lg:flex">

        <div
          className="
            relative
            w-full
            max-w-[1450px]
            overflow-hidden
          "
          style={{
            aspectRatio: '1.582746',
            backgroundImage:
              "url('/images/login-matrixflow.png')",
            backgroundSize: '100% 100%',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        >

          {/* ==================================================
              LOGIN SOBRE EL RECUADRO BLANCO DE LA IMAGEN
          =================================================== */}

          <div
            className="
              absolute
              right-[3.8%]
              top-[15%]
              flex
              h-[71%]
              w-[32%]
              items-center
              justify-center
            "
          >

            <div className="w-[76%] max-w-[330px]">

              {/* LOGO */}
              <div className="mb-5 flex justify-center">

                <div className="flex items-center gap-2">

                  <div className="flex h-9 w-9 items-center justify-center">
                    <span className="text-4xl font-bold text-[#111111]">
                      M
                    </span>
                  </div>

                  <div>
                    <p className="text-[15px] font-semibold tracking-[0.16em] text-[#111111]">
                      MATRIXFLOW
                    </p>

                    <p className="text-[7px] tracking-[0.32em] text-[#6B7280]">
                      ENTERPRISE
                    </p>
                  </div>

                </div>

              </div>

              {/* TÍTULO */}

              <div className="mb-5">

                <h2 className="text-center text-2xl font-bold tracking-tight text-[#111111]">
                  Iniciar sesión
                </h2>

                <p className="mt-1 text-center text-[10px] leading-4 text-[#6B7280]">
                  Ingresa tu DNI para acceder a tu cuenta
                </p>

              </div>

              {/* DNI */}

              <div>

                <label
                  htmlFor="dni"
                  className="mb-1.5 block text-[10px] font-semibold text-[#111111]"
                >
                  DNI
                </label>

                <div className="flex h-10 overflow-hidden rounded-lg border border-[#D7D7D5] bg-white">

                  <div className="flex w-10 items-center justify-center text-[#6B7280]">
                    <span className="text-sm">♙</span>
                  </div>

                  <input
                    id="dni"
                    type="text"
                    inputMode="numeric"
                    maxLength={8}
                    value={dni}
                    onChange={(e) => {
                      const valor =
                        e.target.value.replace(
                          /\D/g,
                          ''
                        );

                      setDni(valor);
                      setError('');
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        buscarUsuario();
                      }
                    }}
                    placeholder="Ingrese su DNI"
                    className="
                      min-w-0
                      flex-1
                      bg-transparent
                      px-1
                      text-[11px]
                      text-[#111111]
                      outline-none
                      placeholder:text-[#A1A1A1]
                    "
                  />

                </div>

              </div>

              {/* BOTÓN */}

              <button
                type="button"
                onClick={buscarUsuario}
                disabled={cargandoDni}
                className="
                  mt-4
                  flex
                  h-10
                  w-full
                  items-center
                  justify-center
                  gap-3
                  rounded-full
                  bg-[#202020]
                  text-[11px]
                  font-semibold
                  text-white
                  transition
                  hover:bg-[#111111]
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                {cargandoDni
                  ? 'Buscando...'
                  : 'Ingresar'}

                <span className="text-base">
                  →
                </span>
              </button>

              {/* USUARIO */}

              {usuario && (
                <div className="mt-4 rounded-xl border border-[#E8C8D4] bg-[#F8E9EE] p-3">

                  <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-[#775b66]">
                    Usuario identificado
                  </p>

                  <p className="mt-1 text-sm font-bold text-[#111111]">
                    {usuario.nombre}
                  </p>

                  <p className="mt-1 text-[9px] text-[#6B7280]">
                    DNI: {usuario.dni}
                  </p>

                  <p className="text-[9px] text-[#6B7280]">
                    Rol: {usuario.rol}
                  </p>

                </div>
              )}

              {/* =================================================
                  CÁMARA
              ================================================== */}

              {usuario && !rostroRegistrado && (
                <div className="mt-4">

                  <div className="mb-2 flex items-center justify-between">

                    <p className="text-[10px] font-semibold text-[#111111]">
                      {usuario.tiene_rostro
                        ? 'Verificación facial'
                        : 'Registro facial'}
                    </p>

                    <span className="rounded-full bg-[#F8E9EE] px-2 py-1 text-[8px] font-bold text-[#775b66]">
                      {textoEstadoCamara()}
                    </span>

                  </div>

                  <div className="relative overflow-hidden rounded-xl bg-[#111111]">

                    <div className="aspect-video">

                 <video
  ref={videoDesktopRef}
  autoPlay
  muted
  playsInline
  width={640}
  height={480}
  className="h-full w-full object-cover"
  style={{
    display: 'block',
    width: '100%',
    height: '100%',
    minHeight: '100%',
    objectFit: 'cover',
    backgroundColor: '#111111',
    transform: 'scaleX(-1)',
  }}
/>
                    </div>

                    {estadoCamara === 'apagada' && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#151515]">

                        <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-[#292929] text-white">
                          ◉
                        </div>

                        <p className="text-[10px] font-semibold text-white">
                          Cámara desactivada
                        </p>

                        <p className="mt-1 text-[8px] text-white/50">
                          Active la cámara para continuar
                        </p>

                      </div>
                    )}

                    {estadoCamara === 'cargando' && (
                      <div className="absolute inset-0 flex items-center justify-center bg-[#111111]/95">

                        <div className="text-center">

                          <div className="mx-auto mb-3 h-7 w-7 animate-spin rounded-full border-4 border-white/20 border-t-[#775b66]" />

                          <p className="text-[10px] font-semibold text-white">
                            Preparando reconocimiento facial...
                          </p>

                        </div>

                      </div>
                    )}

                    {rostroDetectado && (
                      <div className="pointer-events-none absolute inset-0">

                        <div className="absolute left-1/2 top-1/2 h-36 w-28 -translate-x-1/2 -translate-y-1/2 rounded-[45%] border-2 border-[#D58CA5]" />

                        <div className="absolute left-1/2 top-2 -translate-x-1/2 rounded-full bg-[#775b66] px-3 py-1 text-[8px] font-bold text-white">
                          ROSTRO DETECTADO
                        </div>

                      </div>
                    )}

                  </div>

                  {/* BOTONES */}

                  <div className="mt-2 flex gap-2">

                    {estadoCamara === 'apagada' ||
                    estadoCamara === 'error' ? (
                      <button
                        type="button"
                        onClick={iniciarCamara}
                        className="
                          flex-1
                          rounded-lg
                          bg-[#202020]
                          px-3
                          py-2.5
                          text-[10px]
                          font-semibold
                          text-white
                          hover:bg-[#111111]
                        "
                      >
                        Activar cámara
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={detenerCamara}
                        className="
                          rounded-lg
                          border
                          border-[#D9D9D6]
                          bg-white
                          px-3
                          py-2.5
                          text-[10px]
                          font-semibold
                          text-[#111111]
                        "
                      >
                        Detener
                      </button>
                    )}

                    {!usuario.tiene_rostro && (
                      <button
                        type="button"
                        onClick={registrarRostro}
                        disabled={
                          !rostroDetectado ||
                          registrandoRostro ||
                          estadoCamara !== 'detectando'
                        }
                        className="
                          flex-1
                          rounded-lg
                          bg-[#775b66]
                          px-3
                          py-2.5
                          text-[10px]
                          font-semibold
                          text-white
                          hover:bg-[#6B4652]
                          disabled:cursor-not-allowed
                          disabled:bg-[#D1D5DB]
                        "
                      >
                        {registrandoRostro
                          ? 'Registrando...'
                          : 'Registrar rostro'}
                      </button>
                    )}

                    {usuario.tiene_rostro && (
                      <button
                        type="button"
                        onClick={verificarRostro}
                        disabled={
                          !rostroDetectado ||
                          verificandoRostro ||
                          estadoCamara !== 'detectando'
                        }
                        className="
                          flex-1
                          rounded-lg
                          bg-[#775b66]
                          px-3
                          py-2.5
                          text-[10px]
                          font-semibold
                          text-white
                          hover:bg-[#6B4652]
                          disabled:cursor-not-allowed
                          disabled:bg-[#D1D5DB]
                        "
                      >
                        {verificandoRostro
                          ? 'Verificando...'
                          : 'Verificar rostro'}
                      </button>
                    )}

                  </div>

                  {usuario.tiene_rostro && (
                    <div className="mt-2 rounded-lg border border-[#E8C8D4] bg-[#F8E9EE] p-2.5">

                      <p className="text-[9px] font-bold text-[#6B4652]">
                        Verificación requerida
                      </p>

                      <p className="mt-1 text-[8px] leading-4 text-[#775b66]">
                        Active la cámara, coloque su rostro
                        frente a ella y pulse "Verificar rostro".
                      </p>

                    </div>
                  )}

                </div>
              )}

              {/* =================================================
                  ROSTRO REGISTRADO
              ================================================== */}

              {rostroRegistrado && (
                <div className="mt-4 rounded-xl border border-[#DCC6CF] bg-[#F8E9EE] p-4 text-center">

                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-white text-xl text-[#775b66]">
                    ✓
                  </div>

                  <h3 className="mt-2 text-sm font-bold text-[#6B4652]">
                    Rostro registrado correctamente
                  </h3>

                  <p className="mt-1 text-[9px] text-[#775b66]">
                    El descriptor facial de {usuario?.nombre}
                    fue guardado en MatrixFlow.
                  </p>

                  <button
                    type="button"
                    onClick={
                      entrarDespuesDelRegistro
                    }
                    className="
                      mt-3
                      w-full
                      rounded-lg
                      bg-[#202020]
                      px-4
                      py-2.5
                      text-[10px]
                      font-semibold
                      text-white
                    "
                  >
                    Continuar a MatrixFlow
                  </button>

                </div>
              )}

              {/* =================================================
                  VERIFICACIÓN EXITOSA
              ================================================== */}

              {rostroVerificado && (
                <div className="mt-4 rounded-xl border border-[#DCC6CF] bg-[#F8E9EE] p-4 text-center">

                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-white text-xl text-[#775b66]">
                    ✓
                  </div>

                  <h3 className="mt-2 text-sm font-bold text-[#6B4652]">
                    Identidad verificada
                  </h3>

                  <p className="mt-1 text-[9px] text-[#775b66]">
                    El rostro coincide con el registro
                    biométrico de {usuario?.nombre}.
                  </p>

                  {distanciaFacial !== null && (
                    <p className="mt-1 text-[8px] text-[#775b66]">
                      Distancia facial:{' '}
                      {distanciaFacial}
                    </p>
                  )}

                  <div className="mt-3 rounded-lg bg-white px-3 py-2 text-[9px] font-semibold text-[#6B4652]">
                    Acceso autorizado. Ingresando a MatrixFlow...
                  </div>

                </div>
              )}

              {/* MENSAJE */}

              {mensaje && !error && (
                <div className="mt-3 rounded-lg border border-[#E8C8D4] bg-[#F8E9EE] px-3 py-2 text-[9px] leading-4 text-[#775b66]">
                  {mensaje}
                </div>
              )}

              {/* ERROR */}

              {error && (
                <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[9px] leading-4 text-red-700">

                  <p className="font-semibold">
                    No se pudo completar la operación
                  </p>

                  <p className="mt-1">
                    {error}
                  </p>

                </div>
              )}

              {/* PIE */}

              <div className="mt-5 border-t border-[#EEEEEC] pt-3 text-center">

                <p className="text-[8px] text-[#9CA3AF]">
                  ¿No tienes una cuenta?
                </p>

                <p className="mt-1 text-[9px] font-medium text-[#775b66]">
                  Contacta al administrador
                </p>

              </div>

            </div>

          </div>

        </div>
      </div>

      {/* ======================================================
          MÓVIL
      ======================================================= */}

      <div className="flex min-h-screen items-center justify-center bg-[#F3F3F1] p-4 lg:hidden">

        <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl">

          {/* IMAGEN ARRIBA */}

          <div
            className="relative aspect-[1.582746] w-full bg-white"
            style={{
              backgroundImage:
                "url('/images/login-matrixflow.png')",
              backgroundSize: '100% 100%',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}
          />

          {/* FORMULARIO MÓVIL */}

          <div className="p-6">

            <div className="mb-5">

              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#775b66]">
                Acceso seguro
              </p>

              <h2 className="mt-2 text-2xl font-bold text-[#111111]">
                Iniciar sesión
              </h2>

              <p className="mt-2 text-sm leading-5 text-[#6B7280]">
                Ingresa tu DNI para acceder a tu cuenta
                y verificar tu identidad.
              </p>

            </div>

            <label
              htmlFor="dni-mobile"
              className="mb-2 block text-sm font-semibold text-[#111111]"
            >
              DNI
            </label>

            <input
              id="dni-mobile"
              type="text"
              inputMode="numeric"
              maxLength={8}
              value={dni}
              onChange={(e) => {
                const valor =
                  e.target.value.replace(/\D/g, '');

                setDni(valor);
                setError('');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  buscarUsuario();
                }
              }}
              placeholder="Ingrese su DNI"
              className="
                w-full
                rounded-xl
                border
                border-[#D9D9D6]
                bg-white
                px-4
                py-3
                text-sm
                text-[#111111]
                outline-none
                focus:border-[#775b66]
                focus:ring-4
                focus:ring-[#F8E9EE]
              "
            />

            <button
              type="button"
              onClick={buscarUsuario}
              disabled={cargandoDni}
              className="
                mt-4
                w-full
                rounded-xl
                bg-[#111111]
                px-5
                py-3
                text-sm
                font-semibold
                text-white
                hover:bg-[#292929]
                disabled:opacity-50
              "
            >
              {cargandoDni
                ? 'Buscando...'
                : 'Ingresar'}
            </button>

            {usuario && (
              <div className="mt-5 rounded-2xl border border-[#E8C8D4] bg-[#F8E9EE] p-4">

                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#775b66]">
                  Usuario identificado
                </p>

                <p className="mt-1 text-lg font-bold text-[#111111]">
                  {usuario.nombre}
                </p>

                <p className="mt-1 text-xs text-[#6B7280]">
                  DNI: {usuario.dni}
                </p>

                <p className="text-xs text-[#6B7280]">
                  Rol: {usuario.rol}
                </p>

              </div>
            )}

            {usuario && !rostroRegistrado && (
              <div className="mt-5">

                <div className="mb-3 flex items-center justify-between">

                  <p className="text-sm font-semibold text-[#111111]">
                    {usuario.tiene_rostro
                      ? 'Verificación facial'
                      : 'Registro facial'}
                  </p>

                  <span className="rounded-full bg-[#F8E9EE] px-3 py-1 text-[10px] font-bold text-[#775b66]">
                    {textoEstadoCamara()}
                  </span>

                </div>

                <div className="relative overflow-hidden rounded-2xl bg-[#111111]">

                  <div className="aspect-video">

                    <video
                      ref={videoMobileRef}
                      autoPlay
                      muted
                      playsInline
                      className="h-full w-full object-cover"
                    />

                  </div>

                  {estadoCamara === 'apagada' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#151515]">

                      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#292929] text-xl text-white">
                        ◉
                      </div>

                      <p className="text-sm font-semibold text-white">
                        Cámara desactivada
                      </p>

                      <p className="mt-1 text-xs text-white/50">
                        Active la cámara para continuar
                      </p>

                    </div>
                  )}

                  {estadoCamara === 'cargando' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-[#111111]/95">

                      <div className="text-center">

                        <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-white/20 border-t-[#775b66]" />

                        <p className="text-sm font-semibold text-white">
                          Preparando reconocimiento facial...
                        </p>

                      </div>

                    </div>
                  )}

                  {rostroDetectado && (
                    <div className="pointer-events-none absolute inset-0">

                      <div className="absolute left-1/2 top-1/2 h-52 w-40 -translate-x-1/2 -translate-y-1/2 rounded-[45%] border-2 border-[#D58CA5]" />

                      <div className="absolute left-1/2 top-3 -translate-x-1/2 rounded-full bg-[#775b66] px-4 py-2 text-[10px] font-bold text-white">
                        ROSTRO DETECTADO
                      </div>

                    </div>
                  )}

                </div>

                <div className="mt-3 flex gap-3">

                  {estadoCamara === 'apagada' ||
                  estadoCamara === 'error' ? (
                    <button
                      type="button"
                      onClick={iniciarCamara}
                      className="
                        flex-1
                        rounded-xl
                        bg-[#111111]
                        px-4
                        py-3
                        text-sm
                        font-semibold
                        text-white
                      "
                    >
                      Activar cámara
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={detenerCamara}
                      className="
                        rounded-xl
                        border
                        border-[#D9D9D6]
                        bg-white
                        px-4
                        py-3
                        text-sm
                        font-semibold
                        text-[#111111]
                      "
                    >
                      Detener
                    </button>
                  )}

                  {!usuario.tiene_rostro && (
                    <button
                      type="button"
                      onClick={registrarRostro}
                      disabled={
                        !rostroDetectado ||
                        registrandoRostro ||
                        estadoCamara !== 'detectando'
                      }
                      className="
                        flex-1
                        rounded-xl
                        bg-[#775b66]
                        px-4
                        py-3
                        text-sm
                        font-semibold
                        text-white
                        disabled:bg-[#D1D5DB]
                      "
                    >
                      {registrandoRostro
                        ? 'Registrando...'
                        : 'Registrar rostro'}
                    </button>
                  )}

                  {usuario.tiene_rostro && (
                    <button
                      type="button"
                      onClick={verificarRostro}
                      disabled={
                        !rostroDetectado ||
                        verificandoRostro ||
                        estadoCamara !== 'detectando'
                      }
                      className="
                        flex-1
                        rounded-xl
                        bg-[#775b66]
                        px-4
                        py-3
                        text-sm
                        font-semibold
                        text-white
                        disabled:bg-[#D1D5DB]
                      "
                    >
                      {verificandoRostro
                        ? 'Verificando...'
                        : 'Verificar rostro'}
                    </button>
                  )}

                </div>

              </div>
            )}

            {rostroRegistrado && (
              <div className="mt-5 rounded-2xl border border-[#DCC6CF] bg-[#F8E9EE] p-6 text-center">

                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white text-2xl text-[#775b66]">
                  ✓
                </div>

                <h3 className="mt-4 text-lg font-bold text-[#6B4652]">
                  Rostro registrado correctamente
                </h3>

                <p className="mt-2 text-sm text-[#775b66]">
                  El descriptor facial de {usuario?.nombre}
                  fue guardado en MatrixFlow.
                </p>

                <button
                  type="button"
                  onClick={
                    entrarDespuesDelRegistro
                  }
                  className="
                    mt-5
                    w-full
                    rounded-xl
                    bg-[#111111]
                    px-5
                    py-3
                    text-sm
                    font-semibold
                    text-white
                  "
                >
                  Continuar a MatrixFlow
                </button>

              </div>
            )}

            {rostroVerificado && (
              <div className="mt-5 rounded-2xl border border-[#DCC6CF] bg-[#F8E9EE] p-6 text-center">

                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white text-2xl text-[#775b66]">
                  ✓
                </div>

                <h3 className="mt-4 text-lg font-bold text-[#6B4652]">
                  Identidad verificada
                </h3>

                <p className="mt-2 text-sm text-[#775b66]">
                  El rostro coincide con el registro
                  biométrico de {usuario?.nombre}.
                </p>

                {distanciaFacial !== null && (
                  <p className="mt-2 text-xs text-[#775b66]">
                    Distancia facial:{' '}
                    {distanciaFacial}
                  </p>
                )}

              </div>
            )}

            {mensaje && !error && (
              <div className="mt-4 rounded-xl border border-[#E8C8D4] bg-[#F8E9EE] px-4 py-3 text-sm text-[#775b66]">
                {mensaje}
              </div>
            )}

            {error && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">

                <p className="font-semibold">
                  No se pudo completar la operación
                </p>

                <p className="mt-1">
                  {error}
                </p>

              </div>
            )}

            <div className="mt-6 border-t border-[#EEEEEC] pt-5 text-center">

              <p className="text-[11px] text-[#9CA3AF]">
                ¿No tienes una cuenta?
              </p>

              <p className="mt-1 text-xs font-medium text-[#775b66]">
                Contacta al administrador
              </p>

            </div>

          </div>

        </div>
      </div>

    </div>
  );
}
