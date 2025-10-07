# Component Library Demo

Aplicación React + Vite que demuestra la librería de componentes y la integración con el backend de analíticas. Incluye tracking automático, panel en tiempo real, autenticación con JWT (contra el backend) y exportación de interacciones.

## Requisitos

- Node.js 18+
- npm 9+
- Backend de analíticas en ejecución (ver `../backend/README.md`).

## Configuración

1. Instala dependencias:

   ```bash
   npm install
   ```

2. Copia el archivo de ejemplo de variables y define la URL del backend si es distinta al valor por defecto:

   ```bash
   cp .env.example .env
   ```

   ```env
   VITE_ANALYTICS_API_URL=http://localhost:4000
   ```

## Scripts disponibles

| Comando         | Descripción                                                   |
| --------------- | ------------------------------------------------------------- |
| `npm run dev`   | Arranca el servidor de desarrollo de Vite (puerto 5173 por defecto). |
| `npm run build` | Genera la build de producción.                                |
| `npm run preview` | Sirve la build generada para validación rápida.            |
| `npm test`      | Ejecuta la suite de pruebas con Jest + Testing Library.       |

## Uso

1. Inicia el backend (`npm run dev` dentro de `../backend`).
2. Arranca el frontend con `npm run dev` y abre `http://localhost:5173`.
3. Interactúa con los componentes; las métricas se muestran en el panel "Estadísticas en Tiempo Real".
4. Regístrate o inicia sesión para habilitar los botones de exportación (CSV/JSON).

## Estructura destacada

- `src/context/TrackingContext.tsx`: proveedor global que gestiona autenticación, llamadas al backend y sincronización de estadísticas.
- `src/services/trackingApi.ts`: cliente HTTP con helpers para trackeo, stats y exportaciones.
- `src/components/*`: componentes instrumentados con tracking automático (Button, Input, Modal, Card).
- `src/App.tsx`: página demo que combina los componentes, muestra el dashboard y controla autenticación/exportación.

## Pruebas

Las pruebas unitarias de los componentes se ejecutan con:

```bash
npm test -- --runInBand
```

Las funciones de tracking se mockean durante las pruebas para mantenerlas deterministas.

## Notas

- Si el backend se ejecuta en otra URL, ajusta `VITE_ANALYTICS_API_URL` en el `.env`.
- Las descargas de exportación se disparan desde el navegador utilizando blobs temporales.
- El contador de interacciones se actualiza de forma optimista además de las consultas periódicas (cada 5 segundos) al endpoint `/api/components/stats`.
