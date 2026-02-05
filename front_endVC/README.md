# VidaConectada

**VidaConectada** es una aplicación web orientada a la **promoción y gestión de campañas de donación de sangre**, diseñada para conectar donantes con campañas activas de manera segura, clara y eficiente.

El sistema está desarrollado con un **frontend en React** y un **backend en Django + Django REST Framework**, permitiendo la gestión tanto de usuarios finales como de administradores mediante un panel administrativo completo.

---

## Objetivo del proyecto

- Facilitar la **inscripción de donantes** a campañas de donación de sangre.
- Centralizar la **gestión de campañas**, participantes y usuarios.
- Evitar **registros duplicados** en campañas.
- Proveer **estadísticas y reportes** para análisis y toma de decisiones.
- Brindar información clara sobre **requisitos, bancos de sangre y experiencias reales** de donantes.
- Ofrecer una plataforma **accesible, escalable y segura** para instituciones de salud.

---

## Tecnologías utilizadas

### Frontend
- React.js  
- JavaScript  
- CSS  
- React Router DOM  
- Axios  
- React Icons  
- React Slick (Carrusel)  
- Recharts (gráficos y estadísticas)

### Backend
- Django  
- Django REST Framework  
- Python  

### Base de datos
- MySQL  

### Autenticación y seguridad
- JWT (djangorestframework-simplejwt)  
- Sistema de usuarios de Django  
- Control de roles (usuario / administrador)  

### Otros servicios
- Cloudinary (gestión de imágenes)  
- django-cors-headers  

---

## Arquitectura general

- El **frontend** consume la API REST proporcionada por Django.
- El **backend** gestiona la lógica de negocio, validaciones y seguridad.
- **MySQL** almacena usuarios, campañas, participantes, testimonios y galería.
- **JWT** protege las rutas privadas del sistema administrativo.

---

## Funcionalidades

### Para usuarios
- Registro e inicio de sesión.
- Consulta de campañas públicas activas y pasadas.
- Inscripción a campañas de donación.
- Validación automática para evitar múltiples registros en la misma campaña.
- Visualización de:
  - Tipo de sangre requerido.
  - Porcentaje de población objetivo.
  - Fecha, hora y ubicación.
- Acceso a:
  - Requisitos para donar sangre.
  - Red de bancos de sangre.
  - Galería de campañas.
  - Testimonios reales de donantes.

---

### Para administradores

#### Gestión de campañas
- Crear campañas con:
  - Nombre
  - Descripción
  - Fecha y hora
  - Imagen obligatoria
  - Estado (activo / inactivo)
- Editar campañas existentes.
- Eliminar campañas.
- Visualizar campañas activas y finalizadas.

#### Gestión de participantes
- Visualizar usuarios inscritos por campaña.
- Validar participación.
- Bloqueo automático de registros duplicados.
- Exportar participantes en formato CSV.

#### Gestión de usuarios
- Visualizar usuarios registrados.
- Crear nuevos administradores.
- Bloquear usuarios temporalmente.
- Eliminar usuarios del sistema.

#### Gestión de contenido informativo
- Administrar **galería de imágenes**.
- Gestionar **testimonios de texto**.
- Actualizar información de **requisitos y bancos de sangre**.

#### Reportes y estadísticas
- Cantidad de participantes por campaña.
- Campañas por mes (gráficos).
- Tipos de sangre más requeridos.
- Descarga de reportes para análisis interno.

---

## Secciones informativas del sistema

### Galería
- Muestra imágenes reales de campañas de donación.
- Refuerza la confianza y el impacto social del proyecto.
- Las imágenes se almacenan y gestionan mediante **Cloudinary**.

---

### Red de bancos de sangre
- Listado de bancos de sangre disponibles.
- Información básica:
  - Nombre del banco
  - Ubicación
  - Horarios de atención
- Permite orientar al donante a centros cercanos.

---

### Requisitos para donar sangre
- Edad mínima y máxima permitida.
- Peso mínimo requerido.
- Buen estado de salud general.
- No haber donado sangre recientemente.
- No presentar enfermedades infecciosas.
- No estar en ayuno prolongado.
- Presentar documento de identificación.

> *Los requisitos pueden ser actualizados por los administradores según normativa vigente.*

---

### Testimonios
- Sección de **testimonios en texto** de donantes.
- Refuerza la confianza y motiva a nuevos usuarios.
- Ejemplos:
  - Experiencias positivas al donar.
  - Impacto personal de ayudar a otros.
- Los testimonios pueden ser administrados desde el panel administrativo.

---

## Área de administración – Guía de uso

