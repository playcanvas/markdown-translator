# Markdown Translator

A powerful command-line tool that uses Google Gemini AI to translate markdown and MDX files from English to any specified language while preserving formatting and structure.

## Features

- 🌍 **Multi-language support** - Translate to 40+ languages
- 📝 **Markdown-aware** - Preserves all markdown formatting (headers, links, code blocks, tables, etc.)
- 🔄 **Smart chunking** - Handles large files by splitting content intelligently
- 🎯 **Selective translation** - Only translates text content, keeps code and URLs intact
- 📊 **Progress tracking** - Real-time progress indication with spinners
- 🎨 **Beautiful CLI** - Colorful, user-friendly command-line interface
- ⚡ **Fast processing** - Optimized for speed with high-performance Gemini model

## Installation

### Prerequisites

- Node.js 16.0.0 or higher
- Google Gemini API key ([Get one here](https://aistudio.google.com/app/apikey))

> **Note**: This tool uses ES modules (ESM) and requires Node.js 16+ for full compatibility.

### Install dependencies

```bash
npm install
```

### Make CLI globally available (optional)

```bash
npm link
```

Or run directly with Node:

```bash
node bin/cli.js
```

## Setup

### 1. Get Google Gemini API Key

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create a new API key
3. Copy the generated key

### 2. Set API Key

**Option A: Environment Variable (Recommended)**

```bash
export GEMINI_API_KEY="your-api-key-here"
```

**Option B: Command Line Argument**

```bash
md-translate translate -i file.md -l Spanish --key your-api-key-here
```

## Usage

### Basic Translation

```bash
# Translate README.md to Spanish
md-translate translate -i README.md -l Spanish

# Translate with custom output file
md-translate translate -i docs/guide.md -l French -o docs/guide_fr.md

# Translate using API key argument
md-translate translate -i file.md -l German --key your-api-key
```

### Available Commands

#### `translate` - Translate a markdown or MDX file

```bash
md-translate translate [options]

Options:
  -i, --input <file>     Input markdown/MDX file path (required)
  -l, --language <lang>  Target language (required)
  -o, --output <file>    Output file path (optional)
  -k, --key <apikey>     Google Gemini API key (optional)
```

#### `languages` - List supported languages

```bash
md-translate languages
```

#### `setup` - Show setup guide

```bash
md-translate setup
```

#### `--help` - Show help

```bash
md-translate --help
```

## Supported Languages

The tool supports 40+ languages including:

- **European**: Spanish, French, German, Italian, Portuguese, Dutch, Russian, Polish, Swedish, Norwegian, Danish, Finnish, Greek, Ukrainian, Czech, Hungarian, Romanian, Bulgarian, Croatian, Serbian, Slovak, Slovenian, Estonian, Latvian, Lithuanian, Catalan, Basque, Welsh, Irish
- **Asian**: Chinese, Japanese, Korean, Hindi, Thai, Vietnamese, Indonesian, Malay
- **Middle Eastern**: Arabic, Hebrew, Turkish

## Examples

### Example 1: Basic Translation

```bash
md-translate translate -i README.md -l Spanish
```

**Output**: Creates `README_spanish.md` with Spanish translation

### Example 2: Custom Output Path

```bash
md-translate translate -i docs/api.md -l French -o docs/fr/api.md
```

**Output**: Creates `docs/fr/api.md` with French translation

### Example 3: Using API Key Argument

```bash
md-translate translate -i guide.md -l German --key AIzaSyC...
```

### Example 4: Large File Translation

The tool automatically handles large files by splitting them into chunks:

```bash
md-translate translate -i large-document.md -l Japanese
```



## What Gets Translated

✅ **Translated**:
- Heading text
- Paragraph text
- List items
- Table content
- Link text
- Image alt text
- Quote text

❌ **Preserved**:
- Code blocks and inline code
- URLs and file paths
- Markdown syntax characters
- HTML tags
- Mathematical expressions
- Technical terms and proper nouns (when appropriate)

## Output

The tool provides detailed progress feedback:

```
╔═══════════════════════════════════════╗
║        Markdown Translator            ║
║     Powered by Google Gemini AI       ║
╚═══════════════════════════════════════╝

📋 Translation Details:
   Input:    /path/to/README.md
   Output:   /path/to/README_spanish.md
   Language: Spanish

⠋ Translating chunk 2/3...
✅ Translation completed successfully!

📊 Summary:
   Original length:  2,845 characters
   Translated length: 3,120 characters
   Language:         Spanish
   Output file:      /path/to/README_spanish.md
```

## Error Handling

The tool provides clear error messages for common issues:

- Missing or invalid API key
- File not found
- Invalid file format
- Network connectivity issues
- API rate limiting

## Development

### Project Structure

```
markdown-translator/
├── bin/
│   └── cli.js           # CLI entry point
├── src/
│   └── translator.js    # Core translation logic
├── package.json         # Dependencies and scripts
└── README.md           # Documentation
```

### Architecture

This project uses **ES modules (ESM)** for modern JavaScript development:

- All files use `import`/`export` syntax instead of `require`/`module.exports`
- `package.json` includes `"type": "module"` for ESM support
- Compatible with the latest versions of dependencies (chalk 5.x, ora 8.x)
- Requires Node.js 16+ for full ESM compatibility

### Key Dependencies

- `@google/generative-ai` - Google Gemini AI SDK
- `commander` - Command-line interface framework
- `chalk` - Terminal styling
- `ora` - Progress spinners
- `fs-extra` - Enhanced file system operations

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Troubleshooting

### API Key Issues

- Ensure your API key is valid and active
- Check that you have sufficient quota in your Google Cloud account
- Verify the API key has access to the Gemini API

### Large File Processing

- The tool automatically chunks large files
- Each chunk is processed with a small delay to avoid rate limiting
- Very large files may take several minutes to process

### Network Issues

- Ensure you have a stable internet connection
- The tool will retry failed requests automatically
- Check firewall settings if you encounter connection issues

## Support

If you encounter any issues or have questions:

1. Check the troubleshooting section above
2. Run `md-translate setup` for configuration help
3. Create an issue on the project repository

---

**Happy translating! 🌍✨** 