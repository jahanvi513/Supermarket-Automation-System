"use client"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import ManagerLayout from "@/components/layouts/manager-layout"

const mockData = {
  Dairy: ["Milk", "Cheese", "Yogurt"],
  Meat: ["Chicken", "Beef", "Pork"],
  Bakery: ["Bread", "Bagel", "Croissant"],
  Produce: ["Apple", "Banana", "Carrot"]
}

export default function StoreLayout() {
  const [search, setSearch] = useState("")

  const getSearchMatches = () => {
    const results: { product: string; category: string }[] = []
    if (search.trim() === "") return results

    for (const [category, items] of Object.entries(mockData)) {
      items.forEach((item) => {
        if (item.toLowerCase().includes(search.toLowerCase())) {
          results.push({ product: item, category })
        }
      })
    }
    return results
  }

  const searchMatches = getSearchMatches()

  const filterProducts = (category: string) =>
    mockData[category].filter((item) =>
      item.toLowerCase().includes(search.toLowerCase())
    )

  return (
    <ManagerLayout>
      <div className="container py-6">
        <h1 className="text-2xl font-bold mb-4">Store Layout Map</h1>

        <Input
          type="text"
          placeholder="Search for a product..."
          className="mb-2"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {searchMatches.length > 0 && (
          <div className="text-sm text-gray-700 mb-6">
            {searchMatches.map((match, index) => (
              <p key={index}>
                <strong>{match.product}</strong> is in <strong>{match.category}</strong>
              </p>
            ))}
          </div>
        )}

        {/* 📍 Grid-style Store Layout */}
        <div className="grid grid-cols-4 gap-4 h-[500px] text-sm font-medium text-center mb-10">
          {/* Left Aisle */}
          <div className="col-span-1 row-span-4 bg-gray-100 border flex items-center justify-center p-4">
            <div>
              <h2 className="mb-2">Dairy</h2>
              <ul className="text-xs text-left">
                {filterProducts("Dairy").map((item, i) => (
                  <li key={i}>• {item}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Top Middle */}
          <div className="col-span-2 bg-red-100 border flex items-center justify-center p-4">
            <div>
              <h2 className="mb-2">Bakery</h2>
              <ul className="text-xs text-left">
                {filterProducts("Bakery").map((item, i) => (
                  <li key={i}>• {item}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Center block: Meat + Produce stacked */}
          <div className="col-span-2 row-span-2 border border-dashed flex flex-col justify-evenly items-center bg-white">
            <div>
              <h2 className="text-blue-800">Meat</h2>
              <ul className="text-xs text-left">
                {filterProducts("Meat").map((item, i) => (
                  <li key={i}>• {item}</li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="text-green-800">Produce</h2>
              <ul className="text-xs text-left">
                {filterProducts("Produce").map((item, i) => (
                  <li key={i}>• {item}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Checkout Area */}
          <div className="col-span-2 bg-green-100 border flex items-center justify-center">
            <h2 className="text-xl">Checkout</h2>
          </div>

          {/* Right Wall */}
          <div className="col-span-1 row-span-4 bg-gray-100 border flex items-center justify-center">
            <h2>Other Sections</h2>
          </div>
        </div>
      </div>
    </ManagerLayout>
  )
}

