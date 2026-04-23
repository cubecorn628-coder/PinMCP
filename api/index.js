export default async function handler(req, res) {
  return res.status(200).json({
    name: "pinterest-mcp-server",
    version: "1.0.0",
    description: "Pinterest search tools for MCP",
    tools: [
      {
        name: "pinterest_image_search",
        description: "Search for images (pins) on Pinterest",
        parameters: {
          type: "object",
          properties: {
            query: { type: "string", description: "Search query" },
            limit: { type: "number", description: "Maximum results (default 20)" }
          },
          required: ["query"]
        }
      },
      {
        name: "pinterest_user_search",
        description: "Search for users on Pinterest",
        parameters: {
          type: "object",
          properties: {
            query: { type: "string", description: "Search query" },
            limit: { type: "number", description: "Maximum results (default 20)" }
          },
          required: ["query"]
        }
      },
      {
        name: "pinterest_board_search",
        description: "Search for boards on Pinterest",
        parameters: {
          type: "object",
          properties: {
            query: { type: "string", description: "Search query" },
            limit: { type: "number", description: "Maximum results (default 20)" }
          },
          required: ["query"]
        }
      }
    ]
  });
}
