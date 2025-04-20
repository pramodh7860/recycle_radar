import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import MapBox from "@/components/ui/map-box";
import { WasteCollection } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Plus, Upload, ListFilter, MapPin, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

const VendorDashboard = () => {
  const { logoutMutation } = useAuth();
  const [activeTab, setActiveTab] = useState("map");
  
  // Fetch waste collections
  const { data: wasteCollections = [], isLoading } = useQuery<WasteCollection[]>({
    queryKey: ['/api/waste-collections'],
  });

  return (
    <div className="space-y-8">
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Vendor Dashboard</h1>
          <p className="text-gray-400">Manage your waste collections and track recycling progress</p>
        </div>
        <div className="flex space-x-3">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="border-red-800 text-gray-200 hover:bg-red-900/30">
                <ListFilter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Filter Collections</DialogTitle>
                <DialogDescription>Filter waste collections by type and date</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Waste Type</Label>
                  <Select defaultValue="all">
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="plastic_pet">Plastic (PET)</SelectItem>
                      <SelectItem value="plastic_hdpe">Plastic (HDPE)</SelectItem>
                      <SelectItem value="paper">Paper & Cardboard</SelectItem>
                      <SelectItem value="glass">Glass</SelectItem>
                      <SelectItem value="metal">Metal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Date Range</Label>
                  <Input type="date" />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Apply Filters</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="default" size="sm" className="bg-red-700 hover:bg-red-600">
                <Plus className="w-4 h-4 mr-2" />
                Add Waste Collection
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Waste Collection</DialogTitle>
                <DialogDescription>Record your waste collection details</DialogDescription>
              </DialogHeader>
              <form onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const data = {
                  wasteType: formData.get('wasteType'),
                  quantity: Number(formData.get('quantity')),
                  location: formData.get('location')
                };
                
                try {
                  await fetch('/api/waste-collections', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                  });
                  
                  // Refresh the page to show new collection
                  window.location.reload();
                } catch (error) {
                  console.error('Failed to add collection:', error);
                }
              }}>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Waste Type</Label>
                    <Select name="wasteType" defaultValue="plastic">
                      <SelectTrigger>
                        <SelectValue placeholder="Select waste type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="plastic_pet">Plastic (PET)</SelectItem>
                        <SelectItem value="plastic_hdpe">Plastic (HDPE)</SelectItem>
                        <SelectItem value="paper">Paper & Cardboard</SelectItem>
                        <SelectItem value="glass">Glass</SelectItem>
                        <SelectItem value="metal">Metal</SelectItem>
                        <SelectItem value="ewaste">E-Waste</SelectItem>
                        <SelectItem value="organic">Organic Waste</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Quantity (kg)</Label>
                    <Input type="number" name="quantity" min="1" />
                  </div>
                  <div className="space-y-2">
                    <Label>Collection Location</Label>
                    <Input name="location" placeholder="Enter location details" />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Add Collection</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 border-gray-700 shadow-xl overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 transform translate-x-6 -translate-y-6">
            <div className="w-full h-full rounded-full bg-red-600/20 backdrop-blur-xl"></div>
          </div>
          <CardContent className="pt-6 pb-4 relative">
            <div className="text-center">
              <p className="text-gray-400 font-medium text-sm uppercase tracking-wider">Total Collections</p>
              <h3 className="text-3xl font-bold mt-2 text-white">{wasteCollections.length}</h3>
              <div className="mt-3 w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-red-700 to-red-500 rounded-full" 
                     style={{ width: `${Math.min(100, wasteCollections.length * 5)}%` }}></div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 border-gray-700 shadow-xl overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 transform translate-x-6 -translate-y-6">
            <div className="w-full h-full rounded-full bg-red-600/20 backdrop-blur-xl"></div>
          </div>
          <CardContent className="pt-6 pb-4 relative">
            <div className="text-center">
              <p className="text-gray-400 font-medium text-sm uppercase tracking-wider">Pending Payments</p>
              <h3 className="text-3xl font-bold mt-2 text-white">₹3,250</h3>
              <div className="mt-3 w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-red-700 to-red-500 rounded-full" style={{ width: "65%" }}></div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 border-gray-700 shadow-xl overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 transform translate-x-6 -translate-y-6">
            <div className="w-full h-full rounded-full bg-red-600/20 backdrop-blur-xl"></div>
          </div>
          <CardContent className="pt-6 pb-4 relative">
            <div className="text-center">
              <p className="text-gray-400 font-medium text-sm uppercase tracking-wider">Waste Collected</p>
              <h3 className="text-3xl font-bold mt-2 text-white">124 kg</h3>
              <div className="mt-3 w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-red-700 to-red-500 rounded-full" style={{ width: "78%" }}></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs section */}
      <Tabs defaultValue="map" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-6 bg-gray-800/50 p-1 border border-gray-700">
          <TabsTrigger value="map" className="data-[state=active]:bg-red-800 data-[state=active]:text-white">
            <MapPin className="w-4 h-4 mr-2" />
            Collection Map
          </TabsTrigger>
          <TabsTrigger value="list" className="data-[state=active]:bg-red-800 data-[state=active]:text-white">
            <ListFilter className="w-4 h-4 mr-2" />
            My Collections
          </TabsTrigger>
          <TabsTrigger value="voice" className="data-[state=active]:bg-red-800 data-[state=active]:text-white">
            <Upload className="w-4 h-4 mr-2" />
            Voice Uploads
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="map" className="mt-0">
          <MapBox title="Collection Zones & Drop-off Points" />
        </TabsContent>
        
        <TabsContent value="list" className="mt-0">
          <Card className="bg-gray-900/70 border-gray-700 backdrop-blur-md shadow-xl">
            <CardHeader className="border-b border-gray-800 bg-gray-900/60">
              <CardTitle className="text-xl text-gray-200">My Waste Collections</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-12 w-12 animate-spin text-red-500 opacity-70" />
                </div>
              ) : wasteCollections.length > 0 ? (
                <div className="divide-y divide-gray-800">
                  {wasteCollections.map((collection) => (
                    <div key={collection.id} className="p-4 hover:bg-red-900/10 transition-colors">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium text-gray-200 text-lg">{collection.wasteType}</h4>
                          <p className="text-sm text-gray-400 mt-1 flex items-center">
                            <svg className="w-4 h-4 mr-1 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {new Date(collection.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg text-white">{collection.quantity} kg</p>
                          <span className="inline-block px-3 py-1 text-xs rounded-full bg-gradient-to-r from-red-900 to-red-700 text-white border border-red-600/30 shadow-glow mt-1">
                            Collected
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 px-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-900/20 text-red-500 mb-4 border border-red-800/30">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className="text-gray-400 mb-5">No waste collections found. Start adding some!</p>
                  <Button className="bg-red-700 hover:bg-red-600" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Waste Collection
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="voice" className="mt-0">
          <Card className="bg-gray-900/70 border-gray-700 backdrop-blur-md shadow-xl overflow-hidden">
            <CardHeader className="border-b border-gray-800 bg-gray-900/60">
              <CardTitle className="text-xl text-gray-200">Voice Descriptions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-10 px-4">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-red-900 to-red-700 text-white mb-6 shadow-glow animate-pulse-slow">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3 text-white">Record Voice Description</h3>
                <p className="text-gray-400 mb-6 max-w-md mx-auto">
                  Describe your waste collection in your own language. Our system will translate and process your voice input.
                </p>
                <Button variant="default" className="bg-red-700 hover:bg-red-600 py-6 px-6 rounded-full">
                  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                  Start Recording
                </Button>
              </div>
              
              <div className="mt-6 bg-gray-800/50 p-5 rounded-lg border border-gray-700">
                <h4 className="font-medium mb-4 text-gray-300 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                  Recent Voice Uploads
                </h4>
                <div className="text-center py-8 text-gray-500 bg-gray-800/30 rounded-md border border-gray-700/50">
                  <p>No voice uploads found yet</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VendorDashboard;