// PANTALLA DE INICIO
// Cambia segun haya sesion iniciada o no.

import { useRouter } from 'expo-router';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useCarrito } from '../context/CarritoContext';
import { COLORES } from '../theme';

export default function PantallaInicio() {
  const router = useRouter();
  const { usuario, cargando, haySesion, esAdministrador, salir } = useAuth();
  const { unidades } = useCarrito();

  if (cargando) {
    return (
      <View style={estilos.pantalla}>
        <ActivityIndicator size="large" color={COLORES.acento} />
      </View>
    );
  }

  return (
    <View style={estilos.pantalla}>
      <Text style={estilos.emoji}>{'\u{1F32E}'}</Text>
      <Text style={estilos.titulo}>TacoExpress</Text>
      <Text style={estilos.subtitulo}>Taqueria Los Hernandez</Text>

      {haySesion && (
        <View style={estilos.tarjetaSesion}>
          <Text style={estilos.saludo}>Hola, {usuario.nombre}</Text>
          <Text style={estilos.rol}>
            {esAdministrador ? 'Administrador' : 'Cliente'}
          </Text>
        </View>
      )}

      <TouchableOpacity style={estilos.boton} onPress={() => router.push('/menu')}>
        <Text style={estilos.botonTexto}>Ver el menu</Text>
      </TouchableOpacity>

      {/* El pedido en curso se recuerda mientras la aplicacion este abierta,
          asi que se avisa desde el inicio si quedo algo sin confirmar. */}
      {unidades > 0 && (
        <TouchableOpacity
          style={estilos.botonBorde}
          onPress={() => router.push('/carrito')}
        >
          <Text style={estilos.botonBordeTexto}>
            Ver mi pedido ({unidades})
          </Text>
        </TouchableOpacity>
      )}

      {/* El administrador ve todos los pedidos; el cliente solo los suyos. */}
      {haySesion && (
        <TouchableOpacity
          style={estilos.botonBorde}
          onPress={() => router.push('/pedidos')}
        >
          <Text style={estilos.botonBordeTexto}>
            {esAdministrador ? 'Pedidos recibidos' : 'Mis pedidos'}
          </Text>
        </TouchableOpacity>
      )}

      {esAdministrador && (
        <TouchableOpacity
          style={estilos.botonBorde}
          onPress={() => router.push('/menu/nuevo')}
        >
          <Text style={estilos.botonBordeTexto}>Agregar un platillo</Text>
        </TouchableOpacity>
      )}

      {haySesion ? (
        <TouchableOpacity style={estilos.botonTexto2} onPress={salir}>
          <Text style={estilos.enlace}>Cerrar sesion</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={estilos.botonBorde}
          onPress={() => router.push('/login')}
        >
          <Text style={estilos.botonBordeTexto}>Iniciar sesion</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const estilos = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: COLORES.fondo,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emoji: { fontSize: 64, marginBottom: 8 },
  titulo: { fontSize: 32, fontWeight: '700', color: COLORES.texto },
  subtitulo: { fontSize: 15, color: COLORES.textoSuave, marginTop: 4, marginBottom: 24 },
  tarjetaSesion: {
    backgroundColor: COLORES.acentoFondo,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
  },
  saludo: { fontSize: 16, fontWeight: '600', color: COLORES.acento },
  rol: { fontSize: 12, color: COLORES.acento, marginTop: 2 },
  boton: {
    backgroundColor: COLORES.acento,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    width: '100%',
  },
  botonTexto: { color: COLORES.acentoTexto, fontWeight: '600', fontSize: 16 },
  botonBorde: {
    borderWidth: 1,
    borderColor: COLORES.borde,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    width: '100%',
    marginTop: 12,
  },
  botonBordeTexto: { color: COLORES.textoSuave, fontWeight: '600', fontSize: 16 },
  botonTexto2: { marginTop: 18, padding: 8 },
  enlace: { color: COLORES.error, fontWeight: '600', fontSize: 14 },
});
