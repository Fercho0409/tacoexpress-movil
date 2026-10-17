// CAPA DE LOGICA - validaciones de las pantallas de cuenta
// Se mantienen aparte del formulario para poder reutilizarlas.

// Revisa que el correo tenga la forma nombre@dominio.algo
const FORMATO_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validarInicioSesion(datos) {
  const errores = {};

  const correo = (datos.correo || '').trim();
  if (!correo) {
    errores.correo = 'El correo es obligatorio.';
  } else if (!FORMATO_CORREO.test(correo)) {
    errores.correo = 'Escriba un correo valido, por ejemplo nombre@correo.com';
  }

  if (!datos.clave) {
    errores.clave = 'La contrasena es obligatoria.';
  }

  return { errores, esValido: Object.keys(errores).length === 0 };
}

export function validarRegistro(datos) {
  const errores = {};

  const nombre = (datos.nombre || '').trim();
  if (!nombre) {
    errores.nombre = 'El nombre es obligatorio.';
  } else if (nombre.length < 3) {
    errores.nombre = 'El nombre debe tener al menos 3 caracteres.';
  }

  const correo = (datos.correo || '').trim();
  if (!correo) {
    errores.correo = 'El correo es obligatorio.';
  } else if (!FORMATO_CORREO.test(correo)) {
    errores.correo = 'Escriba un correo valido, por ejemplo nombre@correo.com';
  }

  const clave = datos.clave || '';
  if (!clave) {
    errores.clave = 'La contrasena es obligatoria.';
  } else if (clave.length < 6) {
    errores.clave = 'La contrasena debe tener al menos 6 caracteres.';
  } else if (!/[0-9]/.test(clave)) {
    errores.clave = 'La contrasena debe incluir al menos un numero.';
  }

  if (!datos.confirmacion) {
    errores.confirmacion = 'Repita la contrasena.';
  } else if (datos.confirmacion !== clave) {
    errores.confirmacion = 'Las contrasenas no coinciden.';
  }

  return { errores, esValido: Object.keys(errores).length === 0 };
}
