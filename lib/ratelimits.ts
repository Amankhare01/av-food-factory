import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const DATA_DIR = path.join(process.cwd(), '.data');
const FILE = path.join(DATA_DIR, 'ratelimit.json');

const MEMORY_KEY = '__av_food_factory__ratelimit__';

type Bucket = { [ip: string]: number[] };

type GlobalBuckets = typeof globalThis & { [MEMORY_KEY]?: Bucket };

const globalBuckets = globalThis as GlobalBuckets;

let useMemory =
  process.env.RATE_LIMIT_STORAGE === 'memory' ||
  process.env.VERCEL === '1' ||
  process.env.NEXT_RUNTIME === 'edge';

const ensureFsReady = async () => {
  if (useMemory) return;
  try {
    if (!existsSync(DATA_DIR)) await mkdir(DATA_DIR, { recursive: true });
  } catch {
    useMemory = true;
  }
};

const getMemoryBuckets = () => {
  if (!globalBuckets[MEMORY_KEY]) {
    globalBuckets[MEMORY_KEY] = {};
  }
  return globalBuckets[MEMORY_KEY]!;
};

const readBuckets = async (): Promise<Bucket> => {
  if (useMemory) return getMemoryBuckets();
  try {
    if (!existsSync(FILE)) return {};
    const data = JSON.parse(await readFile(FILE, 'utf-8')) as Bucket;
    globalBuckets[MEMORY_KEY] = data;
    return data;
  } catch {
    useMemory = true;
    return getMemoryBuckets();
  }
};

const persistBuckets = async (buckets: Bucket) => {
  if (useMemory) {
    globalBuckets[MEMORY_KEY] = buckets;
    return;
  }
  try {
    await writeFile(FILE, JSON.stringify(buckets, null, 2), 'utf-8');
    globalBuckets[MEMORY_KEY] = buckets;
  } catch {
    useMemory = true;
    globalBuckets[MEMORY_KEY] = buckets;
  }
};

export async function allow(ip: string, maxPerHour = 5) {
  await ensureFsReady();
  const buckets = await readBuckets();
  const now = Date.now();
  const hourAgo = now - 60 * 60 * 1000;
  const arr = (buckets[ip] || []).filter((ts) => ts > hourAgo);
  if (!Number.isFinite(maxPerHour)) {
    arr.push(now);
    buckets[ip] = arr;
    await persistBuckets(buckets);
    return { ok: true, remaining: Infinity };
  }
  if (arr.length >= maxPerHour) return { ok: false, remaining: 0 };
  arr.push(now);
  buckets[ip] = arr;
  await persistBuckets(buckets);
  return { ok: true, remaining: maxPerHour - arr.length };
}
