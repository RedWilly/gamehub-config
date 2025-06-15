/**
 * @fileoverview Email utility using Resend for transactional emails.
 * @module lib/email
 */
import { Resend } from 'resend';

/**
 * Sends an email using Resend API.
 * @param to - Recipient email address.
 * @param subject - Email subject.
 * @param text - Plain text content.
 * @returns Promise resolving when the email is sent.
 */
export async function sendEmail({ to, subject, text }: { to: string; subject: string; text: string }): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error('Missing RESEND_API_KEY in environment.');
  const resend = new Resend(apiKey);
  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || 'noreply@example.com',
    to,
    subject,
    text,
  });
}
