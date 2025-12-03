import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const plans = await prisma.plan.findMany({
      orderBy: { id: "asc" },
    });

    return NextResponse.json(plans);
  } catch (error) {
    console.error("Error fetching plans:", error);
    return NextResponse.json(
      { error: "Failed to fetch plans" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { name, speed, price, features, color, icon } = body;

    if (!name || !speed || !price) {
      return NextResponse.json(
        { error: "Name, speed, and price are required" },
        { status: 400 }
      );
    }

    const newPlan = await prisma.plan.create({
      data: {
        name,
        speed,
        price: parseFloat(price),
        features,
        color: color || "indigo", // default color
        icon: icon || "wifi", // default icon
      },
    });

    return NextResponse.json(newPlan, { status: 201 });
  } catch (error) {
    console.error("Error creating plan:", error);
    return NextResponse.json(
      { error: "Failed to create plan" },
      { status: 500 }
    );
  }
}
