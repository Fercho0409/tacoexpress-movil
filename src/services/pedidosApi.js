// CAPA DE DATOS - pedidos
// Cada pedido confirmado se guarda en Firestore amarrado a la cuenta
// del usuario que lo hizo. Asi el cliente puede volver a verlo cuando
// quiera, aunque cierre la aplicacion o entre desde otro telefono.

import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from './firebase';

const COLECCION = 'pedidos';

// Los estados por los que pasa un pedido, en orden.
// El administrador los va cambiando desde su pantalla.
export const ESTADOS = ['Recibido', 'En preparacion', 'Entregado', 'Cancelado'];

export const COLOR_ESTADO = {
  Recibido: 'acento',
  'En preparacion': 'acento',
  Entregado: 'exito',
  Cancelado: 'error',
};

// Convierte un documento de Firestore en el objeto que esperan las pantallas.
function aPedido(documento) {
  const datos = documento.data();
  return {
    id: documento.id,
    uid: datos.uid || '',
    nombreCliente: datos.nombreCliente || '',
    correoCliente: datos.correoCliente || '',
    lineas: Array.isArray(datos.lineas) ? datos.lineas : [],
    total: Number(datos.total) || 0,
    estado: datos.estado || 'Recibido',
    // creadoEnMs es un numero puesto por la aplicacion. Se usa para
    // ordenar porque siempre esta listo; la marca del servidor tarda un
    // instante en llegar y puede venir vacia justo despues de guardar.
    creadoEnMs: Number(datos.creadoEnMs) || 0,
  };
}

// Fecha en formato legible para mostrar en pantalla.
export function fechaDePedido(pedido) {
  if (!pedido.creadoEnMs) return '';
  const f = new Date(pedido.creadoEnMs);
  const dia = String(f.getDate()).padStart(2, '0');
  const mes = String(f.getMonth() + 1).padStart(2, '0');
  const hora = String(f.getHours()).padStart(2, '0');
  const minuto = String(f.getMinutes()).padStart(2, '0');
  return `${dia}/${mes}/${f.getFullYear()} - ${hora}:${minuto}`;
}

// Guarda el pedido. Las lineas llevan copiado el nombre y el precio del
// platillo tal como estaban al momento de pedir: si manana cambia el
// precio en el menu, este pedido sigue mostrando lo que se cobro.
export async function crearPedido({ usuario, lineas }) {
  if (!usuario) throw new Error('Debe iniciar sesion para hacer un pedido.');
  if (!lineas || lineas.length === 0) throw new Error('El pedido esta vacio.');

  const lineasGuardadas = lineas.map((linea) => ({
    platilloId: linea.id,
    nombre: linea.nombre,
    precio: Number(linea.precio) || 0,
    cantidad: Number(linea.cantidad) || 0,
    subtotal: Number((linea.precio * linea.cantidad).toFixed(2)),
  }));

  const total = Number(
    lineasGuardadas.reduce((suma, l) => suma + l.subtotal, 0).toFixed(2)
  );

  const referencia = await addDoc(collection(db, COLECCION), {
    uid: usuario.uid,
    nombreCliente: usuario.nombre || usuario.correo,
    correoCliente: usuario.correo,
    lineas: lineasGuardadas,
    total,
    estado: 'Recibido',
    creadoEnMs: Date.now(),
    creadoEn: serverTimestamp(),
  });

  return { id: referencia.id, total, lineas: lineasGuardadas };
}

// Pedidos de un solo usuario: lo que ve el cliente en "Mis pedidos".
// El orden se hace aqui y no en la consulta a proposito: pedirle a
// Firestore que filtre y ordene a la vez obliga a crear un indice a
// mano en la consola. Con pocos pedidos ordenar aqui es mas simple.
export async function listarPedidosDe(uid) {
  const consulta = query(collection(db, COLECCION), where('uid', '==', uid));
  const lista = await getDocs(consulta);
  return lista.docs.map(aPedido).sort((a, b) => b.creadoEnMs - a.creadoEnMs);
}

// Todos los pedidos: lo que ve el administrador.
export async function listarPedidos() {
  const lista = await getDocs(collection(db, COLECCION));
  return lista.docs.map(aPedido).sort((a, b) => b.creadoEnMs - a.creadoEnMs);
}

export async function buscarPedido(id) {
  const encontrado = await getDoc(doc(db, COLECCION, String(id)));
  return encontrado.exists() ? aPedido(encontrado) : undefined;
}

// Solo el administrador cambia el estado, desde la pantalla de pedidos.
export async function cambiarEstado(id, estado) {
  await updateDoc(doc(db, COLECCION, String(id)), { estado });
  return await buscarPedido(id);
}

// Cuenta cuantas unidades lleva un pedido, para el resumen de la lista.
export function cantidadDePedido(pedido) {
  return pedido.lineas.reduce((suma, l) => suma + (Number(l.cantidad) || 0), 0);
}
