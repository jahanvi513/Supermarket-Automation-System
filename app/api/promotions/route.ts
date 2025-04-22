import { NextResponse } from "next/server"

// Mock promotions data
const promotions = [
  {
    id: "promo1",
    name: "Summer Sale",
    description: "20% off on all summer products",
    discountType: "percentage",
    discountValue: 20,
    applicableToAll: false,
    category: "summer",
    startDate: "2023-06-01",
    endDate: "2023-08-31",
    isActive: true,
  },
  {
    id: "promo2",
    name: "Back to School",
    description: "Buy one get one free on school supplies",
    discountType: "fixed",
    discountValue: 0,
    applicableToAll: false,
    category: "school",
    startDate: "2023-08-01",
    endDate: "2023-09-15",
    isActive: true,
  },
  {
    id: "promo3",
    name: "Holiday Special",
    description: "10% off on all products",
    discountType: "percentage",
    discountValue: 10,
    applicableToAll: true,
    startDate: "2023-12-01",
    endDate: "2023-12-31",
    isActive: true,
  },
  {
    id: "promo4",
    name: "Clearance Sale",
    description: "50% off on selected items",
    discountType: "percentage",
    discountValue: 50,
    applicableToAll: false,
    category: "clearance",
    startDate: "2023-01-15",
    endDate: "2023-02-15",
    isActive: false,
  },
]

export async function GET() {
  // Return the promotions data
  return NextResponse.json(promotions)
}

export async function POST(request: Request) {
  try {
    const data = await request.json()

    // Generate a new ID
    const newId = `promo${promotions.length + 1}`

    // Create a new promotion
    const newPromotion = {
      id: newId,
      ...data,
    }

    // Add to the promotions array (in a real app, this would be saved to a database)
    promotions.push(newPromotion)

    return NextResponse.json(newPromotion, { status: 201 })
  } catch (error) {
    console.error("Error creating promotion:", error)
    return NextResponse.json({ error: "Failed to create promotion" }, { status: 500 })
  }
}
