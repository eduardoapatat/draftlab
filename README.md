# DraftLab

Un simulador de **pick & ban** en tiempo real para League of Legends, pensado
para escalar a otros juegos como Valorant. Dos equipos entran a una sala,
banean y eligen campeones por turnos —tal cual el draft del cliente oficial— y
al final ordenan sus picks por línea.

Nació como un proyecto para aprender React a fondo, en especial cómo manejar
**estado compartido en tiempo real** entre varios jugadores.

## ✨ Características

- 🔴🔵 **Multijugador en vivo** — lo que un jugador hace se refleja al instante
  en la pantalla del otro.
- 🔗 **Salas por enlace** — cada partida vive en su propia URL; la compartes y
  listo.
- ⏱️ **Reglas del LCS** — secuencia de bans y picks por turnos, con cronómetro
  y auto-selección si se acaba el tiempo.
- 🚫 **Opción de no banear**, como en el competitivo.
- 🎯 **Reordenar por línea** al final, arrastrando y soltando (Top, Jungla,
  Mid, Bot, Support).
- 🔒 **Contraseña opcional** y elección de lado al crear la sala.
- ✅ **Botón de "Listo"** — el draft no empieza hasta que ambos confirman, y se
  pausa si alguien se desconecta.
- 🔎 **Buscador de campeones** y datos en vivo desde la API de Riot.

## 🛠️ Tecnologías

- **React 19**, **TypeScript** y **Vite**
- **PartyKit** (WebSockets sobre Cloudflare) para el tiempo real
- **Tailwind CSS v4** + **shadcn/ui** para la interfaz
- **@dnd-kit** para el arrastrar y soltar
- **Data Dragon** de Riot Games como fuente de campeones

## 🧠 Cómo funciona

El servidor es la **única fuente de verdad**. Los clientes no deciden nada por
su cuenta: mandan intenciones ("quiero banear a X") y el servidor valida si es
válido, aplica el cambio y reparte el nuevo estado a todos. Así nadie puede
hacer trampa y todos ven exactamente lo mismo, incluso al recargar la página.

## 🚀 Correr en local

Necesitas Node y pnpm.

```bash
pnpm install
```

```bash
# terminal 1 — el servidor en tiempo real
pnpm party

# terminal 2 — la app
pnpm dev
```

Abre la URL que muestra Vite. Para probar el multijugador, abre la misma sala
en dos pestañas (una en incógnito sirve como segundo jugador).

## 📦 Despliegue

Los pasos para publicarlo están en [DEPLOY.md](./DEPLOY.md).

## 📌 Estado

En desarrollo. Funciona de extremo a extremo en local; el hosting está
pendiente. La base ya está lista para sumar más juegos además de LoL.
