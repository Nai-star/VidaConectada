# api/utils.py
import cloudinary
import cloudinary.uploader
import cloudinary.api

# Configura tu cuenta de Cloudinary
cloudinary.config(
    cloud_name="dfhdzszjp",  # tu cloud name
    api_key="756294734517976",    # reemplaza con tu API key
    api_secret="afQPVezXkifYQiVTKVVbG8pYf0s",  # reemplaza con tu API secret
    secure=True
)

def upload_to_cloudinary(file):
    """
    Sube un archivo (imagen o video) a Cloudinary y devuelve la URL segura.
    """
    if not file:
        return None

    try:
        result = cloudinary.uploader.upload(file)
        return result.get("secure_url")
    except Exception as e:
        print("Error subiendo a Cloudinary:", e)
        return None
