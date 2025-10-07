# Analytics Backend

REST API para registrar y consultar interacciones de los componentes de la demo. Está construido con Express, TypeScript y MongoDB Atlas, e incluye autenticación JWT, validación con Zod, logging básico y exportación de datos.

## Requisitos

- Node.js 18+
- npm 9+

## Configuración

1. Instala dependencias:

   ```bash
   npm install
   ```

2. Copia el archivo de ejemplo de variables de entorno y ajústalo según sea necesario:

   ```bash
   cp .env.example .env
   ```

   Variables disponibles:

   | Variable        | Descripción                                       | Valor por defecto           |
   | --------------- | ------------------------------------------------- | --------------------------- |
   | `PORT`            | Puerto HTTP del servidor                          | `4000`                      |
   | `JWT_SECRET`      | Semilla utilizada para firmar los JWT             | `development-secret`        |
   | `JWT_EXPIRES_IN`  | Tiempo de expiración del token (formato JWT)      | `1h`                        |
   | `MONGODB_URI`     | Cadena de conexión a tu cluster de MongoDB Atlas | `mongodb://127.0.0.1:27017/analytics-demo` |
   | `MONGODB_DB_NAME` | Base de datos donde se guardarán los datos       | `analytics-demo`            |

3. Inicia el servidor en modo desarrollo con recarga automática:

   ```bash
   npm run dev
   ```

   O en modo producción:

   ```bash
   npm start
   ```

El servidor mostrará logs JSON en consola y mantendrá abierta la conexión a MongoDB Atlas.

## Endpoints

### Health Check

- **GET** `/api/health`
- **Descripción:** Verifica el estado del servicio.
- **Respuesta 200:**

  ```json
  {
    "status": "ok",
    "timestamp": "2025-01-01T12:00:00.000Z",
    "environment": "development",
    "uptime": 42.5
  }
  ```

### Autenticación

#### Registrar usuario

- **POST** `/api/auth/register`
- **Body:**

  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```

- **Respuesta 201:**

  ```json
  {
    "message": "User registered successfully",
    "user": {
      "id": "65f1c2a34f0c5e3d2b1a7c90",
      "email": "user@example.com",
      "createdAt": "2025-01-01T12:05:00.000Z"
    },
    "token": "<jwt>"
  }
  ```

- **Errores comunes:**
  - `409 Conflict` si el correo ya está registrado.
  - `400 Bad Request` si falla la validación.

#### Login

- **POST** `/api/auth/login`
- **Body:** igual a `register`.
- **Respuesta 200:**

  ```json
  {
    "message": "Login successful",
    "token": "<jwt>",
    "user": {
      "id": "65f1c2a34f0c5e3d2b1a7c90",
      "email": "user@example.com"
    }
  }
  ```

- **Errores comunes:**
  - `401 Unauthorized` si credenciales no válidas.

### Tracking de componentes

#### Registrar interacción

- **POST** `/api/components/track`
- **Body:**

  ```json
  {
    "componentName": "Button",
    "variant": "primary",
    "action": "click",
    "metadata": {
      "label": "Comprar",
      "hasIcon": true
    },
    "timestamp": "2025-01-01T12:10:00.000Z"
  }
  ```

- **Respuesta 201:** `{"message": "Event recorded"}`
- **Notas:**
  - `componentName` y `action` son obligatorios.
  - `timestamp` es opcional; si no se envía se usa el tiempo del servidor.
  - Se complementa automáticamente con `userAgent` e IP de la petición.

#### Obtener estadísticas

- **GET** `/api/components/stats`
- **Descripción:** Devuelve métricas agregadas y últimos eventos.
- **Respuesta 200 (resumen):**

  ```json
  {
    "totals": {
      "events": 42,
      "lastHour": 12,
      "components": { "Button": 20, "Modal": 6 },
      "actions": { "click": 30, "open": 6 },
      "variants": {
        "Button": { "primary": 12, "secondary": 8 }
      }
    },
    "recentEvents": [
      {
        "id": "65f1c2a34f0c5e3d2b1a7c90",
        "componentName": "Button",
        "variant": "primary",
        "action": "click",
        "metadata": { "label": "Comprar" },
        "createdAt": "2025-01-01 12:15:12"
      }
    ],
    "lastEvent": {
      "id": "65f1c2a34f0c5e3d2b1a7c90",
      "componentName": "Button",
      "variant": "primary",
      "action": "click",
      "metadata": { "label": "Comprar" },
      "createdAt": "2025-01-01 12:15:12"
    }
  }
  ```

#### Exportar datos

- **GET** `/api/components/export`
- **Query:** `format=csv` o `format=json` (opcional, por defecto JSON)
- **Headers:** `Authorization: Bearer <jwt>`
- **Descripción:** Genera un archivo descargable con todo el histórico.
- **Respuestas:**
  - `200 OK` con `Content-Type` `text/csv` o `application/json` y encabezado `Content-Disposition`.
  - `401 Unauthorized` si falta o es inválido el token.

## Manejo de errores

Todas las respuestas de error siguen el formato:

```json
{
  "error": {
    "message": "Descripción del error",
    "details": [
      {
        "path": "body.email",
        "message": "Email must be valid"
      }
    ]
  }
}
```

- `400` para errores de validación.
- `401` para autenticación fallida.
- `404` para rutas inexistentes.
- `409` para conflictos (por ejemplo, email duplicado).
- `500` para errores inesperados.

## Logging y base de datos

- Los logs se emiten en formato JSON y se gestionan con `morgan` + consola.
- Los datos se almacenan en MongoDB; ajusta `MONGODB_URI` y `MONGODB_DB_NAME` según tu entorno (Atlas o local).
- Para pruebas automatizadas puedes apuntar a una base separada cambiando `MONGODB_DB_NAME` o empleando un cluster específico para testing.

## Scripts disponibles

| Comando        | Descripción                          |
| -------------- | ------------------------------------ |
| `npm run dev`  | Ejecuta el servidor con `ts-node-dev` (recarga en caliente). |
| `npm run build`| Compila el proyecto TypeScript a JavaScript en `dist/`. |
| `npm start`    | Corre la versión compilada desde `dist`. |
| `npm run lint` | Placeholder (sin lint configurado).  |

## Estructura principal

```
backend/
├── src/
│   ├── app.ts                 # Configuración de middlewares y rutas
│   ├── index.ts               # Punto de entrada y conexión a MongoDB
│   ├── config/                # Configuración de env, logger y base de datos
│   ├── controllers/           # Lógica por endpoint
│   ├── middleware/            # Validación, auth, not found, errores
│   ├── routes/                # Definición de rutas Express
│   ├── services/              # Capa de acceso a datos y helpers
│   └── types/                 # Tipados compartidos y extensiones de Express
├── dist/                      # Salida compilada por TypeScript
├── .env.example
└── README.md
```

## Próximos pasos sugeridos

- Añadir pruebas automatizadas sobre los servicios y controladores.
- Implementar paginación/filtrado en `/api/components/stats` y `/api/components/export`.
- Exponer métricas con Prometheus/Grafana o similar para observabilidad.
