/* ==========================================================================
   AlquilaPC - Lógica del cotizador y registro de clics
   ========================================================================== */

'use strict';

// ----------------------------- Reglas de negocio ---------------------------

const TARIFA_DIARIA = 35000;
const MIN_EQUIPOS = 2;

const SERVICIO_EN_CIUDAD = 1;
const SERVICIO_FUERA_CIUDAD = 2;
const SERVICIO_EN_ESTABLECIMIENTO = 3;

const DESCUENTO_DIAS_ADICIONALES = 0.02; // 2 %
const DESCUENTO_ESTABLECIMIENTO = 0.05; // 5 %
const INCREMENTO_FUERA_CIUDAD = 0.05; // 5 %

const NOMBRE_SERVICIO = {
  [SERVICIO_EN_CIUDAD]: 'En la ciudad',
  [SERVICIO_FUERA_CIUDAD]: 'Fuera de la ciudad',
  [SERVICIO_EN_ESTABLECIMIENTO]: 'En el establecimiento',
};

// ------------------------------- Utilidades -------------------------------

const redondear = (valor) => Math.round((Number(valor) + Number.EPSILON) * 100) / 100;

const formatoMoneda = (valor) =>
  '$ ' + Math.round(Number(valor)).toLocaleString('es-CO');

const formatoHora = (fecha) =>
  [fecha.getHours(), fecha.getMinutes(), fecha.getSeconds()]
    .map((parte) => String(parte).padStart(2, '0'))
    .join(':');

// --------------------------- Funciones de cálculo --------------------------

function calculoAlquiler(diasIniciales, numEquipos, tarifa = TARIFA_DIARIA) {
  return redondear(tarifa * diasIniciales * numEquipos);
}

function calculoAlquilerAdicional(diasAdicionales, numEquipos, tarifa = TARIFA_DIARIA) {
  return redondear(tarifa * diasAdicionales * numEquipos);
}

function calculoDescuento(valor, porcentaje) {
  return redondear(valor * porcentaje);
}

function calculoAlquilerAdicionalDto(diasAdicionales, numEquipos, tarifa = TARIFA_DIARIA) {
  const bruto = calculoAlquilerAdicional(diasAdicionales, numEquipos, tarifa);
  return redondear(bruto - calculoDescuento(bruto, DESCUENTO_DIAS_ADICIONALES));
}

function calculoDentroEstablecimiento(total) {
  return redondear(total - calculoDescuento(total, DESCUENTO_ESTABLECIMIENTO));
}

function calculoDomicilio(total) {
  return redondear(total + calculoDescuento(total, INCREMENTO_FUERA_CIUDAD));
}

/**
 * Calcula el desglose completo del alquiler.
 * Lanza un Error con mensaje legible si los datos no son válidos.
 */
