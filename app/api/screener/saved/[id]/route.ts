import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id);
  if (isNaN(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const snapshot = await prisma.screenerSnapshot.findUnique({ where: { id } });
  if (!snapshot) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({
    ...snapshot,
    filters: JSON.parse(snapshot.filters),
    results: JSON.parse(snapshot.results),
  });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id);
  if (isNaN(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  await prisma.screenerSnapshot.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
