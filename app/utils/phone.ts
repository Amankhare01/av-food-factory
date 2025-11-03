// utils/phone.ts
export function toE164(raw: string, defaultCountry = '91') {
  const digits = (raw || '').replace(/\D/g, '');
  if (!digits) return null;
  if (raw.trim().startsWith('+')) return `+${digits}`;
  if (digits.length >= 10 && digits.startsWith(defaultCountry)) return `+${digits}`;
  return `+${defaultCountry}${digits}`;
}

export function asWhatsApp(addr: string) {
  return addr?.startsWith('whatsapp:') ? addr : `whatsapp:${addr}`;
}
