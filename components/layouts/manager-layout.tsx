"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { BarChart, Package, Store, LogOut, Settings, ShoppingBag, Users, Tag } from "lucide-react"

interface ManagerLayoutProps {
  children: React.ReactNode
}

export default function ManagerLayout({ children }: ManagerLayoutProps) {
  const [username, setUsername] = useState("")
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const user = localStorage.getItem("user")
    if (!user) {
      router.push("/")
    } else {
      const userData = JSON.parse(user)
      if (userData.role !== "manager") {
        router.push("/")
      } else {
        setUsername(userData.username)
      }
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("user")
    router.push("/")
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold">SNU-Mart Manager Portal</h1>
          <div className="flex items-center space-x-4">
            <span>Welcome, {username}</span>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        <aside className="w-64 bg-gray-100 border-r">
          <nav className="p-4 space-y-2">
            <Link href="/manager/dashboard">
              <Button
                variant={pathname === "/manager/dashboard" ? "default" : "ghost"}
                className="w-full justify-start"
              >
                <BarChart className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
            </Link>
            <Link href="/manager/products">
              <Button variant={pathname === "/manager/products" ? "default" : "ghost"} className="w-full justify-start">
                <Package className="h-4 w-4 mr-2" />
                Products
              </Button>
            </Link>
            <Link href="/manager/inventory">
              <Button
                variant={pathname === "/manager/inventory" ? "default" : "ghost"}
                className="w-full justify-start"
              >
                <ShoppingBag className="h-4 w-4 mr-2" />
                Inventory
              </Button>
            </Link>
            <Link href="/manager/customers">
              <Button
                variant={pathname === "/manager/customers" ? "default" : "ghost"}
                className="w-full justify-start"
              >
                <Users className="h-4 w-4 mr-2" />
                Customers
              </Button>
            </Link>
            <Link href="/manager/pricing">
              <Button variant={pathname === "/manager/pricing" ? "default" : "ghost"} className="w-full justify-start">
                <Tag className="h-4 w-4 mr-2" />
                Pricing
              </Button>
            </Link>
            <Link href="/manager/store-layout">
              <Button
                variant={pathname === "/manager/store-layout" ? "default" : "ghost"}
                className="w-full justify-start"
              >
                <Store className="h-4 w-4 mr-2" />
                Store Layout
              </Button>
            </Link>
            <Link href="/manager/reports">
              <Button variant={pathname === "/manager/reports" ? "default" : "ghost"} className="w-full justify-start">
                <BarChart className="h-4 w-4 mr-2" />
                Reports
              </Button>
            </Link>
            <Link href="/manager/settings">
              <Button variant={pathname === "/manager/settings" ? "default" : "ghost"} className="w-full justify-start">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </Link>
          </nav>
        </aside>

        <main className="flex-1 bg-gray-50">{children}</main>
      </div>
    </div>
  )
}
