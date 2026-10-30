// CAPA DE LOGICA - estado de la sesion
// Guarda quien inicio sesion y lo comparte con toda la aplicacion.
// Las pantallas no llaman al servicio directamente: le piden a este contexto.

import { createContext, useContext, useEffect, useState } from 'react';
import {
  cerrarSesion as cerrarSesionServicio,
  googleDisponible,
  iniciarSesion as iniciarSesionServicio,
  iniciarSesionConGoogle as iniciarSesionConGoogleServicio,
  leerSesion,
  registrar as registrarServicio,
} from '../services/cuentasApi';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  // Al abrir la aplicacion se revisa si quedo una sesion guardada.
  useEffect(() => {
    let activo = true;
    (async () => {
      try {
        const sesion = await leerSesion();
        if (activo) setUsuario(sesion);
      } finally {
        if (activo) setCargando(false);
      }
    })();
    return () => {
      activo = false;
    };
  }, []);

  async function entrar(correo, clave) {
    const sesion = await iniciarSesionServicio(correo, clave);
    setUsuario(sesion);
    return sesion;
  }

  // Segunda forma de entrar: con la cuenta de Google.
  // El servicio hace el trabajo; aqui solo se guarda el resultado, igual
  // que con el correo. Para el resto de la aplicacion da lo mismo por
  // cual de las dos puertas entro el usuario.
  async function entrarConGoogle() {
    const sesion = await iniciarSesionConGoogleServicio();
    setUsuario(sesion);
    return sesion;
  }

  async function crearCuenta(datos) {
    const sesion = await registrarServicio(datos);
    setUsuario(sesion);
    return sesion;
  }

  async function salir() {
    await cerrarSesionServicio();
    setUsuario(null);
  }

  const valor = {
    usuario,
    cargando,
    entrar,
    entrarConGoogle,
    googleDisponible,
    crearCuenta,
    salir,
    haySesion: usuario !== null,
    esAdministrador: usuario?.rol === 'administrador',
  };

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

// Hook para usar la sesion sin repetir useContext en cada pantalla.
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  }
  return ctx;
}
