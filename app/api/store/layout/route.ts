import { NextResponse } from "next/server"

// Mock store layout
const storeLayout = {
  id: 1,
  name: "Main Store",
  sections: [
    {
      id: 1,
      name: "Produce",
      position: { x: 0, y: 0 },
      dimensions: { width: 3, height: 2 },
      products: [4],
    },
    {
      id: 2,
      name: "Dairy",
      position: { x: 3, y: 0 },
      dimensions: { width: 2, height: 2 },
      products: [1, 3],
    },
    {
      id: 3,
      name: "Bakery",
      position: { x: 0, y: 2 },
      dimensions: { width: 2, height: 1 },
      products: [2],
    },
    {
      id: 4,
      name: "Meat",
      position: { x: 2, y: 2 },
      dimensions: { width: 3, height: 1 },
      products: [5],
    },
    {
      id: 5,
      name: "Checkout",
      position: { x: 5, y: 0 },
      dimensions: { width: 1, height: 3 },
      products: [],
    },
  ],
}

export async function GET() {
  // Simulate a slight delay to mimic a real API call
  await new Promise((resolve) => setTimeout(resolve, 500))

  return NextResponse.json(storeLayout)
}

export async function PUT(request: Request) {
  try {
    const updatedLayout = await request.json()

    // In a real application, you would update the database here
    // For now, we'll just return the updated layout
    return NextResponse.json(updatedLayout)
  } catch (error) {
    console.error("Error updating store layout:", error)
    return NextResponse.json({ success: false, message: "Failed to update store layout" }, { status: 500 })
  }
}
