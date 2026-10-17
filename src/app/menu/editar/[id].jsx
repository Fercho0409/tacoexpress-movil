// PANTALLA: Editar un platillo existente
// Busca el platillo por su id, carga sus datos en el formulario
// compartido y guarda los cambios con actualizarPlatillo.

import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import FormularioPlatillo from '../../../components/FormularioPlatillo';
import { useAuth } from '../../../context/AuthContext';
import { actualizarPlatillo, buscarPlatillo } from '../../../services/menuApi';
import { COLORES } from '../../../theme';

export default function PantallaEditar() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { esAdministrador } = useAuth();
  const [platillo, setPlatillo] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    // Si no es administrador no tiene sentido pedir los datos.
    if (!esAdministrador) {
      setCargando(false);
      return;
    }

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
  }, [id, esAdministrador]);

  // RUTA PROTEGIDA: solo el administrador puede modificar el menu.
  if (!esAdministrador) {
    return (
      <View style={estilos.bloqueo}>
        <Stack.Screen options={{ title: 'Acceso restringido' }} />
        <Text style={estilos.bloqueoTitulo}>No tiene acceso a esta pantalla</Text>
        <Text style={estilos.bloqueoTexto}>
          Solo el administrador puede modificar los platillos del menu.
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

  if (cargando) {
    return (
      <View style={estilos.centro}>
        <Stack.Screen options={{ title: 'Editar platillo' }} />
        <ActivityIndicator size="large" color={COLORES.acento} />
      </View>
    );
  }

  if (!platillo) {
    return (
      <View style={estilos.centro}>
        <Stack.Screen options={{ title: 'Editar platillo' }} />
        <Text style={estilos.bloqueoTexto}>Este platillo ya no existe.</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={estilos.enlace}>Volver al menu</Text>
        </TouchableOpacity>
      </View>
    );
  }

  async function guardar(datos) {
    await actualizarPlatillo(id, datos);
    router.back();
  }

  return (
    <View style={estilos.pantalla}>
      <Stack.Screen options={{ title: 'Editar platillo' }} />
      <FormularioPlatillo
        valorInicial={platillo}
        textoBoton="Guardar cambios"
        textoGuardando="Guardando cambios..."
        onGuardar={guardar}
        onCancelar={() => router.back()}
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
    padding: 28,
  },
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
  enlace: { color: COLORES.acento, fontWeight: '600' },
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
