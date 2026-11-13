"""AlquilaPC - Modulo logico del taller (SENA).

Reglas de negocio
-----------------
* Tarifa base: $35.000 por equipo, por dia (no hay alquiler por horas).
* Minimo de equipos por solicitud: 2.
* Si hay dias adicionales se aplica un 2 % de descuento sobre el valor de
  esos dias adicionales.
* Servicio "En la ciudad" (1): sin ajuste.
* Servicio "Fuera de la ciudad" (2): incremento del 5 % sobre el total.
* Servicio "En el establecimiento" (3): descuento del 5 % sobre el total.

Todas las funciones devuelven valores monetarios redondeados a 2 decimales,
de modo que el modulo pueda reutilizarse desde la web, la app movil o la
consola sin duplicar reglas.
"""

from __future__ import annotations

from typing import Dict, Union

# ---------------------------------------------------------------------------
# Constantes de negocio
# ---------------------------------------------------------------------------

TARIFA_DIARIA = 35_000.0
MIN_EQUIPOS = 2

SERVICIO_EN_CIUDAD = 1
SERVICIO_FUERA_CIUDAD = 2
SERVICIO_EN_ESTABLECIMIENTO = 3

DESCUENTO_DIAS_ADICIONALES = 0.02  # 2 %
DESCUENTO_ESTABLECIMIENTO = 0.05  # 5 %
INCREMENTO_FUERA_CIUDAD = 0.05  # 5 %

SERVICIOS = {
    SERVICIO_EN_CIUDAD: "En la ciudad",
    SERVICIO_FUERA_CIUDAD: "Fuera de la ciudad",
    SERVICIO_EN_ESTABLECIMIENTO: "En el establecimiento",
}

Numero = Union[int, float]


# ---------------------------------------------------------------------------
# Funciones de calculo
# ---------------------------------------------------------------------------


def calculo_alquiler(
    dias_iniciales: Numero,
    num_equipos: Numero,
    tarifa: Numero = TARIFA_DIARIA,
) -> float:
    """Valor del alquiler de los dias iniciales.

    Formula: tarifa diaria * dias iniciales * numero de equipos.
    """
    return _redondear(tarifa * dias_iniciales * num_equipos)


def calculo_alquiler_adicional(
    dias_adicionales: Numero,
    num_equipos: Numero,
    tarifa: Numero = TARIFA_DIARIA,
) -> float:
    """Valor bruto (sin descuento) de los dias adicionales."""
    return _redondear(tarifa * dias_adicionales * num_equipos)


def calculo_alquiler_adicional_dto(
    dias_adicionales: Numero,
    num_equipos: Numero,
    tarifa: Numero = TARIFA_DIARIA,
) -> float:
    """Valor de los dias adicionales con el 2 % de descuento aplicado."""
    bruto = calculo_alquiler_adicional(dias_adicionales, num_equipos, tarifa)
    return _redondear(bruto - calculo_descuento(bruto, DESCUENTO_DIAS_ADICIONALES))


def calculo_descuento(valor: Numero, porcentaje: Numero) -> float:
    """Devuelve el monto del descuento.

    ``porcentaje`` se expresa en formato decimal (0.05 = 5 %).
    """
    return _redondear(valor * porcentaje)


def calculo_dentro_establecimiento(total: Numero) -> float:
    """Total con el 5 % de descuento por servicio en el establecimiento."""
    return _redondear(total - calculo_descuento(total, DESCUENTO_ESTABLECIMIENTO))


def calculo_domicilio(total: Numero) -> float:
    """Total con el 5 % de incremento por servicio fuera de la ciudad."""
    return _redondear(total + calculo_descuento(total, INCREMENTO_FUERA_CIUDAD))


def calcular_valores(
    nombre_cliente: str,
    num_equipos: Numero,
    dias_iniciales: Numero,
    dias_adicionales: Numero,
    tipo_servicio: Numero,
) -> Dict[str, object]:
    """Calcula el resumen completo del alquiler.

    Devuelve un diccionario con el desglose de todos los conceptos, listo
    para mostrarse en consola, en la web o en la app movil.
    """
    datos = validar_datos(
        nombre_cliente, num_equipos, dias_iniciales, dias_adicionales, tipo_servicio
    )

    equipos = datos["num_equipos"]
    dias = datos["dias_iniciales"]
    adicionales = datos["dias_adicionales"]
    servicio = datos["tipo_servicio"]

    valor_base = calculo_alquiler(dias, equipos)
    valor_adicional_bruto = calculo_alquiler_adicional(adicionales, equipos)
    descuento_adicional = calculo_descuento(
        valor_adicional_bruto, DESCUENTO_DIAS_ADICIONALES
    ) if adicionales > 0 else 0.0
    valor_adicional = calculo_alquiler_adicional_dto(adicionales, equipos)
    subtotal = _redondear(valor_base + valor_adicional)

    descuento_establecimiento = 0.0
    incremento_fuera_ciudad = 0.0

    if servicio == SERVICIO_EN_ESTABLECIMIENTO:
        descuento_establecimiento = _redondear(
            calculo_descuento(subtotal, DESCUENTO_ESTABLECIMIENTO)
        )
        total = calculo_dentro_establecimiento(subtotal)
    elif servicio == SERVICIO_FUERA_CIUDAD:
        incremento_fuera_ciudad = _redondear(
            calculo_descuento(subtotal, INCREMENTO_FUERA_CIUDAD)
        )
        total = calculo_domicilio(subtotal)
    else:
        total = subtotal

    return {
        "nombre_cliente": datos["nombre_cliente"],
        "num_equipos": equipos,
        "dias_iniciales": dias,
        "dias_adicionales": adicionales,
        "tipo_servicio": servicio,
        "servicio": SERVICIOS[servicio],
        "tarifa_diaria": TARIFA_DIARIA,
        "valor_base": valor_base,
        "valor_adicional_bruto": valor_adicional_bruto,
        "descuento_adicional": descuento_adicional,
        "valor_adicional": valor_adicional,
        "subtotal": subtotal,
        "descuento_establecimiento": descuento_establecimiento,
        "incremento_fuera_ciudad": incremento_fuera_ciudad,
        "total": _redondear(total),
    }


