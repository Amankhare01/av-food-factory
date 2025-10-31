import nodemailer from 'nodemailer';
import twilio from 'twilio';

type Lead = {
  id: string;
  name: string;
  phone: string;
  guests?: string;
  source?: string;
  createdAt: string;
  status?: string;
};

export async function notifyEmail(lead: Lead) {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const to = process.env.NOTIFY_EMAIL_TO;
  const from = process.env.NOTIFY_EMAIL_FROM || user;
  if (!host || !port || !user || !pass || !to || !from) return { ok: false, skipped: true };
  const transport = nodemailer.createTransport({ host, port, secure: port === 465, auth: { user, pass } });
  const subject = `New Lead • ${lead.name} (${lead.phone})`;
  const html = `
    <h2>New Lead</h2>
    <ul>
      <li><b>ID:</b> ${lead.id}</li>
      <li><b>Name:</b> ${lead.name}</li>
      <li><b>Phone:</b> ${lead.phone}</li>
      <li><b>Guests:</b> ${lead.guests || '-'}</li>
      <li><b>Source:</b> ${lead.source || '-'}</li>
      <li><b>When:</b> ${new Date(lead.createdAt).toLocaleString()}</li>
    </ul>
  `;
  await transport.sendMail({ from, to, subject, html });
  return { ok: true };
}

export async function notifyWhatsApp(lead: Lead) {
  const sid = process.env.TWILIO_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_WHATSAPP_FROM;
  const to = process.env.NOTIFY_WHATSAPP_TO;
  if (!sid || !token || !from || !to) return { ok: false, skipped: true };
  const client = twilio(sid, token);
  const body = `New Lead • ${lead.name}\nPhone: ${lead.phone}\nGuests: ${lead.guests||'-'}\nSource: ${lead.source||'-'}\nWhen: ${new Date(lead.createdAt).toLocaleString()}`;
  await client.messages.create({ from, to, body });
  return { ok: true };
}

export async function autoReplyLead(lead: Lead) {
  const sid = process.env.TWILIO_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (!sid || !token) return { ok: false, skipped: true };
  const client = twilio(sid, token);
  const rawPhone = lead.phone.trim();
  const digits = rawPhone.replace(/\D/g, '');
  const phoneE164 = rawPhone.startsWith('+') ? '+' + digits : (digits.startsWith('91') ? '+' + digits : '+91' + digits);
  const message = `Hi ${lead.name}, thanks for contacting AV Food Factory! We received your request` +
    `${lead.guests ? ` for ~${lead.guests} guests` : ''}. Our team will reach out shortly. — AV Food Factory`;

  const waFrom = process.env.TWILIO_WHATSAPP_FROM;
  if (waFrom) {
    try {
      await client.messages.create({ from: waFrom, to: 'whatsapp:' + phoneE164.replace(/^\+/, '+'), body: message });
      return { ok: true };
    } catch {}
  }
  const smsFrom = process.env.TWILIO_SMS_FROM;
  if (smsFrom) {
    try {
      await client.messages.create({ from: smsFrom, to: phoneE164, body: message });
      return { ok: true };
    } catch {}
  }
  return { ok: false, skipped: true };
}
