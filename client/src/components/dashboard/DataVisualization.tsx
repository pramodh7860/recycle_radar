import { useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WasteCollection } from "@shared/schema";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface DataVisualizationProps {
  wasteCollections: WasteCollection[];
  isLoading: boolean;
  title?: string;
  fullWidth?: boolean;
}

const DataVisualization = ({ 
  wasteCollections, 
  isLoading, 
  title = "Waste Collection Analytics",
  fullWidth = false
}: DataVisualizationProps) => {
  
  // Generate waste by type data
  const wasteByTypeData = useMemo(() => {
    const typeCounts: Record<string, number> = {};
    
    wasteCollections.forEach(waste => {
      const type = waste.wasteType;
      typeCounts[type] = (typeCounts[type] || 0) + waste.quantity;
    });
    
    return Object.entries(typeCounts).map(([name, value]) => ({
      name: name.replace('_', ' ').toUpperCase(),
      value: Number(value.toFixed(2))
    }));
  }, [wasteCollections]);
  
  // Generate monthly trend data
  const monthlyTrendData = useMemo(() => {
    // Create a map to store waste collection by month
    const monthlyData: Record<string, number> = {};
    
    wasteCollections.forEach(waste => {
      const date = new Date(waste.createdAt);
      const monthYear = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      
      monthlyData[monthYear] = (monthlyData[monthYear] || 0) + waste.quantity;
    });
    
    // Convert to array and sort by date
    return Object.entries(monthlyData)
      .map(([month, total]) => ({
        month,
        total: Number(total.toFixed(2))
      }))
      .sort((a, b) => {
        const dateA = new Date(a.month);
        const dateB = new Date(b.month);
        return dateA.getTime() - dateB.getTime();
      });
  }, [wasteCollections]);
  
  // Generate zone data
  const zoneData = useMemo(() => {
    const zoneMap: Record<string, number> = {};
    
    wasteCollections.forEach(waste => {
      const zone = waste.collectionZone;
      zoneMap[zone] = (zoneMap[zone] || 0) + waste.quantity;
    });
    
    return Object.entries(zoneMap).map(([name, value]) => ({
      name: name.replace('zone_', 'Zone '),
      value: Number(value.toFixed(2))
    }));
  }, [wasteCollections]);
  
  // Colors for charts
  const CHART_COLORS = [
    "#2E7D32", // primary green
    "#0288D1", // secondary blue
    "#00BFA5", // accent teal
    "#F57C00", // orange
    "#D32F2F", // red
    "#7B1FA2"  // purple
  ];
  
  return (
    <Card className={fullWidth ? "w-full" : ""}>
      <CardHeader className="border-b border-gray-200 p-4">
        <CardTitle className="font-inter font-medium text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-80">
            <div className="animate-spin h-8 w-8 border-4 border-green-700 border-t-transparent rounded-full"></div>
          </div>
        ) : wasteCollections.length === 0 ? (
          <div className="text-center h-80 flex items-center justify-center">
            <div className="text-gray-500">
              No data available for visualization
            </div>
          </div>
        ) : (
          <Tabs defaultValue="waste-types">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="waste-types">By Waste Type</TabsTrigger>
              <TabsTrigger value="trends">Monthly Trends</TabsTrigger>
              <TabsTrigger value="zones">By Zone</TabsTrigger>
            </TabsList>
            
            <TabsContent value="waste-types" className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={wasteByTypeData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" width={100} />
                  <Tooltip 
                    formatter={(value: number) => [`${value.toFixed(2)} kg`, 'Quantity']}
                    labelStyle={{ fontWeight: 'bold' }}
                  />
                  <Bar dataKey="value" fill="#2E7D32" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </TabsContent>
            
            <TabsContent value="trends" className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: number) => [`${value.toFixed(2)} kg`, 'Quantity']}
                    labelStyle={{ fontWeight: 'bold' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="total" 
                    stroke="#0288D1" 
                    strokeWidth={2}
                    dot={{ fill: '#0288D1', strokeWidth: 2 }}
                    activeDot={{ r: 6, fill: '#0288D1' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </TabsContent>
            
            <TabsContent value="zones" className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={zoneData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {zoneData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => [`${value.toFixed(2)} kg`, 'Quantity']}
                    labelStyle={{ fontWeight: 'bold' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
};

export default DataVisualization;
