export interface ContactMessage {
  name: string;
  email: string;
  message: string;
  /** reCAPTCHA token for bot prevention */
  token?: string;
  /** honeypot field must remain empty */
  botField?: string;
}
