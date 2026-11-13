import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

import FormularioAlquiler from './src/components/FormularioAlquiler';
import RegistroClicks from './src/components/RegistroClicks';
import TarjetaResultado from './src/components/TarjetaResultado';
import {
  SERVICIO_EN_CIUDAD,
  calcularValores,
  formatoHora,
} from './src/utils/calculos';
import { colores } from './src/theme';

const VALORES_INICIALES = {
  nombre: '',
  equipos: '2',
  dias: '1',
  adicionales: '0',
  servicio: SERVICIO_EN_CIUDAD,
};

export default function App() {
  const [valores, setValores] = useState(VALORES_INICIALES);
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState('');
  const [contador, setContador] = useState(0);
  const [registros, setRegistros] = useState([]);

  const alCambiar = (campo, valor) => {
    setValores((actuales) => ({ ...actuales, [campo]: valor }));
    if (error) {
      setError('');
    }
  };

  const registrarEvento = (evento) => {
    const hora = formatoHora();
    setContador((actual) => actual + 1);
    setRegistros((actuales) => [
      {
        id: actuales.length > 0 ? actuales[0].id + 1 : 1,
        evento,
        hora,
      },
      ...actuales,
    ]);
  };

  const manejarCalculo = () => {
    setError('');
    try {
      const datos = calcularValores({
        nombre: valores.nombre,
        numEquipos: valores.equipos,
        diasIniciales: valores.dias,
        diasAdicionales: valores.adicionales === '' ? '0' : valores.adicionales,
        tipoServicio: valores.servicio,
      });

      setResultado(datos);
      registrarEvento(
        `Cálculo de alquiler · ${datos.nombre} · ${datos.numEquipos} equipos · ` +
          `${datos.diasIniciales + datos.diasAdicionales} días · ${datos.servicio}`
      );
    } catch (excepcion) {
      setResultado(null);
      setError(excepcion.message);
    }
  };

  const manejarLimpiar = () => {
    setValores(VALORES_INICIALES);
    setResultado(null);
    setError('');
  };

  const manejarClic = () => {
    registrarEvento('Clic manual del usuario');
  };

  const borrarRegistros = () => {
    setRegistros([]);
    setContador(0);
  };

  return (
    <SafeAreaView style={estilos.pantalla}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        style={estilos.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={estilos.contenido}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={estilos.encabezado}>
            <View style={estilos.marca}>
              <View style={estilos.logo}>
                <Text style={estilos.logoTexto}>PC</Text>
              </View>
              <View style={estilos.marcaTexto}>
                <Text style={estilos.etiqueta}>SENA · Taller de programación</Text>
                <Text style={estilos.titulo}>AlquilaPC</Text>
              </View>
            </View>
            <Text style={estilos.descripcion}>
              Calcula el alquiler de equipos portátiles con descuentos e incrementos según
              el lugar del servicio.
            </Text>
          </View>

          <FormularioAlquiler
            valores={valores}
            alCambiar={alCambiar}
            onCalcular={manejarCalculo}
            onLimpiar={manejarLimpiar}
            error={error}
          />

          <TarjetaResultado resultado={resultado} />

          <RegistroClicks
            contador={contador}
            registros={registros}
            onRegistrarClic={manejarClic}
            onBorrarRegistros={borrarRegistros}
          />

          <Text style={estilos.pie}>
            AlquilaPC · Tarifa base $35.000 por equipo/día · Mínimo 2 equipos
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: colores.fondo,
  },
  flex: {
    flex: 1,
  },
  contenido: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 32,
    gap: 18,
  },
  encabezado: {
    gap: 10,
    paddingHorizontal: 4,
  },
  marca: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logo: {
    width: 50,
    height: 50,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colores.primario,
  },
  logoTexto: {
    color: colores.blanco,
    fontWeight: '800',
    fontSize: 17,
    letterSpacing: 0.5,
  },
  marcaTexto: {
    flex: 1,
  },
  etiqueta: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: colores.primario,
  },
  titulo: {
    fontSize: 30,
    fontWeight: '800',
    color: colores.texto,
    letterSpacing: -0.5,
  },
  descripcion: {
    fontSize: 13,
    lineHeight: 19,
    color: colores.textoSuave,
  },
  pie: {
    textAlign: 'center',
    fontSize: 11,
    color: colores.textoSuave,
    paddingHorizontal: 16,
  },
});
