// PANTALLA: Mi pedido (carrito)
// Muestra lo que el usuario lleva elegido y le permite confirmarlo.
// Hasta que confirma, nada de esto se guarda en Firestore.

import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useCarrito } from '../context/CarritoContext';
import { crearPedido } from '../services/pedidosApi';
import { COLORES } from '../theme';

export default function PantallaCarrito() {
  const router = useRouter();
  const { usuario, haySesion } = useAuth();
  const { lineas, cambiarCantidad, quitar, vaciar, total, vacio } = useCarrito();
  const [enviando, setEnviando] = useState(false);
  const [aviso, setAviso] = useState('');

  async function confirmar() {
    setAviso('');
    try {
      setEnviando(true);
      await crearPedido({ usuario, lineas });
      // El carrito se vacia solo despues de que Firestore confirmo que
      // guardo el pedido. Si falla, el usuario no pierde su seleccion.
      vaciar();
      router.replace('/pedidos');
    } catch (e) {
      setAviso(e.message || 'No se pudo enviar el pedido.');
    } finally {
      setEnviando(false);
    }
  }

  if (vacio) {
    return (
      <View style={estilos.centro}>
        <Stack.Screen options={{ title: 'Mi pedido' }} />
        <Text style={estilos.emoji}>{'\u{1F37D}'}</Text>
        <Text style={estilos.vacioTitulo}>Su pedido esta vacio</Text>
        <Text style={estilos.vacioTexto}>
          Elija platillos del menu para empezar.
        </Text>
        <TouchableOpacity
          style={estilos.boton}
          onPress={() => router.replace('/menu')}
        >
          <Text style={estilos.botonTexto}>Ir al menu</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={estilos.pantalla} contentContainerStyle={estilos.contenido}>
      <Stack.Screen options={{ title: 'Mi pedido' }} />

      {!!aviso && <Text style={estilos.aviso}>{aviso}</Text>}

      {lineas.map((linea) => (
        <View key={linea.id} style={estilos.linea}>
          <View style={estilos.lineaDatos}>
            <Text style={estilos.lineaNombre}>{linea.nombre}</Text>
            <Text style={estilos.lineaPrecio}>
              ${linea.precio.toFixed(2)} c/u
            </Text>
          </View>

          <View style={estilos.contador}>
            <TouchableOpacity
              style={estilos.contadorBoton}
              onPress={() => cambiarCantidad(linea.id, linea.cantidad - 1)}
            >
              <Text style={estilos.contadorTexto}>-</Text>
            </TouchableOpacity>

            <Text style={estilos.cantidad}>{linea.cantidad}</Text>

            <TouchableOpacity
              style={estilos.contadorBoton}
              onPress={() => cambiarCantidad(linea.id, linea.cantidad + 1)}
            >
              <Text style={estilos.contadorTexto}>+</Text>
            </TouchableOpacity>
          </View>

          <View style={estilos.lineaFinal}>
            <Text style={estilos.subtotal}>
              ${(linea.precio * linea.cantidad).toFixed(2)}
            </Text>
            <TouchableOpacity onPress={() => quitar(linea.id)}>
              <Text style={estilos.quitar}>Quitar</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}

      <View style={estilos.totalCaja}>
        <Text style={estilos.totalEtiqueta}>Total a pagar</Text>
        <Text style={estilos.totalMonto}>${total.toFixed(2)}</Text>
      </View>

      {/* El pedido queda amarrado a la cuenta, por eso se exige la sesion. */}
      {haySesion ? (
        <TouchableOpacity
          style={[estilos.boton, enviando && estilos.botonApagado]}
          onPress={confirmar}
          disabled={enviando}
        >
          <Text style={estilos.botonTexto}>
            {enviando ? 'Enviando pedido...' : 'Confirmar pedido'}
          </Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={estilos.botonBorde}
          onPress={() => router.push('/login')}
        >
          <Text style={estilos.botonBordeTexto}>
            Inicie sesion para confirmar
          </Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity style={estilos.botonBorde} onPress={() => router.back()}>
        <Text style={estilos.botonBordeTexto}>Seguir pidiendo</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: COLORES.fondo },
  contenido: { padding: 16, paddingBottom: 40 },
  centro: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORES.fondo,
    padding: 24,
  },
  emoji: { fontSize: 56, marginBottom: 10 },
  vacioTitulo: { fontSize: 18, fontWeight: '700', color: COLORES.texto },
  vacioTexto: {
    fontSize: 14,
    color: COLORES.textoSuave,
    marginTop: 4,
    marginBottom: 22,
    textAlign: 'center',
  },
  aviso: {
    backgroundColor: COLORES.errorFondo,
    color: COLORES.error,
    padding: 10,
    borderRadius: 8,
    fontSize: 13,
    marginBottom: 12,
  },
  linea: {
    backgroundColor: COLORES.superficie,
    borderWidth: 1,
    borderColor: COLORES.borde,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  lineaDatos: { marginBottom: 10 },
  lineaNombre: { fontSize: 15, fontWeight: '600', color: COLORES.texto },
  lineaPrecio: { fontSize: 13, color: COLORES.textoSuave, marginTop: 2 },
  contador: { flexDirection: 'row', alignItems: 'center' },
  contadorBoton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: COLORES.superficieAlta,
    borderWidth: 1,
    borderColor: COLORES.borde,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contadorTexto: { color: COLORES.texto, fontSize: 18, fontWeight: '700' },
  cantidad: {
    color: COLORES.texto,
    fontSize: 16,
    fontWeight: '700',
    minWidth: 44,
    textAlign: 'center',
  },
  lineaFinal: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  subtotal: { fontSize: 16, fontWeight: '700', color: COLORES.acento },
  quitar: { fontSize: 13, color: COLORES.error, fontWeight: '600' },
  totalCaja: {
    backgroundColor: COLORES.acentoFondo,
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    marginBottom: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  totalEtiqueta: { fontSize: 14, fontWeight: '600', color: COLORES.acento },
  totalMonto: { fontSize: 22, fontWeight: '700', color: COLORES.acento },
  boton: {
    backgroundColor: COLORES.acento,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
  },
  botonApagado: { opacity: 0.6 },
  botonTexto: { color: COLORES.acentoTexto, fontWeight: '600', fontSize: 16 },
  botonBorde: {
    borderWidth: 1,
    borderColor: COLORES.borde,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  botonBordeTexto: { color: COLORES.textoSuave, fontWeight: '600', fontSize: 15 },
});
