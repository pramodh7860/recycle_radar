import { useState, useRef } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Camera, MapPin } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useOffline } from "@/contexts/OfflineContext";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { addOfflineComplaint } from "@/lib/db";

const ComplaintForm = () => {
  const { user } = useAuth();
  const { isOnline } = useOffline();
  const { toast } = useToast();
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleBrowseFiles = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const newImages = Array.from(files);
    const newImagePreviewUrls = newImages.map(file => URL.createObjectURL(file));
    
    setImages(prevImages => [...prevImages, ...newImages]);
    setImagePreviewUrls(prevUrls => [...prevUrls, ...newImagePreviewUrls]);
  };

  const handleRemoveImage = (index: number) => {
    // Revoke object URL to prevent memory leaks
    URL.revokeObjectURL(imagePreviewUrls[index]);
    
    setImages(prevImages => prevImages.filter((_, i) => i !== index));
    setImagePreviewUrls(prevUrls => prevUrls.filter((_, i) => i !== index));
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Geolocation not supported",
        description: "Your browser doesn't support location services",
        variant: "destructive",
      });
      return;
    }
    
    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      position => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setIsGettingLocation(false);
        toast({
          title: "Location acquired",
          description: "Your current location has been added to the complaint",
        });
      },
      error => {
        setIsGettingLocation(false);
        toast({
          title: "Location error",
          description: `Failed to get your location: ${error.message}`,
          variant: "destructive",
        });
      }
    );
  };

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to submit a complaint",
        variant: "destructive",
      });
      return;
    }
    
    if (!description.trim()) {
      toast({
        title: "Description required",
        description: "Please provide a description of the waste issue",
        variant: "destructive",
      });
      return;
    }
    
    if (!location) {
      toast({
        title: "Location required",
        description: "Please share your location for the complaint",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const locationString = `${location.lat},${location.lng}`;
      
      const complaintData = {
        userId: user.id,
        description,
        location: locationString,
      };
      
      if (isOnline) {
        // Online submission
        // In a real app, you would upload the images to a server/cloud storage
        // and get back URLs to include in the complaint
        await apiRequest("POST", "/api/complaints", complaintData);
        
        toast({
          title: "Complaint submitted",
          description: "Your complaint has been registered successfully",
        });
      } else {
        // Offline submission - store locally
        let imageData = null;
        
        if (images.length > 0) {
          // For offline storage, convert image to base64
          // This is simplified - in a real app you might use a more efficient method
          const reader = new FileReader();
          const imagePromise = new Promise<string>((resolve) => {
            reader.onloadend = () => {
              resolve(reader.result as string);
            };
            reader.readAsDataURL(images[0]);
          });
          
          imageData = await imagePromise;
        }
        
        await addOfflineComplaint(complaintData, imageData || undefined);
        
        toast({
          title: "Saved offline",
          description: "Your complaint will be submitted when you're online",
        });
      }
      
      // Reset form
      setDescription("");
      setImages([]);
      setImagePreviewUrls([]);
      setLocation(null);
    } catch (error) {
      console.error("Error submitting complaint:", error);
      toast({
        title: "Submission failed",
        description: "There was an error submitting your complaint",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader className="border-b border-gray-200 p-4">
        <CardTitle className="font-inter font-medium text-lg">Swachh Bharat Complaint</CardTitle>
        <p className="text-sm text-gray-600">Report illegal waste dumping</p>
      </CardHeader>
      <CardContent className="p-4">
        {/* Image Upload */}
        <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 flex flex-col items-center justify-center bg-gray-50 mb-4">
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            multiple
            onChange={handleFileChange}
          />
          
          {imagePreviewUrls.length > 0 ? (
            <div className="w-full">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
                {imagePreviewUrls.map((url, index) => (
                  <div key={index} className="relative group">
                    <img 
                      src={url} 
                      alt={`Complaint preview ${index + 1}`}
                      className="h-24 w-full object-cover rounded-md"
                    />
                    <button 
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleRemoveImage(index)}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleBrowseFiles}
                className="w-full"
              >
                <Camera className="h-4 w-4 mr-2" />
                Add More Photos
              </Button>
            </div>
          ) : (
            <>
              <Camera className="h-8 w-8 text-gray-400 mb-2" />
              <p className="text-sm text-center text-gray-600 mb-1">Drag & drop photos here</p>
              <p className="text-xs text-gray-500">or</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleBrowseFiles}
                className="mt-2"
              >
                Browse Files
              </Button>
            </>
          )}
        </div>
        
        {/* Description */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1" htmlFor="description">
            Description
          </label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Describe the illegal dumping issue..."
            className="block w-full"
          />
        </div>
        
        {/* Location */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Location</label>
          <Button
            type="button"
            variant="outline"
            className={`w-full flex items-center justify-between ${
              location ? 'border-green-600 bg-green-50' : ''
            }`}
            onClick={getCurrentLocation}
            disabled={isGettingLocation}
          >
            <div className="flex items-center">
              <MapPin className="h-4 w-4 text-red-500 mr-2" />
              <span className="text-sm">
                {location 
                  ? 'Location shared • Precise location available'
                  : isGettingLocation
                    ? 'Getting your location...'
                    : 'Current Location • Share Precise Location'
                }
              </span>
            </div>
            {isGettingLocation && (
              <div className="animate-spin h-4 w-4 border-2 border-green-600 border-t-transparent rounded-full"></div>
            )}
          </Button>
        </div>
        
        {/* Submit Button */}
        <Button
          type="button"
          className="w-full bg-red-600 hover:bg-red-700 text-white"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
              Submitting...
            </>
          ) : (
            'Submit Complaint'
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ComplaintForm;
