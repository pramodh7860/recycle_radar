import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Inbox, ShoppingCart, BarChart2, FileText, Factory, Users } from "lucide-react";
import { Transaction, WasteCollection } from "@shared/schema";
import MapBox from "@/components/ui/map-box";
// import { Chart } from "@/components/ui/chart";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const FactoryDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch transactions
  const { data: transactions = [], isLoading: transactionsLoading } = useQuery<Transaction[]>({
    queryKey: ['/api/transactions'],
  });

  // Fetch waste collections
  const { data: wasteCollections = [], isLoading: collectionsLoading } = useQuery<WasteCollection[]>({
    queryKey: ['/api/waste-collections'],
  });

  // Create chart data
  const purchasesByType = wasteCollections.reduce((acc, collection) => {
    const existing = acc.find(item => item.name === collection.wasteType);
    if (existing) {
      existing.value += collection.quantity;
    } else {
      acc.push({
        name: collection.wasteType,
        value: collection.quantity
      });
    }
    return acc;
  }, [] as { name: string; value: number }[]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Factory Dashboard</h1>
        <div className="flex space-x-2">
          <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  // Generate report data
                  const reportData = {
                    transactions,
                    wasteCollections,
                    totalSpent: transactions.reduce((sum, t) => sum + t.amount, 0),
                    totalWaste: wasteCollections.reduce((sum, w) => sum + w.quantity, 0)
                  };

                  // Create and download CSV
                  const csv = `Transaction ID,Date,Amount,Status\n${
                    transactions.map(t => 
                      `${t.id},${new Date(t.createdAt).toLocaleDateString()},${t.amount},${t.status}`
                    ).join('\n')}`;

                  const blob = new Blob([csv], { type: 'text/csv' });
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'factory-report.csv';
                  a.click();
                }}
              >
                <FileText className="w-4 h-4 mr-2" />
                Reports
              </Button>
          <Dialog>
                <DialogTrigger asChild>
                  <Button variant="default" size="sm">
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Purchase Waste
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Purchase Waste</DialogTitle>
                    <DialogDescription>Enter waste purchase details</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    // Submit purchase
                    fetch('/api/transactions', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        wasteType: formData.get('wasteType'),
                        quantity: Number(formData.get('quantity')),
                        amount: Number(formData.get('amount')),
                        pricePerKg: Number(formData.get('pricePerKg')),
                        sellerId: Number(formData.get('sellerId'))
                      })
                    });
                  }}>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Waste Type</Label>
                        <Select name="wasteType">
                          <SelectTrigger>
                            <SelectValue placeholder="Select waste type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="plastic">Plastic</SelectItem>
                            <SelectItem value="paper">Paper</SelectItem>
                            <SelectItem value="metal">Metal</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Quantity (kg)</Label>
                        <Input type="number" name="quantity" min="1" />
                      </div>
                      <div className="space-y-2">
                        <Label>Price per kg (₹)</Label>
                        <Input type="number" name="pricePerKg" min="1" />
                      </div>
                      <div className="space-y-2">
                        <Label>Seller ID</Label>
                        <Input type="number" name="sellerId" min="1" placeholder="Enter vendor ID" />
                      </div>
                      <div className="space-y-2">
                        <Label>Amount (₹)</Label>
                        <Input type="number" name="amount" min="1" />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit" onClick={async (e) => {
                        e.preventDefault();
                        const form = e.currentTarget.closest('form');
                        if (!form) return;
                        
                        const formData = new FormData(form);
                        try {
                          await fetch('/api/transactions', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              sellerId: Number(formData.get('sellerId')),
                              amount: Number(formData.get('amount')),
                              status: 'pending'
                            })
                          });
                          window.location.reload();
                        } catch (error) {
                          console.error('Failed to create transaction:', error);
                        }
                      }}>
                        Confirm Purchase
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-blue-700 font-medium">Purchases</p>
              <h3 className="text-3xl font-bold mt-1">{transactions.length}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-purple-700 font-medium">Total Spent</p>
              <h3 className="text-3xl font-bold mt-1">₹{transactions.reduce((sum, t) => sum + t.amount, 0).toLocaleString()}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-green-700 font-medium">Waste Processed</p>
              <h3 className="text-3xl font-bold mt-1">{wasteCollections.reduce((sum, w) => sum + w.quantity, 0)} kg</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-amber-700 font-medium">Vendors</p>
              <h3 className="text-3xl font-bold mt-1">{new Set(wasteCollections.map(w => w.userId)).size}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="overview">
            <BarChart2 className="w-4 h-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="purchases">
            <ShoppingCart className="w-4 h-4 mr-2" />
            Purchases
          </TabsTrigger>
          <TabsTrigger value="vendors">
            <Users className="w-4 h-4 mr-2" />
            Vendors
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-0 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Waste Purchases by Type</CardTitle>
              </CardHeader>
              <CardContent>
                {collectionsLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin h-8 w-8 border-4 border-blue-700 border-t-transparent rounded-full"></div>
                  </div>
                ) : purchasesByType.length > 0 ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={purchasesByType}>
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill="#3b82f6" name="Quantity (kg)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No purchase data available</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Factory Location</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <MapBox title="Factory Location Map" description="Interactive map showing factory location and collection zones" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {transactionsLoading ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin h-8 w-8 border-4 border-blue-700 border-t-transparent rounded-full"></div>
                </div>
              ) : transactions.length > 0 ? (
                <div className="divide-y">
                  {transactions.slice(0, 5).map((transaction) => (
                    <div key={transaction.id} className="py-3 flex justify-between items-center">
                      <div>
                        <div className="font-medium">Purchase #{transaction.id}</div>
                        <div className="text-sm text-gray-500">
                          {new Date(transaction.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">₹{transaction.amount}</div>
                        <div className={`text-sm ${
                          transaction.status === 'completed' 
                            ? 'text-green-600' 
                            : transaction.status === 'pending' 
                              ? 'text-amber-600' 
                              : 'text-gray-600'
                        }`}>
                          {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No transactions found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="purchases" className="mt-0">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Waste Purchases</CardTitle>
              <Button variant="outline" size="sm">
                <FileText className="w-4 h-4 mr-2" />
                Export
              </Button>
            </CardHeader>
            <CardContent>
              {transactionsLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin h-8 w-8 border-4 border-blue-700 border-t-transparent rounded-full"></div>
                </div>
              ) : transactions.length > 0 ? (
                <div className="relative overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-gray-700 bg-gray-50">
                      <tr>
                        <th className="px-4 py-3">ID</th>
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3">Vendor</th>
                        <th className="px-4 py-3">Amount</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((transaction) => (
                        <tr key={transaction.id} className="bg-white border-b">
                          <td className="px-4 py-3 font-medium">{transaction.id}</td>
                          <td className="px-4 py-3">{new Date(transaction.createdAt).toLocaleDateString()}</td>
                          <td className="px-4 py-3">Vendor #{transaction.sellerId}</td>
                          <td className="px-4 py-3 font-medium">₹{transaction.amount}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              transaction.status === 'completed' 
                                ? 'bg-green-100 text-green-800' 
                                : transaction.status === 'pending' 
                                  ? 'bg-amber-100 text-amber-800' 
                                  : 'bg-gray-100 text-gray-800'
                            }`}>
                              {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <Button variant="ghost" size="sm">View</Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No purchase transactions found</p>
                  <Button className="mt-4" variant="default" size="sm">
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Make a Purchase
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vendors" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Vendor Network</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 mb-4 bg-blue-50 rounded-lg">
                <Factory className="h-12 w-12 mx-auto text-blue-600 mb-2" />
                <h3 className="text-lg font-bold">Connect with Waste Vendors</h3>
                <p className="text-gray-600 max-w-md mx-auto mt-2">
                  Expand your recycling network by connecting with more waste vendors in your area
                </p>
                <Button className="mt-4">Find Vendors</Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                {/* Static vendors for now */}
                {[1, 2, 3].map((id) => (
                  <Card key={id} className="overflow-hidden">
                    <div className="h-2 bg-blue-600"></div>
                    <CardContent className="pt-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                          <Users className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">Vendor #{id}</h4>
                          <p className="text-sm text-gray-500">Delhi Region</p>
                        </div>
                      </div>
                      <div className="mt-4 text-sm">
                        <div className="flex justify-between py-1">
                          <span className="text-gray-600">Waste Types:</span>
                          <span>Plastic, Paper</span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className="text-gray-600">Collections:</span>
                          <span>24</span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className="text-gray-600">Rating:</span>
                          <span>★★★★☆</span>
                        </div>
                      </div>
                      <Button variant="outline" className="w-full mt-4" size="sm">View Profile</Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FactoryDashboard;