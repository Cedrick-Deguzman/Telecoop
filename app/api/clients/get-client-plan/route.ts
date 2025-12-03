// app/api/clients/get-client-plan/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const clientId = req.nextUrl.searchParams.get("clientId");
    if (!clientId) {
      return NextResponse.json({ error: "clientId is required" }, { status: 400 });
    }

    const client = await prisma.client.findUnique({
      where: { id: parseInt(clientId) },
      include: { plan: true }, // include the plan relation
    });

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    return NextResponse.json(client.plan);
  } catch (error) {
    console.error("Error fetching client plan:", error);
    return NextResponse.json({ error: "Failed to fetch client plan" }, { status: 500 });
  }
}
