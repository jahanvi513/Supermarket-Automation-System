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
import { getInventory, updateInventory } from "@/lib/api"

export default function ManagerInventory() {
  const { toast } = useToast()
  const [inventory, setInventory] = useState<any[]>([])
  const [filteredInventory, setFilteredInventory] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [newQuantity, setNewQuantity] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    fetchInventory()
  }, [])

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredInventory(inventory)
    } else {
      const lowercaseSearch = searchTerm.toLowerCase()
      const filtered = inventory.filter(
        (item) =>
          (item.productId?.toString() || "").includes(lowercaseSearch) ||
          (item.productName?.toLowerCase() || "").includes(lowercaseSearch) ||
          (item.category?.toLowerCase() || "").includes(lowercaseSearch),
      )
      setFilteredInventory(filtered)
    }
  }, [searchTerm, inventory])

  const fetchInventory = async () => {
    setIsLoading(true)
    try {
      const data = await getInventory()
      if (Array.isArray(data)) {
        setInventory(data)
        setFilteredInventory(data)
      } else {
        console.error("Invalid inventory data format:", data)
        toast({
          title: "Error",
          description: "Failed to fetch inventory. Invalid data format.",
          variant: "destructive",
        })
        setInventory([])
        setFilteredInventory([])
      }
    } catch (error) {
      console.error("Error fetching inventory:", error)
      toast({
        title: "Error",
        description: "Failed to fetch inventory. Please try again.",
        variant: "destructive",
      })
      setInventory([])
      setFilteredInventory([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateInventory = async () => {
    if (!selectedItem || !newQuantity.trim() || isNaN(Number(newQuantity))) {
      toast({
        title: "Error",
        description: "Please enter a valid quantity.",
        variant: "destructive",
      })
      return
    }

    setIsUpdating(true)
    try {
      await updateInventory(selectedItem.productId, Number(newQuantity))

      // Update local state
      const updatedInventory = inventory.map((item) => {
        if (item.productId === selectedItem.productId) {
          return { ...item, currentQuantity: Number(newQuantity) }
        }
        return item
      })

      setInventory(updatedInventory)
      setFilteredInventory(updatedInventory)

      toast({
        title: "Success",
        description: "Inventory updated successfully.",
      })

      setIsDialogOpen(false)
    } catch (error) {
      console.error("Error updating inventory:", error)
      toast({
        title: "Error",
        description: "Failed to update inventory. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleUpdateClick = (item: any) => {
    if (!item) {
      console.error("Attempted to update undefined item")
      toast({
        title: "Error",
        description: "Invalid item selected.",
        variant: "destructive",
      })
      return
    }

    setSelectedItem(item)

    // Safely convert currentQuantity to string with fallback to "0"
    const quantityStr =
      item.currentQuantity !== undefined && item.currentQuantity !== null ? item.currentQuantity.toString() : "0"

    setNewQuantity(quantityStr)
    setIsDialogOpen(true)
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
          <Button onClick={fetchInventory}>Refresh</Button>
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
              {filteredInventory.map((item) => (
                <TableRow key={item.productId || `item-${Math.random()}`}>
                  <TableCell>{item.productId || "N/A"}</TableCell>
                  <TableCell className="font-medium">{item.productName || "N/A"}</TableCell>
                  <TableCell>{item.category || "N/A"}</TableCell>
                  <TableCell>{item.currentQuantity !== undefined ? item.currentQuantity : "N/A"}</TableCell>
                  <TableCell>{item.minimumThreshold !== undefined ? item.minimumThreshold : "N/A"}</TableCell>
                  <TableCell>
                    {item.currentQuantity !== undefined && item.minimumThreshold !== undefined ? (
                      item.currentQuantity <= item.minimumThreshold ? (
                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                          Low Stock
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          In Stock
                        </Badge>
                      )
                    ) : (
                      <Badge variant="outline">Unknown</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" onClick={() => handleUpdateClick(item)}>
                      Update
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8 text-gray-500">No inventory items found matching your search.</div>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Update Inventory</DialogTitle>
            </DialogHeader>
            {selectedItem && (
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <div className="font-medium">{selectedItem.productName || "Unknown Product"}</div>
                  <div className="text-sm text-gray-500">Product ID: {selectedItem.productId || "N/A"}</div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="current-quantity">Current Quantity</Label>
                  <Input
                    id="current-quantity"
                    value={selectedItem.currentQuantity !== undefined ? selectedItem.currentQuantity : "N/A"}
                    disabled
                  />
                </div>

                <div className="space-y-2">
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
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
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
