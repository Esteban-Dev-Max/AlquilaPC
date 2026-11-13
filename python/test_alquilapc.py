"""Pruebas unitarias del modulo logico de AlquilaPC.

Ejecucion (desde la carpeta ``python``)::

    python -m unittest -v test_alquilapc.py
"""

import unittest

from Prueba1 import (
    DESCUENTO_DIAS_ADICIONALES,
    DESCUENTO_ESTABLECIMIENTO,
    INCREMENTO_FUERA_CIUDAD,
    TARIFA_DIARIA,
    calculo_alquiler,
    calculo_alquiler_adicional,
    calculo_alquiler_adicional_dto,
    calculo_dentro_establecimiento,
    calculo_descuento,
    calculo_domicilio,
    calcular_valores,
    formato_moneda,
    validar_datos,
)


class TestCalculoAlquiler(unittest.TestCase):
    """Tarifa base: $35.000 por equipo por dia."""

    def test_dos_equipos_tres_dias(self):
        self.assertEqual(calculo_alquiler(3, 2), 210_000)

    def test_un_equipo_un_dia(self):
        self.assertEqual(calculo_alquiler(1, 1), TARIFA_DIARIA)

    def test_tarifa_personalizada(self):
        self.assertEqual(calculo_alquiler(4, 2, tarifa=10_000), 80_000)

    def test_retorna_float(self):
        self.assertIsInstance(calculo_alquiler(2, 2), float)


class TestCalculoAdicional(unittest.TestCase):
    """Dias adicionales y su descuento del 2 %."""

    def test_bruto_dos_equipos_dos_dias(self):
        self.assertEqual(calculo_alquiler_adicional(2, 2), 140_000)

    def test_bruto_sin_dias_adicionales(self):
        self.assertEqual(calculo_alquiler_adicional(0, 3), 0)

    def test_bruto_seis_equipos_cuatro_dias(self):
        self.assertEqual(calculo_alquiler_adicional(4, 6), 840_000)

    def test_con_descuento_dos_por_ciento(self):
        # 140.000 - 2 % (2.800) = 137.200
        self.assertEqual(calculo_alquiler_adicional_dto(2, 2), 137_200)

    def test_con_descuento_seis_equipos(self):
        # 840.000 - 2 % (16.800) = 823.200
        self.assertEqual(calculo_alquiler_adicional_dto(4, 6), 823_200)

    def test_sin_dias_adicionales_no_hay_descuento(self):
        self.assertEqual(calculo_alquiler_adicional_dto(0, 2), 0)

    def test_diferencia_equivale_al_descuento(self):
        bruto = calculo_alquiler_adicional(5, 3)
        con_dto = calculo_alquiler_adicional_dto(5, 3)
        self.assertAlmostEqual(bruto - con_dto, bruto * DESCUENTO_DIAS_ADICIONALES, places=2)


class TestDescuentosEIncrementos(unittest.TestCase):
    """Funciones de descuento, establecimiento y domicilio."""

    def test_calculo_descuento_cinco_por_ciento(self):
        self.assertEqual(calculo_descuento(100_000, 0.05), 5_000)

    def test_calculo_descuento_dos_por_ciento(self):
        self.assertEqual(calculo_descuento(140_000, 0.02), 2_800)

    def test_calculo_descuento_cero(self):
        self.assertEqual(calculo_descuento(100_000, 0), 0)

    def test_dentro_establecimiento(self):
        # 100.000 - 5 % = 95.000
        self.assertEqual(calculo_dentro_establecimiento(100_000), 95_000)

    def test_dentro_establecimiento_total_cero(self):
        self.assertEqual(calculo_dentro_establecimiento(0), 0)

    def test_domicilio_incrementa_cinco_por_ciento(self):
        # 100.000 + 5 % = 105.000
        self.assertEqual(calculo_domicilio(100_000), 105_000)

    def test_domicilio_total_cero(self):
        self.assertEqual(calculo_domicilio(0), 0)


