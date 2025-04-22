"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "@/components/ui/use-toast"
import { getProductById, getCustomerById, updateCustomerCredits, createSale, getPromotions } from "@/lib/api"

export default function EmployeeCheckout() {
  const [productId, setProductId] = useState("")
  const [customerId, setCustomerId] = useState("")
  const [customer, setCustomer] = useState<any>(null)
  const [cartItems, setCartItems] = useState<any[]>([])
  const [appliedPromotions, setAppliedPromotions] = useState<any[]>([])
  const [availablePromotions, setAvailablePromotions] = useState<any[]>([])
  const [subtotal, setSubtotal] = useState(0)
  const [tax, setTax] = useState(0)
  const [discount, setDiscount] = useState(0)
  const [total, setTotal] = useState(0)
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [useCredits, setUseCredits] = useState(false)

  useEffect(() => {
    // Fetch available promotions
    const fetchPromotions = async () => {
      try {
        const promotions = await getPromotions()
        setAvailablePromotions(promotions)
      } catch (error) {
        console.error("Error fetching promotions:", error)
      }
    }

    fetchPromotions()
  }, [])

  useEffect(() => {
    // Calculate totals whenever cart or promotions change
    calculateTotals()
  }, [cartItems, appliedPromotions, useCredits, customer])

  const handleAddProduct = async () => {
    if (!productId.trim()) return

    try {
      const product = await getProductById(productId)

      // Check if product already exists in cart
      const existingItemIndex = cartItems.findIndex((item) => item.id === product.id)

      if (existingItemIndex >= 0) {
        // Update quantity if product already in cart
        const updatedItems = [...cartItems]
        updatedItems[existingItemIndex].quantity += 1
        setCartItems(updatedItems)
      } else {
        // Add new product to cart
        setCartItems([...cartItems, { ...product, quantity: 1 }])
      }

      // Check if any promotions apply to this product
      checkPromotions(product)

      setProductId("")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add product. Please check the product ID.",
        variant: "destructive",
      })
    }
  }

  const handleRemoveItem = (index: number) => {
    const newCartItems = [...cartItems]
    newCartItems.splice(index, 1)
    setCartItems(newCartItems)

    // Recalculate applicable promotions
    recalculatePromotions(newCartItems)
  }

  const handleQuantityChange = (index: number, newQuantity: number) => {
    if (newQuantity < 1) return

    const newCartItems = [...cartItems]
    newCartItems[index].quantity = newQuantity
    setCartItems(newCartItems)

    // Recalculate applicable promotions
    recalculatePromotions(newCartItems)
  }

  const handleLookupCustomer = async () => {
    if (!customerId.trim()) return

    try {
      const customerData = await getCustomerById(customerId)
      setCustomer(customerData)
      toast({
        title: "Customer Found",
        description: `${customerData.name} has ${customerData.loyaltyPoints} loyalty points and ${customerData.creditBalance} credit balance.`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Customer not found. Please check the ID.",
        variant: "destructive",
      })
    }
  }

  const checkPromotions = (product: any) => {
    // Check if any promotions apply to this product
    const applicablePromotions = availablePromotions.filter(
      (promo) => promo.productId === product.id || promo.category === product.category || promo.applicableToAll,
    )

    if (applicablePromotions.length > 0) {
      // Add any new applicable promotions
      const newPromotions = applicablePromotions.filter((promo) => !appliedPromotions.some((p) => p.id === promo.id))

      if (newPromotions.length > 0) {
        setAppliedPromotions([...appliedPromotions, ...newPromotions])
      }
    }
  }

  const recalculatePromotions = (items: any[]) => {
    // Remove promotions that no longer apply
    const stillApplicablePromotions = appliedPromotions.filter((promo) => {
      // Keep global promotions
      if (promo.applicableToAll) return true

      // Check if any items match this promotion's criteria
      return items.some((item) => promo.productId === item.id || promo.category === item.category)
    })

    setAppliedPromotions(stillApplicablePromotions)
  }

  const calculateTotals = () => {
    // Calculate subtotal
    const itemsSubtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
    setSubtotal(itemsSubtotal)

    // Calculate discount from promotions
    let totalDiscount = 0
    appliedPromotions.forEach((promo) => {
      if (promo.discountType === "percentage") {
        totalDiscount += itemsSubtotal * (promo.discountValue / 100)
      } else if (promo.discountType === "fixed") {
        totalDiscount += promo.discountValue
      }
    })

    // Apply customer credits if selected
    if (useCredits && customer && customer.creditBalance > 0) {
      const maxCreditsToUse = Math.min(customer.creditBalance, itemsSubtotal - totalDiscount)
      totalDiscount += maxCreditsToUse
    }

    setDiscount(totalDiscount)

    // Calculate tax (assuming 8% tax rate)
    const taxAmount = (itemsSubtotal - totalDiscount) * 0.08
    setTax(taxAmount)

    // Calculate total
    setTotal(itemsSubtotal - totalDiscount + taxAmount)
  }

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      toast({
        title: "Error",
        description: "Cart is empty. Please add products before checkout.",
        variant: "destructive",
      })
      return
    }

    setIsCheckingOut(true)

    try {
      // Create sale object
      const saleData = {
        customerId: customer ? customer.id : null,
        items: cartItems.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price,
        })),
        subtotal,
        tax,
        discount,
        total,
        appliedPromotions: appliedPromotions.map((p) => p.id),
        creditsUsed: useCredits && customer ? Math.min(customer.creditBalance, discount) : 0,
      }

      // Process the sale
      const result = await createSale(saleData)

      // Update customer credits if needed
      if (customer) {
        // Calculate new credits earned (1 point per $10 spent)
        const newCredits = Math.floor(total / 10)

        // Calculate remaining credits after using them
        const remainingCredits = useCredits
          ? Math.max(0, customer.creditBalance - Math.min(customer.creditBalance, discount))
          : customer.creditBalance

        // Update customer with new total credits
        await updateCustomerCredits(customer.id, remainingCredits + newCredits)
      }

      toast({
        title: "Checkout Complete",
        description: `Sale #${result.id} processed successfully.`,
      })

      // Reset the checkout
      setCartItems([])
      setCustomer(null)
      setCustomerId("")
      setAppliedPromotions([])
      setUseCredits(false)
    } catch (error) {
      toast({
        title: "Checkout Error",
        description: "Failed to process checkout. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsCheckingOut(false)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Product Entry */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Checkout</CardTitle>
          <CardDescription>Scan or enter product IDs to add items to the cart</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Enter Product ID"
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddProduct()}
              />
            </div>
            <Button onClick={handleAddProduct}>Add</Button>
          </div>

          {cartItems.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cartItems.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-gray-500">ID: {item.id}</div>
                      </div>
                    </TableCell>
                    <TableCell>${item.price.toFixed(2)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleQuantityChange(index, item.quantity - 1)}
                        >
                          -
                        </Button>
                        <span>{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleQuantityChange(index, item.quantity + 1)}
                        >
                          +
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>${(item.price * item.quantity).toFixed(2)}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(index)}>
                        ×
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-gray-500">No items in cart. Add products to begin checkout.</div>
          )}
        </CardContent>
      </Card>

      {/* Customer and Payment */}
      <Card>
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Customer Lookup */}
          <div className="space-y-2">
            <Label htmlFor="customer-id">Customer ID (Optional)</Label>
            <div className="flex gap-2">
              <Input
                id="customer-id"
                placeholder="Enter Customer ID"
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
              />
              <Button variant="outline" onClick={handleLookupCustomer}>
                Lookup
              </Button>
            </div>
            {customer && (
              <div className="bg-gray-50 p-3 rounded-md mt-2">
                <p className="font-medium">{customer.name}</p>
                <p className="text-sm text-gray-500">Loyalty Points: {customer.loyaltyPoints}</p>
                <p className="text-sm text-gray-500">Credit Balance: ${customer.creditBalance.toFixed(2)}</p>
                {customer.creditBalance > 0 && (
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      type="checkbox"
                      id="use-credits"
                      checked={useCredits}
                      onChange={(e) => setUseCredits(e.target.checked)}
                    />
                    <Label htmlFor="use-credits" className="text-sm">
                      Use available credits
                    </Label>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Applied Promotions */}
          {appliedPromotions.length > 0 && (
            <div>
              <h3 className="font-medium mb-2">Applied Promotions</h3>
              <ul className="space-y-1 text-sm">
                {appliedPromotions.map((promo, index) => (
                  <li key={index} className="text-green-600">
                    {promo.name} -{" "}
                    {promo.discountType === "percentage" ? `${promo.discountValue}%` : `$${promo.discountValue}`} off
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Order Totals */}
          <div className="space-y-2 pt-4 border-t">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>-${discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Tax (8%)</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={handleCheckout} disabled={isCheckingOut || cartItems.length === 0}>
            {isCheckingOut ? "Processing..." : "Complete Checkout"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
