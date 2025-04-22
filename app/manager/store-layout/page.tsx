"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { getStoreLayout, getProducts } from "@/lib/api"

export default function ManagerStoreLayout() {
  const [storeLayout, setStoreLayout] = useState<any>(null)
  const [products, setProducts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedSection, setSelectedSection] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editMode, setEditMode] = useState<"section" | "product" | null>(null)
  const [formData, setFormData] = useState({
    sectionId: "",
    sectionName: "",
    sectionType: "",
    productId: "",
    aisle: "",
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const [layoutData, productsData] = await Promise.all([getStoreLayout(), getProducts()])

      setStoreLayout(layoutData)
      setProducts(productsData)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleEditSection = (sectionId: string) => {
    const section = storeLayout.sections.find((s: any) => s.id === sectionId)
    if (!section) return

    setFormData({
      ...formData,
      sectionId: section.id,
      sectionName: section.name,
      sectionType: section.type,
    })

    setEditMode("section")
    setIsDialogOpen(true)
  }

  const handleAddProductToSection = (sectionId: string) => {
    setFormData({
      ...formData,
      sectionId,
      productId: "",
      aisle: "",
    })

    setEditMode("product")
    setIsDialogOpen(true)
  }

  const handleSubmit = async () => {
    // This would normally call an API to update the store layout
    // For now, we'll just simulate the update locally

    if (editMode === "section") {
      // Update section details
      const updatedSections = storeLayout.sections.map((section: any) => {
        if (section.id === formData.sectionId) {
          return {
            ...section,
            name: formData.sectionName,
            type: formData.sectionType,
          }
        }
        return section
      })

      setStoreLayout({
        ...storeLayout,
        sections: updatedSections,
      })

      toast({
        title: "Success",
        description: "Section updated successfully.",
      })
    } else if (editMode === "product") {
      // Add product to section
      const product = products.find((p) => p.id === formData.productId)
      if (!product) {
        toast({
          title: "Error",
          description: "Product not found.",
          variant: "destructive",
        })
        return
      }

      const updatedSections = storeLayout.sections.map((section: any) => {
        if (section.id === formData.sectionId) {
          const productEntry = {
            id: product.id,
            name: product.name,
            aisle: formData.aisle,
          }

          // Check if product already exists in this section
          const existingProductIndex = section.products
            ? section.products.findIndex((p: any) => p.id === product.id)
            : -1

          if (existingProductIndex >= 0) {
            // Update existing product
            const updatedProducts = [...section.products]
            updatedProducts[existingProductIndex] = productEntry
            return {
              ...section,
              products: updatedProducts,
            }
          } else {
            // Add new product
            return {
              ...section,
              products: [...(section.products || []), productEntry],
            }
          }
        }
        return section
      })

      setStoreLayout({
        ...storeLayout,
        sections: updatedSections,
      })

      toast({
        title: "Success",
        description: "Product added to section successfully.",
      })
    }

    setIsDialogOpen(false)
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
        <CardTitle>Store Layout Management</CardTitle>
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

                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleEditSection(section.id)}>
                            Edit Section
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleAddProductToSection(section.id)}>
                            Add Product
                          </Button>
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
                      </div>
                    )
                  })()
                ) : (
                  <div className="text-center py-4 text-gray-500">Select a section to view details</div>
                )}
              </CardContent>
            </Card>

            <div className="mt-4">
              <Button variant="outline" className="w-full" onClick={fetchData}>
                Refresh Layout
              </Button>
            </div>
          </div>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editMode === "section" ? "Edit Section" : "Add Product to Section"}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {editMode === "section" ? (
                <>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="sectionName" className="text-right">
                      Name
                    </Label>
                    <Input
                      id="sectionName"
                      name="sectionName"
                      value={formData.sectionName}
                      onChange={handleInputChange}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="sectionType" className="text-right">
                      Type
                    </Label>
                    <Select
                      value={formData.sectionType}
                      onValueChange={(value) => handleSelectChange("sectionType", value)}
                    >
                      <SelectTrigger id="sectionType" className="col-span-3">
                        <SelectValue placeholder="Select section type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="grocery">Grocery</SelectItem>
                        <SelectItem value="produce">Produce</SelectItem>
                        <SelectItem value="dairy">Dairy</SelectItem>
                        <SelectItem value="meat">Meat</SelectItem>
                        <SelectItem value="bakery">Bakery</SelectItem>
                        <SelectItem value="frozen">Frozen</SelectItem>
                        <SelectItem value="household">Household</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="productId" className="text-right">
                      Product
                    </Label>
                    <Select
                      value={formData.productId}
                      onValueChange={(value) => handleSelectChange("productId", value)}
                    >
                      <SelectTrigger id="productId" className="col-span-3">
                        <SelectValue placeholder="Select product" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="aisle" className="text-right">
                      Aisle
                    </Label>
                    <Input
                      id="aisle"
                      name="aisle"
                      value={formData.aisle}
                      onChange={handleInputChange}
                      className="col-span-3"
                    />
                  </div>
                </>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
