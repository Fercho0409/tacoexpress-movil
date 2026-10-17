// CAPA DE DATOS - cuentas de usuario
// Guarda los usuarios y la sesion en el almacenamiento del telefono.
//
// En la Etapa 3, Foro 2, estas funciones pasaran a usar Firebase
// Authentication y Firestore. El resto de la aplicacion no cambia,
// porque solo conoce estas funciones.

import AsyncStorage from '@react-native-async-storage/async-storage';

const LLAVE_USUARIOS = 'tacoexpress_usuarios';
const LLAVE_SESION = 'tacoexpress_sesion';

// Cuentas que ya vienen creadas para poder probar la aplicacion.
const USUARIOS_INICIALES = [
  {
    nombre: 'Administrador',
    correo: 'admin@tacoexpress.com',
    clave: 'Admin1234',
    rol: 'administrador',
  },
  {
    nombre: 'Cliente de prueba',
    correo: 'cliente@tacoexpress.com',
    clave: 'Cliente1234',
    rol: 'cliente',
  },
];

async function leerUsuarios() {
  const guardado = await AsyncStorage.getItem(LLAVE_USUARIOS);
  if (guardado) return JSON.parse(guardado);
  await AsyncStorage.setItem(LLAVE_USUARIOS, JSON.stringify(USUARIOS_INICIALES));
  return USUARIOS_INICIALES;
}

async function guardarUsuarios(usuarios) {
  await AsyncStorage.setItem(LLAVE_USUARIOS, JSON.stringify(usuarios));
}

// Devuelve el usuario sin la contrasena, que nunca sale de esta capa.
function sinClave(usuario) {
  const { clave, ...resto } = usuario;
  return resto;
}

export async function iniciarSesion(correo, clave) {
  const usuarios = await leerUsuarios();
  const encontrado = usuarios.find(
    (u) => u.correo.toLowerCase() === correo.trim().toLowerCase()
  );

  if (!encontrado || encontrado.clave !== clave) {
    throw new Error('El correo o la contrasena no son correctos.');
  }

  const sesion = sinClave(encontrado);
  await AsyncStorage.setItem(LLAVE_SESION, JSON.stringify(sesion));
  return sesion;
}

export async function registrar(datos) {
  const usuarios = await leerUsuarios();
  const correo = datos.correo.trim().toLowerCase();

  if (usuarios.some((u) => u.correo.toLowerCase() === correo)) {
    throw new Error('Ya existe una cuenta con ese correo.');
  }

  // Quien se registra desde la aplicacion entra como cliente.
  const nuevo = {
    nombre: datos.nombre.trim(),
    correo,
    clave: datos.clave,
    rol: 'cliente',
  };

  await guardarUsuarios([...usuarios, nuevo]);

  const sesion = sinClave(nuevo);
  await AsyncStorage.setItem(LLAVE_SESION, JSON.stringify(sesion));
  return sesion;
}

export async function cerrarSesion() {
  await AsyncStorage.removeItem(LLAVE_SESION);
}

export async function leerSesion() {
  const guardado = await AsyncStorage.getItem(LLAVE_SESION);
  return guardado ? JSON.parse(guardado) : null;
}
