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
const MEMORY_KEY = '__av_food_factory__leads__';

type GlobalLeads = typeof globalThis & { [MEMORY_KEY]?: Lead[] };

const globalLeads = globalThis as GlobalLeads;

let useMemory =
  process.env.LEADS_STORAGE === 'memory' ||
  process.env.VERCEL === '1' ||
  process.env.NEXT_RUNTIME === 'edge';

const ensureFsReady = async () => {
  if (useMemory) return;
  try {
    if (!existsSync(DATA_DIR)) await mkdir(DATA_DIR, { recursive: true });
    if (!existsSync(FILE)) await writeFile(FILE, '[]', 'utf-8');
  } catch {
    useMemory = true;
  }
};

const getMemoryStore = () => {
  if (!globalLeads[MEMORY_KEY]) {
    globalLeads[MEMORY_KEY] = [];
  }
  return globalLeads[MEMORY_KEY]!;
};

const readStore = async (): Promise<Lead[]> => {
  if (useMemory) return [...getMemoryStore()];
  try {
    const raw = await readFile(FILE, 'utf-8');
    const parsed = JSON.parse(raw) as Lead[];
    globalLeads[MEMORY_KEY] = parsed;
    return parsed;
  } catch {
    useMemory = true;
    return [...getMemoryStore()];
  }
};

const persistStore = async (list: Lead[]) => {
  if (useMemory) {
    globalLeads[MEMORY_KEY] = [...list];
    return;
  }
  try {
    await writeFile(FILE, JSON.stringify(list, null, 2), 'utf-8');
    globalLeads[MEMORY_KEY] = [...list];
  } catch {
    useMemory = true;
    globalLeads[MEMORY_KEY] = [...list];
  }
};

export async function ensureStore() {
  await ensureFsReady();
  if (useMemory) return;
}

export async function readLeads(): Promise<Lead[]> {
  await ensureStore();
  return readStore();
}

export async function writeLeads(list: Lead[]) {
  await ensureStore();
  await persistStore(list);
}
