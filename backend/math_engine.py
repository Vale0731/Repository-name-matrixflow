from decimal import Decimal, InvalidOperation


# ============================================================
# UTILIDADES
# ============================================================

def es_entero(valor):
    """
    Determina si un valor representa un número entero.
    Acepta int y strings como "999999999999999999999".
    """
    try:
        if isinstance(valor, bool):
            return False

        if isinstance(valor, int):
            return True

        texto = str(valor).strip()

        if texto.startswith("+"):
            texto = texto[1:]

        if texto.startswith("-"):
            texto_num = texto[1:]
        else:
            texto_num = texto

        return texto_num.isdigit()

    except Exception:
        return False


def convertir_numero(valor):
    """
    Convierte números preservando enteros grandes.

    Ejemplo:
    "999999999999999999999"
    se convierte a int y NO a float.
    """

    if isinstance(valor, bool):
        raise ValueError("Los valores booleanos no son números válidos")

    if isinstance(valor, int):
        return valor

    if isinstance(valor, float):
        # Si es un float entero, lo convertimos a int.
        if valor.is_integer():
            return int(valor)
        return valor

    texto = str(valor).strip()

    if texto == "":
        raise ValueError("Se encontró un número vacío")

    # Entero
    if es_entero(texto):
        return int(texto)

    # Decimal
    try:
        decimal = Decimal(texto)

        if decimal == decimal.to_integral_value():
            return int(decimal)

        return decimal

    except InvalidOperation:
        raise ValueError(f"Valor numérico inválido: {valor}")


def convertir_vector(vector):
    return [convertir_numero(x) for x in vector]


def convertir_matriz(matriz):
    return [
        [convertir_numero(x) for x in fila]
        for fila in matriz
    ]


# ============================================================
# SUMA DE VECTORES
# ============================================================

def sumar_vectores(vector_a, vector_b):

    if len(vector_a) != len(vector_b):
        raise ValueError(
            "Los vectores deben tener la misma dimensión"
        )

    a = convertir_vector(vector_a)
    b = convertir_vector(vector_b)

    resultado = [
        x + y
        for x, y in zip(a, b)
    ]

    return resultado


# ============================================================
# RESTA DE VECTORES
# ============================================================

def restar_vectores(vector_a, vector_b):

    if len(vector_a) != len(vector_b):
        raise ValueError(
            "Los vectores deben tener la misma dimensión"
        )

    a = convertir_vector(vector_a)
    b = convertir_vector(vector_b)

    resultado = [
        x - y
        for x, y in zip(a, b)
    ]

    return resultado


# ============================================================
# PRODUCTO PUNTO
# ============================================================

def producto_punto(vector_a, vector_b):

    if len(vector_a) != len(vector_b):
        raise ValueError(
            "Los vectores deben tener la misma dimensión"
        )

    a = convertir_vector(vector_a)
    b = convertir_vector(vector_b)

    resultado = sum(
        x * y
        for x, y in zip(a, b)
    )

    return resultado


# ============================================================
# MULTIPLICACIÓN POR ESCALAR
# ============================================================

def multiplicar_por_escalar(vector, escalar):

    v = convertir_vector(vector)
    e = convertir_numero(escalar)

    resultado = [
        x * e
        for x in v
    ]

    return resultado


# ============================================================
# TRANSPUESTA
# ============================================================

def transpuesta(matriz):

    if not matriz:
        return []

    m = convertir_matriz(matriz)

    cantidad_columnas = len(m[0])

    for fila in m:
        if len(fila) != cantidad_columnas:
            raise ValueError(
                "Todas las filas de la matriz deben tener la misma cantidad de columnas"
            )

    resultado = [
        [
            m[fila][columna]
            for fila in range(len(m))
        ]
        for columna in range(cantidad_columnas)
    ]

    return resultado


# ============================================================
# MULTIPLICACIÓN DE MATRICES
# ============================================================

def multiplicar_matrices(matriz_a, matriz_b):

    if not matriz_a or not matriz_b:
        raise ValueError(
            "Las matrices no pueden estar vacías"
        )

    a = convertir_matriz(matriz_a)
    b = convertir_matriz(matriz_b)

    columnas_a = len(a[0])
    filas_b = len(b)

    # Validar que A sea rectangular
    for fila in a:
        if len(fila) != columnas_a:
            raise ValueError(
                "La primera matriz no tiene una estructura válida"
            )

    # Validar que B sea rectangular
    columnas_b = len(b[0])

    for fila in b:
        if len(fila) != columnas_b:
            raise ValueError(
                "La segunda matriz no tiene una estructura válida"
            )

    if columnas_a != filas_b:
        raise ValueError(
            "Las dimensiones de las matrices no son compatibles"
        )

    resultado = []

    for i in range(len(a)):

        fila_resultado = []

        for j in range(columnas_b):

            suma = 0

            for k in range(columnas_a):

                suma += a[i][k] * b[k][j]

            fila_resultado.append(suma)

        resultado.append(fila_resultado)

    return resultado


# ============================================================
# COMBINACIÓN LINEAL
# ============================================================

def combinacion_lineal(vectores, escalares):

    if not vectores:
        raise ValueError(
            "Debe existir al menos un vector"
        )

    if len(vectores) != len(escalares):
        raise ValueError(
            "La cantidad de vectores debe coincidir con la cantidad de escalares"
        )

    vectores_convertidos = [
        convertir_vector(v)
        for v in vectores
    ]

    escalares_convertidos = [
        convertir_numero(e)
        for e in escalares
    ]

    dimension = len(vectores_convertidos[0])

    for vector in vectores_convertidos:

        if len(vector) != dimension:
            raise ValueError(
                "Todos los vectores deben tener la misma dimensión"
            )

    resultado = [0] * dimension

    for vector, escalar in zip(
        vectores_convertidos,
        escalares_convertidos
    ):

        for i in range(dimension):

            resultado[i] += vector[i] * escalar

    return resultado
