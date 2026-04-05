# console.py, menu de consola para el sistema de asistencias
from database import (
    agregar_jugador_db,
    exportar_asistencias_excel,
    inicializar_db,
    listar_jugadores_db,
)


def _mostrar_resultado_operacion(resultado, mensaje_ok):
    if resultado["exito"]:
        print(mensaje_ok)
    else:
        print(f"Error: {resultado.get('mensaje', 'Error desconocido')}")


def menu_consola():
    while True:
        print("\nSUAREZ VOLEY CLUB")
        print("1. Agregar jugador")
        print("2. Listar jugadores")
        print("3. Generar reporte Excel")
        print("4. Salir")
        op = input("Opcion: ")

        if op == "1":
            try:
                nombre = input("Nombre: ")
                edad = int(input("Edad: "))
                tiempo = int(input("Tiempo: "))
                res = agregar_jugador_db(nombre, edad, tiempo)
                _mostrar_resultado_operacion(
                    res,
                    f"Jugador agregado con exito. Codigo: {res.get('codigo', '----')}",
                )
            except ValueError:
                print("Error: Edad y tiempo deben ser numeros.")
        elif op == "2":
            jugadores = listar_jugadores_db()
            print("\nLISTADO DE JUGADORES:")
            if not jugadores:
                print("No hay jugadores cargados.")
                continue
            for j in jugadores:
                print(
                    f"- {j['nombre']} (Edad: {j['edad']}, Tiempo: {j['tiempo']} meses, Codigo: {j['codigo']})"
                )
        elif op == "3":
            ruta = exportar_asistencias_excel()
            print(f"Reporte '{ruta}' generado con exito.")
        elif op == "4":
            print("Saliendo...")
            break
        else:
            print("Error: opcion invalida.")


if __name__ == "__main__":
    inicializar_db()
    menu_consola()
