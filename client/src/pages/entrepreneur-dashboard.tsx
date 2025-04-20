import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Search, MapPin, FileText, Lightbulb, TrendingUp, ChevronRight, Sliders } from "lucide-react";
import MapBox from "@/components/ui/map-box";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

const EntrepreneurDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("feasibility");
  const [wasteType, setWasteType] = useState("plastic");
  const [investmentLevel, setInvestmentLevel] = useState(500000);
  const [location, setLocation] = useState("Delhi NCR");

  // Fetch real-time data
  const { data: marketData, isLoading: marketLoading } = useQuery({
    queryKey: ['market-data', wasteType, location],
    queryFn: async () => {
      const response = await fetch(`/api/market-analysis?type=${wasteType}&location=${location}`);
      if (!response.ok) throw new Error('Failed to fetch market data');
      return response.json();
    }
  });

  // Save business plan mutation
  const savePlanMutation = useMutation({
    mutationFn: async (planData) => {
      try {
        const response = await fetch('/api/business-plans', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(planData)
        });
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Failed to save business plan');
        }
        
        return response.json();
      } catch (error) {
        toast({
          title: "Error",
          description: error.message || "Failed to save business plan",
          variant: "destructive",
        });
        throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Business plan saved successfully",
      });
    },
  });

  // Real-time feasibility calculation based on market data
  const calculateFeasibilityScore = () => {
    if (!marketData) return 70;

    let score = 60;
    score += (marketData.demandScore || 0) * 0.3;
    score += (marketData.competitionScore || 0) * 0.2;
    score += (marketData.growthPotential || 0) * 0.3;
    score += (marketData.infrastructureScore || 0) * 0.2;

    return Math.min(100, Math.max(0, score));
  };

  const feasibilityScore = calculateFeasibilityScore();
  const scoreColor = 
    feasibilityScore >= 80 ? "text-green-600" : 
    feasibilityScore >= 60 ? "text-amber-600" : 
    "text-red-600";

  const handleDownloadReport = async () => {
    try {
      const response = await fetch('/api/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wasteType,
          location,
          investmentLevel,
          feasibilityScore,
          marketData
        })
      });

      if (!response.ok) throw new Error('Failed to generate report');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `business-report-${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download report",
        variant: "destructive",
      });
    }
  };

  const handleSaveBusinessPlan = () => {
    savePlanMutation.mutate({
      wasteType,
      location,
      investmentLevel,
      feasibilityScore,
      marketData,
      userId: user?.id
    });
  };

  const handleGetConsultation = async () => {
    try {
      const response = await fetch('/api/schedule-consultation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          businessType: wasteType,
          location
        })
      });

      if (!response.ok) throw new Error('Failed to schedule consultation');

      toast({
        title: "Success",
        description: "Consultation request sent successfully. Our team will contact you soon.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to schedule consultation",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Entrepreneur Dashboard</h1>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={handleDownloadReport}>
            <FileText className="w-4 h-4 mr-2" />
            Download Report
          </Button>
          <Button variant="default" size="sm" onClick={handleGetConsultation}>
            <Lightbulb className="w-4 h-4 mr-2" />
            Get Consultation
          </Button>
        </div>
      </div>

      <Tabs defaultValue="feasibility" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="feasibility">
            <TrendingUp className="w-4 h-4 mr-2" />
            Feasibility Analysis
          </TabsTrigger>
          <TabsTrigger value="locations">
            <MapPin className="w-4 h-4 mr-2" />
            Potential Locations
          </TabsTrigger>
          <TabsTrigger value="opportunities">
            <Lightbulb className="w-4 h-4 mr-2" />
            Opportunities
          </TabsTrigger>
        </TabsList>

        <TabsContent value="feasibility" className="mt-0 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recycling Business Feasibility</CardTitle>
                  <CardDescription>
                    Analyze the feasibility of starting a recycling business based on your parameters
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="waste-type">Waste Type</Label>
                      <Select value={wasteType} onValueChange={setWasteType}>
                        <SelectTrigger id="waste-type">
                          <SelectValue placeholder="Select waste type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="plastic">Plastic</SelectItem>
                          <SelectItem value="paper">Paper</SelectItem>
                          <SelectItem value="glass">Glass</SelectItem>
                          <SelectItem value="metal">Metal</SelectItem>
                          <SelectItem value="e-waste">E-Waste</SelectItem>
                          <SelectItem value="organic">Organic</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Select value={location} onValueChange={setLocation}>
                        <SelectTrigger id="location">
                          <SelectValue placeholder="Select location" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Delhi NCR">Delhi NCR</SelectItem>
                          <SelectItem value="Mumbai">Mumbai</SelectItem>
                          <SelectItem value="Bangalore">Bangalore</SelectItem>
                          <SelectItem value="Chennai">Chennai</SelectItem>
                          <SelectItem value="Kolkata">Kolkata</SelectItem>
                          <SelectItem value="Hyderabad">Hyderabad</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="investment">Initial Investment (₹)</Label>
                      <span className="text-sm text-gray-500">₹{investmentLevel.toLocaleString()}</span>
                    </div>
                    <Slider
                      id="investment"
                      min={100000}
                      max={2000000}
                      step={100000}
                      value={[investmentLevel]}
                      onValueChange={(values) => setInvestmentLevel(values[0])}
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>₹1 Lakh</span>
                      <span>₹20 Lakhs</span>
                    </div>
                  </div>

                  <Button className="w-full mt-2" onClick={handleSaveBusinessPlan}>
                    Save Business Plan
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Required Licenses & Permits</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left">License/Permit</th>
                          <th className="px-4 py-2 text-left">Difficulty</th>
                          <th className="px-4 py-2 text-left">Timeframe</th>
                          <th className="px-4 py-2 text-left">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {requiredLicenses.map((license, index) => (
                          <tr key={index} className="bg-white">
                            <td className="px-4 py-3">{license.name}</td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                license.difficulty === "Low"
                                  ? "bg-green-100 text-green-800"
                                  : license.difficulty === "Medium"
                                    ? "bg-amber-100 text-amber-800"
                                    : "bg-red-100 text-red-800"
                              }`}>
                                {license.difficulty}
                              </span>
                            </td>
                            <td className="px-4 py-3">{license.timeframe}</td>
                            <td className="px-4 py-3">
                              <Button variant="ghost" size="sm">Details</Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card className="sticky top-6">
                <CardHeader>
                  <CardTitle>Feasibility Score</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="relative w-32 h-32 mx-auto">
                    <svg className="w-full h-full" viewBox="0 0 100 100">
                      <circle
                        className="text-gray-200"
                        strokeWidth="8"
                        stroke="currentColor"
                        fill="transparent"
                        r="42"
                        cx="50"
                        cy="50"
                      />
                      <circle
                        className={scoreColor}
                        strokeWidth="8"
                        stroke="currentColor"
                        fill="transparent"
                        r="42"
                        cx="50"
                        cy="50"
                        strokeDasharray="264"
                        strokeDashoffset={264 - (264 * feasibilityScore) / 100}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
                      <div>
                        <div className={`text-3xl font-bold ${scoreColor}`}>{feasibilityScore}</div>
                        <div className="text-xs text-gray-500">out of 100</div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 text-left">
                    <h3 className="font-medium mb-2">Assessment Summary</h3>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start">
                        <span className="inline-block w-5 h-5 rounded-full bg-green-100 text-green-800 flex items-center justify-center mr-2 text-xs mt-0.5">✓</span>
                        <span>High demand for {wasteType} recycling in {location}</span>
                      </li>
                      <li className="flex items-start">
                        <span className="inline-block w-5 h-5 rounded-full bg-green-100 text-green-800 flex items-center justify-center mr-2 text-xs mt-0.5">✓</span>
                        <span>Investment level is {investmentLevel >= 500000 ? "sufficient" : "on the lower side but workable"}</span>
                      </li>
                      {wasteType === "plastic" && (
                        <li className="flex items-start">
                          <span className="inline-block w-5 h-5 rounded-full bg-green-100 text-green-800 flex items-center justify-center mr-2 text-xs mt-0.5">✓</span>
                          <span>Government incentives available for plastic recycling</span>
                        </li>
                      )}
                      {wasteType === "e-waste" && (
                        <li className="flex items-start">
                          <span className="inline-block w-5 h-5 rounded-full bg-green-100 text-green-800 flex items-center justify-center mr-2 text-xs mt-0.5">✓</span>
                          <span>E-waste recycling has high profit margins</span>
                        </li>
                      )}
                      {investmentLevel < 300000 && (
                        <li className="flex items-start">
                          <span className="inline-block w-5 h-5 rounded-full bg-red-100 text-red-800 flex items-center justify-center mr-2 text-xs mt-0.5">✗</span>
                          <span>Investment might be insufficient for machinery</span>
                        </li>
                      )}
                    </ul>
                  </div>

                  <Button className="w-full mt-6" onClick={handleDownloadReport}>
                    Download Full Report
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="locations" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Optimal Locations for Recycling Business</CardTitle>
              <CardDescription>
                Explore potential locations for setting up your recycling business
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col-reverse md:flex-row gap-6">
                <div className="md:w-1/3 space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-medium mb-2">Location Filters</h3>
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <Label htmlFor="region">Region</Label>
                        <Select defaultValue="delhi">
                          <SelectTrigger id="region">
                            <SelectValue placeholder="Select region" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="delhi">Delhi NCR</SelectItem>
                            <SelectItem value="mumbai">Mumbai</SelectItem>
                            <SelectItem value="bangalore">Bangalore</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="distance">Max Distance from Waste Sources (km)</Label>
                        <Slider
                          id="distance"
                          min={1}
                          max={50}
                          step={1}
                          defaultValue={[10]}
                        />
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>1 km</span>
                          <span>50 km</span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="landCost">Max Land Cost (₹/sqft)</Label>
                        <Slider
                          id="landCost"
                          min={500}
                          max={5000}
                          step={100}
                          defaultValue={[2000]}
                        />
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>₹500</span>
                          <span>₹5000</span>
                        </div>
                      </div>

                      <Button className="w-full mt-2">
                        <Sliders className="w-4 h-4 mr-2" />
                        Apply Filters
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-medium">Recommended Locations</h3>
                    <div className="space-y-2">
                      {[1, 2, 3].map((id) => (
                        <div key={id} className="p-3 bg-white border rounded-lg">
                          <div className="flex justify-between">
                            <h4 className="font-medium">Industrial Area {id}</h4>
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                              {90 - (id * 5)}% Match
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">Okhla Industrial Area, Delhi</p>
                          <div className="flex justify-between mt-2 text-xs text-gray-500">
                            <span>8 km from sources</span>
                            <span>₹{1800 + (id * 200)}/sqft</span>
                          </div>
                          <Button variant="ghost" size="sm" className="w-full mt-2">
                            View Details
                            <ChevronRight className="h-4 w-4 ml-2" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="md:w-2/3">
                  <div className="h-[500px]">
                    <MapBox title="" fullWidth />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="opportunities" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {opportunities.map((opportunity, index) => (
              <Card key={index} className="overflow-hidden">
                <div className="h-2 bg-teal-600"></div>
                <CardHeader>
                  <CardTitle>{opportunity.title}</CardTitle>
                  <CardDescription>{opportunity.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Initial Investment</span>
                      <span className="font-medium">{opportunity.investment}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Expected ROI</span>
                      <span className="font-medium text-green-600">{opportunity.roi}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Market Demand</span>
                      <span className="font-medium">{opportunity.demand}</span>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t">
                    <Button className="w-full">View Business Plan</Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            <Card className="overflow-hidden border-dashed border-2 flex flex-col items-center justify-center p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <Search className="h-6 w-6 text-gray-400" />
              </div>
              <h3 className="font-medium mb-2">Custom Opportunity</h3>
              <p className="text-sm text-gray-500 mb-4">
                Not seeing what you're looking for? Search for more recycling opportunities.
              </p>
              <div className="w-full mb-4">
                <Input placeholder="Search opportunities..." />
              </div>
              <Button variant="outline">Find More Opportunities</Button>
            </Card>
          </div>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Government Schemes & Incentives</CardTitle>
              <CardDescription>
                Explore government programs and incentives for recycling entrepreneurs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-1">Swachh Bharat Mission Grants</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    Grants for setting up waste processing units under SBM Urban
                  </p>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-500">Funding Amount</span>
                    <span>Up to ₹35 Lakhs</span>
                  </div>
                  <Button variant="outline" size="sm" className="w-full">View Details</Button>
                </div>

                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-1">MSME Technology Upgradation</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    Subsidies for purchasing recycling equipment and technology
                  </p>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-500">Subsidy</span>
                    <span>15-25% of machinery cost</span>
                  </div>
                  <Button variant="outline" size="sm" className="w-full">View Details</Button>
                </div>

                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-1">GST Tax Benefits</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    Reduced GST rates for recycled products and inputs
                  </p>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-500">GST Reduction</span>
                    <span>5-12% (from 18%)</span>
                  </div>
                  <Button variant="outline" size="sm" className="w-full">View Details</Button>
                </div>

                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-1">Stand-Up India Loan Scheme</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    Low-interest loans for entrepreneurs in green sectors
                  </p>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-500">Loan Amount</span>
                    <span>₹10 Lakhs - ₹1 Crore</span>
                  </div>
                  <Button variant="outline" size="sm" className="w-full">View Details</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {marketLoading && (
        <div className="text-center py-4">
          Loading market data...
        </div>
      )}

      {savePlanMutation.isError && (
        <div className="text-red-500 text-center py-2">
          Failed to save business plan. Please try again.
        </div>
      )}
    </div>
  );
};

const requiredLicenses = [
  { name: "Pollution Control Board Consent", difficulty: "Medium", timeframe: "45-60 days" },
  { name: "Municipal Corporation License", difficulty: "Low", timeframe: "15-30 days" },
  { name: "GST Registration", difficulty: "Low", timeframe: "7 days" },
  { name: "Factory License", difficulty: "Medium", timeframe: "30-45 days" },
];

const opportunities = [
  {
    title: "Plastic Recycling Unit",
    description: "Convert waste plastic into pellets/granules for manufacturing",
    investment: "₹5-10 Lakhs",
    roi: "15-20% yearly",
    demand: "High"
  },
  {
    title: "E-Waste Processing Center",
    description: "Extract valuable metals and components from electronics",
    investment: "₹12-18 Lakhs",
    roi: "22-28% yearly",
    demand: "Very High"
  },
  {
    title: "Paper Recycling Unit",
    description: "Convert waste paper into recycled paper products",
    investment: "₹4-7 Lakhs",
    roi: "12-18% yearly",
    demand: "Medium"
  },
];

export default EntrepreneurDashboard;