import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { loadConfig } from './config/index.js';
import { VisionService } from './services/visionService.js';
import { createAnalyzeImageTool } from './tools/analyzeImage.js';

class VisionMCPServer {
  private server: Server;
  private visionService: VisionService;

  constructor() {
    const config = loadConfig();
    this.visionService = new VisionService(config);

    this.server = new Server(
      {
        name: 'simple-vision-mcp',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
  }

  private setupHandlers(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, () => ({
      tools: [createAnalyzeImageTool(this.visionService)],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      if (name === 'analyze_image') {
        const tool = createAnalyzeImageTool(this.visionService);
        return await tool.handler(args as { image_path: string; prompt?: string });
      }

      throw new Error(`Unknown tool: ${name}`);
    });
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
  }
}

const server = new VisionMCPServer();
server.run().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});