// CAPA DE DATOS - menu de productos
// Los platillos ya no viven en memoria: ahora estan en Cloud Firestore.
// Las pantallas no cambian, porque los nombres de las funciones siguen
// siendo los mismos y todas devuelven lo mismo que antes.

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { db } from './firebase';

const COLECCION = 'platillos';

// El orden de este arreglo es el orden en que salen las secciones
// del menu en pantalla: primero lo que se pide al inicio de la comida.
export const CATEGORIAS = [
  'Entradas',
  'Sopas',
  'Tacos',
  'Quesadillas',
  'Burritos',
  'Complementos',
  'Postres',
  'Bebidas',
];

// Dibujo que se muestra cuando el platillo todavia no tiene foto.
export const EMOJI_CATEGORIA = {
  Entradas: '\u{1F951}',
  Sopas: '\u{1F35C}',
  Tacos: '\u{1F32E}',
  Quesadillas: '\u{1F9C0}',
  Burritos: '\u{1F32F}',
  Complementos: '\u{1F952}',
  Postres: '\u{1F36E}',
  Bebidas: '\u{1F964}',
};

// FOTOS DEL CATALOGO
// Van dentro del proyecto, por eso se cargan con require y viajan junto
// con el codigo: se ven en cualquier telefono donde se abra la app.
const FOTOS = {
  nachos: require('../../assets/platillos/nachos.jpg'),
  guacamole: require('../../assets/platillos/guacamole.jpg'),
  'sopa-tortilla': require('../../assets/platillos/sopa-tortilla.jpg'),
  'caldo-res': require('../../assets/platillos/caldo-res.jpg'),
  'tacos-pastor': require('../../assets/platillos/tacos-pastor.jpg'),
  'tacos-asada': require('../../assets/platillos/tacos-asada.jpg'),
  quesadilla: require('../../assets/platillos/quesadilla.jpg'),
  burrito: require('../../assets/platillos/burrito.jpg'),
  flan: require('../../assets/platillos/flan.jpg'),
  churros: require('../../assets/platillos/churros.jpg'),
  horchata: require('../../assets/platillos/horchata.jpg'),
};

// En Firestore solo se pueden guardar textos, no imagenes del proyecto.
// Por eso el campo "imagen" guarda una de dos cosas, siempre como texto:
//   - una clave del catalogo, por ejemplo "tacos-pastor"
//   - una direccion de una foto elegida de la galeria del telefono
// Esta funcion decide cual de las dos es y la convierte en algo que el
// componente Image pueda mostrar.
export function fuenteImagen(imagen) {
  if (!imagen) return null;
  if (typeof imagen !== 'string') return imagen;
  if (FOTOS[imagen]) return FOTOS[imagen];
  return { uri: imagen };
}

// Platillos con los que arranca el menu la primera vez.
const MENU_INICIAL = [
  { nombre: 'Nachos con queso', descripcion: 'Totopos de maiz con queso fundido y jalapenos.', categoria: 'Entradas', precio: 3.25, imagen: 'nachos', orden: 1 },
  { nombre: 'Guacamole con totopos', descripcion: 'Aguacate preparado al momento, con tomate y cilantro.', categoria: 'Entradas', precio: 3.75, imagen: 'guacamole', orden: 2 },
  { nombre: 'Sopa de tortilla', descripcion: 'Caldo de tomate con tiras de tortilla, queso y aguacate.', categoria: 'Sopas', precio: 3.5, imagen: 'sopa-tortilla', orden: 3 },
  { nombre: 'Caldo de res', descripcion: 'Res con verduras. Se sirve con arroz y tortillas.', categoria: 'Sopas', precio: 4.5, imagen: 'caldo-res', orden: 4 },
  { nombre: 'Tacos al pastor', descripcion: 'Tortilla de maiz con carne al pastor, cebolla y cilantro.', categoria: 'Tacos', precio: 3.5, imagen: 'tacos-pastor', orden: 5 },
  { nombre: 'Tacos de asada', descripcion: 'Carne asada picada, con salsa verde y limon.', categoria: 'Tacos', precio: 3.75, imagen: 'tacos-asada', orden: 6 },
  { nombre: 'Quesadilla de pollo', descripcion: 'Tortilla de harina rellena de queso y pollo.', categoria: 'Quesadillas', precio: 4.0, imagen: 'quesadilla', orden: 7 },
  { nombre: 'Burrito de carne', descripcion: 'Burrito con carne, frijoles y arroz.', categoria: 'Burritos', precio: 5.0, imagen: 'burrito', orden: 8, disponible: false },
  { nombre: 'Flan napolitano', descripcion: 'Flan casero con caramelo. Porcion individual.', categoria: 'Postres', precio: 2.25, imagen: 'flan', orden: 9 },
  { nombre: 'Churros con cajeta', descripcion: 'Tres churros espolvoreados con azucar y canela.', categoria: 'Postres', precio: 2.75, imagen: 'churros', orden: 10 },
  { nombre: 'Horchata', descripcion: 'Bebida fria de arroz con canela. Vaso de 16 oz.', categoria: 'Bebidas', precio: 1.25, imagen: 'horchata', orden: 11 },
];

