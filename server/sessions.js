/**
 * Session Manager
 * Handles user logins (no-password/creditless) and table codes.
 */

export default class SessionManager {
  constructor() {
    this.sessions = new Map(); // sessionId -> { name, role, tableCode }
    this.tableCodes = new Map(); // tableNumber -> 4-digit code
  }

  createSession(name, role, tableNumber) {
    const sessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    let tableCode = null;
    if (tableNumber) {
      tableCode = this.getOrCreateTableCode(tableNumber);
    }

    const session = { sessionId, name, role, tableCode, tableNumber };
    this.sessions.set(sessionId, session);
    return session;
  }

  getOrCreateTableCode(tableNumber) {
    if (this.tableCodes.has(tableNumber)) {
      return this.tableCodes.get(tableNumber);
    }
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    this.tableCodes.set(tableNumber, code);
    return code;
  }

  getSession(sessionId) {
    return this.sessions.get(sessionId);
  }

  deleteSession(sessionId) {
    this.sessions.delete(sessionId);
  }
}
