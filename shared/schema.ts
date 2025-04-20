import { pgTable, text, serial, integer, boolean, timestamp, doublePrecision, primaryKey, foreignKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { z } from "zod";

// User model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull(), // 'vendor', 'factory', 'entrepreneur'
  language: text("language").notNull().default('en'),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

// Waste Collection model
export const wasteCollections = pgTable("waste_collections", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  wasteType: text("waste_type").notNull(),
  quantity: doublePrecision("quantity").notNull(),
  pricePerKg: doublePrecision("price_per_kg").notNull(),
  collectionZone: text("collection_zone").notNull(),
  availableForSale: boolean("available_for_sale").default(false),
  voiceDescription: text("voice_description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertWasteCollectionSchema = createInsertSchema(wasteCollections).omit({
  id: true,
  createdAt: true,
});

// Transactions model
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  sellerId: integer("seller_id").notNull().references(() => users.id),
  buyerId: integer("buyer_id").notNull().references(() => users.id),
  wasteType: text("waste_type").notNull(),
  quantity: doublePrecision("quantity").notNull(),
  amount: doublePrecision("amount").notNull(),
  status: text("status").notNull(), // 'completed', 'processing', 'cancelled'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
});

// Complaints model
export const complaints = pgTable("complaints", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  description: text("description").notNull(),
  location: text("location").notNull(),
  imageUrl: text("image_url"),
  status: text("status").notNull().default('pending'), // 'pending', 'in_progress', 'resolved'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertComplaintSchema = createInsertSchema(complaints).omit({
  id: true,
  status: true,
  createdAt: true,
});

// Collection Zones model
export const collectionZones = pgTable("collection_zones", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  coordinates: text("coordinates").notNull(), // JSON stringify of [lat, lng]
  zoneType: text("zone_type").notNull(), // 'collection', 'processing', 'high_waste'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCollectionZoneSchema = createInsertSchema(collectionZones).omit({
  id: true,
  createdAt: true,
});

// Relationships
export const usersRelations = relations(users, ({ many }) => ({
  wasteCollections: many(wasteCollections),
  salesTransactions: many(transactions, { relationName: "seller" }),
  purchaseTransactions: many(transactions, { relationName: "buyer" }),
  complaints: many(complaints),
}));

export const wasteCollectionsRelations = relations(wasteCollections, ({ one }) => ({
  user: one(users, {
    fields: [wasteCollections.userId],
    references: [users.id],
  }),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  seller: one(users, {
    fields: [transactions.sellerId],
    references: [users.id],
    relationName: "seller",
  }),
  buyer: one(users, {
    fields: [transactions.buyerId],
    references: [users.id],
    relationName: "buyer",
  }),
}));

export const complaintsRelations = relations(complaints, ({ one }) => ({
  user: one(users, {
    fields: [complaints.userId],
    references: [users.id],
  }),
}));

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type WasteCollection = typeof wasteCollections.$inferSelect;
export type InsertWasteCollection = z.infer<typeof insertWasteCollectionSchema>;

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;

export type Complaint = typeof complaints.$inferSelect;
export type InsertComplaint = z.infer<typeof insertComplaintSchema>;

export type CollectionZone = typeof collectionZones.$inferSelect;
export type InsertCollectionZone = z.infer<typeof insertCollectionZoneSchema>;
