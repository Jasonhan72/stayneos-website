import { getDb } from "./d1";

export interface Review {
  id: string;
  bookingId: string;
  propertyId: string;
  userId: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
}

async function ensureReviewTable(db: ReturnType<typeof getDb>) {
  await db
    .prepare(`
      CREATE TABLE IF NOT EXISTS Review (
        id TEXT PRIMARY KEY,
        bookingId TEXT NOT NULL UNIQUE,
        propertyId TEXT NOT NULL,
        userId TEXT NOT NULL,
        rating INTEGER NOT NULL,
        comment TEXT NOT NULL,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      )
    `)
    .run();
}

export const reviewDb = {
  async findByBookingId(db: ReturnType<typeof getDb>, bookingId: string): Promise<Review | null> {
    await ensureReviewTable(db);

    const result = await db
      .prepare("SELECT * FROM Review WHERE bookingId = ? LIMIT 1")
      .bind(bookingId)
      .first<Review>();

    return result || null;
  },

  async upsert(
    db: ReturnType<typeof getDb>,
    data: Omit<Review, "id" | "createdAt" | "updatedAt">,
  ): Promise<Review> {
    await ensureReviewTable(db);

    const now = new Date().toISOString();
    const existing = await this.findByBookingId(db, data.bookingId);

    if (existing) {
      await db
        .prepare("UPDATE Review SET rating = ?, comment = ?, updatedAt = ? WHERE bookingId = ?")
        .bind(data.rating, data.comment, now, data.bookingId)
        .run();

      return {
        ...existing,
        rating: data.rating,
        comment: data.comment,
        updatedAt: now,
      };
    }

    const id = crypto.randomUUID();
    await db
      .prepare(
        `INSERT INTO Review (id, bookingId, propertyId, userId, rating, comment, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(id, data.bookingId, data.propertyId, data.userId, data.rating, data.comment, now, now)
      .run();

    return {
      id,
      ...data,
      createdAt: now,
      updatedAt: now,
    };
  },
};
