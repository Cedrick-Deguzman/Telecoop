// File: /app/api/clients/add-client/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Generate random 8-character account number
function generateAccountNumber() {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

// Map plans to their monthly fees
const planFees: Record<string, number> = {
  "Basic 50Mbps - $49.99": 49.99,
  "Standard 100Mbps - $79.99": 79.99,
  "Premium 500Mbps - $129.99": 129.99,
  "Ultra 1Gbps - $199.99": 199.99,
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, plan, installationDate } = body;

    if (!name || !plan || !installationDate) {
      return NextResponse.json(
        { error: "Name, plan, and installation date are required" },
        { status: 400 }
      );
    }

    const monthlyFee = planFees[plan];
    if (!monthlyFee) {
      return NextResponse.json(
        { error: "Invalid plan selected" },
        { status: 400 }
      );
    }

    const newClient = await prisma.client.create({
      data: {
        name,
        email: email || null,
        phone: phone || null,
        plan,
        monthlyFee,
        status: "active",
        installationDate: new Date(installationDate),
        accountNumber: generateAccountNumber(),
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(newClient);
  } catch (error: any) {
    console.error("Error adding client:", error);
    return NextResponse.json(
      { error: "Failed to add client" },
      { status: 500 }
    );
  }
}
