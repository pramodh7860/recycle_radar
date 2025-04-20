import { useEffect, useState } from "react";
import { useOffline } from "@/contexts/OfflineContext";
import { AlertCircle, Wifi, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";

const OfflineNotification = () => {
  const { isOnline, pendingChanges, syncNow } = useOffline();
  const [visible, setVisible] = useState(false);
  const [autoHideTimer, setAutoHideTimer] = useState<NodeJS.Timeout | null>(null);
  
  // Show notification when offline status changes
  useEffect(() => {
    // Clear any existing timer
    if (autoHideTimer) {
      clearTimeout(autoHideTimer);
    }
    
    // Show notification
    setVisible(true);
    
    // Set auto-hide timer (5 seconds)
    const timer = setTimeout(() => {
      setVisible(false);
    }, 5000);
    
    setAutoHideTimer(timer);
    
    // Clean up timer on unmount
    return () => {
      if (autoHideTimer) {
        clearTimeout(autoHideTimer);
      }
    };
  }, [isOnline]);
  
  // Show notification when there are pending changes and we're back online
  useEffect(() => {
    if (isOnline && pendingChanges > 0) {
      setVisible(true);
      
      // Set auto-hide timer (5 seconds)
      const timer = setTimeout(() => {
        setVisible(false);
      }, 5000);
      
      setAutoHideTimer(timer);
      
      return () => {
        if (timer) {
          clearTimeout(timer);
        }
      };
    }
  }, [isOnline, pendingChanges]);
  
  const handleClose = () => {
    setVisible(false);
    if (autoHideTimer) {
      clearTimeout(autoHideTimer);
      setAutoHideTimer(null);
    }
  };
  
  // Keep notification visible while user is hovering over it
  const handleMouseEnter = () => {
    if (autoHideTimer) {
      clearTimeout(autoHideTimer);
      setAutoHideTimer(null);
    }
  };
  
  // Start auto-hide timer when user leaves the notification
  const handleMouseLeave = () => {
    const timer = setTimeout(() => {
      setVisible(false);
    }, 2000);
    
    setAutoHideTimer(timer);
  };
  
  if (!visible) {
    return null;
  }
  
  return (
    <div 
      className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg transition-all duration-300 z-50 flex items-center ${
        isOnline 
          ? (pendingChanges > 0 ? 'bg-blue-600 text-white' : 'bg-green-600 text-white') 
          : 'bg-yellow-500 text-white'
      }`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {isOnline ? (
        pendingChanges > 0 ? (
          <>
            <AlertCircle className="h-5 w-5 mr-2" />
            <div>
              <p className="font-medium">Offline changes detected</p>
              <p className="text-sm">You have {pendingChanges} pending changes to sync</p>
              <Button 
                variant="secondary" 
                size="sm" 
                className="mt-2 bg-white text-blue-600 hover:bg-blue-50"
                onClick={() => {
                  syncNow();
                  handleClose();
                }}
              >
                Sync Now
              </Button>
            </div>
          </>
        ) : (
          <>
            <Wifi className="h-5 w-5 mr-2" />
            <div>
              <p className="font-medium">You're online</p>
              <p className="text-sm">All your data is up to date</p>
            </div>
          </>
        )
      ) : (
        <>
          <WifiOff className="h-5 w-5 mr-2" />
          <div>
            <p className="font-medium">You're offline</p>
            <p className="text-sm">Don't worry, your data is being saved locally</p>
          </div>
        </>
      )}
      
      <button 
        className="ml-4 text-white opacity-70 hover:opacity-100"
        onClick={handleClose}
      >
        ✕
      </button>
    </div>
  );
};

export default OfflineNotification;
