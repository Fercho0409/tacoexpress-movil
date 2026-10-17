// PALETA DE LA APLICACION
// Todos los colores viven aqui. Las pantallas no escriben colores
// propios: los piden a este archivo. Asi, cambiar el aspecto de toda
// la aplicacion se hace en un solo lugar y no pantalla por pantalla.
//
// La paleta sigue el diseno elaborado en Figma durante la Etapa 1:
// fondo oscuro con acentos dorados.

export const COLORES = {
  // superficies, de la mas al fondo a la mas cercana
  fondo: '#14110F',
  superficie: '#1F1B18',
  superficieAlta: '#2B2622',
  borde: '#38322C',

  // color de marca
  acento: '#D9A441',
  acentoFondo: '#2A2116',
  acentoTexto: '#14110F', // texto que va encima del dorado

  // textos
  texto: '#F3EEE6',
  textoSuave: '#B3A99B',
  textoTenue: '#938A7C',
  placeholder: '#857C6F',

  // estados
  error: '#E58072',
  errorFondo: '#33201C',
  exito: '#7FC8A0',
  exitoFondo: '#1A2B22',
};

export default COLORES;
