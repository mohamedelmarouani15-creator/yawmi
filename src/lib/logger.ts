type LogArgs = unknown[];

// Centralized server-side logger — swap console.* for Sentry/Axiom here when ready
export const logger = {
  error: (tag: string, ...args: LogArgs) => console.error(`[${tag}]`, ...args),
  warn:  (tag: string, ...args: LogArgs) => console.warn(`[${tag}]`, ...args),
};
