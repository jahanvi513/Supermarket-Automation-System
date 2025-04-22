import { NextResponse } from "next/server"

// Mock inventory database
const inventory = [
  { id: 1, productId: 1, quantity: 100, location: "A1", reorderLevel: 20 },
  { id: 2, productId: 2, quantity: 50, location: "B2", reorderLevel: 10 },
  { id: 3, productId: 3, quantity: 75, location: "C3", reorderLevel: 15 },
  { id: 4, productId: 4, quantity: 200, location: "D4", reorderLevel: 30 },
  { id: 5, productId: 5, quantity: 30, location: "E5", reorderLevel: 5 },
]

export async function GET() {
  // Simulate a slight delay to mimic a real API call
  await new Promise((resolve) => setTimeout(resolve, 500))

  return NextResponse.json(inventory)
}

export async function POST(request: Request) {
  try {
    const inventoryItem = await request.json()

    // In a real application, you would save to a database here
    // For now, we'll just return the inventory item with a new ID
    const newInventoryItem = {
      ...inventoryItem,
      id: inventory.length + 1,
    }

    return NextResponse.json(newInventoryItem)
  } catch (error) {
    console.error("Error creating inventory item:", error)
    return NextResponse.json({ success: false, message: "Failed to create inventory item" }, { status: 500 })
  }
}
