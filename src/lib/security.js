export const isProduction = import.meta.env.PROD;

export function debugLog(...args) {
  if (!isProduction) {
    console.debug("[VANISH]", ...args);
  }
}

export function debugError(...args) {
  if (!isProduction) {
    console.error("[VANISH]", ...args);
  }
}

export function validateMessageId(id) {
  if (!id || typeof id !== "string") {
    return false;
  }

  // UUID validation.
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    id
  );
}

export function clearSensitiveText(element) {
  if (!element) {
    return;
  }

  try {
    element.value = "";
    element.textContent = "";
  } catch {
    // Intentionally ignored.
  }
}

export function preventSensitiveClipboard() {
  return {
    onCopy: (event) => {
      event.preventDefault();
    },

    onCut: (event) => {
      event.preventDefault();
    }
  };
}

export function secureNavigate(path) {
  window.location.replace(path);
}