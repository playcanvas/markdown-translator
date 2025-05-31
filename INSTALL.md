# Quick Installation & Getting Started

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Get Google Gemini API Key
1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create a new API key
3. Copy the generated key

### 3. Set Up Your API Key

**Option A: Environment Variable (Recommended)**
```bash
# Windows PowerShell
$env:GEMINI_API_KEY="your-api-key-here"

# Windows Command Prompt
set GEMINI_API_KEY=your-api-key-here

# Linux/Mac
export GEMINI_API_KEY="your-api-key-here"
```

**Option B: Use with Command**
```bash
node bin/cli.js translate -i file.md -l Spanish --key your-api-key-here
```

### 4. Test with Sample File

Try translating the included sample file:

```bash
# Set your API key first, then run:
node bin/cli.js translate -i examples/sample.md -l Spanish

# Or use npm script:
npm run demo
```

## 📚 Available Commands

```bash
# Get help
node bin/cli.js --help

# List supported languages
node bin/cli.js languages

# Show setup guide
node bin/cli.js setup

# Translate a file
node bin/cli.js translate -i input.md -l TargetLanguage -o output.md
```

## 🎯 Examples

### Basic Translation
```bash
node bin/cli.js translate -i README.md -l French
```

### Custom Output File
```bash
node bin/cli.js translate -i docs/guide.md -l German -o docs/guide_de.md
```

### Using API Key Argument
```bash
node bin/cli.js translate -i file.md -l Japanese --key AIzaSyC...
```

## 🛠️ Make it Global (Optional)

To use `md-translate` from anywhere:

```bash
npm link
```

Then you can use:
```bash
md-translate translate -i file.md -l Spanish
md-translate languages
md-translate setup
```

## 🔍 Troubleshooting

- **API Key Error**: Make sure your Gemini API key is valid and set correctly
- **File Not Found**: Check that your input file path is correct
- **Network Issues**: Ensure you have a stable internet connection

For more detailed information, see the main [README.md](README.md) file. 