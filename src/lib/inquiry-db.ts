import { getDb } from "@/lib/d1";

export type InquiryType =
  | "agents"
  | "hosts"
  | "business"
  | "students"
  | "long_term"
  | "contact"
  | "market_insights";

export interface InquiryRecord {
  id: string;
  type: InquiryType;
  name: string | null;
  email: string;
  phone: string | null;
  company: string | null;
  subject: string | null;
  message: string | null;
  status: "NEW" | "CONTACTED" | "QUALIFIED" | "CLOSED";
  metadata: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateInquiryInput {
  type: InquiryType;
  email: string;
  name?: string | null;
  phone?: string | null;
  company?: string | null;
  subject?: string | null;
  message?: string | null;
  metadata?: Record<string, unknown>;
}

export const inquiryDb = {
  async create(db: ReturnType<typeof getDb>, input: CreateInquiryInput): Promise<InquiryRecord> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const metadata = input.metadata ? JSON.stringify(input.metadata) : null;

    await db
      .prepare(`
        INSERT INTO Inquiry (
          id, type, name, email, phone, company, subject, message, status, metadata, createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .bind(
        id,
        input.type,
        input.name || null,
        input.email,
        input.phone || null,
        input.company || null,
        input.subject || null,
        input.message || null,
        "NEW",
        metadata,
        now,
        now
      )
      .run();

    return {
      id,
      type: input.type,
      name: input.name || null,
      email: input.email,
      phone: input.phone || null,
      company: input.company || null,
      subject: input.subject || null,
      message: input.message || null,
      status: "NEW",
      metadata,
      createdAt: now,
      updatedAt: now,
    };
  },
};

