"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"
import { getCustomers, getCustomerById, updateCustomerCredits } from "@/lib/api"
import { Label } from "@/components/ui/label"


export default function EmployeeCustomers() {
  const [customers, setCustomers] = useState<any[]>([])
  const [filteredCustomers, setFilteredCustomers] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newCredit, setNewCredit] = useState<string>("")

  useEffect(() => {
    fetchCustomers()
  }, [])

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredCustomers(customers)
    } else {
      const lowercaseSearch = searchTerm.toLowerCase()
      const filtered = customers.filter(
        (customer) =>
          customer.id.toString().includes(lowercaseSearch) ||
          customer.name.toLowerCase().includes(lowercaseSearch) ||
          customer.email.toLowerCase().includes(lowercaseSearch),
      )
      setFilteredCustomers(filtered)
    }
  }, [searchTerm, customers])

  const fetchCustomers = async () => {
    setIsLoading(true)
    try {
      const data = await getCustomers()
      setCustomers(data)
      setFilteredCustomers(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch customers. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewCustomer = async (customerId: string) => {
    try {
      const customer = await getCustomerById(customerId)
      setSelectedCustomer(customer)
      setIsDialogOpen(true)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch customer details. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customers</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <Input
            placeholder="Search by ID, name, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </div>

        {isLoading ? (
          <div className="text-center py-8">Loading customers...</div>
        ) : filteredCustomers.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Loyalty Points</TableHead>
                <TableHead>Credit Balance</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>{customer.id}</TableCell>
                  <TableCell className="font-medium">{customer.name}</TableCell>
                  <TableCell>{customer.email}</TableCell>
                  <TableCell>{customer.loyaltyPoints}</TableCell>
                  <TableCell>${customer.creditBalance.toFixed(2)}</TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" onClick={() => handleViewCustomer(customer.id)}>
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8 text-gray-500">No customers found matching your search.</div>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Customer Details</DialogTitle>
            </DialogHeader>
            {selectedCustomer && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-sm font-medium">ID:</div>
                  <div>{selectedCustomer.id}</div>

                  <div className="text-sm font-medium">Name:</div>
                  <div>{selectedCustomer.name}</div>

                  <div className="text-sm font-medium">Email:</div>
                  <div>{selectedCustomer.email}</div>

                  <div className="text-sm font-medium">Phone:</div>
                  <div>{selectedCustomer.phone}</div>

                  <div className="text-sm font-medium">Loyalty Points:</div>
                  <div>{selectedCustomer.loyaltyPoints}</div>

                  <div className="text-sm font-medium">Credit Balance:</div>
                  <div>${selectedCustomer.creditBalance.toFixed(2)}</div>
                  <div className="col-span-2 pt-2">
                    <Label htmlFor="update-credit" className="text-sm font-medium">Update Credit Balance</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Input
                        id="update-credit"
                        type="number"
                        placeholder="Enter new credit value"
                        value={newCredit}
                        onChange={(e) => setNewCredit(e.target.value)}
                        className="max-w-[160px]"
                      />
                      <Button
                        size="sm"
                        onClick={async () => {
                          const newCreditValue = parseFloat(newCredit)
                          if (isNaN(newCreditValue) || newCreditValue < 0) {
                            toast({ title: "Invalid Value", description: "Please enter a valid credit amount", variant: "destructive" })
                            return
                          }

                          try {
                            await updateCustomerCredits(selectedCustomer.id, newCreditValue)
                            toast({ title: "Success", description: "Credit balance updated." })
                            setIsDialogOpen(false)
                            setNewCredit("")
                            fetchCustomers()
                          } catch (err) {
                            toast({ title: "Error", description: "Failed to update credit.", variant: "destructive" })
                          }
                        }}
                      >
                        Update
                      </Button>
                    </div>
                  </div>

                  
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-medium mb-2">Purchase History</h3>
                  {selectedCustomer.purchaseHistory && selectedCustomer.purchaseHistory.length > 0 ? (
                    <div className="max-h-40 overflow-y-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Amount</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedCustomer.purchaseHistory.map((purchase: any, index: number) => (
                            <TableRow key={index}>
                              <TableCell>{new Date(purchase.date).toLocaleDateString()}</TableCell>
                              <TableCell>${purchase.amount.toFixed(2)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">No purchase history available.</div>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
