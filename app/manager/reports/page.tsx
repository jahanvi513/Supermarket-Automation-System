"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "@/components/ui/use-toast"
import ManagerLayout from "@/components/layouts/manager-layout"
import { generateReport } from "@/lib/api"

export default function Reports() {
  const [reportType, setReportType] = useState("sales")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [reportData, setReportData] = useState<any>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleGenerateReport = async () => {
    if (!startDate || !endDate) {
      toast({
        title: "Error",
        description: "Please select both start and end dates.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const data = await generateReport(reportType, startDate, endDate)
      setReportData(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate report. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownloadReport = () => {
    if (!reportData) return

    // Convert report data to CSV
    let csv = ""

    // Add headers
    const headers = Object.keys(reportData.items[0] || {})
    csv += headers.join(",") + "\n"

    // Add rows
    reportData.items.forEach((item: any) => {
      const row = headers.map((header) => {
        const value = item[header]
        // Handle values with commas by wrapping in quotes
        return typeof value === "string" && value.includes(",") ? `"${value}"` : value
      })
      csv += row.join(",") + "\n"
    })

    // Create download link
    const blob = new Blob([csv], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.setAttribute("hidden", "")
    a.setAttribute("href", url)
    a.setAttribute("download", `${reportType}-report-${startDate}-to-${endDate}.csv`)
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const renderReportTable = () => {
    if (!reportData || !reportData.items || reportData.items.length === 0) {
      return <div className="text-center py-8 text-gray-500">No data available for the selected period.</div>
    }

    const headers = Object.keys(reportData.items[0])

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium">{reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report</h3>
            <p className="text-sm text-gray-500">
              {new Date(startDate).toLocaleDateString()} to {new Date(endDate).toLocaleDateString()}
            </p>
          </div>
          <Button onClick={handleDownloadReport}>Download CSV</Button>
        </div>

        <div className="border rounded-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                {headers.map((header) => (
                  <TableHead key={header}>
                    {header.charAt(0).toUpperCase() + header.slice(1).replace(/([A-Z])/g, " $1")}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {reportData.items.map((item: any, index: number) => (
                <TableRow key={index}>
                  {headers.map((header) => (
                    <TableCell key={`${index}-${header}`}>
                      {(typeof item[header] === "number" && header.includes("price")) ||
                      header.includes("amount") ||
                      header.includes("total")
                        ? `$${item[header].toFixed(2)}`
                        : item[header]}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {reportData.summary && (
          <div className="bg-gray-50 p-4 rounded-md">
            <h4 className="font-medium mb-2">Summary</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(reportData.summary).map(([key, value]: [string, any]) => (
                <div key={key} className="bg-white p-3 rounded-md shadow-sm">
                  <div className="text-sm text-gray-500">
                    {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, " $1")}
                  </div>
                  <div className="font-medium">
                    {typeof value === "number" &&
                    (key.includes("price") ||
                      key.includes("amount") ||
                      key.includes("total") ||
                      key.includes("revenue") ||
                      key.includes("profit"))
                      ? `$${value.toFixed(2)}`
                      : value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <ManagerLayout>
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Reports</h1>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Generate Report</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="report-type">Report Type</Label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger id="report-type">
                    <SelectValue placeholder="Select report type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sales">Sales Report</SelectItem>
                    <SelectItem value="inventory">Inventory Report</SelectItem>
                    <SelectItem value="expenses">Expenses Report</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="start-date">Start Date</Label>
                <Input id="start-date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="end-date">End Date</Label>
                <Input id="end-date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>

              <div className="flex items-end">
                <Button className="w-full" onClick={handleGenerateReport} disabled={isLoading}>
                  {isLoading ? "Generating..." : "Generate Report"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {reportData && (
          <Card>
            <CardContent className="pt-6">{renderReportTable()}</CardContent>
          </Card>
        )}
      </div>
    </ManagerLayout>
  )
}
