import { logger as defaultLogger, type Logger } from '@/lib/logger';

/** Reports uncaught errors and flushes queued logs when the page is hidden. Returns a cleanup. */
export function installErrorReporting(logger: Logger = defaultLogger): () => void {
  const onError = (event: ErrorEvent) =>
    logger.error('Uncaught error', { error: event.error ?? event.message });
  const onRejection = (event: PromiseRejectionEvent) =>
    logger.error('Unhandled promise rejection', { error: event.reason });
  const onHidden = () => {
    if (document.visibilityState === 'hidden') logger.flush();
  };

  window.addEventListener('error', onError);
  window.addEventListener('unhandledrejection', onRejection);
  document.addEventListener('visibilitychange', onHidden);
  return () => {
    window.removeEventListener('error', onError);
    window.removeEventListener('unhandledrejection', onRejection);
    document.removeEventListener('visibilitychange', onHidden);
  };
}
