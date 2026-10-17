# TacoExpress — Versión móvil

Aplicación móvil para la **Taquería Los Hernández**, desarrollada en React Native con Expo.

Proyecto de cátedra de la asignatura **Diseño y Programación de Software Multiplataforma (DPS941)** — Universidad Don Bosco, Grupo I.
Docente: Ing. Carlos Emanuel Dubón.

---

## Qué hace

La aplicación permite a un cliente consultar el menú de la taquería y, al personal autorizado, administrarlo desde el teléfono.

| Acción | Visitante | Cliente | Administrador |
| --- | :---: | :---: | :---: |
| Consultar el menú | Sí | Sí | Sí |
| Ver el detalle de un platillo | Sí | Sí | Sí |
| Crear una cuenta | Sí | — | — |
| Agregar un platillo | No | No | Sí |
| Editar un platillo | No | No | Sí |
| Cambiar la fotografía | No | No | Sí |
| Marcar un platillo como agotado | No | No | Sí |
| Eliminar un platillo | No | No | Sí |

El control de acceso se aplica en dos niveles: los botones de administración no se muestran a quien no tiene el rol, y cada pantalla restringida vuelve a verificarlo al cargarse, de modo que tampoco se alcanza escribiendo la dirección directa.

---

## Tecnologías

| Área | Herramienta |
| --- | --- |
| Entorno | React Native con Expo |
| Navegación | Expo Router (rutas basadas en archivos) |
| Estado de sesión | Context API de React |
| Almacenamiento local | AsyncStorage |
| Fotografías | expo-image-picker |
| Diseño | Figma (Etapa 1) |

---

## Requisitos

- Node.js instalado.
- La aplicación **Expo Go** en un teléfono Android o iOS.
- El teléfono y la computadora en la misma red inalámbrica.

---

## Instalación y ejecución

```bash
git clone https://github.com/Fercho0409/tacoexpress-movil.git
cd tacoexpress-movil
npm install
npx expo start
```

La consola muestra un código QR. Al escanearlo con Expo Go, la aplicación se abre en el teléfono.

Si el teléfono no logra conectarse, suele ser el cortafuegos de la computadora. En ese caso:

```bash
npx expo start --tunnel
```

---

## Cuentas de prueba

| Rol | Correo | Contraseña |
| --- | --- | --- |
| Administrador | `admin@tacoexpress.com` | `Admin1234` |
| Cliente | `cliente@tacoexpress.com` | `Cliente1234` |

También se puede crear una cuenta nueva desde **Crear una cuenta**. Las cuentas creadas así reciben el rol de cliente.

---

## Estructura del proyecto

```
src/
  theme.js          Paleta de color. Ninguna pantalla escribe colores propios.
  app/              Las pantallas. Cada archivo es una ruta de navegación.
    index.tsx         Inicio
    login.jsx         Iniciar sesión
    registro.jsx      Crear cuenta
    menu/
      index.jsx       Lista del menú por categorías
      [id].jsx        Detalle de un platillo
      nuevo.jsx       Agregar platillo
      editar/[id].jsx Editar platillo
  components/       Piezas reutilizables (tarjeta de platillo, formulario)
  context/          Sesión activa, compartida con toda la aplicación
  lib/              Reglas de validación
  services/         Origen de los datos
assets/platillos/   Fotografías del catálogo
```

La organización responde a una separación en tres capas:

- **`app/` y `components/`** muestran la información y recogen las acciones del usuario.
- **`context/` y `lib/`** conservan la sesión y aplican las reglas de validación.
- **`services/`** obtiene y guarda los datos. Es la única capa que conoce su origen.

El propósito es que un cambio en el aspecto no obligue a tocar la lógica, y que un cambio en el origen de los datos no obligue a reescribir las pantallas.

---

## Diseño

La paleta de fondo oscuro con acentos dorados proviene del archivo de Figma elaborado en la Etapa 1. Los valores residen en `src/theme.js` y cada pantalla los solicita a ese archivo, de modo que modificar el aspecto completo de la aplicación se hace en un solo lugar.

Cada combinación de texto y fondo se verificó con la fórmula de relación de contraste de las pautas de accesibilidad WCAG 2.2, exigiendo un mínimo de 4.5 a 1 para el texto corriente.

---

## Estado actual

Esta entrega corresponde al primer entregable de la Etapa 3. Conviene señalar sus límites:

- Los datos residen **en memoria**. Al cerrar y reabrir la aplicación, el menú regresa a su contenido inicial.
- Las fotografías elegidas desde la galería se guardan como una dirección del propio teléfono, por lo que son visibles únicamente en ese dispositivo. Las fotografías del catálogo no tienen esa limitación, por estar incorporadas al proyecto.
- El módulo de carrito y pedidos no está implementado.

Las tres cosas se resuelven en la siguiente fase con **Cloud Firestore**, **Firebase Storage** y **Firebase Authentication**. La separación por capas permite hacer esa sustitución modificando únicamente los archivos de `services/`.

---

## Autor

Emerson Fernando Muñoz Arévalo — MA252306
