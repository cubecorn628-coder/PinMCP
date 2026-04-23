# Pinterest MCP Server

Model Context Protocol (MCP) server for searching Pinterest images (pins), users, and boards without login.

## Tools

1. `pinterest_image_search`: Search for pins.
2. `pinterest_user_search`: Search for users.
3. `pinterest_board_search`: Search for boards.

## Configuration

Environment variables in `.env`:
- `USER_AGENT`: Custom User-Agent string.
- `REQUEST_TIMEOUT`: Timeout for requests in ms.
- `PIN_COOKIE`: Optional Pinterest cookie.

## Deployment

### Vercel
1. Install Vercel CLI: `npm i -g vercel`
2. Deploy: `vercel`

### Netlify
1. Install Netlify CLI: `npm i -g netlify-cli`
2. Deploy: `netlify deploy`

## Example Requests

### Pinterest Image Search
```bash
curl -X POST http://localhost:3000/api/pins \
  -H "Content-Type: application/json" \
  -d '{"query": "landscape photography", "limit": 5}'
```

### Pinterest User Search
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"query": "traveler", "limit": 5}'
```

### Pinterest Board Search
```bash
curl -X POST http://localhost:3000/api/boards \
  -H "Content-Type: application/json" \
  -d '{"query": "interior design", "limit": 5}'
```

## MCP JSON Response Format
```json
{
  "result": {
    "content": [
      {
        "type": "json",
        "data": {
          "tool": "pinterest_image_search",
          "query": "cat",
          "count": 1,
          "results": [...]
        }
      }
    ]
  }
}
```
