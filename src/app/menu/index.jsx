// PANTALLA: Menu de productos
// Muestra los platillos agrupados por categoria.
// No contiene logica de negocio: le pide los datos al servicio.

import { Stack, useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  SectionList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import TarjetaPlatillo from '../../components/TarjetaPlatillo';
import { useAuth } from '../../context/AuthContext';
import { useCarrito } from '../../context/CarritoContext';
import { agruparPorCategoria, listarPlatillos } from '../../services/menuApi';
import { COLORES } from '../../theme';

export default function PantallaMenu() {
  const router = useRouter();
  const { esAdministrador } = useAuth();
  const { unidades, total } = useCarrito();
  const [secciones, setSecciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  // useFocusEffect vuelve a cargar la lista cada vez que se entra
  // a esta pantalla, para ver los platillos recien agregados.
  useFocusEffect(
    useCallback(() => {
      let activo = true;
      (async () => {
        try {
          setCargando(true);
          const datos = await listarPlatillos();
          if (activo) setSecciones(agruparPorCategoria(datos));
        } catch (e) {
          if (activo) setError('No se pudo cargar el menu.');
        } finally {
          if (activo) setCargando(false);
        }
      })();
      return () => {
        activo = false;
      };
    }, [])
  );

  if (cargando) {
    return (
      <View style={estilos.centro}>
        <ActivityIndicator size="large" color={COLORES.acento} />
        <Text style={estilos.cargando}>Cargando menu...</Text>
      </View>
    );
  }

  return (
    <View style={estilos.pantalla}>
      <Stack.Screen options={{ title: 'Menu' }} />
      {!!error && <Text style={estilos.error}>{error}</Text>}

      <SectionList
        sections={secciones}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={[
          estilos.contenido,
          // Se deja espacio abajo para que la barra del pedido no tape
          // el ultimo platillo de la lista.
          unidades > 0 && estilos.contenidoConBarra,
        ]}
        ListHeaderComponent={
          <View style={estilos.encabezado}>
            <Text style={estilos.titulo}>Taqueria Los Hernandez</Text>
            <Text style={estilos.subtitulo}>
              Toca un platillo para ver su detalle
            </Text>

            {/* El boton solo aparece para el administrador. */}
            {esAdministrador && (
              <TouchableOpacity
                style={estilos.boton}
                onPress={() => router.push('/menu/nuevo')}
              >
                <Text style={estilos.botonTexto}>+ Agregar platillo</Text>
              </TouchableOpacity>
            )}
          </View>
        }
        renderSectionHeader={({ section }) => (
          <Text style={estilos.categoria}>{section.title.toUpperCase()}</Text>
        )}
        renderItem={({ item }) => (
          <TarjetaPlatillo
            platillo={item}
            onPress={() => router.push(`/menu/${item.id}`)}
          />
        )}
        ListEmptyComponent={
          <Text style={estilos.vacio}>Aun no hay platillos registrados.</Text>
        }
      />

      {/* BARRA DEL PEDIDO
          Aparece pegada abajo solo cuando hay algo en el carrito, para
          que el usuario pueda revisarlo sin volver al inicio. */}
      {unidades > 0 && (
        <TouchableOpacity
          style={estilos.barra}
          onPress={() => router.push('/carrito')}
        >
          <Text style={estilos.barraTexto}>
            Ver mi pedido ({unidades})
          </Text>
          <Text style={estilos.barraTotal}>${total.toFixed(2)}</Text>
        </TouchableOpacity>
      )}
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
  contenidoConBarra: { paddingBottom: 96 },
  encabezado: { marginBottom: 16 },
  titulo: { fontSize: 28, fontWeight: '700', color: COLORES.texto },
  subtitulo: { fontSize: 14, color: COLORES.textoSuave, marginTop: 2 },
  boton: {
    backgroundColor: COLORES.acento,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 14,
  },
  botonTexto: { color: COLORES.acentoTexto, fontWeight: '600', fontSize: 15 },
  categoria: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORES.textoTenue,
    letterSpacing: 1,
    marginTop: 14,
    marginBottom: 8,
  },
  vacio: {
    textAlign: 'center',
    color: COLORES.textoTenue,
    marginTop: 40,
  },
  error: {
    backgroundColor: COLORES.errorFondo,
    color: COLORES.error,
    padding: 10,
    margin: 16,
    borderRadius: 8,
  },
  barra: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 16,
    backgroundColor: COLORES.acento,
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  barraTexto: { color: COLORES.acentoTexto, fontWeight: '700', fontSize: 15 },
  barraTotal: { color: COLORES.acentoTexto, fontWeight: '700', fontSize: 16 },
});
