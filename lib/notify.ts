import { asWhatsApp, toE164 } from '@/app/utils/phone';
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
  const sid   = process.env.TWILIO_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  let from    = process.env.TWILIO_WHATSAPP_FROM;     // e.g. "+14155238886" or "whatsapp:+14155238886"
  let to      = process.env.NOTIFY_WHATSAPP_TO;       // your own number for notifications

  if (!sid || !token || !from || !to) return { ok: false, skipped: true };

  // Normalize numbers
  const client = twilio(sid, token);
  from = asWhatsApp(toE164(from)!);
  to   = asWhatsApp(toE164(to)!);

  const body =
    `New Lead • ${lead.name}\n` +
    `Phone: ${lead.phone}\n` +
    `Guests: ${lead.guests || '-'}\n` +
    `Source: ${lead.source || '-'}\n` +
    `When: ${new Date(lead.createdAt).toLocaleString()}`;

  try {
    await client.messages.create({ from, to, body });
    return { ok: true };
  } catch (e:any) {
    console.error('notifyWhatsApp failed:', e?.code, e?.message, e?.moreInfo);
    return { ok: false, error: e?.message };
  }
}


export async function autoReplyLead(lead: Lead) {
  const sid   = process.env.TWILIO_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (!sid || !token) return { ok: false, skipped: true };

  const client = twilio(sid, token);

  const phoneE164 = toE164(lead.phone, '91');
  if (!phoneE164) return { ok: false, error: 'Invalid phone' };

  const message =
    `Hi ${lead.name}, thanks for contacting AV Food Factory!` +
    `${lead.guests ? ` We received your request for ~${lead.guests} guests.` : ''}` +
    ` Our team will reach out shortly. — AV Food Factory`;

  // Prefer WhatsApp if configured
  const waFrom = process.env.TWILIO_WHATSAPP_FROM;
  if (waFrom) {
    try {
      await client.messages.create({
        from: asWhatsApp(toE164(waFrom)!),
        to: asWhatsApp(phoneE164),
        body: message, // NOTE: Requires session (user wrote first) OR a pre-approved template
      });
      return { ok: true, via: 'whatsapp' };
    } catch (e:any) {
      console.error('autoReplyLead (WA) failed:', e?.code, e?.message, e?.moreInfo);
    }
  }

  // Fallback to SMS if configured
  const smsFrom = process.env.TWILIO_SMS_FROM; // must be a Twilio SMS-capable number
  if (smsFrom) {
    try {
      await client.messages.create({ from: toE164(smsFrom)!, to: phoneE164, body: message });
      return { ok: true, via: 'sms' };
    } catch (e:any) {
      console.error('autoReplyLead (SMS) failed:', e?.code, e?.message, e?.moreInfo);
    }
  }
  return { ok: false, skipped: true };
}
