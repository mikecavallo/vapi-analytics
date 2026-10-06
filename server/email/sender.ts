/**
 * Pluggable outbound email. With RESEND_API_KEY set, mail is sent through Resend's
 * HTTP API (no SDK dependency). Otherwise messages are logged to the console, which is
 * what development and the demo use.
 */
export interface EmailMessage {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export interface EmailSender {
  readonly name: string;
  send(message: EmailMessage): Promise<void>;
}

export class ConsoleEmailSender implements EmailSender {
  readonly name = "console";
  async send(message: EmailMessage): Promise<void> {
    console.log(`[email:console] To: ${message.to}\nSubject: ${message.subject}\n\n${message.text}`);
  }
}

export class ResendEmailSender implements EmailSender {
  readonly name = "resend";
  constructor(
    private readonly apiKey: string,
    private readonly from: string,
    private readonly fetchImpl: typeof fetch = fetch,
  ) {}

  async send(message: EmailMessage): Promise<void> {
    const response = await this.fetchImpl("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: this.from,
        to: [message.to],
        subject: message.subject,
        text: message.text,
        ...(message.html ? { html: message.html } : {}),
      }),
    });
    if (!response.ok) {
      const body = (await response.text()).slice(0, 500);
      throw new Error(`Resend API error ${response.status}: ${body}`);
    }
  }
}

export function createEmailSender(env: NodeJS.ProcessEnv = process.env): EmailSender {
  if (env.RESEND_API_KEY) {
    return new ResendEmailSender(env.RESEND_API_KEY, env.EMAIL_FROM || "Invoxa <onboarding@resend.dev>");
  }
  return new ConsoleEmailSender();
}

let defaultSender: EmailSender | undefined;
export function getEmailSender(): EmailSender {
  defaultSender ??= createEmailSender();
  return defaultSender;
}

export function buildVerificationEmail(to: string, token: string, appUrl: string): EmailMessage {
  const link = `${appUrl.replace(/\/$/, "")}/verify-email?token=${encodeURIComponent(token)}`;
  return {
    to,
    subject: "Verify your Invoxa email address",
    text: `Confirm your email address to finish creating your Invoxa account:\n\n${link}\n\nOr paste this token on the verification page: ${token}\n\nIf you did not sign up, you can ignore this message.`,
    html: `<p>Confirm your email address to finish creating your Invoxa account:</p><p><a href="${link}">Verify email</a></p><p>Or paste this token on the verification page: <code>${token}</code></p><p>If you did not sign up, you can ignore this message.</p>`,
  };
}
