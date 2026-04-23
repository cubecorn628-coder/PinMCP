import { fetchPinterest } from '../lib/fetcher.js';
import { parsePinterestData, extractBoards } from '../lib/parser.js';

export default async function handler(req, res) {
  const { query, limit = 20 } = req.method === 'POST' ? req.body : req.query;

  if (!query) {
    return res.status(400).json({
      error: { code: 400, message: 'Missing query parameter' }
    });
  }

  try {
    const url = `https://www.pinterest.com/search/boards/?q=${encodeURIComponent(query)}&rs=content_type_filter`;
    const html = await fetchPinterest(url);
    const data = parsePinterestData(html);
    
    if (!data) {
      throw new Error('Could not parse Pinterest data');
    }

    const boards = extractBoards(data).slice(0, limit);

    return res.status(200).json({
      result: {
        content: [
          {
            type: 'json',
            data: {
              tool: 'pinterest_board_search',
              query,
              count: boards.length,
              results: boards
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
