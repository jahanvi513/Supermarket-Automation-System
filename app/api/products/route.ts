import { NextResponse } from "next/server"

// Mock product database
const products = [
  {
    id: 1,
    name: "Milk",
    description: "Fresh whole milk",
    price: 3.99,
    category: "Dairy",
    barcode: "123456789",
    imageUrl: "/placeholder.svg?height=100&width=100",
  },
  {
    id: 2,
    name: "Bread",
    description: "Whole wheat bread",
    price: 2.49,
    category: "Bakery",
    barcode: "987654321",
    imageUrl: "/placeholder.svg?height=100&width=100",
  },
  {
    id: 3,
    name: "Eggs",
    description: "Farm fresh eggs",
    price: 4.99,
    category: "Dairy",
    barcode: "456789123",
    imageUrl: "/placeholder.svg?height=100&width=100",
  },
  {
    id: 4,
    name: "Apples",
    description: "Red delicious apples",
    price: 1.99,
    category: "Produce",
    barcode: "789123456",
    imageUrl: "/placeholder.svg?height=100&width=100",
  },
  {
    id: 5,
    name: "Chicken",
    description: "Boneless chicken breast",
    price: 8.99,
    category: "Meat",
    barcode: "321654987",
    imageUrl: "/placeholder.svg?height=100&width=100",
  },
]

export async function GET() {
  // Simulate a slight delay to mimic a real API call
  await new Promise((resolve) => setTimeout(resolve, 500))

  return NextResponse.json(products)
}

export async function POST(request: Request) {
  try {
    const product = await request.json()

    // In a real application, you would save to a database here
    // For now, we'll just return the product with a new ID
    const newProduct = {
      ...product,
      id: products.length + 1,
    }

    return NextResponse.json(newProduct)
  } catch (error) {
    console.error("Error creating product:", error)
    return NextResponse.json({ success: false, message: "Failed to create product" }, { status: 500 })
  }
}
