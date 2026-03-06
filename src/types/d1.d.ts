/// <reference types="@cloudflare/workers-types" />

// Extend the global scope to include D1Database
declare global {
  interface D1Database {
    prepare(query: string): D1PreparedStatement;
    dump(): Promise<ArrayBuffer>;
    batch<T>(statements: D1PreparedStatement[]): Promise<D1Result<T>[]>;
    exec(query: string): Promise<D1ExecResult>;
  }

  interface D1PreparedStatement {
    bind(...values: (string | number | null | boolean | ArrayBuffer | Date)[]): D1PreparedStatement;
    first<T>(): Promise<T | null>;
    run<T>(): Promise<D1Result<T>>;
    all<T>(): Promise<D1Result<T>>;
    raw<T>(): Promise<T[]>;
  }

  interface D1Result<T> {
    results: T[];
    success: boolean;
    meta: {
      duration: number;
      changes: number;
      last_row_id: number;
      rows_read: number;
      rows_written: number;
    };
  }

  interface D1ExecResult {
    count: number;
    duration: number;
  }
}

export {};
