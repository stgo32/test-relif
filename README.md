# test-relif

## Descripción

Este proyecto es una API REST construida con Koa y TypeScript que simula la gestión de clientes interesados en la compra de autos de lujo (Ferrari, Lamborghini y Porsche) y la interacción automatizada mediante un chatbot basado en OpenAI. Permite registrar clientes, sus deudas, mensajes y automatiza el seguimiento de conversaciones con respuestas generadas por IA.


## Instalación y ejecución

1. Clona el repositorio y entra en la carpeta:
   ```bash
   git clone https://github.com/stgo32/test-relif.git
   cd test-relif
   ```
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Configura las variables de entorno en un archivo `.env` (ver sección siguiente).
4. Inicia el servidor en modo desarrollo:
   ```bash
   npm run dev
   ```
   O compila y ejecuta en producción:
   ```bash
   npm run build
   npm start
   ```

## Acceso en la Nube

El proyecto está levantado en Railway y puede ser accedido en: https://accurate-education-production.up.railway.app

## Variables de entorno

Si deseas levantar el proyecto localmente, crea un archivo `.env` con los siguientes valores y descomenta en `src/db/config.ts` el setup de la base de datos en `dev` y comenta la de `production`:
```
DB_TYPE=postgres
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASS=postgres
DB_NAME=postgres
OPENAI_API_KEY=<la api key dada en el enunciado>
```

## Endpoints

### Clientes
- `GET /clients` — Lista todos los clientes.
- `GET /clients/:id` — Obtiene el detalle de un cliente (incluye mensajes y deudas).
- `GET /clients-to-do-follow-up` — Lista clientes que requieren seguimiento (sin mensajes recientes en 7 días).
- `POST /client` — Crea un cliente.
Por ejemplo:
```json
{
    "name": "Juan Perez",
    "rut": "11.111.111-1",
    "messages": [
      {
        "text": "Hola, quiero comprar un auto",
        "sentAt": "2023-12-24T00:00:00.000Z",
        "role": "client"
      },
      {
        "text": "Perfecto, te puedo ayudar con eso",
        "sentAt": "2023-12-24T00:00:00.000Z",
        "role": "agent"
      }
    ],
    "debts": [
      {
        "amount": 1000000,
        "institution": "Banco Estado",
        "dueDate": "2023-12-24T00:00:00.000Z"
      }
    ]
  }
```

### Mensajes y Chatbot
- `GET /clients/:id/generateMessage` — Genera y guarda una respuesta automática del agente para el cliente usando IA. Solo responde si el último mensaje fue del cliente.
- `POST /clients/:id/message` — Permite registrar un mensaje enviado por el cliente. Por ejemplo:
```json
{
    "text": "Excelente, que otros modelos tienen disponibles?"
}
```

## Funcionamiento del chatbot

El chatbot utiliza la API de OpenAI para simular a "Santiago", un asesor profesional de ventas de autos de lujo en Chile. Santiago es tu asistente ideal de autos de lujo, que profesionalmente te asesorará en tomar la mejor decisión de nuestros modelos. Para que Santiago funcione, se le dió el contexto de que se encuentra en Chile asesorando autos de lujo nuevos con sucursales en Vitacura y Lo Barnechea. Además, se le dió las instrucciones de guiar al cliente en su búsqueda de forma profesional, se le entregó la base de datos de autos en stock y guarda la historia de conversación para hacerla lo más fluida posible.

El flujo es:
1. El cliente envía mensajes (registrados vía `POST /clients/:id/message`).
Por ejemplo se hace `POST` a https://accurate-education-production.up.railway.app/clients/1/message con el siguiente body:
```json
{
    "text": "Me gustan los autos rojos"
}
```

2. Una vez que el cliente haya escrito, se puede solicitar una respuesta automática del agente usando `GET /clients/:id/generateMessage`.

El sistema solo responde si el último mensaje fue del cliente, evitando respuestas duplicadas. La base de datos de autos es dummy por temas prácticos y de tiempo y se puede encontrar en `src/utils/carsInStock.ts`.

## Estructura del proyecto
- `src/models/` — Entidades de base de datos: Cliente, Mensaje, Deuda.
- `src/routes/` — Rutas de la API (clientes, mensajes, endpoints generales).
- `src/services/aiResponder.ts` — Lógica de integración con OpenAI y generación de respuestas.
- `src/utils/` — Utilidades, tipos y lista de autos en stock.
- `src/db/` — Configuración de la base de datos.
