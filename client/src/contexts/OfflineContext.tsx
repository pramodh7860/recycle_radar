import React, { createContext, useContext, useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { initializeDb, syncData } from "@/lib/db";

interface OfflineContextType {
  isOnline: boolean;
  pendingChanges: number;
  syncNow: () => Promise<void>;
}

const OfflineContext = createContext<OfflineContextType>({
  isOnline: true,
  pendingChanges: 0,
  syncNow: async () => {},
});

export const useOffline = () => useContext(OfflineContext);

export const OfflineProvider: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingChanges, setPendingChanges] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    // Initialize the database
    initializeDb()
      .then(() => {
        // Check for pending changes on mount
        checkPendingChanges();
      })
      .catch(err => {
        console.error("Failed to initialize offline database:", err);
      });

    // Event listeners for online/offline status
    const handleOnline = () => {
      setIsOnline(true);
      toast({
        title: "You're back online",
        description: "Synchronizing your data...",
      });
      
      // When coming back online, try to sync data
      syncData()
        .then(() => {
          checkPendingChanges();
          toast({
            title: "Sync completed",
            description: "Your data has been synchronized",
          });
        })
        .catch(err => {
          console.error("Sync failed:", err);
          toast({
            title: "Sync failed",
            description: "Some data couldn't be synchronized",
            variant: "destructive",
          });
        });
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast({
        title: "You're offline",
        description: "Don't worry, your data is being saved locally",
        variant: "warning",
      });
    };

    // Check for pending changes periodically
    const intervalId = setInterval(checkPendingChanges, 30000);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      clearInterval(intervalId);
    };
  }, [toast]);

  const checkPendingChanges = async () => {
    try {
      const db = await initializeDb();
      const pendingWasteCollections = await db.pendingWasteCollections.count();
      const pendingComplaints = await db.pendingComplaints.count();
      setPendingChanges(pendingWasteCollections + pendingComplaints);
    } catch (err) {
      console.error("Failed to check pending changes:", err);
    }
  };

  const syncNow = async () => {
    if (!isOnline) {
      toast({
        title: "You're offline",
        description: "Please connect to the internet to sync",
        variant: "warning",
      });
      return;
    }

    toast({
      title: "Syncing...",
      description: "Uploading your pending changes",
    });

    try {
      await syncData();
      await checkPendingChanges();
      toast({
        title: "Sync completed",
        description: "Your data has been synchronized",
      });
    } catch (err) {
      console.error("Manual sync failed:", err);
      toast({
        title: "Sync failed",
        description: "Some data couldn't be synchronized",
        variant: "destructive",
      });
    }
  };

  return (
    <OfflineContext.Provider value={{ isOnline, pendingChanges, syncNow }}>
      {children}
    </OfflineContext.Provider>
  );
};