### Dashboard
- Gráficos de campañas por mes.
- Acceso rápido para crear nuevas campañas.
- Vista general del estado del sistema.

### Panel de campañas
- Visualización de campañas activas y pasadas.
- Crear, editar y eliminar campañas.
- Información clave: fecha, hora y ubicación.

### Panel de participantes
- Listado de usuarios inscritos.
- Validación manual de participación.
- Exportación de datos en CSV.

### Panel de usuarios
- Gestión completa de usuarios.
- Asignación de roles.
- Bloqueo o eliminación de cuentas.

### Navegación general
- Menú lateral para acceder a:
  - Campañas
  - Participantes
  - Usuarios
  - Galería
  - Testimonios
  - Reportes
- Cambios reflejados en tiempo real en la base de datos MySQL.

---

## Servicios y Endpoints principales

Todos los endpoints están disponibles bajo `/api/` y protegidos mediante JWT.

### Campañas
- `GET /campanas/` → Listar campañas públicas  
- `POST /campanas/` → Crear campaña (admin)  
- `PUT /campanas/<id>/` → Editar campaña (admin)  
- `DELETE /campanas/<id>/` → Eliminar campaña (admin)  

### Participación
- `POST /participacion/` → Registrar participación  
- `GET /participacion/<campaign_id>/` → Ver participantes (admin)  
- `POST /participacion/validar/` → Validar participación  

### Usuarios
- `POST /usuarios/register/` → Registro de usuario  
- `POST /usuarios/login/` → Inicio de sesión  
- `GET /usuarios/` → Listar usuarios (admin)  

---

## Instalación y ejecución

### Backend (Django + MySQL)

```bash
cd backend
python -m venv venv


## Intalaciones 

- npm install
- npm run dev    
- npm install react-router-dom
- npm install react-router-hash-link ( lo histale para hacer los enlase de los titulos de la partes de la pagina de la maner mas suave y eficiente)

- npm install react-icons (iconos)

- npm install react-slick (Para el carrusel de la pagina pricipal)
- npm install react-slick slick-carousel

- npm install -g json-server 
- npm run mock(levanta el json)
- npm install recharts



## Back-end 
-  pip install django      
- pip install pymysql  
- pip install django-cors-headers     
- pip install cloudinary   
- python -m pip install djangorestframework    
- python manage.py makemigrations  
- python -m venv venv (esto es para crear la carpeta pero ya esta creada)
- .\venv\Scripts\activate ( esto activa la carpeta )
- python -m pip install --upgrade pip setuptools wheel ( estos actualiza la carpeta )
- python -m pip install django djangorestframework PyMySQL cryptography ( esto instala todo de una vez en la carpeta )
- python manage.py makemigrations                                
- python manage.py migrate
- python manage.py runserver ( levanta Back-end )
- deactivate (Desactivar el venv cuando termines)
- pip install djangorestframework-simplejwt
- pip install mysqlclient
pip install djangorestframework-simplejwt


## Área de mejoras – Implementación de validaciones en campañas

Con el objetivo de fortalecer la integridad de la información y mejorar la experiencia de uso en el sistema **VidaConectada**, se identifican las siguientes mejoras relacionadas con la **implementación de validaciones en el módulo de campañas**:

- **Validación de fechas:**  
  - Evitar la creación de campañas con fechas anteriores a la fecha actual.
  - Validar coherencia entre fecha y hora de la campaña.

- **Validación de campos obligatorios:**  
  - Verificar que todos los campos requeridos estén completos (nombre, descripción, fecha, hora e imagen).
  - Evitar el guardado de campañas con información incompleta.

- **Validación de imágenes:**  
  - Asegurar que la imagen sea obligatoria al crear una campaña.
  - Validar formato y tamaño máximo permitido de la imagen.

- **Validación de campañas duplicadas:**  
  - Evitar la creación de campañas con el mismo nombre, fecha y ubicación.
  - Mostrar mensajes claros al administrador en caso de duplicidad.

- **Validación de estado de campaña:**  
  - Impedir la activación de campañas vencidas.
  - Controlar correctamente el estado activo/inactivo de la campaña.

- **Mensajes de error claros:**  
  - Mostrar retroalimentación visual y textual al administrador cuando una validación falle.
  - Unificar mensajes de error entre frontend y backend.

- **Validaciones tanto en frontend como backend:**  
  - Validaciones inmediatas en el frontend para mejorar la experiencia del usuario.
  - Validaciones definitivas en el backend para garantizar la seguridad de los datos.

Estas mejoras permitirán un **mayor control sobre la creación y edición de campañas**, reduciendo errores, inconsistencias y problemas de datos en el sistema.



