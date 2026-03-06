// Booking helper functions for D1
import { getDb } from "./d1";

export interface Booking {
  id: string;
  bookingNumber: string;
  propertyId: string;
  userId: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  guests: number;
  guestName: string | null;
  guestEmail: string | null;
  guestPhone: string | null;
  basePrice: number;
  cleaningFee: number | null;
  serviceFee: number | null;
  discount: number | null;
  discountRate: number | null;
  tax: number | null;
  totalPrice: number;
  currency: string;
  specialRequests: string | null;
  status: 'PENDING' | 'CONFIRMED' | 'CHECKED_IN' | 'CHECKED_OUT' | 'CANCELLED' | 'NO_SHOW';
  paymentStatus: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'REFUNDED' | 'PARTIALLY_REFUNDED';
  stripePaymentIntentId: string | null;
  cancelledAt: string | null;
  cancelReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export const bookingDb = {
  async findById(db: ReturnType<typeof getDb>, id: string): Promise<Booking | null> {
    const result = await db
      .prepare('SELECT * FROM Booking WHERE id = ?')
      .bind(id)
      .first<Booking>();
    return result || null;
  },

  async findByUserId(db: ReturnType<typeof getDb>, userId: string): Promise<Booking[]> {
    const result = await db
      .prepare('SELECT * FROM Booking WHERE userId = ? ORDER BY createdAt DESC')
      .bind(userId)
      .all<Booking>();
    return result.results || [];
  },

  async create(db: ReturnType<typeof getDb>, data: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>): Promise<Booking> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    
    await db
      .prepare(`
        INSERT INTO Booking (
          id, bookingNumber, propertyId, userId, checkIn, checkOut, nights, guests,
          guestName, guestEmail, guestPhone, basePrice, cleaningFee, serviceFee,
          discount, discountRate, tax, totalPrice, currency, specialRequests,
          status, paymentStatus, stripePaymentIntentId, cancelledAt, cancelReason,
          createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .bind(
        id, data.bookingNumber, data.propertyId, data.userId, data.checkIn, data.checkOut,
        data.nights, data.guests, data.guestName, data.guestEmail, data.guestPhone,
        data.basePrice, data.cleaningFee, data.serviceFee, data.discount, data.discountRate,
        data.tax, data.totalPrice, data.currency, data.specialRequests, data.status,
        data.paymentStatus, data.stripePaymentIntentId, data.cancelledAt, data.cancelReason,
        now, now
      )
      .run();

    return { ...data, id, createdAt: now, updatedAt: now };
  },

  async updateStatus(
    db: ReturnType<typeof getDb>,
    id: string,
    status: Booking['status'],
    data?: { paymentStatus?: Booking['paymentStatus']; cancelledAt?: string; cancelReason?: string }
  ): Promise<void> {
    const sets: string[] = ['status = ?', 'updatedAt = ?'];
    const values: (string | null)[] = [status, new Date().toISOString()];
    
    if (data?.paymentStatus) {
      sets.push('paymentStatus = ?');
      values.push(data.paymentStatus);
    }
    if (data?.cancelledAt) {
      sets.push('cancelledAt = ?');
      values.push(data.cancelledAt);
    }
    if (data?.cancelReason) {
      sets.push('cancelReason = ?');
      values.push(data.cancelReason);
    }
    
    values.push(id);
    
    await db
      .prepare(`UPDATE Booking SET ${sets.join(', ')} WHERE id = ?`)
      .bind(...values)
      .run();
  },
};
