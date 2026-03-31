import { promises as fs } from 'fs';
import path from 'path';

const ARIA_MEMORY_DIR = path.resolve(
  process.env.ARIA_MEMORY_DIR ||
    path.join(process.env.HOME || '/tmp', '.openclaw/workspace/agents/aria/memory/visitors')
);

type InteractionRecord = {
  visitorId: string;
  message: string;
  reply: string;
  recommendations: string[];
  parsedIntent: {
    bedrooms?: number;
    maxBudget?: number;
    locationQuery?: string;
  };
  ip: string;
};

type VisitorProfile = {
  id: string;
  first_seen: string;
  last_seen: string;
  identifiers: {
    ips: string[];
  };
  interaction_count: number;
  interactions: Array<{
    timestamp: string;
    message: string;
    reply_summary: string;
    recommendations: string[];
    intent: {
      bedrooms?: number;
      maxBudget?: number;
      location?: string;
    };
  }>;
  tags: string[];
  status: string;
};

function maskIp(ip: string): string {
  // Only keep first 3 octets for privacy
  const parts = ip.split('.');
  if (parts.length === 4) {
    return `${parts[0]}.${parts[1]}.${parts[2]}.x`;
  }
  return ip.replace(/:[\da-f]+$/i, ':x'); // IPv6
}

async function ensureDir(dirPath: string) {
  try {
    await fs.mkdir(dirPath, { recursive: true });
  } catch {
    // dir already exists
  }
}

export async function recordVisitorInteraction(record: InteractionRecord): Promise<void> {
  const byIdDir = path.join(ARIA_MEMORY_DIR, 'by-id');
  await ensureDir(byIdDir);

  const filePath = path.join(byIdDir, `${record.visitorId}.json`);
  const now = new Date().toISOString();
  const maskedIp = maskIp(record.ip);

  let profile: VisitorProfile;

  try {
    const existing = await fs.readFile(filePath, 'utf-8');
    profile = JSON.parse(existing) as VisitorProfile;
    profile.last_seen = now;
    profile.interaction_count += 1;
    if (!profile.identifiers.ips.includes(maskedIp) && maskedIp !== 'unknown') {
      profile.identifiers.ips.push(maskedIp);
    }
  } catch {
    // New visitor
    profile = {
      id: record.visitorId,
      first_seen: now,
      last_seen: now,
      identifiers: {
        ips: maskedIp !== 'unknown' ? [maskedIp] : [],
      },
      interaction_count: 1,
      interactions: [],
      tags: [],
      status: 'new_visitor',
    };
  }

  // Add this interaction
  profile.interactions.push({
    timestamp: now,
    message: record.message,
    reply_summary: record.reply.slice(0, 200),
    recommendations: record.recommendations,
    intent: {
      bedrooms: record.parsedIntent.bedrooms,
      maxBudget: record.parsedIntent.maxBudget,
      location: record.parsedIntent.locationQuery,
    },
  });

  // Keep last 50 interactions max
  if (profile.interactions.length > 50) {
    profile.interactions = profile.interactions.slice(-50);
  }

  // Auto-tag based on intent
  const intentTags: string[] = [];
  if (record.parsedIntent.bedrooms) {
    intentTags.push(`${record.parsedIntent.bedrooms}br`);
  }
  if (record.parsedIntent.locationQuery) {
    intentTags.push(record.parsedIntent.locationQuery.toLowerCase());
  }
  if (record.parsedIntent.maxBudget) {
    intentTags.push(`budget-${record.parsedIntent.maxBudget}`);
  }
  for (const tag of intentTags) {
    if (!profile.tags.includes(tag)) {
      profile.tags.push(tag);
    }
  }

  // Upgrade status if they've interacted multiple times
  if (profile.interaction_count >= 3 && profile.status === 'new_visitor') {
    profile.status = 'active_lead';
  }

  await fs.writeFile(filePath, JSON.stringify(profile, null, 2), 'utf-8');

  // Also append to interactions.jsonl for bulk analysis
  const logLine = JSON.stringify({
    timestamp: now,
    visitorId: record.visitorId,
    ip: maskedIp,
    message: record.message,
    intent: record.parsedIntent,
    results_count: record.recommendations.length,
  });

  const logPath = path.join(ARIA_MEMORY_DIR, 'interactions.jsonl');
  await fs.appendFile(logPath, logLine + '\n', 'utf-8');
}
