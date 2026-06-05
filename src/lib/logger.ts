type LogArgs = unknown[];

const isDev = process.env.NODE_ENV !== "production";

export const logger = {
  error: (tag: string, ...args: LogArgs) => { if (isDev) console.error(`[${tag}]`, ...args); },
  warn:  (tag: string, ...args: LogArgs) => { if (isDev) console.warn(`[${tag}]`, ...args); },
};