// Convierte un documento de Firestore en el objeto que esperan las pantallas.
function aPlatillo(documento) {
  const datos = documento.data();
  return {
    id: documento.id,
    nombre: datos.nombre || '',
    descripcion: datos.descripcion || '',
    categoria: datos.categoria || '',
    precio: Number(datos.precio) || 0,
    imagen: datos.imagen || '',
    disponible: datos.disponible !== false,
    orden: Number(datos.orden) || 0,
  };
}

// La primera vez que se abre la app la coleccion esta vacia.
// Entonces se cargan los platillos iniciales para que el menu
// no aparezca en blanco.
async function sembrarMenu() {
  const referencia = collection(db, COLECCION);
  for (const platillo of MENU_INICIAL) {
    await addDoc(referencia, {
      disponible: true,
      ...platillo,
      creadoEn: serverTimestamp(),
    });
  }
}

export async function listarPlatillos() {
  let lista = await getDocs(collection(db, COLECCION));

  if (lista.empty) {
    await sembrarMenu();
    lista = await getDocs(collection(db, COLECCION));
  }

  return lista.docs.map(aPlatillo).sort((a, b) => a.orden - b.orden);
}

export async function buscarPlatillo(id) {
  const encontrado = await getDoc(doc(db, COLECCION, String(id)));
  return encontrado.exists() ? aPlatillo(encontrado) : undefined;
}

export async function crearPlatillo(datos) {
  const referencia = await addDoc(collection(db, COLECCION), {
    ...datos,
    disponible: true,
    // Los platillos nuevos van al final de su categoria.
    orden: Date.now(),
    creadoEn: serverTimestamp(),
  });
  return { id: referencia.id, ...datos, disponible: true };
}

// Reemplaza los campos enviados y conserva los demas, para no perder
// la disponibilidad ni el orden del platillo.
export async function actualizarPlatillo(id, datos) {
  const referencia = doc(db, COLECCION, String(id));
  await updateDoc(referencia, datos);
  return await buscarPlatillo(id);
}

export async function alternarDisponible(id) {
  const platillo = await buscarPlatillo(id);
  if (!platillo) return undefined;

  await updateDoc(doc(db, COLECCION, String(id)), {
    disponible: !platillo.disponible,
  });
  return { ...platillo, disponible: !platillo.disponible };
}

export async function eliminarPlatillo(id) {
  await deleteDoc(doc(db, COLECCION, String(id)));
  return id;
}

// Agrupa los platillos por categoria, en el formato que necesita
// la lista con secciones de la pantalla del menu.
export function agruparPorCategoria(lista) {
  const grupos = {};
  lista.forEach((p) => {
    (grupos[p.categoria] = grupos[p.categoria] || []).push(p);
  });
  return CATEGORIAS.filter((c) => grupos[c]).map((c) => ({
    title: c,
    data: grupos[c],
  }));
}