# ---------------------------------------------------------------------------
# Validaciones y utilidades
# ---------------------------------------------------------------------------


def validar_datos(
    nombre_cliente: str,
    num_equipos: Numero,
    dias_iniciales: Numero,
    dias_adicionales: Numero,
    tipo_servicio: Numero,
) -> Dict[str, object]:
    """Valida las entradas y las normaliza a los tipos esperados.

    Lanza ``ValueError`` con un mensaje claro cuando un dato no cumple las
    reglas del taller.
    """
    nombre = str(nombre_cliente or "").strip()
    if not nombre:
        raise ValueError("El nombre del cliente es obligatorio.")

    equipos = _entero(num_equipos, "numero de equipos")
    if equipos < MIN_EQUIPOS:
        raise ValueError(f"Debe alquilar minimo {MIN_EQUIPOS} equipos.")

    dias = _entero(dias_iniciales, "dias iniciales")
    if dias < 1:
        raise ValueError("Los dias iniciales deben ser al menos 1.")

    adicionales = _entero(dias_adicionales, "dias adicionales")
    if adicionales < 0:
        raise ValueError("Los dias adicionales no pueden ser negativos.")

    servicio = _entero(tipo_servicio, "tipo de servicio")
    if servicio not in SERVICIOS:
        raise ValueError("El tipo de servicio debe ser 1, 2 o 3.")

    return {
        "nombre_cliente": nombre,
        "num_equipos": equipos,
        "dias_iniciales": dias,
        "dias_adicionales": adicionales,
        "tipo_servicio": servicio,
    }


def _entero(valor: Numero, campo: str) -> int:
    """Convierte a entero rechazando decimales y valores no numericos."""
    if isinstance(valor, bool):
        raise ValueError(f"El campo '{campo}' debe ser un numero entero.")
    try:
        numero = float(valor)
    except (TypeError, ValueError):
        raise ValueError(f"El campo '{campo}' debe ser un numero entero.") from None
    if numero < 0 or not numero.is_integer():
        raise ValueError(f"El campo '{campo}' debe ser un entero mayor o igual a 0.")
    return int(numero)


def _redondear(valor: Numero) -> float:
    """Redondea a 2 decimales evitando errores de punto flotante."""
    return round(float(valor) + 1e-9, 2)


def formato_moneda(valor: Numero) -> str:
    """Formatea un valor como pesos colombianos: ``$ 210.000``."""
    return "$ " + f"{valor:,.0f}".replace(",", ".")


# ---------------------------------------------------------------------------
# Ejecucion por consola
# ---------------------------------------------------------------------------


def _leer_entero(mensaje: str, defecto: int | None = None) -> int:
    while True:
        entrada = input(mensaje).strip()
        if not entrada and defecto is not None:
            return defecto
        try:
            return int(entrada)
        except ValueError:
            print("  -> Ingrese un numero entero valido.")


def main() -> None:
    print("=" * 58)
    print("  ALQUILAPC - Cotizador de alquiler de equipos")
    print("=" * 58)

    nombre = input("Nombre del cliente: ").strip()
    equipos = _leer_entero(f"Numero de equipos (minimo {MIN_EQUIPOS}): ")
    dias = _leer_entero("Dias iniciales: ")
    adicionales = _leer_entero("Dias adicionales (0 si no aplica): ")
    print("Tipo de servicio: 1) En la ciudad  2) Fuera de la ciudad  3) En el establecimiento")
    servicio = _leer_entero("Opcion: ")

    try:
        resultado = calcular_valores(nombre, equipos, dias, adicionales, servicio)
    except ValueError as error:
        print(f"\nError: {error}")
        return

    print("\n" + "-" * 58)
    print(f"Cliente:            {resultado['nombre_cliente']}")
    print(f"Equipos:            {resultado['num_equipos']}")
    print(f"Dias iniciales:     {resultado['dias_iniciales']}")
    print(f"Dias adicionales:   {resultado['dias_adicionales']}")
    print(f"Servicio:           {resultado['servicio']}")
    print("-" * 58)
    print(f"Alquiler base:      {formato_moneda(resultado['valor_base'])}")
    print(f"Dias adicionales:   {formato_moneda(resultado['valor_adicional_bruto'])}")
    print(f"Dto. adicional (2%):{formato_moneda(resultado['descuento_adicional']):>15}")
    if resultado["descuento_establecimiento"]:
        print(f"Dto. establec. (5%):{formato_moneda(resultado['descuento_establecimiento']):>15}")
    if resultado["incremento_fuera_ciudad"]:
        print(f"Incr. fuera (5%):   {formato_moneda(resultado['incremento_fuera_ciudad'])}")
    print("-" * 58)
    print(f"TOTAL A PAGAR:      {formato_moneda(resultado['total'])}")
    print("=" * 58)


if __name__ == "__main__":
    main()
