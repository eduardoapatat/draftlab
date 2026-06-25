# Despliegue

La app tiene dos piezas que se despliegan **juntas en PartyKit**:

- **Frontend** (React + Vite) → archivos estáticos en `dist/`.
- **Servidor WebSocket** (`party/draft.ts`) → corre en Cloudflare vía PartyKit.

PartyKit sirve ambas en el mismo dominio, así que es un solo deploy, sin CORS ni
configuración extra de SPA.

## Requisitos previos

- Cuenta de PartyKit (login con GitHub, gratis).
- El plan gratuito de Cloudflare cubre el uso esperado. Si se supera la cuota,
  el servicio **deja de responder hasta el día siguiente**: no genera cargos
  automáticos.

## 1. Login (una sola vez)

```bash
npx partykit login
```

Abre el navegador para autorizar con GitHub.

## 2. Servir el frontend desde PartyKit

En `partykit.json`, añadir la clave `serve` apuntando al build de Vite:

```json
{
  "$schema": "https://www.partykit.io/schema.json",
  "name": "draftlab",
  "main": "party/draft.ts",
  "compatibilityDate": "2026-06-24",
  "serve": {
    "path": "dist",
    "singlePageApp": true
  }
}
```

`singlePageApp: true` hace que cualquier ruta (por ejemplo `/abc123`) sirva
`index.html`, necesario porque las salas viven en la URL.

## 3. Apuntar el cliente al host de producción

El cliente lee `VITE_PARTYKIT_HOST`. Crear `.env.production`:

```
VITE_PARTYKIT_HOST=draftlab.TU-USUARIO.partykit.dev
```

Sin `https://` ni barra final. PartyKit usa `wss://` automáticamente.

## 4. Restringir el origen (recomendado)

El servidor valida `ALLOWED_ORIGIN`. Si está vacío permite cualquier origen
(útil en desarrollo). En producción se fija al dominio:

```bash
npx partykit env add ALLOWED_ORIGIN
# valor: https://draftlab.TU-USUARIO.partykit.dev
```

## 5. Build y deploy

```bash
npm run build
npx partykit deploy
```

El dominio queda en `https://draftlab.TU-USUARIO.partykit.dev` (tarda hasta dos
minutos en provisionarse la primera vez).

## Logs en producción

Para ver tráfico y errores en vivo del servidor desplegado:

```bash
npx partykit tail
```

## Notas

- **Alertas de billing**: aunque el plan gratuito corta en vez de cobrar,
  conviene activar una alerta en el dashboard de Cloudflare.
- **CI/CD opcional**: PartyKit admite desplegar en cada push a `main` con
  GitHub Actions.
