import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

export type Lead = {
  id: string;
  name: string;
  phone: string;
  guests?: string;
  source?: string;
  createdAt: string;
  ip?: string | null;
  ua?: string | null;
  status?: 'new' | 'contacted' | 'closed';
  notes?: string;
};

const DATA_DIR = path.join(process.cwd(), '.data');
const FILE = path.join(DATA_DIR, 'leads.json');

export async function ensureStore() {
  if (!existsSync(DATA_DIR)) await mkdir(DATA_DIR, { recursive: true });
  if (!existsSync(FILE)) await writeFile(FILE, '[]', 'utf-8');
}

export async function readLeads(): Promise<Lead[]> {
  await ensureStore();
  const raw = await readFile(FILE, 'utf-8');
  try { return JSON.parse(raw) as Lead[] } catch { return []; }
}

export async function writeLeads(list: Lead[]) {
  await ensureStore();
  await writeFile(FILE, JSON.stringify(list, null, 2), 'utf-8');
}
