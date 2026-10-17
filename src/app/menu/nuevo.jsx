// PANTALLA: Nuevo platillo
// Solo coordina: comprueba el permiso, muestra el formulario compartido
// y manda los datos al servicio. Las reglas estan en validarPlatillo
// y el guardado en menuApi.

import { Stack, useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import FormularioPlatillo from '../../components/FormularioPlatillo';
import { useAuth } from '../../context/AuthContext';
import { crearPlatillo } from '../../services/menuApi';
import { COLORES } from '../../theme';

export default function PantallaNuevo() {
  const router = useRouter();
  const { esAdministrador } = useAuth();

  // RUTA PROTEGIDA: solo el administrador puede agregar platillos.
  if (!esAdministrador) {
    return (
      <View style={estilos.bloqueo}>
        <Stack.Screen options={{ title: 'Acceso restringido' }} />
        <Text style={estilos.bloqueoTitulo}>No tiene acceso a esta pantalla</Text>
        <Text style={estilos.bloqueoTexto}>
          Solo el administrador puede agregar platillos al menu.
        </Text>
        <TouchableOpacity style={estilos.boton} onPress={() => router.push('/login')}>
          <Text style={estilos.botonTexto}>Iniciar sesion</Text>
        </TouchableOpacity>
        <TouchableOpacity style={estilos.botonGris} onPress={() => router.back()}>
          <Text style={estilos.botonGrisTexto}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  async function guardar(datos) {
    await crearPlatillo(datos);
    router.back();
  }

  return (
    <View style={estilos.pantalla}>
      <Stack.Screen options={{ title: 'Nuevo platillo' }} />
      <FormularioPlatillo
        textoBoton="Agregar platillo"
        textoGuardando="Guardando..."
        onGuardar={guardar}
        onCancelar={() => router.back()}
      />
    </View>
  );
}

const estilos = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: COLORES.fondo },
  bloqueo: {
    flex: 1,
    backgroundColor: COLORES.fondo,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
  },
  bloqueoTitulo: {
    fontSize: 19,
    fontWeight: '700',
    color: COLORES.texto,
    textAlign: 'center',
  },
  bloqueoTexto: {
    fontSize: 14,
    color: COLORES.textoSuave,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  boton: {
    backgroundColor: COLORES.acento,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  botonTexto: { color: COLORES.acentoTexto, fontWeight: '600', fontSize: 15 },
  botonGris: {
    borderWidth: 1,
    borderColor: COLORES.borde,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    alignSelf: 'stretch',
    marginTop: 10,
  },
  botonGrisTexto: { color: COLORES.textoSuave, fontWeight: '600', fontSize: 15 },
});
