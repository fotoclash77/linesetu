let _handler: (() => void) | null = null;

export function registerSettingsResetHandler(fn: () => void): () => void {
  _handler = fn;
  return () => { _handler = null; };
}

export function fireSettingsReset() {
  _handler?.();
}
