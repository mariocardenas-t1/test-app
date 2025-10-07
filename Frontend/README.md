# Frontend (Next.js)

Dashboard construido con Next.js 15 y TypeScript que consume la API del backend para visualizar analíticas en tiempo real. Reutiliza la biblioteca de componentes existente mediante alias locales y habilita autenticación + exportaciones.

## Requisitos

- Node.js 18+
- Backend en ejecución (ver `../backend`)

## Configuración

1. Instala dependencias:
   ```bash
   npm install
   ```
2. Copia el archivo de ejemplo y ajusta la URL del backend si es necesario:
   ```bash
   cp .env.example .env
   ```

## Scripts disponibles

| Comando      | Descripción                         |
| ------------ | ----------------------------------- |
| `npm run dev`   | Ejecuta Next.js en modo desarrollo (puerto 3000). |
| `npm run build` | Genera la build de producción.   |
| `npm run start` | Sirve la build generada.         |
| `npm run lint`  | Ejecuta las reglas de linting por defecto. |

## Notas

- El proveedor de tracking reutiliza el contexto de la biblioteca existente, por lo que las interacciones de los componentes (`Button`, `Input`, `Card`, `Modal`) se registran automáticamente en el backend.
- Ajusta `NEXT_PUBLIC_ANALYTICS_API_URL` para apuntar al host donde esté desplegado el backend.
- El proyecto permite importar archivos fuera del directorio de la app (`externalDir`) para compartir código con la biblioteca actual.
