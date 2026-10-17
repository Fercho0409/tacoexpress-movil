// CAPA DE LOGICA - validaciones del formulario
// Se mantiene aparte para poder reutilizarla y para que la pantalla
// solo se encargue de mostrar, no de decidir si algo es valido.

import { CATEGORIAS } from '../services/menuApi';

export function validarPlatillo(datos) {
  const errores = {};

  const nombre = (datos.nombre || '').trim();
  if (!nombre) {
    errores.nombre = 'El nombre es obligatorio.';
  } else if (nombre.length < 3) {
    errores.nombre = 'El nombre debe tener al menos 3 caracteres.';
  } else if (nombre.length > 60) {
    errores.nombre = 'El nombre no puede pasar de 60 caracteres.';
  }

  const descripcion = (datos.descripcion || '').trim();
  if (descripcion.length > 200) {
    errores.descripcion = 'La descripcion no puede pasar de 200 caracteres.';
  }

  // El precio llega como texto desde el campo, por eso se convierte primero.
  const precio = Number(datos.precio);
  if (!datos.precio) {
    errores.precio = 'El precio es obligatorio.';
  } else if (Number.isNaN(precio)) {
    errores.precio = 'El precio debe ser un numero.';
  } else if (precio <= 0) {
    errores.precio = 'El precio debe ser mayor que cero.';
  } else if (precio > 999) {
    errores.precio = 'Revise el precio: parece demasiado alto.';
  }

  if (!datos.categoria) {
    errores.categoria = 'Seleccione una categoria.';
  } else if (!CATEGORIAS.includes(datos.categoria)) {
    errores.categoria = 'La categoria no es valida.';
  }

  return {
    errores,
    esValido: Object.keys(errores).length === 0,
  };
}
