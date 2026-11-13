import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { colores, sombra } from '../theme';

export default function RegistroClicks({
  contador,
  registros,
  onRegistrarClic,
  onBorrarRegistros,
}) {
  return (
    <View style={estilos.tarjeta}>
      <View style={estilos.cabecera}>
        <View style={estilos.cabeceraTexto}>
          <Text style={estilos.titulo}>Registro de clics</Text>
          <Text style={estilos.ayuda}>
            Cada interacción guarda la hora exacta del evento (HH:MM:SS).
          </Text>
        </View>

        <View style={estilos.contador} accessibilityLiveRegion="polite">
          <Text style={estilos.contadorEtiqueta}>Clics registrados</Text>
          <Text style={estilos.contadorNumero}>{contador}</Text>
        </View>
      </View>

      <View style={estilos.acciones}>
        <TouchableOpacity
          style={estilos.botonPrimario}
          onPress={onRegistrarClic}
          accessibilityRole="button"
          activeOpacity={0.8}
        >
          <Text style={estilos.botonPrimarioTexto}>Registrar clic</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={estilos.botonSecundario}
          onPress={onBorrarRegistros}
          accessibilityRole="button"
          activeOpacity={0.8}
        >
          <Text style={estilos.botonSecundarioTexto}>Borrar registros</Text>
        </TouchableOpacity>
      </View>

      <View style={estilos.tabla}>
        <View style={estilos.tablaCabecera}>
          <Text style={[estilos.th, estilos.colNumero]}>N.º</Text>
          <Text style={[estilos.th, estilos.colEvento]}>Evento</Text>
          <Text style={[estilos.th, estilos.colHora]}>Hora</Text>
        </View>

        {registros.length === 0 ? (
          <Text style={estilos.vacia}>
            Aún no hay registros. Calcula un alquiler o pulsa «Registrar clic».
          </Text>
        ) : (
          registros.map((registro) => (
            <View key={registro.id} style={estilos.fila}>
              <Text style={[estilos.celda, estilos.colNumero, estilos.celdaNumero]}>
                {registro.id}
              </Text>
              <Text style={[estilos.celda, estilos.colEvento]} numberOfLines={3}>
                {registro.evento}
              </Text>
              <Text style={[estilos.celda, estilos.colHora, estilos.celdaHora]}>
                {registro.hora}
              </Text>
            </View>
          ))
        )}
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  tarjeta: {
    backgroundColor: colores.superficie,
    borderRadius: 18,
    padding: 20,
    gap: 16,
    ...sombra,
  },
  cabecera: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
    flexWrap: 'wrap',
  },
  cabeceraTexto: {
    flex: 1,
    minWidth: 180,
  },
  titulo: {
    fontSize: 18,
    fontWeight: '700',
    color: colores.texto,
  },
  ayuda: {
    fontSize: 12,
    color: colores.textoSuave,
    marginTop: 4,
  },
  contador: {
    minWidth: 120,
    alignItems: 'center',
    backgroundColor: colores.primarioClaro,
    borderWidth: 1,
    borderColor: '#C9E7E1',
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  contadorEtiqueta: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: colores.primarioOscuro,
    textAlign: 'center',
  },
  contadorNumero: {
    fontSize: 28,
    fontWeight: '800',
    color: colores.primarioOscuro,
    fontVariant: ['tabular-nums'],
  },
  acciones: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  botonPrimario: {
    flexGrow: 1,
    backgroundColor: colores.primario,
    borderRadius: 999,
    paddingVertical: 12,
    paddingHorizontal: 18,
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
    paddingVertical: 12,
    paddingHorizontal: 18,
    alignItems: 'center',
  },
  botonSecundarioTexto: {
    color: colores.primarioOscuro,
    fontSize: 14,
    fontWeight: '600',
  },
  tabla: {
    borderWidth: 1,
    borderColor: colores.borde,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: colores.superficie,
  },
  tablaCabecera: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: '#F3F8F6',
    borderBottomWidth: 1,
    borderBottomColor: colores.borde,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  th: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.7,
    textTransform: 'uppercase',
    color: colores.textoSuave,
  },
  fila: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EDF3F1',
  },
  celda: {
    fontSize: 13,
    color: colores.texto,
  },
  celdaNumero: {
    color: colores.textoSuave,
    fontVariant: ['tabular-nums'],
  },
  celdaHora: {
    fontWeight: '600',
    color: colores.primarioOscuro,
    fontVariant: ['tabular-nums'],
  },
  colNumero: {
    width: 34,
  },
  colEvento: {
    flex: 1,
  },
  colHora: {
    width: 70,
    textAlign: 'right',
  },
  vacia: {
    paddingVertical: 24,
    paddingHorizontal: 16,
    textAlign: 'center',
    fontSize: 12,
    color: colores.textoSuave,
  },
});
