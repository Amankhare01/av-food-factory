import { Lead } from "@/models/Lead";
import connectDB from "@/lib/mongodb";

const COLUMNS = [
  "_id",
  "name",
  "phone",
  "guests",
  "status",
  "source",
  "createdAt",
  "notes",
] as const;

const CREATED_AT_FORMATTER = new Intl.DateTimeFormat("en-IN", {
  timeZone: "Asia/Kolkata",
  year: "numeric",
  month: "short",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: true,
});

export async function GET() {
  await connectDB();

  const leads = await Lead.find().sort({ createdAt: -1 }).lean();

  const header = COLUMNS.join(",") + "\n";
  const rows = leads
    .map((lead) =>
      COLUMNS.map((key) => JSON.stringify(formatCell(lead, key))).join(",")
    )
    .join("\n");
  const csv = header + rows + "\n";

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="leads-${Date.now()}.csv"`,
    },
  });
}

function formatCell(
  lead: Record<string, unknown>,
  key: (typeof COLUMNS)[number]
) {
  if (key === "_id") {
    return (
      (lead._id as { toString?: () => string } | undefined)?.toString?.() ?? ""
    );
  }

  if (key === "createdAt") {
    return formatCreatedAt((lead as { createdAt?: unknown }).createdAt);
  }

  const value = lead[key];

  if (value instanceof Date) return value.toISOString();
  if (value === null || value === undefined) return "";

  if (
    typeof value === "object" &&
    "toISOString" in (value as Record<string, unknown>)
  ) {
    try {
      return (value as { toISOString: () => string }).toISOString();
    } catch {
      /* fall through */
    }
  }

  if (
    typeof value === "object" &&
    typeof (value as { toString?: () => string }).toString === "function"
  ) {
    return (value as { toString: () => string }).toString();
  }

  return String(value);
}

function formatCreatedAt(value: unknown) {
  if (value === null || value === undefined) return "";

  const date =
    value instanceof Date
      ? value
      : typeof value === "string"
      ? new Date(value)
      : typeof value === "number"
      ? new Date(value)
      : value && typeof value === "object" && "valueOf" in value
      ? new Date((value as { valueOf: () => number }).valueOf())
      : null;

  if (!date || Number.isNaN(date.getTime())) return "";

  return CREATED_AT_FORMATTER.format(date);
}
