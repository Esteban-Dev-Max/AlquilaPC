import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { formatoMoneda } from '../utils/calculos';
import { colores, sombra } from '../theme';

function Fila({ etiqueta, valor, tono }) {
  const color =
    tono === 'descuento'
      ? colores.descuento
      : tono === 'incremento'
        ? colores.incremento
        : colores.texto;

  return (
    <View style={estilos.fila}>
      <Text style={estilos.filaEtiqueta}>{etiqueta}</Text>
      <Text style={[estilos.filaValor, { color }]}>{valor}</Text>
    </View>
  );
}

export default function TarjetaResultado({ resultado }) {
  if (!resultado) {
    return null;
  }

  return (
    <View style={estilos.tarjeta}>
      <View>
        <Text style={estilos.sobreTitulo}>Resumen de la cotización</Text>
        <Text style={estilos.cliente}>{resultado.nombre}</Text>
        <Text style={estilos.detalle}>
          {resultado.numEquipos} equipos · {resultado.diasIniciales} día(s) inicial(es) ·{' '}
          {resultado.diasAdicionales} día(s) adicional(es) · {resultado.servicio}
        </Text>
      </View>

      <View style={estilos.desglose}>
        <Fila etiqueta="Alquiler base" valor={formatoMoneda(resultado.valorBase)} />
        <Fila etiqueta="Días adicionales" valor={formatoMoneda(resultado.valorAdicional)} />

        {resultado.descuentoAdicional > 0 ? (
          <Fila
            etiqueta="Descuento adicional (2 %)"
            valor={`- ${formatoMoneda(resultado.descuentoAdicional)}`}
            tono="descuento"
          />
        ) : null}

        {resultado.diasAdicionales > 0 ? (
          <Fila etiqueta="Subtotal" valor={formatoMoneda(resultado.subtotal)} />
        ) : null}

        {resultado.descuentoEstablecimiento > 0 ? (
          <Fila
            etiqueta="Descuento establecimiento (5 %)"
            valor={`- ${formatoMoneda(resultado.descuentoEstablecimiento)}`}
            tono="descuento"
          />
        ) : null}

        {resultado.incrementoFueraCiudad > 0 ? (
          <Fila
            etiqueta="Incremento fuera de la ciudad (5 %)"
            valor={`+ ${formatoMoneda(resultado.incrementoFueraCiudad)}`}
            tono="incremento"
          />
        ) : null}
      </View>

      <View style={estilos.total}>
        <Text style={estilos.totalEtiqueta}>Total a pagar</Text>
        <Text style={estilos.totalValor}>{formatoMoneda(resultado.total)}</Text>
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
  sobreTitulo: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: colores.textoSuave,
    marginBottom: 4,
  },
  cliente: {
    fontSize: 18,
    fontWeight: '700',
    color: colores.texto,
  },
  detalle: {
    fontSize: 12,
    color: colores.textoSuave,
    marginTop: 4,
  },
  desglose: {
    gap: 2,
  },
  fila: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EDF3F1',
    paddingVertical: 8,
  },
  filaEtiqueta: {
    flex: 1,
    fontSize: 13,
    color: colores.textoSuave,
  },
  filaValor: {
    fontSize: 13,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  total: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    backgroundColor: colores.primario,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 18,
  },
  totalEtiqueta: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colores.blanco,
  },
  totalValor: {
    fontSize: 22,
    fontWeight: '800',
    color: colores.blanco,
    fontVariant: ['tabular-nums'],
  },
});
