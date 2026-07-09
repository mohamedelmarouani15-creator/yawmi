type LogArgs = unknown[];

// error/warn restent actifs en production : next.config.ts (compiler.removeConsole)
// exclut déjà error/warn du strip de console.* en prod — c'est la seule
// observabilité serveur disponible (pas de service de logs externe).
export const logger = {
  error: (tag: string, ...args: LogArgs) => { console.error(`[${tag}]`, ...args); },
  warn:  (tag: string, ...args: LogArgs) => { console.warn(`[${tag}]`, ...args); },
};
