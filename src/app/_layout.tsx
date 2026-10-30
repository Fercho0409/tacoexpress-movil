// NAVEGACION PRINCIPAL
// Define la pila de pantallas y envuelve la aplicacion con los contextos
// de sesion y de carrito, para que todas las pantallas sepan quien inicio
// sesion y que lleva pedido.
// Los colores salen de src/theme.js, no se escriben aqui.

import { Stack } from 'expo-router';
import { StatusBar } from 'react-native';
import { AuthProvider } from '../context/AuthContext';
import { CarritoProvider } from '../context/CarritoContext';
import { COLORES } from '../theme';

export default function LayoutPrincipal() {
  return (
    <AuthProvider>
      <CarritoProvider>
        {/* Con fondo oscuro los iconos de la barra superior van en claro. */}
        <StatusBar barStyle="light-content" backgroundColor={COLORES.fondo} />

        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: COLORES.fondo },
            headerTintColor: COLORES.texto,
            headerTitleStyle: { fontWeight: '600', color: COLORES.texto },
            headerShadowVisible: false,
            contentStyle: { backgroundColor: COLORES.fondo },
          }}
        >
          <Stack.Screen name="index" options={{ title: 'TacoExpress' }} />
        </Stack>
      </CarritoProvider>
    </AuthProvider>
  );
}
