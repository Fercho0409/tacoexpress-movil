// PANTALLA: Detalle de un platillo
// Recibe el id por la direccion y pide ese platillo al servicio.
// Las acciones de administracion (marcar agotado, eliminar) solo
// aparecen si la sesion activa es de administrador.

import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import {
  alternarDisponible,
  buscarPlatillo,
  eliminarPlatillo,
  EMOJI_CATEGORIA,
  fuenteImagen,
} from '../../services/menuApi';
import { COLORES } from '../../theme';

export default function PantallaDetalle() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { esAdministrador } = useAuth();
  const [platillo, setPlatillo] = useState(null);
  const [cargando, setCargando] = useState(true);

  // useFocusEffect vuelve a leer el platillo cada vez que se entra a la
  // pantalla, para que los cambios hechos al editarlo se vean de inmediato.
  useFocusEffect(
    useCallback(() => {
      let activo = true;
      (async () => {
        const encontrado = await buscarPlatillo(id);
        if (activo) {
          setPlatillo(encontrado);
          setCargando(false);
        }
      })();
      return () => {
        activo = false;
      };
    }, [id])
  );

  async function cambiarDisponibilidad() {
    const actualizado = await alternarDisponible(id);
    setPlatillo(actualizado);
  }

  function confirmarEliminar() {
    // Se usa un valor de respaldo porque al abrir la pantalla el platillo
    // todavia no ha terminado de cargar y vale null.
    const nombre = platillo ? platillo.nombre : 'este platillo';

    Alert.alert(
      'Eliminar platillo',
      `Se quitara "${nombre}" del menu.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            await eliminarPlatillo(id);
            router.back();
          },
        },
      ]
    );
  }

  if (cargando) {
    return (
      <View style={estilos.centro}>
        <ActivityIndicator size="large" color={COLORES.acento} />
      </View>
    );
  }

  if (!platillo) {
    return (
      <View style={estilos.centro}>
        <Text style={estilos.vacio}>Este platillo ya no existe.</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={estilos.enlace}>Volver al menu</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={estilos.pantalla} contentContainerStyle={estilos.contenido}>
      <Stack.Screen options={{ title: platillo.nombre }} />

      {fuenteImagen(platillo.imagen) ? (
        <Image source={fuenteImagen(platillo.imagen)} style={estilos.foto} />
      ) : (
        <View style={estilos.emojiCaja}>
          <Text style={estilos.emoji}>
            {EMOJI_CATEGORIA[platillo.categoria] || '\u{1F37D}'}
          </Text>
        </View>
      )}

      <Text style={estilos.categoria}>{platillo.categoria.toUpperCase()}</Text>
      <Text style={estilos.nombre}>{platillo.nombre}</Text>
      <Text style={estilos.precio}>${Number(platillo.precio).toFixed(2)}</Text>

      {!!platillo.descripcion && (
        <Text style={estilos.descripcion}>{platillo.descripcion}</Text>
      )}

      <View style={platillo.disponible ? estilos.cajaVerde : estilos.cajaRoja}>
        <Text style={platillo.disponible ? estilos.textoVerde : estilos.textoRojo}>
          {platillo.disponible ? 'Disponible' : 'Agotado'}
        </Text>
      </View>

      {/* ACCIONES DE ADMINISTRADOR
          El cliente solo consulta el platillo; no puede modificarlo. */}
      {esAdministrador && (
        <View style={estilos.zonaAdmin}>
          <Text style={estilos.zonaAdminTitulo}>Acciones del administrador</Text>

          <TouchableOpacity
            style={estilos.botonNaranja}
            onPress={() => router.push(`/menu/editar/${id}`)}
          >
            <Text style={estilos.botonTexto}>Editar platillo</Text>
          </TouchableOpacity>

          <TouchableOpacity style={estilos.botonEspaciado} onPress={cambiarDisponibilidad}>
            <Text style={estilos.botonEspaciadoTexto}>
              {platillo.disponible ? 'Marcar agotado' : 'Marcar disponible'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={estilos.botonRojo} onPress={confirmarEliminar}>
            <Text style={estilos.botonRojoTexto}>Eliminar del menu</Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity style={estilos.botonGris} onPress={() => router.back()}>
        <Text style={estilos.botonGrisTexto}>Volver al menu</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: COLORES.fondo },
  contenido: { padding: 20, paddingBottom: 40 },
  centro: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORES.fondo,
  },
  foto: { width: '100%', height: 200, borderRadius: 16, marginBottom: 18 },
  emojiCaja: {
    width: '100%',
    height: 160,
    borderRadius: 16,
    backgroundColor: COLORES.acentoFondo,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  emoji: { fontSize: 64 },
  categoria: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORES.textoTenue,
    letterSpacing: 1,
  },
  nombre: { fontSize: 24, fontWeight: '700', color: COLORES.texto, marginTop: 4 },
  precio: { fontSize: 20, fontWeight: '700', color: COLORES.acento, marginTop: 6 },
  descripcion: { fontSize: 15, color: COLORES.textoSuave, marginTop: 12, lineHeight: 22 },
  cajaVerde: {
    backgroundColor: COLORES.exitoFondo,
    borderRadius: 8,
    padding: 10,
    marginTop: 18,
    alignItems: 'center',
  },
  cajaRoja: {
    backgroundColor: COLORES.errorFondo,
    borderRadius: 8,
    padding: 10,
    marginTop: 18,
    alignItems: 'center',
  },
  textoVerde: { color: COLORES.exito, fontWeight: '600' },
  textoRojo: { color: COLORES.error, fontWeight: '600' },
  zonaAdmin: {
    marginTop: 22,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORES.borde,
  },
  zonaAdminTitulo: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORES.textoTenue,
    letterSpacing: 1,
    marginBottom: 10,
  },
  // Boton principal: fondo dorado, por eso el texto va oscuro.
  botonNaranja: {
    backgroundColor: COLORES.acento,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  botonTexto: { color: COLORES.acentoTexto, fontWeight: '600', fontSize: 15 },

  // Boton secundario: fondo oscuro, por eso el texto va claro.
  botonEspaciado: {
    backgroundColor: COLORES.superficieAlta,
    borderWidth: 1,
    borderColor: COLORES.borde,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  botonEspaciadoTexto: { color: COLORES.texto, fontWeight: '600', fontSize: 15 },
  botonRojo: {
    borderWidth: 1,
    borderColor: COLORES.error,
    backgroundColor: COLORES.errorFondo,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  botonRojoTexto: { color: COLORES.error, fontWeight: '600', fontSize: 15 },
  botonGris: {
    borderWidth: 1,
    borderColor: COLORES.borde,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 18,
  },
  botonGrisTexto: { color: COLORES.textoSuave, fontWeight: '600', fontSize: 15 },
  vacio: { color: COLORES.textoSuave, marginBottom: 10 },
  enlace: { color: COLORES.acento, fontWeight: '600' },
});
