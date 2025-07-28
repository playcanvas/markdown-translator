# Markdown Translator

A powerful command-line tool that uses Google Gemini AI to translate markdown and MDX files from English to any specified language while preserving formatting and structure.

## Features

- 🌍 **Multi-language support** - Translate to 40+ languages
- 📝 **Markdown-aware** - Preserves all markdown formatting (headers, links, code blocks, tables, etc.)
- 🔄 **Smart chunking** - Handles large files by splitting content intelligently
- 🎯 **Selective translation** - Only translates text content, keeps code and URLs intact
- 📂 **Batch processing** - Translate multiple files using glob patterns (e.g., `docs/**/*.md`)
- 🏗️ **Structure preservation** - Maintain directory structure or flatten output as needed
- 📊 **Progress tracking** - Real-time progress indication with spinners for single files and batches
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

### Batch Processing

The tool supports batch processing of multiple markdown files using glob patterns:

```bash
# Translate all .md files in current directory
md-translate translate -i "*.md" -l Spanish -d ./spanish/

# Translate all markdown files in docs folder and subfolders
md-translate translate -i "docs/**/*.md" -l French -d ./translations/

# Batch translate with flat structure (no subdirectories)
md-translate translate -i "content/**/*.md" -l German -d ./output/ --flat

# Batch translate with custom suffix
md-translate translate -i "*.md" -l Japanese -d ./translated/ --suffix "ja"
```

### Available Commands

#### `translate` - Translate a markdown or MDX file

```bash
md-translate translate [options]

Options:
  -i, --input <pattern>    Input file path or glob pattern (required)
                          Examples: "file.md", "*.md", "docs/**/*.md"
  -l, --language <lang>    Target language (required)
  -o, --output <file>      Output file path (for single file translation)
  -d, --output-dir <dir>   Output directory (for batch translation or single file)
  -k, --key <apikey>       Google Gemini API key (optional)
  --flat                   Use flat structure in output directory (default: preserve structure)
  --suffix <suffix>        Custom suffix for output files (default: language name)
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

### Single File Translation

#### Example 1: Basic Translation

```bash
md-translate translate -i README.md -l Spanish
```

**Output**: Creates `README_spanish.md` with Spanish translation

#### Example 2: Custom Output Path

```bash
md-translate translate -i docs/api.md -l French -o docs/fr/api.md
```

**Output**: Creates `docs/fr/api.md` with French translation

#### Example 3: Using API Key Argument

```bash
md-translate translate -i guide.md -l German --key AIzaSyC...
```

#### Example 4: Large File Translation

The tool automatically handles large files by splitting them into chunks:

```bash
md-translate translate -i large-document.md -l Japanese
```

### Batch Translation

#### Example 5: Translate All Markdown Files

```bash
md-translate translate -i "*.md" -l Spanish -d ./spanish/
```

**Output**: Translates all `.md` files in current directory to `./spanish/` folder

#### Example 6: Recursive Translation with Structure Preservation

```bash
md-translate translate -i "docs/**/*.md" -l French -d ./translations/
```

**Output**: Translates all markdown files in `docs/` and preserves directory structure in `./translations/`

```
docs/
├── guide.md
├── api/
│   └── reference.md
└── tutorials/
    └── getting-started.md

# Becomes:
translations/
├── guide_french.md
├── api/
│   └── reference_french.md
└── tutorials/
    └── getting-started_french.md
```

#### Example 7: Flat Structure Batch Translation

```bash
md-translate translate -i "content/**/*.md" -l German -d ./output/ --flat
```

**Output**: Translates all files but places them in a flat structure (no subdirectories)

```
content/
├── intro.md
├── chapters/
│   ├── chapter1.md
│   └── chapter2.md
└── appendix/
    └── notes.md

# Becomes:
output/
├── intro_german.md
├── chapter1_german.md
├── chapter2_german.md
└── notes_german.md
```

#### Example 8: Custom Suffix

```bash
md-translate translate -i "*.md" -l Japanese -d ./translated/ --suffix "ja"
```

**Output**: Uses "ja" instead of "japanese" as the file suffix



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

The tool provides detailed progress feedback for both single file and batch processing:

### Single File Translation Output

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

### Batch Translation Output

```
╔═══════════════════════════════════════╗
║        Markdown Translator            ║
║     Powered by Google Gemini AI       ║
╚═══════════════════════════════════════╝

📋 Batch Translation Details:
   Pattern:  docs/**/*.md
   Output:   /path/to/translations/
   Language: Spanish
   Structure: Preserved

⠋ [2/5] reference.md - chunk 1/2...
✅ All translations completed successfully!

📊 Summary:
   Files processed: 5
   Successful: 5
   Failed: 0
   Output directory: /path/to/translations/
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

### Batch Processing

- Use quotes around glob patterns to prevent shell expansion: `"*.md"` not `*.md`
- The `--output-dir` option is required for batch translation
- Large batches may take considerable time; use progress indicators to monitor
- Failed files in a batch are reported individually without stopping the process

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