# Pregúntale al Profe

Un bot multifuncional para Telegram y WhatsApp diseñado para automatizar y facilitar la comunicación entre estudiantes, apoderados y profesores, proporcionando acceso rápido a información académica y administrativa.

## Funcionalidades

Este bot ofrece un conjunto de herramientas tanto para estudiantes como para docentes, accesibles a través de comandos de texto simples.

### Para Estudiantes

- **Obtener Notas:** Solicita el informe de notas ingresando el RUT. El bot enviará un archivo HTML con el detalle.
- **Cambiar Email:** Permite actualizar la dirección de correo electrónico asociada al estudiante para recibir comunicados.
- **Inscripción al Sistema:** Guía a los nuevos estudiantes para que se registren en la base de datos del sistema a través de una plantilla de datos.
- **Inscripción Online:** Proporciona un enlace a un formulario de Google para una inscripción alternativa.
- **Conversación General:** Interactúa con un chatbot (SimSimi/Cleverbot) para responder a preguntas generales o saludos. **Nota:** Esta funcionalidad está restringida a usuarios específicos para prevenir abusos del sistema.

### Para Docentes

- **Consultar Datos de Estudiante:** Obtiene información detallada de un estudiante (nombre, curso, contacto, etc.) utilizando su RUT.
- **Enviar Mensajes a un Curso:** Permite difundir un mensaje a todos los estudiantes de un curso específico a través de WhatsApp.
- **Consultar Datos de Apoderado:** (Funcionalidad suspendida) Permitía buscar información de contacto de los apoderados.

## Tecnologías Utilizadas

- **Node.js:** Entorno de ejecución para JavaScript.
- **Telegraf:** Framework para la creación de bots de Telegram.
- **whatsapp-web.js:** Librería para interactuar con WhatsApp Web y automatizar mensajes.
- **Axios & isomorphic-fetch:** Clientes HTTP para realizar peticiones a APIs externas (Google Scripts).
- **dotenv:** Para la gestión de variables de entorno.
- **rut.js:** Para la validación de RUTs chilenos.
- **email-validator:** Para la validación de direcciones de correo electrónico.
- **cleverbot-free & SimSimi:** APIs de chatbots para conversación casual.
- **Google Apps Script:** Funciona como el backend que gestiona las operaciones sobre una hoja de cálculo de Google, la cual actúa como el libro de clases y fuente de datos principal.

## Prerrequisitos

Antes de comenzar, asegúrate de tener lo siguiente:

- [Node.js](https://nodejs.org/) instalado (versión 14 o superior).
- Una cuenta de WhatsApp activa y un smartphone para escanear el código QR.
- Un token de bot de Telegram, que puedes obtener hablando con [BotFather](https://t.me/botfather).
- Una URL de implementación de Google Apps Script configurada para manejar la lógica de la base de datos.

## Instalación y Configuración

1.  **Clona el repositorio:**
    ```bash
    git clone https://github.com/tu-usuario/preguntalealprofe.git
    cd preguntalealprofe
    ```

2.  **Instala las dependencias:**
    ```bash
    npm install
    ```

3.  **Crea un archivo `.env`** en la raíz del proyecto y añade las siguientes variables de entorno:
    ```env
    # Token de tu bot de Telegram
    BOT_TOKEN=TU_TELEGRAM_BOT_TOKEN

    # Número de WhatsApp del administrador para recibir notificaciones (formato internacional)
    numeroAdmin=569xxxxxxxx

    # Código de implementación de tu API de Google Apps Script
    implementacionApiGoogle=TU_CODIGO_DE_IMPLEMENTACION
    ```

4.  **Crea el directorio `informes`:**
    Este directorio es necesario para almacenar temporalmente los informes de notas antes de ser enviados.
    ```bash
    mkdir informes
    ```

## Uso

1.  **Inicia la aplicación:**
    ```bash
    npm start
    ```

2.  **Autenticación de WhatsApp:**
    - Al iniciar por primera vez, se generará un código QR en la terminal.
    - Escanea este código QR con la aplicación de WhatsApp en tu teléfono (en `Dispositivos Vinculados`).
    - Una vez escaneado, se creará un archivo `session` que mantendrá la sesión activa para futuros inicios.

3.  **Interactúa con los bots:**
    - **Telegram:** Busca tu bot en Telegram y envíale un mensaje. Escribe `opciones` para ver el menú de comandos.
    - **WhatsApp:** Envía mensajes al número de WhatsApp vinculado. Escribe `opciones` para ver el menú.

## Estructura del Proyecto

```
.
├── API_servicios/
│   └── APIservicios.js   # Lógica para interactuar con la API de Google Scripts.
├── informes/             # Directorio temporal para informes de notas.
├── .env.example          # Ejemplo de archivo de variables de entorno.
├── app.js                # Archivo principal: lógica de los bots de Telegram y WhatsApp.
├── config.js             # Carga la configuración (ej. token de Telegram).
├── package.json          # Dependencias y scripts del proyecto.
└── README.md             # Este archivo.
```