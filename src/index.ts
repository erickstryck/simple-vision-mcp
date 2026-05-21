import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { loadConfig } from './config/index.js';
import { VisionService } from './services/visionService.js';
import { createAnalyzeImageTool } from './tools/analyzeImage.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageJson = JSON.parse(readFileSync(join(__dirname, '..', 'package.json'), 'utf-8'));

class VisionMCPServer {
  private server: Server;
  private visionService: VisionService;
  private analyzeImageTool: ReturnType<typeof createAnalyzeImageTool>;

  constructor() {
    const config = loadConfig();
    this.visionService = new VisionService(config);
    this.analyzeImageTool = createAnalyzeImageTool(this.visionService);

    this.server = new Server(
      {
        name: 'simple-vision-mcp',
        version: packageJson.version,
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
      tools: [this.analyzeImageTool],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      if (name === 'analyze_image') {
        return await this.analyzeImageTool.handler(args as { image_path: string; prompt?: string });
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