class TestCalcularValores(unittest.TestCase):
    """Integracion de todas las reglas de negocio."""

    def test_servicio_en_la_ciudad(self):
        # base 210.000 + adicional 137.200 = 347.200 (sin ajuste)
        resultado = calcular_valores("Ana Perez", 2, 3, 2, 1)
        self.assertEqual(resultado["valor_base"], 210_000)
        self.assertEqual(resultado["valor_adicional_bruto"], 140_000)
        self.assertEqual(resultado["descuento_adicional"], 2_800)
        self.assertEqual(resultado["valor_adicional"], 137_200)
        self.assertEqual(resultado["subtotal"], 347_200)
        self.assertEqual(resultado["total"], 347_200)
        self.assertEqual(resultado["servicio"], "En la ciudad")

    def test_servicio_fuera_de_la_ciudad(self):
        # 347.200 + 5 % (17.360) = 364.560
        resultado = calcular_valores("Luis Gomez", 2, 3, 2, 2)
        self.assertEqual(resultado["incremento_fuera_ciudad"], 17_360)
        self.assertEqual(resultado["descuento_establecimiento"], 0)
        self.assertEqual(resultado["total"], 364_560)

    def test_servicio_en_el_establecimiento(self):
        # 347.200 - 5 % (17.360) = 329.840
        resultado = calcular_valores("Marta Ruiz", 2, 3, 2, 3)
        self.assertEqual(resultado["descuento_establecimiento"], 17_360)
        self.assertEqual(resultado["incremento_fuera_ciudad"], 0)
        self.assertEqual(resultado["total"], 329_840)

    def test_sin_dias_adicionales(self):
        # 6 equipos * 2 dias = 420.000, sin descuento adicional
        resultado = calcular_valores("Carlos Diaz", 6, 2, 0, 1)
        self.assertEqual(resultado["valor_adicional"], 0)
        self.assertEqual(resultado["descuento_adicional"], 0)
        self.assertEqual(resultado["total"], 420_000)

    def test_establecimiento_sin_adicionales(self):
        # 420.000 - 5 % = 399.000
        resultado = calcular_valores("Sara Mora", 6, 2, 0, 3)
        self.assertEqual(resultado["total"], 399_000)

    def test_fuera_de_la_ciudad_sin_adicionales(self):
        # 420.000 + 5 % = 441.000
        resultado = calcular_valores("Pedro Rojas", 6, 2, 0, 2)
        self.assertEqual(resultado["total"], 441_000)

    def test_minimo_dos_equipos(self):
        # 2 equipos * 1 dia = 70.000
        resultado = calcular_valores("Elena Vargas", 2, 1, 0, 1)
        self.assertEqual(resultado["total"], 70_000)

    def test_diccionario_completo(self):
        resultado = calcular_valores("Ana Perez", 2, 3, 2, 2)
        claves = {
            "nombre_cliente", "num_equipos", "dias_iniciales", "dias_adicionales",
            "tipo_servicio", "servicio", "tarifa_diaria", "valor_base",
            "valor_adicional_bruto", "descuento_adicional", "valor_adicional",
            "subtotal", "descuento_establecimiento", "incremento_fuera_ciudad",
            "total",
        }
        self.assertTrue(claves.issubset(resultado.keys()))

    def test_total_con_dos_decimales(self):
        resultado = calcular_valores("Ana Perez", 3, 1, 1, 3)
        self.assertEqual(resultado["total"], round(resultado["total"], 2))


class TestValidaciones(unittest.TestCase):
    """Entradas invalidas deben lanzar ``ValueError``."""

    def test_nombre_vacio(self):
        with self.assertRaises(ValueError):
            calcular_valores("   ", 2, 1, 0, 1)

    def test_menos_de_dos_equipos(self):
        with self.assertRaises(ValueError):
            calcular_valores("Ana", 1, 1, 0, 1)

    def test_dias_iniciales_cero(self):
        with self.assertRaises(ValueError):
            calcular_valores("Ana", 2, 0, 0, 1)

    def test_dias_adicionales_negativos(self):
        with self.assertRaises(ValueError):
            calcular_valores("Ana", 2, 1, -1, 1)

    def test_tipo_servicio_invalido(self):
        with self.assertRaises(ValueError):
            calcular_valores("Ana", 2, 1, 0, 4)

    def test_equipos_decimales(self):
        with self.assertRaises(ValueError):
            calcular_valores("Ana", 2.5, 1, 0, 1)

    def test_texto_no_numerico(self):
        with self.assertRaises(ValueError):
            calcular_valores("Ana", "dos", 1, 0, 1)

    def test_validar_datos_normaliza_cadenas(self):
        datos = validar_datos("  Ana  ", "3", "2", "0", "2")
        self.assertEqual(datos["nombre_cliente"], "Ana")
        self.assertEqual(datos["num_equipos"], 3)
        self.assertEqual(datos["tipo_servicio"], 2)


class TestFormato(unittest.TestCase):
    def test_formato_moneda(self):
        self.assertEqual(formato_moneda(347_200), "$ 347.200")

    def test_formato_moneda_millones(self):
        self.assertEqual(formato_moneda(1_050_000), "$ 1.050.000")


class TestConstantes(unittest.TestCase):
    def test_valores_de_constantes(self):
        self.assertEqual(TARIFA_DIARIA, 35_000)
        self.assertEqual(DESCUENTO_DIAS_ADICIONALES, 0.02)
        self.assertEqual(DESCUENTO_ESTABLECIMIENTO, 0.05)
        self.assertEqual(INCREMENTO_FUERA_CIUDAD, 0.05)


if __name__ == "__main__":
    unittest.main(verbosity=2)