function calcularValores({ nombre, numEquipos, diasIniciales, diasAdicionales, tipoServicio }) {
  const datos = validarDatos({ nombre, numEquipos, diasIniciales, diasAdicionales, tipoServicio });

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

function validarDatos({ nombre, numEquipos, diasIniciales, diasAdicionales, tipoServicio }) {
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

function entero(valor, campo) {
  const numero = Number(valor);
  if (!Number.isInteger(numero) || numero < 0) {
    throw new Error(`El campo «${campo}» debe ser un número entero válido.`);
  }
  return numero;
}

// ------------------------------ Referencias DOM ----------------------------

const formulario = document.getElementById('formulario');
const mensaje = document.getElementById('mensaje');
const resultado = document.getElementById('resultado');

const campos = {
  nombre: document.getElementById('nombre'),
  equipos: document.getElementById('equipos'),
  dias: document.getElementById('dias'),
  adicionales: document.getElementById('adicionales'),
  servicio: document.getElementById('servicio'),
};

const salida = {
  cliente: document.getElementById('resultado-cliente'),
  detalle: document.getElementById('resultado-detalle'),
  base: document.getElementById('valor-base'),
  adicional: document.getElementById('valor-adicional'),
  descuentoAdicional: document.getElementById('descuento-adicional'),
  subtotal: document.getElementById('valor-subtotal'),
  descuentoEstablecimiento: document.getElementById('descuento-establecimiento'),
  incrementoFuera: document.getElementById('incremento-fuera'),
  total: document.getElementById('valor-total'),
  filaDescuentoAdicional: document.getElementById('fila-descuento-adicional'),
  filaSubtotal: document.getElementById('fila-subtotal'),
  filaEstablecimiento: document.getElementById('fila-establecimiento'),
  filaFuera: document.getElementById('fila-fuera'),
};

const contadorClicks = document.getElementById('contador-clicks');
const cuerpoRegistros = document.getElementById('cuerpo-registros');
const btnClick = document.getElementById('btn-click');
const btnLimpiar = document.getElementById('btn-limpiar');
const btnBorrarRegistros = document.getElementById('btn-borrar-registros');

let totalClicks = 0;

// -------------------------------- Mensajes --------------------------------

function mostrarMensaje(texto, tipo = 'error') {
  mensaje.textContent = texto;
  mensaje.classList.toggle('mensaje--ok', tipo === 'ok');
  mensaje.hidden = false;
}

function ocultarMensaje() {
  mensaje.hidden = true;
  mensaje.textContent = '';
  mensaje.classList.remove('mensaje--ok');
}

function marcarCampoInvalido(campo) {
  campo.classList.add('campo--error');
  campo.setAttribute('aria-invalid', 'true');
}

function limpiarCamposInvalidos() {
  Object.values(campos).forEach((campo) => {
    campo.classList.remove('campo--error');
    campo.removeAttribute('aria-invalid');
  });
}

// ------------------------------ Cálculo y render ---------------------------

function leerFormulario() {
  return {
    nombre: campos.nombre.value,
    numEquipos: campos.equipos.value,
    diasIniciales: campos.dias.value,
    diasAdicionales: campos.adicionales.value || '0',
    tipoServicio: campos.servicio.value,
  };
}

function pintarResultado(datos) {
  salida.cliente.textContent = datos.nombre;
  salida.detalle.textContent =
    `${datos.numEquipos} equipos · ${datos.diasIniciales} día(s) inicial(es) · ` +
    `${datos.diasAdicionales} día(s) adicional(es) · ${datos.servicio}`;

  salida.base.textContent = formatoMoneda(datos.valorBase);
  salida.adicional.textContent = formatoMoneda(datos.valorAdicional);
  salida.adicional.title =
    datos.diasAdicionales > 0
      ? `Valor bruto: ${formatoMoneda(datos.valorAdicionalBruto)}`
      : 'Sin días adicionales';

  salida.filaDescuentoAdicional.hidden = datos.descuentoAdicional <= 0;
  salida.descuentoAdicional.textContent = `- ${formatoMoneda(datos.descuentoAdicional)}`;

  salida.filaSubtotal.hidden = datos.diasAdicionales <= 0;
  salida.subtotal.textContent = formatoMoneda(datos.subtotal);

  salida.filaEstablecimiento.hidden = datos.descuentoEstablecimiento <= 0;
  salida.descuentoEstablecimiento.textContent = `- ${formatoMoneda(
    datos.descuentoEstablecimiento
  )}`;

  salida.filaFuera.hidden = datos.incrementoFueraCiudad <= 0;
  salida.incrementoFuera.textContent = `+ ${formatoMoneda(datos.incrementoFueraCiudad)}`;

  salida.total.textContent = formatoMoneda(datos.total);

  resultado.hidden = false;
}

function manejarEnvio(evento) {
  evento.preventDefault();
  ocultarMensaje();
  limpiarCamposInvalidos();

  try {
    const datos = calcularValores(leerFormulario());
    pintarResultado(datos);
    mostrarMensaje('Cotización calculada correctamente.', 'ok');

    registrarEvento(
      `Cálculo de alquiler · ${datos.nombre} · ${datos.numEquipos} equipos · ` +
        `${datos.diasIniciales + datos.diasAdicionales} días · ${datos.servicio}`
    );

    resultado.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  } catch (error) {
    resultado.hidden = true;
    mostrarMensaje(error.message);
    enfocarCampoConError(error.message);
  }
}

function enfocarCampoConError(texto) {
  const mapa = [
    [/nombre/i, campos.nombre],
    [/equipos/i, campos.equipos],
    [/iniciales/i, campos.dias],
    [/adicionales/i, campos.adicionales],
    [/servicio/i, campos.servicio],
  ];
  const encontrado = mapa.find(([patron]) => patron.test(texto));
  if (encontrado) {
    marcarCampoInvalido(encontrado[1]);
    encontrado[1].focus();
  }
}

// ---------------------------- Registro de clics ---------------------------

function registrarEvento(descripcion) {
  totalClicks += 1;
  contadorClicks.textContent = String(totalClicks);

  const ahora = new Date();
  const fila = document.createElement('tr');
  fila.className = 'fila-nueva';

  const celdaNumero = document.createElement('td');
  celdaNumero.textContent = String(totalClicks);

  const celdaEvento = document.createElement('td');
  celdaEvento.textContent = descripcion;

  const celdaHora = document.createElement('td');
  celdaHora.textContent = formatoHora(ahora);
  celdaHora.title = ahora.toLocaleString('es-CO');

  fila.append(celdaNumero, celdaEvento, celdaHora);

  const filaVacia = cuerpoRegistros.querySelector('.tabla__vacia');
  if (filaVacia) {
    filaVacia.remove();
  }

  cuerpoRegistros.prepend(fila);
}

// Solo se registra la hora cada vez que el evento se ejecuta, por eso se
// captura una única instancia de Date dentro de la función.

function borrarRegistros() {
  totalClicks = 0;
  contadorClicks.textContent = '0';
  cuerpoRegistros.innerHTML =
    '<tr class="tabla__vacia"><td colspan="3">Aún no hay registros. ' +
    'Calcula un alquiler o pulsa «Registrar clic».</td></tr>';
}

// -------------------------------- Acciones --------------------------------

formulario.addEventListener('submit', manejarEnvio);

btnClick.addEventListener('click', () => {
  registrarEvento('Clic manual del usuario');
});

btnLimpiar.addEventListener('click', () => {
  formulario.reset();
  resultado.hidden = true;
  ocultarMensaje();
  limpiarCamposInvalidos();
  campos.nombre.focus();
});

btnBorrarRegistros.addEventListener('click', borrarRegistros);

// Limpia el estado de error de un campo cuando el usuario lo corrige.
Object.values(campos).forEach((campo) => {
  campo.addEventListener('input', () => {
    campo.classList.remove('campo--error');
    campo.removeAttribute('aria-invalid');
  });
});
