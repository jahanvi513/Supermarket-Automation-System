"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { getInventory, updateInventory, getProducts } from "@/lib/api"

export default function ManagerInventory() {
  const { toast } = useToast()
  const [inventory, setInventory] = useState<any[]>([])
  const [productsMap, setProductsMap] = useState<Record<string, any>>({})
  const [filteredInventory, setFilteredInventory] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [newQuantity, setNewQuantity] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredInventory(inventory)
    } else {
      const lower = searchTerm.toLowerCase()
      const filtered = inventory.filter((item) => {
        const product = productsMap[item.productId] || {}
        return (
          item.productId?.toString().includes(lower) ||
          product.name?.toLowerCase().includes(lower) ||
          product.category?.toLowerCase().includes(lower)
        )
      })
      setFilteredInventory(filtered)
    }
  }, [searchTerm, inventory, productsMap])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const [inventoryData, productList] = await Promise.all([
        getInventory(),
        getProducts(),
      ])
      const productIndex = Object.fromEntries(productList.map((p: any) => [p.id, p]))
      setProductsMap(productIndex)
      setInventory(inventoryData)
      setFilteredInventory(inventoryData)
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to fetch inventory or product data.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateClick = (item: any) => {
    setSelectedItem(item)
    setNewQuantity(item.currentQuantity?.toString() || "0")
    setIsDialogOpen(true)
  }

  const handleUpdateInventory = async () => {
    if (!selectedItem || !newQuantity.trim() || isNaN(Number(newQuantity))) {
      toast({ title: "Error", description: "Invalid quantity", variant: "destructive" })
      return
    }

    setIsUpdating(true)
    try {
      await updateInventory(selectedItem.productId, Number(newQuantity))
      const updated = inventory.map((i) =>
        i.productId === selectedItem.productId
          ? { ...i, currentQuantity: Number(newQuantity) }
          : i
      )
      setInventory(updated)
      setFilteredInventory(updated)
      toast({ title: "Success", description: "Inventory updated successfully." })
      setIsDialogOpen(false)
    } catch (err) {
      toast({ title: "Error", description: "Update failed. Try again.", variant: "destructive" })
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Inventory Management</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-6">
          <Input
            placeholder="Search by product ID, name, or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
          <Button onClick={fetchData}>Refresh</Button>
        </div>

        {isLoading ? (
          <div className="text-center py-8">Loading inventory...</div>
        ) : filteredInventory.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Current Stock</TableHead>
                <TableHead>Min. Threshold</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInventory.map((item) => {
                const product = productsMap[item.productId] || {}
                return (
                  <TableRow key={item.productId}>
                    <TableCell>{item.productId}</TableCell>
                    <TableCell>{product.name || "N/A"}</TableCell>
                    <TableCell>{product.category || "N/A"}</TableCell>
                    <TableCell>{item.currentQuantity ?? "N/A"}</TableCell>
                    <TableCell>{item.minimumThreshold ?? "N/A"}</TableCell>
                    <TableCell>
                      {item.currentQuantity != null && item.minimumThreshold != null ? (
                        item.currentQuantity <= item.minimumThreshold ? (
                          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Low Stock</Badge>
                        ) : (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">In Stock</Badge>
                        )
                      ) : (
                        <Badge variant="outline">Unknown</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" onClick={() => handleUpdateClick(item)}>Update</Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8 text-gray-500">No inventory items found.</div>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Update Inventory</DialogTitle>
            </DialogHeader>
            {selectedItem && (
              <div className="space-y-4 py-2">
                <div>
                  <div className="font-medium">{productsMap[selectedItem.productId]?.name || "Unknown Product"}</div>
                  <div className="text-sm text-gray-500">Product ID: {selectedItem.productId}</div>
                </div>
                <div>
                  <Label htmlFor="current-quantity">Current Quantity</Label>
                  <Input id="current-quantity" value={selectedItem.currentQuantity ?? "N/A"} disabled />
                </div>
                <div>
                  <Label htmlFor="new-quantity">New Quantity</Label>
                  <Input
                    id="new-quantity"
                    type="number"
                    value={newQuantity}
                    onChange={(e) => setNewQuantity(e.target.value)}
                    min="0"
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleUpdateInventory} disabled={isUpdating}>
                {isUpdating ? "Updating..." : "Update"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
