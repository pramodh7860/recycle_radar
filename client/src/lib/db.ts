import Dexie, { Table } from 'dexie';
import { InsertWasteCollection, InsertComplaint } from '@shared/schema';
import { apiRequest } from './queryClient';

// Define the database schema with offline pending changes tables
class ProjectBoltDatabase extends Dexie {
  pendingWasteCollections!: Table<InsertWasteCollection & { id?: number }>;
  pendingComplaints!: Table<InsertComplaint & { id?: number, imageData?: string }>;

  constructor() {
    super('ProjectBoltDatabase');
    this.version(1).stores({
      pendingWasteCollections: '++id, userId, wasteType, createdAt',
      pendingComplaints: '++id, userId, createdAt',
    });
  }
}

const db = new ProjectBoltDatabase();

// Initialize the database
export async function initializeDb(): Promise<ProjectBoltDatabase> {
  try {
    await db.open();
    return db;
  } catch (error) {
    console.error('Failed to open database:', error);
    throw error;
  }
}

// Add a waste collection to offline storage
export async function addOfflineWasteCollection(data: InsertWasteCollection): Promise<number> {
  try {
    return await db.pendingWasteCollections.add({
      ...data,
      createdAt: new Date(),
    });
  } catch (error) {
    console.error('Failed to store waste collection offline:', error);
    throw error;
  }
}

// Add a complaint to offline storage
export async function addOfflineComplaint(
  data: InsertComplaint,
  imageData?: string
): Promise<number> {
  try {
    return await db.pendingComplaints.add({
      ...data,
      imageData,
      createdAt: new Date(),
    });
  } catch (error) {
    console.error('Failed to store complaint offline:', error);
    throw error;
  }
}

// Upload image to server (simulated - would use actual file upload in production)
async function uploadImage(imageData: string): Promise<string> {
  // In a real app, this would upload the image to a server or cloud storage
  // For now, we'll just return a URL assuming it was uploaded
  return `https://example.com/images/${Date.now()}.jpg`;
}

// Synchronize offline data with server
export async function syncData(): Promise<void> {
  if (!navigator.onLine) {
    console.log('Cannot sync while offline');
    return;
  }

  try {
    // Sync waste collections
    const pendingWasteCollections = await db.pendingWasteCollections.toArray();
    for (const collection of pendingWasteCollections) {
      const { id, ...data } = collection;
      try {
        await apiRequest('POST', '/api/waste-collections', data);
        await db.pendingWasteCollections.delete(id!);
      } catch (error) {
        console.error(`Failed to sync waste collection ${id}:`, error);
        // Continue with other items even if one fails
      }
    }

    // Sync complaints
    const pendingComplaints = await db.pendingComplaints.toArray();
    for (const complaint of pendingComplaints) {
      try {
        const { id, imageData, ...data } = complaint;
        
        // If there's image data, upload it first
        let imageUrl = undefined;
        if (imageData) {
          imageUrl = await uploadImage(imageData);
        }
        
        // Now submit the complaint with the image URL if applicable
        await apiRequest('POST', '/api/complaints', {
          ...data,
          imageUrl,
        });
        
        await db.pendingComplaints.delete(id!);
      } catch (error) {
        console.error(`Failed to sync complaint ${complaint.id}:`, error);
        // Continue with other items even if one fails
      }
    }

    console.log('Sync completed successfully');
  } catch (error) {
    console.error('Sync failed:', error);
    throw error;
  }
}
