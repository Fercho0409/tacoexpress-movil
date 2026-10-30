// PANTALLA: Historial de pedidos
// El cliente ve solo los pedidos de su cuenta; el administrador los ve
// todos. Los datos vienen de Firestore, no del telefono: por eso siguen
// ahi aunque se cierre la aplicacion o se entre desde otro aparato.

import { Stack, useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import {
  cantidadDePedido,
  fechaDePedido,
  listarPedidos,
  listarPedidosDe,
} from '../../services/pedidosApi';
import { COLORES } from '../../theme';

// Cada estado se pinta de un color distinto para reconocerlo de un vistazo.
function colorDeEstado(estado) {
  if (estado === 'Entregado') return COLORES.exito;
  if (estado === 'Cancelado') return COLORES.error;
  return COLORES.acento;
}

function fondoDeEstado(estado) {
  if (estado === 'Entregado') return COLORES.exitoFondo;
  if (estado === 'Cancelado') return COLORES.errorFondo;
  return COLORES.acentoFondo;
}

export default function PantallaPedidos() {
  const router = useRouter();
  const { usuario, esAdministrador } = useAuth();
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  // Se recarga al entrar para que el cliente vea de inmediato el pedido
  // que acaba de confirmar, y el administrador los cambios de estado.
  useFocusEffect(
    useCallback(() => {
      let activo = true;
      (async () => {
        try {
          setCargando(true);
          const datos = esAdministrador
            ? await listarPedidos()
            : await listarPedidosDe(usuario.uid);
          if (activo) setPedidos(datos);
        } catch (e) {
          if (activo) setError('No se pudieron cargar los pedidos.');
        } finally {
          if (activo) setCargando(false);
        }
      })();
      return () => {
        activo = false;
      };
    }, [esAdministrador, usuario])
  );

  if (cargando) {
    return (
      <View style={estilos.centro}>
        <ActivityIndicator size="large" color={COLORES.acento} />
        <Text style={estilos.cargando}>Cargando pedidos...</Text>
      </View>
    );
  }

  return (
    <View style={estilos.pantalla}>
      <Stack.Screen
        options={{ title: esAdministrador ? 'Pedidos recibidos' : 'Mis pedidos' }}
      />
      {!!error && <Text style={estilos.error}>{error}</Text>}

      <FlatList
        data={pedidos}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={estilos.contenido}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={estilos.tarjeta}
            onPress={() => router.push(`/pedidos/${item.id}`)}
          >
            <View style={estilos.fila}>
              <Text style={estilos.fecha}>{fechaDePedido(item)}</Text>
              <View
                style={[
                  estilos.etiqueta,
                  { backgroundColor: fondoDeEstado(item.estado) },
                ]}
              >
                <Text
                  style={[estilos.etiquetaTexto, { color: colorDeEstado(item.estado) }]}
                >
                  {item.estado}
                </Text>
              </View>
            </View>

            {/* El administrador necesita saber de quien es cada pedido. */}
            {esAdministrador && (
              <Text style={estilos.cliente}>{item.nombreCliente}</Text>
            )}

            <Text style={estilos.resumen}>
              {cantidadDePedido(item)} producto(s)
            </Text>

            <Text style={estilos.total}>${item.total.toFixed(2)}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={estilos.vacioCaja}>
            <Text style={estilos.emoji}>{'\u{1F9FE}'}</Text>
            <Text style={estilos.vacioTitulo}>
              {esAdministrador ? 'Aun no hay pedidos' : 'Aun no ha hecho pedidos'}
            </Text>
            <TouchableOpacity
              style={estilos.boton}
              onPress={() => router.push('/menu')}
            >
              <Text style={estilos.botonTexto}>Ir al menu</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}

const estilos = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: COLORES.fondo },
  centro: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORES.fondo,
  },
  cargando: { marginTop: 10, color: COLORES.textoSuave },
  contenido: { padding: 16, paddingBottom: 32 },
  tarjeta: {
    backgroundColor: COLORES.superficie,
    borderWidth: 1,
    borderColor: COLORES.borde,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fecha: { fontSize: 13, color: COLORES.textoSuave },
  etiqueta: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  etiquetaTexto: { fontSize: 11, fontWeight: '700' },
  cliente: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORES.texto,
    marginTop: 8,
  },
  resumen: { fontSize: 13, color: COLORES.textoTenue, marginTop: 6 },
  total: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORES.acento,
    marginTop: 6,
  },
  vacioCaja: { alignItems: 'center', marginTop: 60 },
  emoji: { fontSize: 48, marginBottom: 10 },
  vacioTitulo: {
    fontSize: 16,
    color: COLORES.textoSuave,
    marginBottom: 20,
    textAlign: 'center',
  },
  boton: {
    backgroundColor: COLORES.acento,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 28,
    alignItems: 'center',
  },
  botonTexto: { color: COLORES.acentoTexto, fontWeight: '600', fontSize: 15 },
  error: {
    backgroundColor: COLORES.errorFondo,
    color: COLORES.error,
    padding: 10,
    margin: 16,
    borderRadius: 8,
  },
});
