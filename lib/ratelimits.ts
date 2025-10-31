import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const DATA_DIR = path.join(process.cwd(), '.data');
const FILE = path.join(DATA_DIR, 'ratelimit.json');

type Bucket = { [ip: string]: number[] };

export async function allow(ip: string, maxPerHour = 5) {
  if (!existsSync(DATA_DIR)) await mkdir(DATA_DIR, { recursive: true });
  let buckets: Bucket = {};
  if (existsSync(FILE)) {
    try { buckets = JSON.parse(await readFile(FILE, 'utf-8')); } catch {}
  }
  const now = Date.now();
  const hourAgo = now - 60*60*1000;
  const arr = (buckets[ip] || []).filter(ts => ts > hourAgo);
  if (arr.length >= maxPerHour) return { ok: false, remaining: 0 };
  arr.push(now);
  buckets[ip] = arr;
  await writeFile(FILE, JSON.stringify(buckets, null, 2), 'utf-8');
  return { ok: true, remaining: maxPerHour - arr.length };
}
