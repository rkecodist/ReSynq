// frontend/src/composables/useSession.ts

// This function is ported directly from the original project's vanilla JS code
// to ensure the generated IDs have the exact same format and randomness.
function generateSessionId(length = 16): string {
  return crypto
    .getRandomValues(new Uint8Array(length))
    .reduce(
      (t, e) =>
        (t +=
          (e &= 63) < 36
            ? e.toString(36)
            : e < 62
              ? (e - 26).toString(36).toUpperCase()
              : e < 63
                ? '_'
                : '-'),
      ''
    );
}

/**
 * A composable to manage the session ID, which is unique per browser tab.
 * It ensures the session ID persists for the lifetime of the tab via sessionStorage,
 * perfectly replicating the original application's behavior.
 */
export function useSession() {
  /**
   * Retrieves the session ID from sessionStorage. If it doesn't exist,
   * a new one is created and stored for the current tab.
   * @returns {string} The session ID for the current browser tab.
   */
  const getSessionId = (): string => {
    const SESSION_KEY = 'synq_session_id';
    let sessionId = sessionStorage.getItem(SESSION_KEY);

    // If no session ID exists for this tab, create one and store it.
    if (!sessionId) {
      sessionId = generateSessionId();
      sessionStorage.setItem(SESSION_KEY, sessionId);
    }

    return sessionId;
  };

  // Expose the function for use in other components.
  return {
    getSessionId,
  };
}