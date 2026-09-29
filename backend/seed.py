from database import SessionLocal
import models


db = SessionLocal()


usuario = db.query(models.Usuario).filter(
    models.Usuario.dni == "00000000"
).first()


if not usuario:

    nuevo_usuario = models.Usuario(
        dni="00000000",
        nombre="Administrador",
        rol="Administrador",
        estado="Activo"
    )

    db.add(nuevo_usuario)
    db.commit()

    print("Administrador creado correctamente.")

else:

    print("El administrador ya existe.")


db.close()