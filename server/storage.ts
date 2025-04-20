import { 
  users, type User, type InsertUser,
  wasteCollections, type WasteCollection, type InsertWasteCollection,
  transactions, type Transaction, type InsertTransaction,
  complaints, type Complaint, type InsertComplaint,
  collectionZones, type CollectionZone, type InsertCollectionZone
} from "@shared/schema";
import { db } from "./db";
import { eq, or } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Waste Collection methods
  getWasteCollections(userId?: number): Promise<WasteCollection[]>;
  getWasteCollection(id: number): Promise<WasteCollection | undefined>;
  createWasteCollection(wasteCollection: InsertWasteCollection): Promise<WasteCollection>;
  
  // Transaction methods
  getTransactions(userId?: number): Promise<Transaction[]>;
  getTransaction(id: number): Promise<Transaction | undefined>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransactionStatus(id: number, status: string): Promise<Transaction | undefined>;
  
  // Complaint methods
  getComplaints(userId?: number): Promise<Complaint[]>;
  getComplaint(id: number): Promise<Complaint | undefined>;
  createComplaint(complaint: InsertComplaint): Promise<Complaint>;
  updateComplaintStatus(id: number, status: string): Promise<Complaint | undefined>;
  
  // Collection Zone methods
  getCollectionZones(): Promise<CollectionZone[]>;
  getCollectionZone(id: number): Promise<CollectionZone | undefined>;
  createCollectionZone(zone: InsertCollectionZone): Promise<CollectionZone>;
  
  // Session store
  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    const PostgresStore = connectPg(session);
    this.sessionStore = new PostgresStore({
      pool,
      tableName: 'session',
      createTableIfMissing: true,
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Waste Collection methods
  async getWasteCollections(userId?: number): Promise<WasteCollection[]> {
    if (userId) {
      return await db.select().from(wasteCollections).where(eq(wasteCollections.userId, userId));
    }
    return await db.select().from(wasteCollections);
  }

  async getWasteCollection(id: number): Promise<WasteCollection | undefined> {
    const [wasteCollection] = await db.select().from(wasteCollections).where(eq(wasteCollections.id, id));
    return wasteCollection;
  }

  async createWasteCollection(insertWasteCollection: InsertWasteCollection): Promise<WasteCollection> {
    const [wasteCollection] = await db.insert(wasteCollections).values(insertWasteCollection).returning();
    return wasteCollection;
  }

  // Transaction methods
  async getTransactions(userId?: number): Promise<Transaction[]> {
    if (userId) {
      return await db.select().from(transactions).where(
        or(
          eq(transactions.sellerId, userId),
          eq(transactions.buyerId, userId)
        )
      );
    }
    return await db.select().from(transactions);
  }

  async getTransaction(id: number): Promise<Transaction | undefined> {
    const [transaction] = await db.select().from(transactions).where(eq(transactions.id, id));
    return transaction;
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const [transaction] = await db.insert(transactions).values(insertTransaction).returning();
    return transaction;
  }

  async updateTransactionStatus(id: number, status: string): Promise<Transaction | undefined> {
    const [transaction] = await db
      .update(transactions)
      .set({ status })
      .where(eq(transactions.id, id))
      .returning();
    return transaction;
  }

  // Complaint methods
  async getComplaints(userId?: number): Promise<Complaint[]> {
    if (userId) {
      return await db.select().from(complaints).where(eq(complaints.userId, userId));
    }
    return await db.select().from(complaints);
  }

  async getComplaint(id: number): Promise<Complaint | undefined> {
    const [complaint] = await db.select().from(complaints).where(eq(complaints.id, id));
    return complaint;
  }

  async createComplaint(insertComplaint: InsertComplaint): Promise<Complaint> {
    const [complaint] = await db.insert(complaints).values(insertComplaint).returning();
    return complaint;
  }

  async updateComplaintStatus(id: number, status: string): Promise<Complaint | undefined> {
    const [complaint] = await db
      .update(complaints)
      .set({ status })
      .where(eq(complaints.id, id))
      .returning();
    return complaint;
  }

  // Collection Zone methods
  async getCollectionZones(): Promise<CollectionZone[]> {
    return await db.select().from(collectionZones);
  }

  async getCollectionZone(id: number): Promise<CollectionZone | undefined> {
    const [zone] = await db.select().from(collectionZones).where(eq(collectionZones.id, id));
    return zone;
  }

  async createCollectionZone(insertZone: InsertCollectionZone): Promise<CollectionZone> {
    const [zone] = await db.insert(collectionZones).values(insertZone).returning();
    return zone;
  }
}

export const storage = new DatabaseStorage();