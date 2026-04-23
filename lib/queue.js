import PQueue from 'p-queue';
import dotenv from 'dotenv';

dotenv.config();

// Antrean request (Queueing) agar server tidak SPAM Pinterest
// Batasi concurrency max (default: 3 request bersamaan)
const maxConcurrent = parseInt(process.env.MAX_CONCURRENT_REQUESTS || '3', 10);
export const requestQueue = new PQueue({ concurrency: maxConcurrent });

requestQueue.on('active', () => {
  console.log(`[Queue] Request processing. Pending requests: ${requestQueue.size}, Active: ${requestQueue.pending}`);
});

// Sistem Rate Limiting sederhana per IP/User (In-Memory)
const rateLimitWindowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10);
const maxRequestsPerWindow = parseInt(process.env.MAX_REQUESTS_PER_WINDOW || '30', 10);

const rateLimitStorage = new Map();

// Helper untuk membersihkan data lama setiap 5 menit
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of rateLimitStorage.entries()) {
    if (now - data.resetTime > 0) {
      rateLimitStorage.delete(key);
    }
  }
}, 5 * 60 * 1000);

export function checkRateLimit(identifier) {
  const now = Date.now();
  let userData = rateLimitStorage.get(identifier);

  if (!userData || now > userData.resetTime) {
    userData = { count: 1, resetTime: now + rateLimitWindowMs };
    rateLimitStorage.set(identifier, userData);
    return true; // Boleh lewat
  }

  userData.count += 1;
  rateLimitStorage.set(identifier, userData);

  if (userData.count > maxRequestsPerWindow) {
    return false; // Kena Limit / SPAM blocked
  }

  return true;
}
