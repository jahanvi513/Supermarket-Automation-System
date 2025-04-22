import { NextResponse } from "next/server"

// Mock inventory database
const inventory = [
  { id: 1, productId: 1, quantity: 100, location: "A1", reorderLevel: 20 },
  { id: 2, productId: 2, quantity: 50, location: "B2", reorderLevel: 10 },
  { id: 3, productId: 3, quantity: 75, location: "C3", reorderLevel: 15 },
  { id: 4, productId: 4, quantity: 200, location: "D4", reorderLevel: 30 },
  { id: 5, productId: 5, quantity: 30, location: "E5", reorderLevel: 5 },
]

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const id = Number.parseInt(params.id)
  const inventoryItem = inventory.find((item) => item.productId === id)

  if (!inventoryItem) {
    return NextResponse.json({ success: false, message: "Inventory item not found" }, { status: 404 })
  }

  return NextResponse.json(inventoryItem)
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    const updatedInventoryItem = await request.json()

    // In a real application, you would update the database here
    // For now, we'll just return the updated inventory item
    return NextResponse.json({ ...updatedInventoryItem, productId: id })
  } catch (error) {
    console.error("Error updating inventory item:", error)
    return NextResponse.json({ success: false, message: "Failed to update inventory item" }, { status: 500 })
  }
}
