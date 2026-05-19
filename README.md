# Simple Vision MCP

A lightweight, focused Model Context Protocol (MCP) server designed specifically for image analysis using OpenAI-compatible APIs. Built with TypeScript and the MCP SDK.

## Motivation

When working with AI coding agents that don't natively support vision capabilities, you often need a reliable way to analyze images. Many existing MCP vision servers are tightly coupled to specific providers (like OpenRouter or OpenAI) or come with unnecessary complexity.

**Simple Vision MCP** was created to solve a specific problem: enabling any OpenAI-compatible API endpoint to function as a vision analysis backend. It focuses on doing one thing exceptionally well - analyzing images - while remaining flexible enough to work with any OpenAI-compatible provider.

### The Problem We Solved

During setup, we encountered several issues:
1. Many vision MCP servers only support specific providers (OpenRouter, OpenAI, etc.)
2. Container-based solutions had stdio communication issues
3. Python-based servers had dependency conflicts
4. Existing solutions were overly complex for the basic need

Simple Vision MCP addresses these by:
- Supporting **any** OpenAI-compatible API endpoint
- Running as a native Node.js process (no containers needed)
- Minimal, focused codebase that's easy to debug and maintain
- Zero external dependencies beyond the MCP SDK

## Features

- **OpenAI-Compatible**: Works with any API that follows the OpenAI chat completions format
- **Single Tool Focus**: One purpose - image analysis done right
- **TypeScript**: Full type safety and modern JavaScript
- **Minimal Dependencies**: Only essential dependencies
- **STDIO Communication**: Native MCP protocol support
- **Configurable**: Full control via environment variables
- **npx Support**: Can run directly with npx, no installation required

## Installation

### Prerequisites

- Node.js 18 or higher
- An OpenAI-compatible API endpoint with vision capabilities

### Quick Start with npx (Recommended)

No installation required - just run directly:

```bash
npx -y @erickstryck/simple-vision-mcp
```

### Global Installation

```bash
npm install -g @erickstryck/simple-vision-mcp
```

### From Source

```bash
git clone https://github.com/erickstryck/simple-vision-mcp.git
cd simple-vision-mcp
npm install
npm run build
```

## Configuration

Simple Vision MCP is configured entirely via environment variables. Create a `.env` file or export variables directly:

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `VISION_API_KEY` | Your API key | Yes | - |
| `VISION_BASE_URL` | API endpoint base URL | Yes | `https://api.openai.com/v1` |
| `VISION_MODEL` | Model name for vision | Yes | `gpt-4o-mini` |
| `VISION_MAX_TOKENS` | Max response tokens | No | `4096` |
| `VISION_TIMEOUT` | Request timeout (seconds) | No | `120` |

### Example .env File

```env
VISION_API_KEY=your-api-key-here
VISION_BASE_URL=https://your-custom-endpoint.com/api/v1
VISION_MODEL=Qwen3.5-4B-AWQ
VISION_MAX_TOKENS=4096
VISION_TIMEOUT=120
```

## Usage

### Running the Server

```bash
# Using npx (recommended - always gets latest version)
npx -y @erickstryck/simple-vision-mcp

# Using global installation
simple-vision-mcp

# From source
npm start

# With environment variables inline
VISION_API_KEY=your-key VISION_BASE_URL=https://api.example.com/v1 VISION_MODEL=your-model npx -y @erickstryck/simple-vision-mcp
```

### OpenCode Configuration

Add to your `opencode.json`:

```json
{
  "mcp": {
    "vision": {
      "type": "local",
      "command": ["npx", "-y", "@erickstryck/simple-vision-mcp"],
      "env": {
        "VISION_API_KEY": "your-api-key",
        "VISION_BASE_URL": "https://your-endpoint.com/api/v1",
        "VISION_MODEL": "your-vision-model"
      },
      "enabled": true
    }
  }
}
```

### Claude Desktop Configuration

Add to `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "vision": {
      "command": "npx",
      "args": ["-y", "@erickstryck/simple-vision-mcp"],
      "env": {
        "VISION_API_KEY": "your-api-key",
        "VISION_BASE_URL": "https://your-endpoint.com/api/v1",
        "VISION_MODEL": "your-vision-model"
      }
    }
  }
}
```

### Cursor Configuration

Add to your Cursor MCP settings:

```json
{
  "mcpServers": {
    "vision": {
      "command": "npx",
      "args": ["-y", "@erickstryck/simple-vision-mcp"],
      "env": {
        "VISION_API_KEY": "your-api-key",
        "VISION_BASE_URL": "https://your-endpoint.com/api/v1",
        "VISION_MODEL": "your-vision-model"
      }
    }
  }
}
```

## Available Tools

### analyze_image

Analyzes an image and returns a detailed description.

**Parameters:**

| Parameter | Type | Description | Required |
|-----------|------|-------------|----------|
| `image_path` | string | Path to the image file | Yes |
| `prompt` | string | Custom analysis prompt | No |

**Default Prompt:** "Describe this image in detail, including objects, text, colors, composition, and any notable features."

**Example:**

```json
{
  "name": "analyze_image",
  "arguments": {
    "image_path": "/path/to/image.png",
    "prompt": "What objects are in this image?"
  }
}
```

**Response:**

```json
{
  "content": [
    {
      "type": "text",
      "text": "The image shows a red square with..."
    }
  ]
}
```

## Supported Image Formats

- PNG (.png)
- JPEG (.jpg, .jpeg)
- GIF (.gif)
- WebP (.webp)
- BMP (.bmp)

## Development

### Project Structure

```
simple-vision-mcp/
├── src/
│   ├── config/
│   │   └── index.ts          # Configuration loading
│   ├── services/
│   │   └── visionService.ts  # Vision API client
│   ├── tools/
│   │   └── analyzeImage.ts   # MCP tool definition
│   ├── utils/
│   │   └── imageProcessor.ts # Image processing utilities
│   └── index.ts              # Main entry point
├── bin/
│   └── cli.js                # CLI wrapper
├── tests/
│   ├── config.test.ts
│   ├── imageProcessor.test.ts
│   └── visionService.test.ts
├── package.json
├── tsconfig.json
└── README.md
```

### Building

```bash
npm run build
```

### Testing

```bash
# Run tests once
npm test

# Watch mode
npm run test:watch
```

### Design Principles

1. **Single Responsibility**: Each module has one clear purpose
2. **Dependency Injection**: Services receive dependencies via constructor
3. **Functional Core**: Business logic is pure and testable
4. **Explicit over Implicit**: Clear types and function signatures

## Troubleshooting

### "VISION_API_KEY environment variable is required"

Ensure you've set the `VISION_API_KEY` environment variable before starting the server.

### "Unsupported image format"

The image format is not supported. Ensure your image is PNG, JPEG, GIF, WebP, or BMP format.

### "Vision API error: 401"

Authentication failed. Verify your API key is correct and has access to vision capabilities.

### "Vision API error: 4xx/5xx"

Check your `VISION_BASE_URL` is correct and the API endpoint is accessible.

## License

MIT License - see LICENSE file for details.

## Contributing

Contributions welcome! Please feel free to submit a Pull Request.