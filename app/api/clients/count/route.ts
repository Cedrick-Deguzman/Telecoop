import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Total clients
    const total = await prisma.client.count();

    // Active clients (or active connections)
    const activeConnections = await prisma.client.count({
      where: { status: "active" },
    });

    return NextResponse.json({ total, activeConnections });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch counts" }, { status: 500 });
  }
}