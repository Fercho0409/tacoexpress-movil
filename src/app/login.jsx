// PANTALLA: Inicio de sesion

import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { validarInicioSesion } from '../lib/validarCuenta';
import { COLORES } from '../theme';

export default function PantallaLogin() {
  const router = useRouter();
  const { entrar, entrarConGoogle, googleDisponible } = useAuth();

  const [datos, setDatos] = useState({ correo: '', clave: '' });
  const [errores, setErrores] = useState({});
  const [aviso, setAviso] = useState('');
  const [entrando, setEntrando] = useState(false);
  const [entrandoGoogle, setEntrandoGoogle] = useState(false);

  // Mientras una de las dos formas de entrar esta trabajando, se apagan
  // los dos botones para que el usuario no dispare las dos a la vez.
  const ocupado = entrando || entrandoGoogle;

  function cambiar(campo, valor) {
    setDatos((antes) => ({ ...antes, [campo]: valor }));
    setErrores((antes) => ({ ...antes, [campo]: undefined }));
    setAviso('');
  }

  async function enviar() {
    const { errores: errs, esValido } = validarInicioSesion(datos);
    setErrores(errs);
    if (!esValido) return;

    try {
      setEntrando(true);
      await entrar(datos.correo, datos.clave);
      router.replace('/');
    } catch (e) {
      setAviso(e.message);
    } finally {
      setEntrando(false);
    }
  }

  // Con Google no hay campos que validar: la verificacion la hace Google
  // en su propia ventana y devuelve el resultado ya comprobado.
  async function enviarConGoogle() {
    setErrores({});
    setAviso('');
    try {
      setEntrandoGoogle(true);
      await entrarConGoogle();
      router.replace('/');
    } catch (e) {
      setAviso(e.message);
    } finally {
      setEntrandoGoogle(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={estilos.pantalla}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={estilos.contenido}>
        <Stack.Screen options={{ title: 'Iniciar sesion' }} />

        <Text style={estilos.emoji}>{'\u{1F32E}'}</Text>
        <Text style={estilos.titulo}>Bienvenido</Text>
        <Text style={estilos.subtitulo}>Ingrese a su cuenta de TacoExpress</Text>

        {!!aviso && <Text style={estilos.aviso}>{aviso}</Text>}

        <Text style={estilos.etiqueta}>Correo</Text>
        <TextInput
          style={[estilos.campo, errores.correo && estilos.campoError]}
          value={datos.correo}
          onChangeText={(texto) => cambiar('correo', texto)}
          placeholder="nombre@correo.com"
          placeholderTextColor={COLORES.placeholder}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        {!!errores.correo && <Text style={estilos.error}>{errores.correo}</Text>}

        <Text style={estilos.etiqueta}>Contrasena</Text>
        <TextInput
          style={[estilos.campo, errores.clave && estilos.campoError]}
          value={datos.clave}
          onChangeText={(texto) => cambiar('clave', texto)}
          placeholder="Su contrasena"
          placeholderTextColor={COLORES.placeholder}
          secureTextEntry
        />
        {!!errores.clave && <Text style={estilos.error}>{errores.clave}</Text>}

        <TouchableOpacity
          style={[estilos.boton, ocupado && estilos.botonApagado]}
          onPress={enviar}
          disabled={ocupado}
        >
          <Text style={estilos.botonTexto}>
            {entrando ? 'Entrando...' : 'Iniciar sesion'}
          </Text>
        </TouchableOpacity>

        {/* El inicio con Google necesita abrir una ventana del navegador.
            En el telefono esa ventana no existe sin compilar la aplicacion
            con codigo nativo, asi que el boton solo aparece en la web. */}
        {googleDisponible && (
          <>
            <View style={estilos.separador}>
              <View style={estilos.linea} />
              <Text style={estilos.separadorTexto}>o</Text>
              <View style={estilos.linea} />
            </View>

            <TouchableOpacity
              style={[estilos.botonGoogle, ocupado && estilos.botonApagado]}
              onPress={enviarConGoogle}
              disabled={ocupado}
            >
              <Text style={estilos.botonGoogleTexto}>
                {entrandoGoogle ? 'Abriendo Google...' : 'Continuar con Google'}
              </Text>
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity
          style={estilos.botonBorde}
          onPress={() => router.push('/registro')}
          disabled={ocupado}
        >
          <Text style={estilos.botonBordeTexto}>Crear una cuenta</Text>
        </TouchableOpacity>

        <View style={estilos.ayuda}>
          <Text style={estilos.ayudaTitulo}>Cuentas de prueba</Text>
          <Text style={estilos.ayudaTexto}>
            Administrador: admin@tacoexpress.com / Admin1234
          </Text>
          <Text style={estilos.ayudaTexto}>
            Cliente: cliente@tacoexpress.com / Cliente1234
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const estilos = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: COLORES.fondo },
  contenido: { padding: 24, paddingTop: 32, paddingBottom: 40 },
  emoji: { fontSize: 48, textAlign: 'center' },
  titulo: {
    fontSize: 26,
    fontWeight: '700',
    color: COLORES.texto,
    textAlign: 'center',
    marginTop: 8,
  },
  subtitulo: {
    fontSize: 14,
    color: COLORES.textoSuave,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 20,
  },
  aviso: {
    backgroundColor: COLORES.errorFondo,
    color: COLORES.error,
    padding: 10,
    borderRadius: 8,
    fontSize: 13,
    marginBottom: 8,
  },
  etiqueta: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORES.textoSuave,
    marginBottom: 6,
    marginTop: 14,
  },
  campo: {
    backgroundColor: COLORES.superficie,
    borderWidth: 1,
    borderColor: COLORES.borde,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 15,
    color: COLORES.texto,
  },
  campoError: { borderColor: COLORES.error },
  error: { color: COLORES.error, fontSize: 12, marginTop: 4 },
  boton: {
    backgroundColor: COLORES.acento,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 24,
  },
  botonApagado: { opacity: 0.6 },
  botonTexto: { color: COLORES.acentoTexto, fontWeight: '600', fontSize: 15 },
  separador: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 14,
  },
  linea: { flex: 1, height: 1, backgroundColor: COLORES.borde },
  separadorTexto: {
    color: COLORES.textoTenue,
    fontSize: 12,
    marginHorizontal: 12,
  },
  botonGoogle: {
    backgroundColor: COLORES.superficieAlta,
    borderWidth: 1,
    borderColor: COLORES.borde,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  botonGoogleTexto: { color: COLORES.texto, fontWeight: '600', fontSize: 15 },
  botonBorde: {
    borderWidth: 1,
    borderColor: COLORES.borde,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  botonBordeTexto: { color: COLORES.textoSuave, fontWeight: '600', fontSize: 15 },
  ayuda: {
    backgroundColor: COLORES.acentoFondo,
    borderRadius: 10,
    padding: 14,
    marginTop: 28,
  },
  ayudaTitulo: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORES.acento,
    marginBottom: 6,
  },
  ayudaTexto: { fontSize: 12, color: COLORES.acento, lineHeight: 18 },
});
