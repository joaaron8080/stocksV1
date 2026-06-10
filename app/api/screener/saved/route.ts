import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const snapshots = await prisma.screenerSnapshot.findMany({
    where: { name: { not: "__cache__" } },
    orderBy: { searchedAt: "desc" },
    select: {
      id: true,
      name: true,
      searchedAt: true,
      resultCount: true,
      filters: true,
    },
  });
  return NextResponse.json(snapshots);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, filters, results } = body;

  if (!name || !filters || !Array.isArray(results)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const filtersJson = JSON.stringify(filters);

  const duplicate = await prisma.screenerSnapshot.findFirst({
    where: { filters: filtersJson, name: { not: "__cache__" } },
    select: { id: true, name: true },
  });

  if (duplicate) {
    return NextResponse.json(
      { error: "duplicate", existingName: duplicate.name },
      { status: 409 }
    );
  }

  const snapshot = await prisma.screenerSnapshot.create({
    data: {
      name: String(name).slice(0, 100),
      filters: filtersJson,
      results: JSON.stringify(results),
      resultCount: results.length,
    },
  });

  return NextResponse.json({ id: snapshot.id }, { status: 201 });
}
