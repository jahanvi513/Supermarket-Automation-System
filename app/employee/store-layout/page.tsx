"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { getStoreLayout } from "@/lib/api"

export default function EmployeeStoreLayout() {
  const [storeLayout, setStoreLayout] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedSection, setSelectedSection] = useState<string | null>(null)

  useEffect(() => {
    fetchStoreLayout()
  }, [])

  const fetchStoreLayout = async () => {
    setIsLoading(true)
    try {
      const data = await getStoreLayout()
      setStoreLayout(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch store layout. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Store Layout</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">Loading store layout...</div>
        </CardContent>
      </Card>
    )
  }

  if (!storeLayout) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Store Layout</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">Store layout information is not available.</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Store Layout</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <div className="border rounded-md p-4 bg-gray-50 h-[500px] relative">
              {/* Store layout visualization */}
              <div className="grid grid-cols-4 grid-rows-4 gap-2 h-full">
                {storeLayout.sections.map((section: any) => (
                  <div
                    key={section.id}
                    className={`border rounded-md flex items-center justify-center p-2 cursor-pointer transition-colors ${
                      selectedSection === section.id ? "bg-blue-100 border-blue-300" : "bg-white hover:bg-gray-100"
                    }`}
                    style={{
                      gridColumn: `span ${section.dimensions.width}`,
                      gridRow: `span ${section.dimensions.height}`,
                    }}
                    onClick={() => setSelectedSection(section.id)}
                  >
                    <div className="text-center">
                      <div className="font-medium">{section.name}</div>
                      <div className="text-xs text-gray-500">{section.type}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Section Details</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedSection ? (
                  (() => {
                    const section = storeLayout.sections.find((s: any) => s.id === selectedSection)
                    return (
                      <div className="space-y-4">
                        <div>
                          <h3 className="font-medium">{section.name}</h3>
                          <p className="text-sm text-gray-500">{section.type}</p>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium mb-1">Products in this section:</h4>
                          {section.products && section.products.length > 0 ? (
                            <ul className="space-y-1">
                              {section.products.map((product: any) => (
                                <li key={product.id} className="text-sm">
                                  {product.name} - Aisle {product.aisle}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-sm text-gray-500">No products in this section.</p>
                          )}
                        </div>

                        <div className="pt-2">
                          <Button variant="outline" size="sm" className="w-full">
                            View All Products
                          </Button>
                        </div>
                      </div>
                    )
                  })()
                ) : (
                  <div className="text-center py-4 text-gray-500">Select a section to view details</div>
                )}
              </CardContent>
            </Card>

            <div className="mt-4">
              <Button variant="outline" className="w-full" onClick={fetchStoreLayout}>
                Refresh Layout
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
