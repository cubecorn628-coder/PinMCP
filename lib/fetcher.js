import fetch from 'node-fetch';
import dotenv from 'dotenv';
import { requestQueue } from './queue.js';

dotenv.config();

const DEFAULT_USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
const MAX_RETRIES = 3;

// Helper untuk Exponential Backoff (jeda sebelum retry)
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export async function fetchPinterest(url, retries = 0) {
  const userAgent = process.env.USER_AGENT || DEFAULT_USER_AGENT;
  const timeout = parseInt(process.env.REQUEST_TIMEOUT || '10000', 10);
  const cookie = process.env.PIN_COOKIE || '';

  const headers = {
    'User-Agent': userAgent,
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
    'Accept-Language': 'en-US,en;q=0.9',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Sec-Fetch-User': '?1',
    'Upgrade-Insecure-Requests': '1',
  };

  if (cookie) {
    headers['Cookie'] = cookie;
  }

  // Bungkus dalam Antrean (Queue)
  return requestQueue.add(async () => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        headers,
        signal: controller.signal,
      });

      if (!response.ok) {
        // Fallback & Failover: Retry pada HTTP 429 atau 5xx
        if ((response.status === 429 || response.status >= 500) && retries < MAX_RETRIES) {
          console.warn(`⚠️ Warning: Pinterest returned ${response.status}. Retrying (${retries + 1}/${MAX_RETRIES})...`);
          const delay = Math.pow(2, retries) * 1000; // 1s, 2s, 4s
          await sleep(delay);
          return fetchPinterest(url, retries + 1);
        }
        
        throw new Error(`Pinterest returned ${response.status}: ${response.statusText}`);
      }

      const html = await response.text();
      return html;
    } catch (error) {
      // Failover untuk Timeout/Network error (bukan response dari server)
      if (error.name === 'AbortError' || error.code === 'ECONNRESET' || error.type === 'system') {
        if (retries < MAX_RETRIES) {
          console.warn(`⚠️ Warning: Network Error (${error.message}). Retrying (${retries + 1}/${MAX_RETRIES})...`);
          const delay = Math.pow(2, retries) * 1000;
          await sleep(delay);
          return fetchPinterest(url, retries + 1);
        }
      }
      throw error;
    } finally {
      clearTimeout(id);
    }
  });
}
