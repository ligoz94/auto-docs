/**
 * Modulo di autenticazione utente
 * Gestisce login e autenticazione a due fattori (2FA)
 */

export interface LoginResult {
  status: 'success' | 'pending_2fa' | 'error';
  token: string | null;
  message?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
}

/**
 * Autentica un utente con email e password
 * Supporta autenticazione a due fattori opzionale
 *
 * @param email - Email dell'utente
 * @param password - Password dell'utente
 * @returns Risultato del login con token o richiesta 2FA
 *
 * @example
 * ```typescript
 * const result = await login('user@example.com', 'password123');
 * if (result.status === 'success') {
 *   console.log('Token:', result.token);
 * }
 * ```
 */
export async function login(email: string, password: string): Promise<LoginResult> {
  try {
    // Validazione input
    if (!email || !password) {
      return {
        status: 'error',
        token: null,
        message: 'Email e password sono obbligatori'
      };
    }

    // Simula chiamata API di autenticazione
    const { token, requires2FA } = await authenticate(email, password);

    // Se richiesto 2FA, ritorna stato pending
    if (requires2FA) {
      return {
        status: 'pending_2fa',
        token: null,
        message: 'Codice 2FA richiesto'
      };
    }

    // Login riuscito
    return {
      status: 'success',
      token,
      message: 'Login effettuato con successo'
    };
  } catch (error) {
    return {
      status: 'error',
      token: null,
      message: error instanceof Error ? error.message : 'Errore durante il login'
    };
  }
}

/**
 * Verifica il codice 2FA fornito dall'utente
 *
 * @param token - Token temporaneo ricevuto dopo login
 * @param code - Codice 2FA fornito dall'utente
 * @returns Token JWT finale se verifica riuscita
 */
export async function verify2FA(token: string, code: string): Promise<LoginResult> {
  try {
    if (!token || !code) {
      return {
        status: 'error',
        token: null,
        message: 'Token e codice 2FA sono obbligatori'
      };
    }

    // Simula verifica 2FA
    const isValid = await validate2FACode(token, code);

    if (!isValid) {
      return {
        status: 'error',
        token: null,
        message: 'Codice 2FA non valido'
      };
    }

    // Genera token finale
    const finalToken = await generateFinalToken(token);

    return {
      status: 'success',
      token: finalToken,
      message: 'Autenticazione completata'
    };
  } catch (error) {
    return {
      status: 'error',
      token: null,
      message: 'Errore durante la verifica 2FA'
    };
  }
}

// Funzioni helper simulate
async function authenticate(email: string, password: string) {
  // Simula chiamata API
  return {
    token: 'temp_' + Math.random().toString(36),
    requires2FA: Math.random() > 0.5
  };
}

async function validate2FACode(token: string, code: string): Promise<boolean> {
  // Simula validazione
  return code.length === 6;
}

async function generateFinalToken(tempToken: string): Promise<string> {
  // Simula generazione token finale
  return 'jwt_' + Math.random().toString(36);
}
