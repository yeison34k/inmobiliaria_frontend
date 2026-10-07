/** Error normalizado de la API: mismo contrato que devuelve el backend. */
export class ApiError extends Error {
  constructor({ status, code, message, details }) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details ?? null;
  }

  get isValidation() { return this.status === 422 || this.code === 'VALIDATION_ERROR'; }
  get isUnauthorized() { return this.status === 401; }
  get isConflict() { return this.status === 409; }

  /** Mensaje listo para mostrar, incluyendo detalles de validacion. */
  get displayMessage() {
    if (Array.isArray(this.details) && this.details.length) {
      return `${this.message}: ${this.details.map((d) => `${d.field} ${d.message}`).join(', ')}`;
    }
    return this.message;
  }
}
