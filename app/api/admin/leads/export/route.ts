import { readLeads } from "@/lib/leads";

//get
export async function GET() {
  const list = await readLeads();

  const cols = ['_id','name','phone','guests','status','source','createdAt','ip','ua','notes'];
  const header = cols.join(',') + '\n';
  const rows = list.map(l => cols.map(c => JSON.stringify((l as any)[c] ?? '')).join(',')).join('\n');
  const csv = header + rows + '\n';

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="leads-${Date.now()}.csv"`
    }
  });
}

