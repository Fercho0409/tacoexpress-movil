// PANTALLA: Detalle de un pedido
// Muestra el desglose completo tal como quedo guardado. El administrador
// puede cambiarle el estado desde aqui.

import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import {
  buscarPedido,
  cambiarEstado,
  ESTADOS,
  fechaDePedido,
} from '../../services/pedidosApi';
import { COLORES } from '../../theme';

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

export default function PantallaDetallePedido() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { esAdministrador } = useAuth();
  const [pedido, setPedido] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    let activo = true;
    (async () => {
      const encontrado = await buscarPedido(id);
      if (activo) {
        setPedido(encontrado);
        setCargando(false);
      }
    })();
    return () => {
      activo = false;
    };
  }, [id]);

  async function ponerEstado(nuevo) {
    try {
      setGuardando(true);
      const actualizado = await cambiarEstado(id, nuevo);
      setPedido(actualizado);
    } finally {
      setGuardando(false);
    }
  }

  if (cargando) {
    return (
      <View style={estilos.centro}>
        <ActivityIndicator size="large" color={COLORES.acento} />
      </View>
    );
  }

  if (!pedido) {
    return (
      <View style={estilos.centro}>
        <Text style={estilos.vacio}>Este pedido ya no existe.</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={estilos.enlace}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={estilos.pantalla} contentContainerStyle={estilos.contenido}>
      <Stack.Screen options={{ title: 'Detalle del pedido' }} />

      <View
        style={[estilos.estadoCaja, { backgroundColor: fondoDeEstado(pedido.estado) }]}
      >
        <Text style={[estilos.estadoTexto, { color: colorDeEstado(pedido.estado) }]}>
          {pedido.estado}
        </Text>
      </View>

      <Text style={estilos.etiqueta}>Fecha</Text>
      <Text style={estilos.dato}>{fechaDePedido(pedido)}</Text>

      <Text style={estilos.etiqueta}>Cliente</Text>
      <Text style={estilos.dato}>{pedido.nombreCliente}</Text>
      <Text style={estilos.datoSuave}>{pedido.correoCliente}</Text>

      <Text style={estilos.etiqueta}>Productos</Text>

      {/* Estos nombres y precios son los que tenia el menu cuando se hizo
          el pedido. Si luego cambia el precio, aqui no cambia nada: el
          pedido guarda su propia copia, como una factura. */}
      {pedido.lineas.map((linea, i) => (
        <View key={`${linea.platilloId}-${i}`} style={estilos.linea}>
          <View style={estilos.lineaIzquierda}>
            <Text style={estilos.lineaNombre}>{linea.nombre}</Text>
            <Text style={estilos.lineaDetalle}>
              {linea.cantidad} x ${Number(linea.precio).toFixed(2)}
            </Text>
          </View>
          <Text style={estilos.lineaSubtotal}>
            ${Number(linea.subtotal).toFixed(2)}
          </Text>
        </View>
      ))}

      <View style={estilos.totalCaja}>
        <Text style={estilos.totalEtiqueta}>Total</Text>
        <Text style={estilos.totalMonto}>${pedido.total.toFixed(2)}</Text>
      </View>

      {/* Solo el administrador mueve el pedido de un estado a otro. */}
      {esAdministrador && (
        <View style={estilos.zonaAdmin}>
          <Text style={estilos.zonaAdminTitulo}>Cambiar estado</Text>

          {ESTADOS.map((estado) => {
            const actual = estado === pedido.estado;
            return (
              <TouchableOpacity
                key={estado}
                style={[
                  actual ? estilos.botonActivo : estilos.botonEstado,
                  guardando && estilos.apagado,
                ]}
                onPress={() => ponerEstado(estado)}
                disabled={guardando || actual}
              >
                <Text style={actual ? estilos.botonActivoTexto : estilos.botonEstadoTexto}>
                  {actual ? `${estado} (actual)` : estado}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      <TouchableOpacity style={estilos.botonGris} onPress={() => router.back()}>
        <Text style={estilos.botonGrisTexto}>Volver</Text>
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
  estadoCaja: {
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 18,
  },
  estadoTexto: { fontSize: 16, fontWeight: '700' },
  etiqueta: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORES.textoTenue,
    letterSpacing: 1,
    marginTop: 16,
    marginBottom: 6,
  },
  dato: { fontSize: 15, color: COLORES.texto },
  datoSuave: { fontSize: 13, color: COLORES.textoSuave, marginTop: 2 },
  linea: {
    backgroundColor: COLORES.superficie,
    borderWidth: 1,
    borderColor: COLORES.borde,
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lineaIzquierda: { flex: 1, paddingRight: 10 },
  lineaNombre: { fontSize: 15, fontWeight: '600', color: COLORES.texto },
  lineaDetalle: { fontSize: 13, color: COLORES.textoSuave, marginTop: 2 },
  lineaSubtotal: { fontSize: 15, fontWeight: '700', color: COLORES.acento },
  totalCaja: {
    backgroundColor: COLORES.acentoFondo,
    borderRadius: 12,
    padding: 16,
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  totalEtiqueta: { fontSize: 14, fontWeight: '600', color: COLORES.acento },
  totalMonto: { fontSize: 22, fontWeight: '700', color: COLORES.acento },
  zonaAdmin: {
    marginTop: 24,
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
  botonActivo: {
    backgroundColor: COLORES.acento,
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
    marginBottom: 8,
  },
  botonActivoTexto: { color: COLORES.acentoTexto, fontWeight: '600', fontSize: 15 },
  botonEstado: {
    backgroundColor: COLORES.superficieAlta,
    borderWidth: 1,
    borderColor: COLORES.borde,
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
    marginBottom: 8,
  },
  botonEstadoTexto: { color: COLORES.texto, fontWeight: '600', fontSize: 15 },
  apagado: { opacity: 0.6 },
  botonGris: {
    borderWidth: 1,
    borderColor: COLORES.borde,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  botonGrisTexto: { color: COLORES.textoSuave, fontWeight: '600', fontSize: 15 },
  vacio: { color: COLORES.textoSuave, marginBottom: 10 },
  enlace: { color: COLORES.acento, fontWeight: '600' },
});
