# DraftLab

Simulador de pick & ban en tiempo real para League of Legends, creado pensando
en replicar el draft del competitivo con el diseño antiguo, el que se usaba
aproximadamente entre la season 6 y la season 10.

La idea es jugar el draft como en un partido de equipo: un lado azul contra un
lado rojo, con un capitán por lado que banea y elige los campeones por su
equipo.

## Caracteristicas

- Modo en equipo, lado azul contra lado rojo.
- Un capitan por lado: cada capitan banea y pickea por su equipo.
- Creacion de drafts por salas: cada partida vive en su propia URL y se comparte
  como un enlace.
- Usa las reglas del draft competitivo (secuencia de bans y picks por turnos,
  con cronometro por turno).
- Opcion de no banear, como en el competitivo.
- Reordenamiento de lineas en la fase final: como hay un capitan por lado, al
  terminar el draft el capitan acomoda sus picks en cada linea (top, jungla,
  mid, bot, support) arrastrando y soltando.
- Contraseña opcional y eleccion de lado al crear la sala.
- Boton de "Listo": el draft no empieza hasta que ambos capitanes confirman, y
  se pausa si un capitan se desconecta.
- Buscador de campeones, con los datos en vivo desde la API de Riot.

## Tecnologias

- React 19, TypeScript y Vite
- PartyKit (WebSockets sobre Cloudflare) para el tiempo real
- Tailwind CSS v4 y shadcn/ui para la interfaz
- @dnd-kit para el arrastrar y soltar
- Data Dragon de Riot Games como fuente de campeones

## Como funciona

El servidor es la unica fuente de verdad. Los clientes no deciden nada por su
cuenta: mandan intenciones ("quiero banear a X") y el servidor valida si es
valido, aplica el cambio y reparte el nuevo estado a todos. Asi nadie puede
hacer trampa y todos ven lo mismo, incluso al recargar la pagina.

## Correr en local

Necesitas Node y pnpm.

```bash
pnpm install
```

```bash
# terminal 1 - el servidor en tiempo real
pnpm party

# terminal 2 - la app
pnpm dev
```

Abre la URL que muestra Vite. Para probar el multijugador, abre la misma sala
en dos pestañas (una en incognito sirve como segundo jugador).

## Despliegue

Los pasos para publicarlo estan en [DEPLOY.md](./DEPLOY.md).

## Estado

En desarrollo. Funciona de extremo a extremo en local; el hosting esta
pendiente. La base ya esta lista para sumar mas juegos ademas de LoL.
