// CAPA DE LOGICA - carrito de compras
// El carrito vive solo mientras el usuario arma su pedido. No se guarda
// en Firestore: seria escribir en la base cada vez que toca un boton.
// Solo al confirmar se manda el pedido completo de una sola vez.

import { createContext, useContext, useState } from 'react';

const CarritoContext = createContext(null);

export function CarritoProvider({ children }) {
  // Cada linea es: { id, nombre, precio, cantidad }
  const [lineas, setLineas] = useState([]);

  // Si el platillo ya estaba en el carrito se le suma uno a la cantidad,
  // en vez de aparecer dos veces en la lista.
  function agregar(platillo, cantidad = 1) {
    setLineas((antes) => {
      const existente = antes.find((l) => l.id === platillo.id);
      if (existente) {
        return antes.map((l) =>
          l.id === platillo.id ? { ...l, cantidad: l.cantidad + cantidad } : l
        );
      }
      return [
        ...antes,
        {
          id: platillo.id,
          nombre: platillo.nombre,
          precio: Number(platillo.precio) || 0,
          cantidad,
        },
      ];
    });
  }

  // Cambiar la cantidad a cero equivale a quitar el platillo del carrito.
  function cambiarCantidad(id, cantidad) {
    const nueva = Number(cantidad) || 0;
    if (nueva <= 0) {
      quitar(id);
      return;
    }
    setLineas((antes) =>
      antes.map((l) => (l.id === id ? { ...l, cantidad: nueva } : l))
    );
  }

  function quitar(id) {
    setLineas((antes) => antes.filter((l) => l.id !== id));
  }

  function vaciar() {
    setLineas([]);
  }

  const total = Number(
    lineas.reduce((suma, l) => suma + l.precio * l.cantidad, 0).toFixed(2)
  );

  // Cuantas unidades lleva en total: es el numero del globito del carrito.
  const unidades = lineas.reduce((suma, l) => suma + l.cantidad, 0);

  const valor = {
    lineas,
    agregar,
    cambiarCantidad,
    quitar,
    vaciar,
    total,
    unidades,
    vacio: lineas.length === 0,
  };

  return (
    <CarritoContext.Provider value={valor}>{children}</CarritoContext.Provider>
  );
}

// Hook para usar el carrito sin repetir useContext en cada pantalla.
export function useCarrito() {
  const ctx = useContext(CarritoContext);
  if (!ctx) {
    throw new Error('useCarrito debe usarse dentro de <CarritoProvider>');
  }
  return ctx;
}
