import React from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { OPCIONES_SERVICIO } from '../utils/calculos';
import { colores, sombra } from '../theme';

function Campo({ etiqueta, ayuda, children }) {
  return (
    <View style={estilos.campo}>
      <Text style={estilos.etiqueta}>{etiqueta}</Text>
      {children}
      {ayuda ? <Text style={estilos.ayuda}>{ayuda}</Text> : null}
    </View>
  );
}

export default function FormularioAlquiler({
  valores,
  alCambiar,
  onCalcular,
  onLimpiar,
  error,
}) {
  return (
    <View style={estilos.tarjeta}>
      <View style={estilos.cabecera}>
        <Text style={estilos.titulo}>Datos de la solicitud</Text>
        <View style={estilos.pildora}>
          <Text style={estilos.pildoraTexto}>$35.000 / día</Text>
        </View>
      </View>

      <Campo etiqueta="Nombre del cliente">
        <TextInput
          style={estilos.input}
          value={valores.nombre}
          onChangeText={(texto) => alCambiar('nombre', texto)}
          placeholder="Ej. Ana María Pérez"
          placeholderTextColor="#9AAFA9"
          autoCapitalize="words"
          maxLength={60}
          returnKeyType="next"
        />
      </Campo>

      <View style={estilos.fila}>
        <View style={estilos.columna}>
          <Campo etiqueta="Número de equipos" ayuda="Mínimo 2 equipos.">
            <TextInput
              style={estilos.input}
              value={valores.equipos}
              onChangeText={(texto) => alCambiar('equipos', texto)}
              keyboardType="number-pad"
              placeholder="2"
              placeholderTextColor="#9AAFA9"
              maxLength={4}
            />
          </Campo>
        </View>
        <View style={estilos.columna}>
          <Campo etiqueta="Días iniciales" ayuda="Al menos 1 día.">
            <TextInput
              style={estilos.input}
              value={valores.dias}
              onChangeText={(texto) => alCambiar('dias', texto)}
              keyboardType="number-pad"
              placeholder="1"
              placeholderTextColor="#9AAFA9"
              maxLength={4}
            />
          </Campo>
        </View>
      </View>

      <Campo etiqueta="Días adicionales" ayuda="Reciben 2 % de descuento.">
        <TextInput
          style={estilos.input}
          value={valores.adicionales}
          onChangeText={(texto) => alCambiar('adicionales', texto)}
          keyboardType="number-pad"
          placeholder="0"
          placeholderTextColor="#9AAFA9"
          maxLength={4}
        />
      </Campo>

      <Campo etiqueta="Tipo de servicio">
        <View style={estilos.opciones}>
          {OPCIONES_SERVICIO.map((opcion) => {
            const activo = valores.servicio === opcion.valor;
            return (
              <TouchableOpacity
                key={opcion.valor}
                style={[estilos.opcion, activo && estilos.opcionActiva]}
                onPress={() => alCambiar('servicio', opcion.valor)}
                accessibilityRole="radio"
                accessibilityState={{ selected: activo }}
                accessibilityLabel={`${opcion.etiqueta} ${opcion.nota}`}
              >
                <Text style={[estilos.opcionTexto, activo && estilos.opcionTextoActiva]}>
                  {opcion.etiqueta}
                </Text>
                <Text style={[estilos.opcionNota, activo && estilos.opcionNotaActiva]}>
                  {opcion.nota}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </Campo>

      {error ? (
        <View style={estilos.error}>
          <Text style={estilos.errorTexto}>{error}</Text>
        </View>
      ) : null}

      <View style={estilos.acciones}>
        <TouchableOpacity
          style={estilos.botonPrimario}
          onPress={onCalcular}
          accessibilityRole="button"
          activeOpacity={0.8}
        >
          <Text style={estilos.botonPrimarioTexto}>Calcular alquiler</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={estilos.botonSecundario}
          onPress={onLimpiar}
          accessibilityRole="button"
          activeOpacity={0.8}
        >
          <Text style={estilos.botonSecundarioTexto}>Limpiar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  tarjeta: {
    backgroundColor: colores.superficie,
    borderRadius: 18,
    padding: 20,
    gap: 14,
    ...sombra,
  },
  cabecera: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    flexWrap: 'wrap',
  },
  titulo: {
    fontSize: 18,
    fontWeight: '700',
    color: colores.texto,
  },
  pildora: {
    backgroundColor: colores.primarioClaro,
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  pildoraTexto: {
    fontSize: 12,
    fontWeight: '600',
    color: colores.primarioOscuro,
  },
  campo: {
    gap: 6,
    flex: 1,
  },
  etiqueta: {
    fontSize: 13,
    fontWeight: '600',
    color: colores.texto,
  },
  ayuda: {
    fontSize: 11,
    color: colores.textoSuave,
  },
  input: {
    borderWidth: 1.5,
    borderColor: colores.borde,
    borderRadius: 10,
    backgroundColor: '#FBFDFC',
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 15,
    color: colores.texto,
  },
  fila: {
    flexDirection: 'row',
    gap: 12,
  },
  columna: {
    flex: 1,
  },
  opciones: {
    gap: 8,
  },
  opcion: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    borderWidth: 1.5,
    borderColor: colores.borde,
    borderRadius: 10,
    paddingVertical: 11,
    paddingHorizontal: 14,
    backgroundColor: '#FBFDFC',
  },
  opcionActiva: {
    borderColor: colores.primario,
    backgroundColor: colores.primarioClaro,
  },
  opcionTexto: {
    fontSize: 14,
    color: colores.texto,
    flexShrink: 1,
  },
  opcionTextoActiva: {
    fontWeight: '600',
    color: colores.primarioOscuro,
  },
  opcionNota: {
    fontSize: 12,
    color: colores.textoSuave,
  },
  opcionNotaActiva: {
    color: colores.primarioOscuro,
    fontWeight: '600',
  },
  error: {
    backgroundColor: colores.errorFondo,
    borderLeftWidth: 4,
    borderLeftColor: colores.error,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  errorTexto: {
    color: colores.error,
    fontSize: 13,
  },
  acciones: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
    marginTop: 2,
  },
  botonPrimario: {
    flexGrow: 1,
    backgroundColor: colores.primario,
    borderRadius: 999,
    paddingVertical: 13,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  botonPrimarioTexto: {
    color: colores.blanco,
    fontSize: 14,
    fontWeight: '700',
  },
  botonSecundario: {
    flexGrow: 1,
    borderWidth: 1.5,
    borderColor: colores.borde,
    borderRadius: 999,
    paddingVertical: 13,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  botonSecundarioTexto: {
    color: colores.primarioOscuro,
    fontSize: 14,
    fontWeight: '600',
  },
});
