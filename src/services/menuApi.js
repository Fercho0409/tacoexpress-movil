// CAPA DE DATOS
// Aqui vive la lista de platillos y las operaciones sobre ella.
// Ninguna pantalla guarda datos por su cuenta: todas pasan por aqui.
//
// En esta etapa los datos estan en memoria. Cuando conectemos Firestore
// solo se cambian las funciones de este archivo y las pantallas no se tocan.

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
// Las fotos que el administrador elige de la galeria son distintas:
// se guardan como texto (una direccion del telefono) y solo existen
// en ese aparato. Por eso la aplicacion admite las dos formas.
const FOTOS = {
  nachos: require('../../assets/platillos/nachos.jpg'),
  guacamole: require('../../assets/platillos/guacamole.jpg'),
  sopaTortilla: require('../../assets/platillos/sopa-tortilla.jpg'),
  caldoRes: require('../../assets/platillos/caldo-res.jpg'),
  tacosPastor: require('../../assets/platillos/tacos-pastor.jpg'),
  tacosAsada: require('../../assets/platillos/tacos-asada.jpg'),
  quesadilla: require('../../assets/platillos/quesadilla.jpg'),
  burrito: require('../../assets/platillos/burrito.jpg'),
  flan: require('../../assets/platillos/flan.jpg'),
  churros: require('../../assets/platillos/churros.jpg'),
  horchata: require('../../assets/platillos/horchata.jpg'),
};

// Convierte el campo imagen al formato que espera el componente Image.
// Devuelve null cuando no hay foto, para que la pantalla muestre el dibujo.
export function fuenteImagen(imagen) {
  if (!imagen) return null;
  return typeof imagen === 'string' ? { uri: imagen } : imagen;
}

let platillos = [
  {
    id: 1,
    nombre: 'Nachos con queso',
    descripcion: 'Totopos de maiz con queso fundido y jalapenos.',
    categoria: 'Entradas',
    precio: 3.25,
    imagen: FOTOS.nachos,
    disponible: true,
  },
  {
    id: 2,
    nombre: 'Guacamole con totopos',
    descripcion: 'Aguacate preparado al momento, con tomate y cilantro.',
    categoria: 'Entradas',
    precio: 3.75,
    imagen: FOTOS.guacamole,
    disponible: true,
  },
  {
    id: 3,
    nombre: 'Sopa de tortilla',
    descripcion: 'Caldo de tomate con tiras de tortilla, queso y aguacate.',
    categoria: 'Sopas',
    precio: 3.5,
    imagen: FOTOS.sopaTortilla,
    disponible: true,
  },
  {
    id: 4,
    nombre: 'Caldo de res',
    descripcion: 'Res con verduras. Se sirve con arroz y tortillas.',
    categoria: 'Sopas',
    precio: 4.5,
    imagen: FOTOS.caldoRes,
    disponible: true,
  },
  {
    id: 5,
    nombre: 'Tacos al pastor',
    descripcion: 'Tortilla de maiz con carne al pastor, cebolla y cilantro.',
    categoria: 'Tacos',
    precio: 3.5,
    imagen: FOTOS.tacosPastor,
    disponible: true,
  },
  {
    id: 6,
    nombre: 'Tacos de asada',
    descripcion: 'Carne asada picada, con salsa verde y limon.',
    categoria: 'Tacos',
    precio: 3.75,
    imagen: FOTOS.tacosAsada,
    disponible: true,
  },
  {
    id: 7,
    nombre: 'Quesadilla de pollo',
    descripcion: 'Tortilla de harina rellena de queso y pollo.',
    categoria: 'Quesadillas',
    precio: 4.0,
    imagen: FOTOS.quesadilla,
    disponible: true,
  },
  {
    id: 8,
    nombre: 'Burrito de carne',
    descripcion: 'Burrito con carne, frijoles y arroz.',
    categoria: 'Burritos',
    precio: 5.0,
    imagen: FOTOS.burrito,
    disponible: false,
  },
  {
    id: 9,
    nombre: 'Flan napolitano',
    descripcion: 'Flan casero con caramelo. Porcion individual.',
    categoria: 'Postres',
    precio: 2.25,
    imagen: FOTOS.flan,
    disponible: true,
  },
  {
    id: 10,
    nombre: 'Churros con cajeta',
    descripcion: 'Tres churros espolvoreados con azucar y canela.',
    categoria: 'Postres',
    precio: 2.75,
    imagen: FOTOS.churros,
    disponible: true,
  },
  {
    id: 11,
    nombre: 'Horchata',
    descripcion: 'Bebida fria de arroz con canela. Vaso de 16 oz.',
    categoria: 'Bebidas',
    precio: 1.25,
    imagen: FOTOS.horchata,
    disponible: true,
  },
];

// Simula la demora de una peticion real, para que la pantalla
// muestre el estado de carga como lo hara con la base de datos.
const demora = (ms = 400) => new Promise((r) => setTimeout(r, ms));

export async function listarPlatillos() {
  await demora();
  return [...platillos];
}

export async function buscarPlatillo(id) {
  await demora(200);
  return platillos.find((p) => String(p.id) === String(id));
}

export async function crearPlatillo(datos) {
  await demora();
  const nuevo = { ...datos, id: Date.now(), disponible: true };
  platillos = [...platillos, nuevo];
  return nuevo;
}

// Reemplaza los campos enviados y conserva los demas, para no perder
// la disponibilidad ni el identificador del platillo.
export async function actualizarPlatillo(id, datos) {
  await demora();
  platillos = platillos.map((p) =>
    String(p.id) === String(id) ? { ...p, ...datos } : p
  );
  return platillos.find((p) => String(p.id) === String(id));
}

export async function alternarDisponible(id) {
  await demora(200);
  platillos = platillos.map((p) =>
    String(p.id) === String(id) ? { ...p, disponible: !p.disponible } : p
  );
  return platillos.find((p) => String(p.id) === String(id));
}

export async function eliminarPlatillo(id) {
  await demora(200);
  platillos = platillos.filter((p) => String(p.id) !== String(id));
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
