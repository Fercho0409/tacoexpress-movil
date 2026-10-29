// CAPA DE DATOS - cuentas y sesion
// Antes las cuentas vivian en el telefono con AsyncStorage. Ahora viven
// en Firebase: Authentication guarda el correo y la contrasena, y
// Firestore guarda el nombre y el rol de cada usuario.
//
// Los nombres de las funciones son los mismos de antes a proposito, para
// que el contexto y las pantallas de login y registro no cambien.

import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

const COLECCION = 'usuarios';

// Firebase avisa de los errores con codigos en ingles. Aqui se traducen
// a mensajes que el usuario pueda entender.
function mensajeDeError(error) {
  const codigo = error?.code || '';
  const mensajes = {
    'auth/invalid-credential': 'El correo o la contrasena no son correctos.',
    'auth/invalid-email': 'El correo no tiene un formato valido.',
    'auth/user-not-found': 'El correo o la contrasena no son correctos.',
    'auth/wrong-password': 'El correo o la contrasena no son correctos.',
    'auth/email-already-in-use': 'Ya existe una cuenta con ese correo.',
    'auth/weak-password': 'La contrasena es demasiado debil.',
    'auth/too-many-requests': 'Demasiados intentos. Espere un momento.',
    'auth/network-request-failed': 'Sin conexion. Revise su internet.',
  };
  return mensajes[codigo] || 'No se pudo completar la operacion.';
}

// Busca el nombre y el rol del usuario en Firestore.
// Si el documento no existe todavia (por ejemplo, una cuenta creada
// desde la consola de Firebase), se crea uno con el rol de cliente.
async function perfilDe(cuenta) {
  const referencia = doc(db, COLECCION, cuenta.uid);
  const encontrado = await getDoc(referencia);

  if (encontrado.exists()) {
    const datos = encontrado.data();
    return {
      uid: cuenta.uid,
      correo: cuenta.email,
      nombre: datos.nombre || cuenta.email,
      rol: datos.rol || 'cliente',
    };
  }

  const perfilNuevo = {
    nombre: cuenta.displayName || cuenta.email,
    correo: cuenta.email,
    rol: 'cliente',
    creadoEn: serverTimestamp(),
  };
  await setDoc(referencia, perfilNuevo);
  return { uid: cuenta.uid, correo: cuenta.email, nombre: perfilNuevo.nombre, rol: 'cliente' };
}

export async function iniciarSesion(correo, clave) {
  try {
    const credencial = await signInWithEmailAndPassword(
      auth,
      correo.trim().toLowerCase(),
      clave
    );
    return await perfilDe(credencial.user);
  } catch (error) {
    throw new Error(mensajeDeError(error));
  }
}

export async function registrar(datos) {
  const correo = (datos.correo || '').trim().toLowerCase();
  try {
    const credencial = await createUserWithEmailAndPassword(auth, correo, datos.clave);

    // Las cuentas nuevas siempre nacen como cliente. El rol de
    // administrador se asigna a mano desde la consola de Firebase,
    // para que nadie pueda darselo a si mismo desde el registro.
    const referencia = doc(db, COLECCION, credencial.user.uid);
    await setDoc(referencia, {
      nombre: (datos.nombre || '').trim() || correo,
      correo,
      rol: 'cliente',
      creadoEn: serverTimestamp(),
    });

    return {
      uid: credencial.user.uid,
      correo,
      nombre: (datos.nombre || '').trim() || correo,
      rol: 'cliente',
    };
  } catch (error) {
    throw new Error(mensajeDeError(error));
  }
}

export async function cerrarSesion() {
  await signOut(auth);
}

// Al abrir la aplicacion, Firebase tarda un instante en recuperar la
// sesion guardada. Por eso no se puede leer auth.currentUser de una vez:
// hay que esperar el primer aviso de Firebase y recien ahi responder.
export function leerSesion() {
  return new Promise((resolver) => {
    const cancelar = onAuthStateChanged(auth, async (cuenta) => {
      cancelar();
      if (!cuenta) {
        resolver(null);
        return;
      }
      try {
        resolver(await perfilDe(cuenta));
      } catch (error) {
        resolver(null);
      }
    });
  });
}