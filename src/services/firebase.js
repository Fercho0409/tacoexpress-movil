// CONEXION CON FIREBASE
// Este archivo arranca Firebase una sola vez y entrega dos cosas al resto
// del proyecto: "auth" para las cuentas y "db" para la base de datos.
// Ninguna pantalla habla con Firebase directamente: pasan por los servicios.

import { initializeApp } from 'firebase/app';
import * as firebaseAuth from 'firebase/auth';
import { initializeFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Datos del proyecto en la consola de Firebase.
// Estas llaves no son secretas: identifican el proyecto, no dan permisos.
// La seguridad real vive en las reglas de Firestore.
const configuracion = {
  apiKey: 'AIzaSyCucPGB61sCWMqQ1u6TLQX-P6_KrAiXvEE',
  authDomain: 'tacoexpress-dae8a.firebaseapp.com',
  projectId: 'tacoexpress-dae8a',
  storageBucket: 'tacoexpress-dae8a.firebasestorage.app',
  messagingSenderId: '232799174294',
  appId: '1:232799174294:web:eec65b68972db7303f8cb7',
};

export const app = initializeApp(configuracion);

// La sesion debe guardarse en el telefono para que el usuario no tenga
// que volver a entrar cada vez que abre la app. En React Native eso se
// hace con AsyncStorage, el mismo almacenamiento que ya usabamos antes.
//
// El nombre de la funcion que conecta Firebase con AsyncStorage cambio
// de lugar entre versiones del SDK, por eso se intenta y, si no existe,
// se arranca de la forma simple. Asi el archivo funciona en cualquiera.
function iniciarAutenticacion() {
  try {
    return firebaseAuth.initializeAuth(app, {
      persistence: firebaseAuth.getReactNativePersistence(AsyncStorage),
    });
  } catch (error) {
    return firebaseAuth.getAuth(app);
  }
}

export const auth = iniciarAutenticacion();

// Firestore se conecta por defecto con una conexion en streaming que
// React Native no siempre sostiene: la app termina en modo sin conexion
// y muestra datos viejos. Al forzar el modo de consulta larga
// (long polling) la conexion se vuelve estable en el telefono.
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
});
