import React from 'react';
import ThreeBackground from '@/components/ui/three-background';

interface DarkLayoutProps {
  children: React.ReactNode;
}

const DarkLayout: React.FC<DarkLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-black text-gray-100 relative overflow-hidden">
      {/* 3D background for the entire page */}
      <div className="fixed inset-0 z-0">
        <ThreeBackground />
      </div>
      
      {/* Glass effect overlay */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-0"></div>
      
      {/* Main content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default DarkLayout;