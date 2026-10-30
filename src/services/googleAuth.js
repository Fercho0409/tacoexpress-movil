// INICIO DE SESION CON GOOGLE - version para telefono (Android / iOS)
//
// Existen dos archivos con este mismo nombre:
//   googleAuth.js      <- este, se usa en el telefono
//   googleAuth.web.js  <- se usa en el navegador
//
// Metro, el empaquetador de React Native, elige solo cual de los dos
// incluir segun donde se este ejecutando la aplicacion. El resto del
// proyecto importa "./googleAuth" sin enterarse de la diferencia.
//
// En el telefono no hay ventanas emergentes: Google abre su propia
// pantalla de seleccion de cuenta, la del sistema Android. Por eso aqui
// se usa la libreria nativa y no signInWithPopup.

import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth } from './firebase';

// Identificador del proyecto ante Google. Aunque la aplicacion sea de
// Android, aqui va el identificador "web": es el que Firebase usa para
// reconocer que el telefono y el navegador son el mismo proyecto.
const ID_CLIENTE_WEB =
  '232799174294-3tuu84mveuglj2u1a0fhe87eqjkp2ku9.apps.googleusercontent.com';

export const googleDisponible = true;

// La configuracion se hace una sola vez, la primera vez que alguien
// toca el boton. No conviene hacerla al abrir la aplicacion porque
// retrasaria el arranque sin necesidad.
let configurado = false;
function configurar() {
  if (configurado) return;
  GoogleSignin.configure({ webClientId: ID_CLIENTE_WEB });
  configurado = true;
}

export async function entrarConGoogle() {
  configurar();

  // Google exige que el telefono tenga sus servicios actualizados.
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

  const respuesta = await GoogleSignin.signIn();

  // El sitio donde viene el comprobante cambio entre versiones de la
  // libreria, por eso se busca en los dos lugares posibles.
  const comprobante = respuesta?.data?.idToken || respuesta?.idToken;
  if (!comprobante) {
    throw new Error('Google no devolvio el comprobante de identidad.');
  }

  // Google ya verifico quien es la persona. Ese comprobante firmado se
  // le entrega a Firebase, que lo revisa y abre la sesion.
  const credencial = GoogleAuthProvider.credential(comprobante);
  const resultado = await signInWithCredential(auth, credencial);
  return resultado.user;
}
