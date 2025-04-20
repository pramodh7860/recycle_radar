import express, { type Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  insertUserSchema,
  insertWasteCollectionSchema,
  insertTransactionSchema,
  insertComplaintSchema,
  insertCollectionZoneSchema
} from "@shared/schema";
import { z } from "zod";
import { setupAuth } from "./auth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  setupAuth(app);
  
  const apiRouter = express.Router();

  // Waste Collection routes
  apiRouter.get("/waste-collections", async (req: Request, res: Response) => {
    try {
      const userId = req.query.userId ? Number(req.query.userId) : undefined;
      const collections = await storage.getWasteCollections(userId);
      return res.status(200).json(collections);
    } catch (error) {
      return res.status(500).json({ message: "Error fetching waste collections" });
    }
  });

  apiRouter.get("/waste-collections/:id", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const collection = await storage.getWasteCollection(id);
      
      if (!collection) {
        return res.status(404).json({ message: "Waste collection not found" });
      }
      
      return res.status(200).json(collection);
    } catch (error) {
      return res.status(500).json({ message: "Error fetching waste collection" });
    }
  });

  apiRouter.post("/waste-collections", async (req: Request, res: Response) => {
    try {
      const collectionData = insertWasteCollectionSchema.parse(req.body);
      const collection = await storage.createWasteCollection(collectionData);
      return res.status(201).json(collection);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid waste collection data", errors: error.errors });
      }
      return res.status(500).json({ message: "Error creating waste collection" });
    }
  });

  // Transaction routes
  apiRouter.get("/transactions", async (req: Request, res: Response) => {
    try {
      const userId = req.query.userId ? Number(req.query.userId) : undefined;
      const transactions = await storage.getTransactions(userId);
      return res.status(200).json(transactions);
    } catch (error) {
      return res.status(500).json({ message: "Error fetching transactions" });
    }
  });

  apiRouter.get("/transactions/:id", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const transaction = await storage.getTransaction(id);
      
      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }
      
      return res.status(200).json(transaction);
    } catch (error) {
      return res.status(500).json({ message: "Error fetching transaction" });
    }
  });

  apiRouter.post("/transactions", async (req: Request, res: Response) => {
    try {
      const transactionData = insertTransactionSchema.parse(req.body);
      const transaction = await storage.createTransaction(transactionData);
      return res.status(201).json(transaction);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid transaction data", errors: error.errors });
      }
      return res.status(500).json({ message: "Error creating transaction" });
    }
  });

  apiRouter.patch("/transactions/:id/status", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const { status } = req.body;
      
      if (!status || !['completed', 'processing', 'cancelled'].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      const transaction = await storage.updateTransactionStatus(id, status);
      
      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }
      
      return res.status(200).json(transaction);
    } catch (error) {
      return res.status(500).json({ message: "Error updating transaction status" });
    }
  });

  // Complaint routes
  apiRouter.get("/complaints", async (req: Request, res: Response) => {
    try {
      const userId = req.query.userId ? Number(req.query.userId) : undefined;
      const complaints = await storage.getComplaints(userId);
      return res.status(200).json(complaints);
    } catch (error) {
      return res.status(500).json({ message: "Error fetching complaints" });
    }
  });

  apiRouter.get("/complaints/:id", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const complaint = await storage.getComplaint(id);
      
      if (!complaint) {
        return res.status(404).json({ message: "Complaint not found" });
      }
      
      return res.status(200).json(complaint);
    } catch (error) {
      return res.status(500).json({ message: "Error fetching complaint" });
    }
  });

  apiRouter.post("/complaints", async (req: Request, res: Response) => {
    try {
      const complaintData = insertComplaintSchema.parse(req.body);
      const complaint = await storage.createComplaint(complaintData);
      return res.status(201).json(complaint);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid complaint data", errors: error.errors });
      }
      return res.status(500).json({ message: "Error creating complaint" });
    }
  });

  apiRouter.patch("/complaints/:id/status", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const { status } = req.body;
      
      if (!status || !['pending', 'in_progress', 'resolved'].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      const complaint = await storage.updateComplaintStatus(id, status);
      
      if (!complaint) {
        return res.status(404).json({ message: "Complaint not found" });
      }
      
      return res.status(200).json(complaint);
    } catch (error) {
      return res.status(500).json({ message: "Error updating complaint status" });
    }
  });

  // Business Plans routes
  apiRouter.post("/business-plans", async (req: Request, res: Response) => {
    try {
      // Validate user is authenticated
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const planData = req.body;
      // Store business plan in database or process it as needed
      // For now, we'll just return success
      return res.status(200).json({ 
        message: "Business plan saved successfully",
        data: planData
      });
    } catch (error) {
      return res.status(500).json({ message: "Error saving business plan" });
    }
  });

  // Collection Zone routes
  apiRouter.get("/collection-zones", async (_req: Request, res: Response) => {
    try {
      const zones = await storage.getCollectionZones();
      return res.status(200).json(zones);
    } catch (error) {
      return res.status(500).json({ message: "Error fetching collection zones" });
    }
  });

  apiRouter.get("/collection-zones/:id", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const zone = await storage.getCollectionZone(id);
      
      if (!zone) {
        return res.status(404).json({ message: "Collection zone not found" });
      }
      
      return res.status(200).json(zone);
    } catch (error) {
      return res.status(500).json({ message: "Error fetching collection zone" });
    }
  });

  apiRouter.post("/collection-zones", async (req: Request, res: Response) => {
    try {
      const zoneData = insertCollectionZoneSchema.parse(req.body);
      const zone = await storage.createCollectionZone(zoneData);
      return res.status(201).json(zone);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid collection zone data", errors: error.errors });
      }
      return res.status(500).json({ message: "Error creating collection zone" });
    }
  });

  // Register the API router with prefix
  app.use("/api", apiRouter);

  const httpServer = createServer(app);
  return httpServer;
}
