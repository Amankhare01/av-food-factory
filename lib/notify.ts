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
 <div style="font-family:Inter,Arial,sans-serif;background:#f0fdfa;padding:32px;">
   <div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:14px;border:1px solid #e5e7eb;overflow:hidden;">

     <div style="background:#0f766e;padding:22px 32px;">
       <h2 style="margin:0;font-size:22px;font-weight:700;color:#ffffff;">New Lead Received</h2>
     </div>

     <!-- THIS padding fixes spacing issue -->
     <div style="padding:24px 32px 32px;">
        <div style="display:flex;gap:6px;margin-bottom:12px;">
          <span style="color:#6b7280;">ID:</span>
          <span style="font-weight:600;color:#0f766e;">${lead.id}</span>
        </div>

        <div style="display:flex;gap:6px;margin-bottom:12px;">
          <span style="color:#6b7280;">Name:</span>
          <span style="font-weight:600;color:#111827;">${lead.name}</span>
        </div>

        <div style="display:flex;gap:6px;margin-bottom:12px;">
          <span style="color:#6b7280;">Phone:</span>
          <span style="font-weight:600;color:#111827;">${lead.phone}</span>
        </div>

        <div style="display:flex;gap:6px;margin-bottom:12px;">
          <span style="color:#6b7280;">Guests:</span>
          <span style="font-weight:600;color:#111827;">${lead.guests || '-'}</span>
        </div>

        <div style="display:flex;gap:6px;margin-bottom:12px;">
          <span style="color:#6b7280;">Source:</span>
          <span style="font-weight:600;color:#111827;">${lead.source || '-'}</span>
        </div>

        <div style="display:flex;gap:6px;margin-bottom:12px;">
          <span style="color:#6b7280;">Created:</span>
          <span style="font-weight:600;color:#111827;">${new Date(lead.createdAt).toLocaleString()}</span>
        </div>
     </div>

   </div>
 </div>
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
const body = `✨ *New Lead Received* ✨

*Name:* ${lead.name}
*Phone:* ${lead.phone}
*Guests:* ${lead.guests || '-'}
*Source:* ${lead.source || '-'}
*Time:* ${new Date(lead.createdAt).toLocaleString()}

🧩 Please take action now.`;
  await client.messages.create({ from, to, body });
  return { ok: true };
}

export async function autoReplyLead(lead: Lead) {
  const sid = process.env.TWILIO_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (!sid || !token) return { ok: false, skipped: true };
  const client = twilio(sid, token);
  const digits = lead.phone.replace(/\D/g, '');
  const phoneE164 = toE164(lead.phone, '91') || (digits ? `+91${digits}` : '');
  if (!phoneE164) return { ok: false, skipped: true };
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
