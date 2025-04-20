import { ArrowUp, ArrowDown } from "lucide-react";
import { ReactNode } from "react";
import { Card } from "@/components/ui/card";

interface StatsCardProps {
  title: string;
  value: string;
  icon: ReactNode;
  iconBgColor: string;
  percentageChange?: number;
  goal?: string;
  progressPercentage?: number;
}

const StatsCard = ({
  title,
  value,
  icon,
  iconBgColor,
  percentageChange,
  goal,
  progressPercentage = 0
}: StatsCardProps) => {
  const isPositiveChange = percentageChange !== undefined && percentageChange >= 0;
  
  return (
    <Card className="overflow-hidden">
      <div className="p-5">
        <div className="flex items-center">
          <div className={`flex-shrink-0 rounded-full p-3 ${iconBgColor}`}>
            {icon}
          </div>
          <div className="ml-5">
            <p className="text-sm text-gray-600 font-medium">{title}</p>
            <h3 className="text-2xl font-inter font-bold">{value}</h3>
          </div>
        </div>
        
        {(percentageChange !== undefined || goal) && (
          <div className="mt-4">
            <div className="flex items-center justify-between">
              {percentageChange !== undefined && (
                <span className={`text-xs ${isPositiveChange ? 'text-green-600' : 'text-red-600'} font-medium flex items-center`}>
                  {isPositiveChange ? (
                    <ArrowUp className="h-3 w-3 mr-1" />
                  ) : (
                    <ArrowDown className="h-3 w-3 mr-1" />
                  )}
                  {Math.abs(percentageChange)}% from last month
                </span>
              )}
              
              {goal && (
                <span className="text-xs text-gray-600">Goal: {goal}</span>
              )}
            </div>
            
            {progressPercentage > 0 && (
              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                <div 
                  className="bg-green-700 h-2 rounded-full" 
                  style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                ></div>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

export default StatsCard;
