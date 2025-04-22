"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { getPromotions, createPromotion, getProducts } from "@/lib/api"

export default function ManagerPromotions() {
  const { toast } = useToast()
  const [promotions, setPromotions] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    discountType: "percentage",
    discountValue: "",
    applicableToAll: false,
    productId: "",
    category: "",
    startDate: "",
    endDate: "",
    isActive: true,
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      // Fetch promotions
      const promotionsData = await getPromotions()
      setPromotions(Array.isArray(promotionsData) ? promotionsData : [])

      // Fetch products
      try {
        const productsData = await getProducts()
        setProducts(Array.isArray(productsData) ? productsData : [])
      } catch (productError) {
        console.error("Error fetching products:", productError)
        // Don't fail the whole page if products can't be fetched
        setProducts([])
      }
    } catch (error: any) {
      console.error("Error fetching data:", error)
      setError(error.message || "Failed to fetch promotions data")
      toast({
        title: "Error",
        description: "Failed to fetch promotions data. Please try again.",
        variant: "destructive",
      })
      // Set empty arrays to prevent undefined errors
      setPromotions([])
      setProducts([])
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

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }))
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      discountType: "percentage",
      discountValue: "",
      applicableToAll: false,
      productId: "",
      category: "",
      startDate: "",
      endDate: "",
      isActive: true,
    })
  }

  const handleAddPromotion = () => {
    resetForm()
    setIsDialogOpen(true)
  }

  const handleSubmit = async () => {
    // Validate form
    if (!formData.name || !formData.discountValue) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)
    try {
      const promotionData = {
        ...formData,
        discountValue: Number.parseFloat(formData.discountValue),
      }

      const result = await createPromotion(promotionData)

      if (result && !result.error) {
        // Update local state
        setPromotions([...promotions, result])

        toast({
          title: "Success",
          description: "Promotion created successfully.",
        })

        setIsDialogOpen(false)
        resetForm()
      } else {
        throw new Error(result.error || "Failed to create promotion")
      }
    } catch (error: any) {
      console.error("Error creating promotion:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to create promotion. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleRetry = () => {
    fetchData()
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Promotions Management</CardTitle>
          <Button onClick={handleAddPromotion}>Add New Promotion</Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">Loading promotions...</div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={handleRetry}>Retry</Button>
          </div>
        ) : promotions.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Applicable To</TableHead>
                <TableHead>Valid Period</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {promotions.map((promotion) => (
                <TableRow key={promotion.id || `promotion-${Math.random()}`}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{promotion.name || "Unnamed Promotion"}</div>
                      <div className="text-sm text-gray-500">{promotion.description || "No description"}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {promotion.discountType === "percentage"
                      ? `${promotion.discountValue || 0}%`
                      : `$${(promotion.discountValue || 0).toFixed(2)}`}
                  </TableCell>
                  <TableCell>
                    {promotion.applicableToAll
                      ? "All Products"
                      : promotion.productId
                        ? `Product: ${products.find((p) => p.id === promotion.productId)?.name || promotion.productId}`
                        : promotion.category
                          ? `Category: ${promotion.category}`
                          : "Not specified"}
                  </TableCell>
                  <TableCell>
                    {promotion.startDate && promotion.endDate
                      ? `${new Date(promotion.startDate).toLocaleDateString()} - ${new Date(promotion.endDate).toLocaleDateString()}`
                      : "No expiration"}
                  </TableCell>
                  <TableCell>
                    <div
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        promotion.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {promotion.isActive ? "Active" : "Inactive"}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No promotions found. Create a new promotion to get started.
          </div>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Promotion</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name*
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Input
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="discountType" className="text-right">
                  Discount Type
                </Label>
                <Select
                  value={formData.discountType}
                  onValueChange={(value) => handleSelectChange("discountType", value)}
                >
                  <SelectTrigger id="discountType" className="col-span-3">
                    <SelectValue placeholder="Select discount type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                    <SelectItem value="fixed">Fixed Amount ($)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="discountValue" className="text-right">
                  Discount Value*
                </Label>
                <Input
                  id="discountValue"
                  name="discountValue"
                  type="number"
                  min="0"
                  step={formData.discountType === "percentage" ? "1" : "0.01"}
                  value={formData.discountValue}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="applicableToAll" className="text-right">
                  Apply to All Products
                </Label>
                <div className="col-span-3 flex items-center space-x-2">
                  <Switch
                    id="applicableToAll"
                    checked={formData.applicableToAll}
                    onCheckedChange={(checked) => handleSwitchChange("applicableToAll", checked)}
                  />
                  <Label htmlFor="applicableToAll">{formData.applicableToAll ? "Yes" : "No"}</Label>
                </div>
              </div>

              {!formData.applicableToAll && (
                <>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="productId" className="text-right">
                      Product
                    </Label>
                    <Select
                      value={formData.productId}
                      onValueChange={(value) => handleSelectChange("productId", value)}
                      disabled={!!formData.category}
                    >
                      <SelectTrigger id="productId" className="col-span-3">
                        <SelectValue placeholder="Select product (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {products.map((product) => (
                          <SelectItem key={product.id || `product-${Math.random()}`} value={product.id || ""}>
                            {product.name || "Unnamed Product"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="category" className="text-right">
                      Category
                    </Label>
                    <Input
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="col-span-3"
                      disabled={!!formData.productId && formData.productId !== "none"}
                      placeholder="Enter category (optional)"
                    />
                  </div>
                </>
              )}

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="startDate" className="text-right">
                  Start Date
                </Label>
                <Input
                  id="startDate"
                  name="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="endDate" className="text-right">
                  End Date
                </Label>
                <Input
                  id="endDate"
                  name="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="isActive" className="text-right">
                  Active
                </Label>
                <div className="col-span-3 flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => handleSwitchChange("isActive", checked)}
                  />
                  <Label htmlFor="isActive">{formData.isActive ? "Yes" : "No"}</Label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false)
                  resetForm()
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={isProcessing}>
                {isProcessing ? "Creating..." : "Create Promotion"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
