export type PublicInquiryType =
  | "agents"
  | "hosts"
  | "business"
  | "students"
  | "long_term"
  | "contact"
  | "market_insights";

export async function submitInquiry(type: PublicInquiryType, payload: Record<string, unknown>): Promise<void> {
  const response = await fetch("/api/inquiries", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      type,
      payload,
    }),
  });

  const data = (await response.json().catch(() => ({}))) as { error?: string };

  if (!response.ok) {
    throw new Error(data.error || "Submission failed");
  }
}

