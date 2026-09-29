import numpy as np


def sumar_vectores(vector_a, vector_b):
    a = np.array(vector_a)
    b = np.array(vector_b)

    if a.shape != b.shape:
        raise ValueError("Los vectores deben tener la misma dimensión")

    resultado = a + b

    return resultado.tolist()


def restar_vectores(vector_a, vector_b):
    a = np.array(vector_a)
    b = np.array(vector_b)

    if a.shape != b.shape:
        raise ValueError("Los vectores deben tener la misma dimensión")

    resultado = a - b

    return resultado.tolist()


def producto_punto(vector_a, vector_b):
    a = np.array(vector_a)
    b = np.array(vector_b)

    if a.shape != b.shape:
        raise ValueError("Los vectores deben tener la misma dimensión")

    resultado = np.dot(a, b)

    return resultado.item()


def multiplicar_por_escalar(vector, escalar):
    v = np.array(vector)

    resultado = v * escalar

    return resultado.tolist()


def transpuesta(matriz):
    m = np.array(matriz)

    resultado = m.T

    return resultado.tolist()


def multiplicar_matrices(matriz_a, matriz_b):
    a = np.array(matriz_a)
    b = np.array(matriz_b)

    if a.shape[1] != b.shape[0]:
        raise ValueError(
            "Las dimensiones de las matrices no son compatibles"
        )

    resultado = np.matmul(a, b)

    return resultado.tolist()

def combinacion_lineal(vectores, escalares):
    if not vectores:
        raise ValueError("Debe existir al menos un vector")

    if len(vectores) != len(escalares):
        raise ValueError(
            "La cantidad de vectores debe coincidir con la cantidad de escalares"
        )

    vectores_np = [np.array(v) for v in vectores]

    dimension = vectores_np[0].shape

    for vector in vectores_np:
        if vector.shape != dimension:
            raise ValueError(
                "Todos los vectores deben tener la misma dimensión"
            )

    resultado = np.zeros(dimension)

    for vector, escalar in zip(vectores_np, escalares):
        resultado = resultado + (vector * escalar)

    return resultado.tolist()