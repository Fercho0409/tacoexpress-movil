// CAPA DE PRESENTACION
// Formulario compartido por la pantalla de agregar y la de editar.
// No sabe si esta creando o modificando: recibe los valores iniciales
// y entrega los datos ya validados a quien lo use.

import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { validarPlatillo } from '../lib/validarPlatillo';
import { CATEGORIAS, EMOJI_CATEGORIA, fuenteImagen } from '../services/menuApi';
import { COLORES } from '../theme';

const VACIO = { nombre: '', descripcion: '', precio: '', categoria: '', imagen: '' };

export default function FormularioPlatillo({
  valorInicial,
  textoBoton = 'Guardar',
  textoGuardando = 'Guardando...',
  onGuardar,
  onCancelar,
}) {
  const inicial = { ...VACIO, ...(valorInicial || {}) };

  const [datos, setDatos] = useState({
    nombre: inicial.nombre,
    descripcion: inicial.descripcion,
    // El precio se maneja como texto porque viene de un campo de escritura.
    precio: inicial.precio === '' ? '' : String(inicial.precio),
    categoria: inicial.categoria,
  });
  const [imagen, setImagen] = useState(inicial.imagen || '');
  const [errores, setErrores] = useState({});
  const [guardando, setGuardando] = useState(false);
  const [avisoFoto, setAvisoFoto] = useState('');

  function cambiar(campo, valor) {
    setDatos((antes) => ({ ...antes, [campo]: valor }));
    // Se limpia el error de ese campo apenas el usuario corrige.
    setErrores((antes) => ({ ...antes, [campo]: undefined }));
  }

  // Abre la galeria del telefono y guarda la direccion de la foto elegida.
  async function elegirFoto() {
    setAvisoFoto('');
    const permiso = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permiso.granted) {
      setAvisoFoto('Se necesita permiso para abrir la galeria.');
      return;
    }

    const resultado = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.6,
    });

    if (!resultado.canceled) {
      setImagen(resultado.assets[0].uri);
    }
  }

  async function enviar() {
    const { errores: errs, esValido } = validarPlatillo(datos);
    setErrores(errs);
    if (!esValido) return;

    setGuardando(true);
    await onGuardar({
      nombre: datos.nombre.trim(),
      descripcion: datos.descripcion.trim(),
      precio: Number(datos.precio),
      categoria: datos.categoria,
      imagen,
    });
    setGuardando(false);
  }

  const emojiActual = EMOJI_CATEGORIA[datos.categoria] || '\u{1F37D}';
  const vistaPrevia = fuenteImagen(imagen);

  return (
    <KeyboardAvoidingView
      style={estilos.pantalla}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={estilos.contenido}>
        <Text style={estilos.etiqueta}>Foto del platillo</Text>

        {vistaPrevia ? (
          <View>
            <Image source={vistaPrevia} style={estilos.vistaFoto} />
            <View style={estilos.filaBotonesFoto}>
              <TouchableOpacity style={estilos.botonMedio} onPress={elegirFoto}>
                <Text style={estilos.botonMedioTexto}>Cambiar foto</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={estilos.botonMedio}
                onPress={() => setImagen('')}
              >
                <Text style={estilos.botonMedioTexto}>Quitar foto</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity style={estilos.cajaFoto} onPress={elegirFoto}>
            <Text style={estilos.cajaFotoEmoji}>{emojiActual}</Text>
            <Text style={estilos.cajaFotoTexto}>Elegir una foto de la galeria</Text>
            <Text style={estilos.cajaFotoNota}>
              Mientras no haya foto se muestra este dibujo
            </Text>
          </TouchableOpacity>
        )}
        {!!avisoFoto && <Text style={estilos.error}>{avisoFoto}</Text>}

        <Text style={estilos.etiqueta}>Nombre</Text>
        <TextInput
          style={[estilos.campo, errores.nombre && estilos.campoError]}
          value={datos.nombre}
          onChangeText={(texto) => cambiar('nombre', texto)}
          placeholder="Tacos al pastor"
          placeholderTextColor={COLORES.placeholder}
        />
        {!!errores.nombre && <Text style={estilos.error}>{errores.nombre}</Text>}

        <Text style={estilos.etiqueta}>Descripcion</Text>
        <TextInput
          style={[
            estilos.campo,
            estilos.campoAlto,
            errores.descripcion && estilos.campoError,
          ]}
          value={datos.descripcion}
          onChangeText={(texto) => cambiar('descripcion', texto)}
          placeholder="Ingredientes principales"
          placeholderTextColor={COLORES.placeholder}
          multiline
        />
        {!!errores.descripcion && (
          <Text style={estilos.error}>{errores.descripcion}</Text>
        )}

        <Text style={estilos.etiqueta}>Precio (USD)</Text>
        <TextInput
          style={[estilos.campo, errores.precio && estilos.campoError]}
          value={datos.precio}
          onChangeText={(texto) => cambiar('precio', texto)}
          placeholder="3.50"
          placeholderTextColor={COLORES.placeholder}
          keyboardType="decimal-pad"
        />
        {!!errores.precio && <Text style={estilos.error}>{errores.precio}</Text>}

        <Text style={estilos.etiqueta}>Categoria</Text>
        <View style={estilos.pastillas}>
          {CATEGORIAS.map((categoria) => {
            const activa = datos.categoria === categoria;
            return (
              <TouchableOpacity
                key={categoria}
                style={[estilos.pastilla, activa && estilos.pastillaActiva]}
                onPress={() => cambiar('categoria', categoria)}
              >
                <Text
                  style={activa ? estilos.pastillaTextoActivo : estilos.pastillaTexto}
                >
                  {categoria}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        {!!errores.categoria && <Text style={estilos.error}>{errores.categoria}</Text>}

        <TouchableOpacity
          style={[estilos.boton, guardando && estilos.botonApagado]}
          onPress={enviar}
          disabled={guardando}
        >
          <Text style={estilos.botonTexto}>
            {guardando ? textoGuardando : textoBoton}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={estilos.botonGris} onPress={onCancelar}>
          <Text style={estilos.botonGrisTexto}>Cancelar</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const estilos = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: COLORES.fondo },
  contenido: { padding: 20, paddingBottom: 40 },
  etiqueta: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORES.textoSuave,
    marginBottom: 6,
    marginTop: 14,
  },
  cajaFoto: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: COLORES.borde,
    backgroundColor: COLORES.superficie,
    borderRadius: 12,
    paddingVertical: 22,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  cajaFotoEmoji: { fontSize: 36, marginBottom: 6 },
  cajaFotoTexto: { fontSize: 14, fontWeight: '600', color: COLORES.textoSuave },
  cajaFotoNota: {
    fontSize: 12,
    color: COLORES.textoTenue,
    marginTop: 4,
    textAlign: 'center',
  },
  vistaFoto: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    backgroundColor: COLORES.superficieAlta,
  },
  filaBotonesFoto: { flexDirection: 'row', gap: 10, marginTop: 10 },
  botonMedio: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORES.borde,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  botonMedioTexto: { color: COLORES.textoSuave, fontWeight: '600', fontSize: 14 },
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
  campoAlto: { height: 80, textAlignVertical: 'top' },
  campoError: { borderColor: COLORES.error },
  error: { color: COLORES.error, fontSize: 12, marginTop: 4 },
  pastillas: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pastilla: {
    borderWidth: 1,
    borderColor: COLORES.borde,
    backgroundColor: COLORES.superficie,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  pastillaActiva: { backgroundColor: COLORES.acento, borderColor: COLORES.acento },
  pastillaTexto: { color: COLORES.textoSuave, fontSize: 13 },
  pastillaTextoActivo: { color: COLORES.acentoTexto, fontSize: 13, fontWeight: '600' },
  boton: {
    backgroundColor: COLORES.acento,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 24,
  },
  botonApagado: { opacity: 0.6 },
  botonTexto: { color: COLORES.acentoTexto, fontWeight: '600', fontSize: 15 },
  botonGris: {
    borderWidth: 1,
    borderColor: COLORES.borde,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  botonGrisTexto: { color: COLORES.textoSuave, fontWeight: '600', fontSize: 15 },
});
