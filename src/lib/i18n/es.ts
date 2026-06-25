export const es = {
  'home.title': 'DraftLab',
  'home.create': 'Crear sala',
  'home.or': 'o',
  'home.codePlaceholder': 'Código de sala',
  'home.join': 'Unirse',

  'top.room': 'Sala:',
  'top.you': 'Eres:',
  'top.copy': 'Copiar sala',
  'top.newRoom': 'Nueva sala',
  'top.turnBlue': 'Turno lado azul',
  'top.turnRed': 'Turno lado rojo',
  'top.waiting': 'Esperando al rival…',
  'top.complete': '¡Draft completo!',
  'top.reorderCaptain': 'Arrastra para acomodar tus lanes',
  'top.reorderSpectator': 'Acomodando lanes…',

  'phase.ban': 'Baneos {n}',
  'phase.pick': 'Selección {n}',
  'phase.reorder': 'Asignar posiciones',

  'ban.skip': 'No banear',

  'search.placeholder': 'Buscar campeón…',

  'ready.button': 'Estoy listo',
  'ready.waiting': 'Esperando…',
  'ready.ready': 'Listo',

  'turn.of': 'Turno de {name}',

  'role.blue': 'AZUL',
  'role.red': 'ROJO',
  'role.spectator': 'ESPECTADOR',

  'pick.n': 'Selección {n}',

  'lane.top': 'Top',
  'lane.jungle': 'Jungla',
  'lane.mid': 'Mid',
  'lane.bot': 'Bot',
  'lane.support': 'Support',

  'setup.title': 'Configurar partida',
  'setup.desc': 'Define los nombres de los equipos antes de empezar el draft.',
  'setup.blue': 'Equipo azul',
  'setup.red': 'Equipo rojo',
  'setup.password': 'Contraseña (opcional)',
  'setup.passwordPlaceholder': 'Sin contraseña',
  'setup.side': 'Tu lado',
  'setup.sideBlue': 'Lado azul',
  'setup.sideRed': 'Lado rojo',
  'setup.start': 'Empezar draft',

  'auth.title': 'Sala protegida',
  'auth.desc': 'Ingresa la contraseña para entrar como capitán.',
  'auth.password': 'Contraseña',
  'auth.error': 'Contraseña incorrecta.',
  'auth.spectator': 'Ver como espectador',
  'auth.enter': 'Entrar',

  'champions.loading': 'Cargando campeones…',
  'champions.error': 'Error: {message}',
} as const;

export type TranslationKey = keyof typeof es;
