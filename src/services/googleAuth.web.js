// INICIO DE SESION CON GOOGLE - version para navegador
//
// Este archivo es el gemelo de googleAuth.js. Metro usa este cuando la
// aplicacion corre en el navegador, por la terminacion ".web" del
// nombre, y usa el otro cuando corre en el telefono.
//
// En el navegador si existen las ventanas emergentes, asi que el propio
// Firebase se encarga de todo el proceso: abre la ventana de Google,
// espera a que la persona elija su cuenta y devuelve la sesion lista.

import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from './firebase';

export const googleDisponible = true;

export async function entrarConGoogle() {
  const proveedor = new GoogleAuthProvider();
  const resultado = await signInWithPopup(auth, proveedor);
  return resultado.user;
}
