import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/contexts/AuthContext";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { WASTE_TYPES, COLLECTION_ZONES } from "@/lib/theme";

// Create schema
const wasteCollectionSchema = z.object({
  wasteType: z.string().min(1, "Waste type is required"),
  quantity: z.coerce.number().positive("Quantity must be positive"),
  pricePerKg: z.coerce.number().positive("Price must be positive"),
  collectionZone: z.string().min(1, "Collection zone is required"),
  availableForSale: z.boolean().default(false),
});

type WasteCollectionFormValues = z.infer<typeof wasteCollectionSchema>;

interface WasteCollectionFormProps {
  onSubmit: (data: WasteCollectionFormValues, voiceDescription?: string) => void;
  voiceRecorderComponent?: React.ReactNode;
}

const WasteCollectionForm = ({ 
  onSubmit,
  voiceRecorderComponent
}: WasteCollectionFormProps) => {
  const { user } = useAuth();
  const [voiceDescription, setVoiceDescription] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<WasteCollectionFormValues>({
    resolver: zodResolver(wasteCollectionSchema),
    defaultValues: {
      wasteType: "",
      quantity: 0,
      pricePerKg: 0,
      collectionZone: "",
      availableForSale: false,
    },
  });

  const handleFormSubmit = async (data: WasteCollectionFormValues) => {
    if (!user) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit(data, voiceDescription || undefined);
      
      // Reset form
      form.reset({
        wasteType: "",
        quantity: 0,
        pricePerKg: 0,
        collectionZone: "",
        availableForSale: false,
      });
      setVoiceDescription("");
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVoiceRecordingComplete = (_: Blob, transcription: string) => {
    setVoiceDescription(transcription);
  };

  return (
    <Card>
      <CardHeader className="border-b border-gray-200 p-4">
        <CardTitle className="font-inter font-medium text-lg">Waste Recording</CardTitle>
        <p className="text-sm text-gray-600">Add new waste materials using voice or manual input</p>
      </CardHeader>
      <CardContent className="p-4">
        {/* Voice Recorder */}
        {voiceRecorderComponent}
        
        {/* Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4 mt-4">
            <FormField
              control={form.control}
              name="wasteType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Waste Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select waste type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {WASTE_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity (kg)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="pricePerKg"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price (₹/kg)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="collectionZone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Collection Zone</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select zone" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {COLLECTION_ZONES.map((zone) => (
                        <SelectItem key={zone.value} value={zone.value}>
                          {zone.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="availableForSale"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-1">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Available for immediate sale</FormLabel>
                  </div>
                </FormItem>
              )}
            />
            
            <Button 
              type="submit" 
              className="w-full bg-green-700 hover:bg-green-800"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  Processing...
                </>
              ) : (
                'Record Waste Collection'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default WasteCollectionForm;
