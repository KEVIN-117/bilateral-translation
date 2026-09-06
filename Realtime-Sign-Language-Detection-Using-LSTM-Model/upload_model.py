import os
from huggingface_hub import login, upload_file

# Inicia sesión usando la variable de entorno HUGGING_FACE_HUB_TOKEN o el prompt interactivo
login()

REPO_ID = "k3rb3r0/translation"

# Subimos explícitamente solo los artefactos del modelo para evitar subir .venv o Notebooks pesados
archivos_a_subir = ["model.h5", "model_weights.h5", "README.md"]

for archivo in archivos_a_subir:
    if os.path.exists(archivo):
        print(f"Subiendo {archivo} a Hugging Face Hub ({REPO_ID})...")
        upload_file(
            path_or_fileobj=archivo,
            path_in_repo=archivo,
            repo_id=REPO_ID,
            repo_type="model"
        )
        print(f"✅ {archivo} subido exitosamente.")
    else:
        print(f"⚠️ El archivo {archivo} no se encontró en el directorio local.")
