import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// -----------------------------------
// GET — Fetch all plans + subscriber count
// -----------------------------------
export async function GET() {
  try {
    const plans = await prisma.plan.findMany({
      orderBy: { id: "asc" },
      include: {
        clients: true,
      },
    });

    const formatted = plans.map((plan) => ({
      id: plan.id,
      name: plan.name,
      speed: plan.speed,
      price: Number(plan.price), // ensure numeric
      isActive: plan.isActive,
      color: plan.color,
      icon: plan.icon,
      features: plan.features,

      subscribers: plan.clients?.length ?? 0, // ensure number
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Error fetching plans:", error);
    return NextResponse.json(
      { error: "Failed to fetch plans" },
      { status: 500 }
    );
  }
}

// -----------------------------------
// PUT — Update a plan
// -----------------------------------
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      id,
      name,
      speed,
      price,
      isActive,
      features,
      color,
      icon,
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Missing plan ID" },
        { status: 400 }
      );
    }

    // Ensure features is always an array
    const featuresArray =
      Array.isArray(features) ? features : [];

    // Update plan
    const updated = await prisma.plan.update({
      where: { id },
      data: {
        name,
        speed,
        price: Number(price),
        isActive:
          isActive === "true" ||
          isActive === true,
        features: featuresArray,
        color,
        icon,
      },
      include: { clients: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating plan:", error);
    return NextResponse.json(
      { error: "Failed to update plan" },
      { status: 500 }
    );
  }
}
