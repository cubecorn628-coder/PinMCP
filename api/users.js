import { fetchPinterest } from '../lib/fetcher.js';
import { parsePinterestData, extractUsers } from '../lib/parser.js';

export default async function handler(req, res) {
  const { query, limit = 20 } = req.method === 'POST' ? req.body : req.query;

  if (!query) {
    return res.status(400).json({
      error: { code: 400, message: 'Missing query parameter' }
    });
  }

  try {
    const url = `https://www.pinterest.com/search/users/?q=${encodeURIComponent(query)}&rs=content_type_filter`;
    const html = await fetchPinterest(url);
    const data = parsePinterestData(html);
    
    if (!data) {
      throw new Error('Could not parse Pinterest data');
    }

    const users = extractUsers(data).slice(0, limit);

    return res.status(200).json({
      result: {
        content: [
          {
            type: 'json',
            data: {
              tool: 'pinterest_user_search',
              query,
              count: users.length,
              results: users
            }
          }
        ]
      }
    });
  } catch (error) {
    return res.status(500).json({
      error: {
        code: 500,
        message: error.message,
        details: error.stack
      }
    });
  }
}
