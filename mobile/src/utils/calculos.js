/**
 * AlquilaPC - Reglas de negocio compartidas por la app móvil.
 *
 * Tarifa base: $35.000 por equipo/día.
 * Días adicionales: 2 % de descuento.
 * Fuera de la ciudad: +5 % sobre el total.
 * En el establecimiento: -5 % sobre el total.
 */

export const TARIFA_DIARIA = 35000;
export const MIN_EQUIPOS = 2;

export const SERVICIO_EN_CIUDAD = 1;
export const SERVICIO_FUERA_CIUDAD = 2;
export const SERVICIO_EN_ESTABLECIMIENTO = 3;

export const DESCUENTO_DIAS_ADICIONALES = 0.02;
export const DESCUENTO_ESTABLECIMIENTO = 0.05;
export const INCREMENTO_FUERA_CIUDAD = 0.05;

export const NOMBRE_SERVICIO = {
  [SERVICIO_EN_CIUDAD]: 'En la ciudad',
  [SERVICIO_FUERA_CIUDAD]: 'Fuera de la ciudad',
  [SERVICIO_EN_ESTABLECIMIENTO]: 'En el establecimiento',
};

export const OPCIONES_SERVICIO = [
  { valor: SERVICIO_EN_CIUDAD, etiqueta: '1 · En la ciudad', nota: 'Sin ajuste' },
  { valor: SERVICIO_FUERA_CIUDAD, etiqueta: '2 · Fuera de la ciudad', nota: '+5 %' },
  {
    valor: SERVICIO_EN_ESTABLECIMIENTO,
    etiqueta: '3 · En el establecimiento',
    nota: '−5 %',
  },
];

const redondear = (valor) => Math.round((Number(valor) + Number.EPSILON) * 100) / 100;

export const formatoMoneda = (valor) => {
  const numero = Math.round(Number(valor));
  const grupos = String(Math.abs(numero)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${numero < 0 ? '-' : ''}$ ${grupos}`;
};

const dosDigitos = (valor) => String(valor).padStart(2, '0');

/** Hora local en formato HH:MM:SS. */
export const formatoHora = (fecha = new Date()) =>
  `${dosDigitos(fecha.getHours())}:${dosDigitos(fecha.getMinutes())}:${dosDigitos(
    fecha.getSeconds()
  )}`;

export const calculoAlquiler = (diasIniciales, numEquipos, tarifa = TARIFA_DIARIA) =>
  redondear(tarifa * diasIniciales * numEquipos);

export const calculoAlquilerAdicional = (
  diasAdicionales,
  numEquipos,
  tarifa = TARIFA_DIARIA
) => redondear(tarifa * diasAdicionales * numEquipos);

export const calculoDescuento = (valor, porcentaje) => redondear(valor * porcentaje);

export const calculoAlquilerAdicionalDto = (
  diasAdicionales,
  numEquipos,
  tarifa = TARIFA_DIARIA
) => {
  const bruto = calculoAlquilerAdicional(diasAdicionales, numEquipos, tarifa);
  return redondear(bruto - calculoDescuento(bruto, DESCUENTO_DIAS_ADICIONALES));
};

export const calculoDentroEstablecimiento = (total) =>
  redondear(total - calculoDescuento(total, DESCUENTO_ESTABLECIMIENTO));

export const calculoDomicilio = (total) =>
  redondear(total + calculoDescuento(total, INCREMENTO_FUERA_CIUDAD));

function entero(valor, campo) {
  const numero = Number(valor);
  if (!Number.isInteger(numero) || numero < 0) {
    throw new Error(`El campo «${campo}» debe ser un número entero válido.`);
  }
  return numero;
}

export function validarDatos({
  nombre,
  numEquipos,
  diasIniciales,
  diasAdicionales,
  tipoServicio,
}) {
  const nombreLimpio = String(nombre ?? '').trim();
  if (!nombreLimpio) {
    throw new Error('El nombre del cliente es obligatorio.');
  }

  const equipos = entero(numEquipos, 'número de equipos');
  if (equipos < MIN_EQUIPOS) {
    throw new Error(`Debe alquilar mínimo ${MIN_EQUIPOS} equipos.`);
  }

  const dias = entero(diasIniciales, 'días iniciales');
  if (dias < 1) {
    throw new Error('Los días iniciales deben ser al menos 1.');
  }

  const adicionales = entero(diasAdicionales, 'días adicionales');
  if (adicionales < 0) {
    throw new Error('Los días adicionales no pueden ser negativos.');
  }

  const servicio = entero(tipoServicio, 'tipo de servicio');
  if (!NOMBRE_SERVICIO[servicio]) {
    throw new Error('El tipo de servicio debe ser 1, 2 o 3.');
  }

  return {
    nombre: nombreLimpio,
    numEquipos: equipos,
    diasIniciales: dias,
    diasAdicionales: adicionales,
    tipoServicio: servicio,
  };
}

/** Devuelve el desglose completo del alquiler. */
export function calcularValores(datosEntrada) {
  const datos = validarDatos(datosEntrada);

  const valorBase = calculoAlquiler(datos.diasIniciales, datos.numEquipos);
  const valorAdicionalBruto = calculoAlquilerAdicional(
    datos.diasAdicionales,
    datos.numEquipos
  );
  const descuentoAdicional =
    datos.diasAdicionales > 0
      ? calculoDescuento(valorAdicionalBruto, DESCUENTO_DIAS_ADICIONALES)
      : 0;
  const valorAdicional = calculoAlquilerAdicionalDto(
    datos.diasAdicionales,
    datos.numEquipos
  );
  const subtotal = redondear(valorBase + valorAdicional);

  let descuentoEstablecimiento = 0;
  let incrementoFueraCiudad = 0;
  let total = subtotal;

  if (datos.tipoServicio === SERVICIO_EN_ESTABLECIMIENTO) {
    descuentoEstablecimiento = calculoDescuento(subtotal, DESCUENTO_ESTABLECIMIENTO);
    total = calculoDentroEstablecimiento(subtotal);
  } else if (datos.tipoServicio === SERVICIO_FUERA_CIUDAD) {
    incrementoFueraCiudad = calculoDescuento(subtotal, INCREMENTO_FUERA_CIUDAD);
    total = calculoDomicilio(subtotal);
  }

  return {
    ...datos,
    servicio: NOMBRE_SERVICIO[datos.tipoServicio],
    valorBase,
    valorAdicionalBruto,
    descuentoAdicional,
    valorAdicional,
    subtotal,
    descuentoEstablecimiento,
    incrementoFueraCiudad,
    total: redondear(total),
  };
}
