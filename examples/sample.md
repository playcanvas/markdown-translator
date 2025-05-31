# Sample Markdown Document

This is a sample markdown document that demonstrates various markdown elements for testing the translation tool.

## Introduction

Welcome to the **Markdown Translator** testing document! This file contains various markdown elements to ensure that translations preserve formatting correctly.

### Features to Test

Here are the key features we want to verify:

1. **Headers** of different levels
2. *Italic* and **bold** text formatting
3. `Inline code` snippets
4. Lists (ordered and unordered)
5. Links and images
6. Code blocks
7. Tables
8. Blockquotes

## Code Examples

Here's a JavaScript function that should remain untranslated:

```javascript
function greetUser(name) {
    console.log(`Hello, ${name}! Welcome to the translator.`);
    return `Greeting sent to ${name}`;
}
```

And here's some Python code:

```python
def calculate_total(items):
    """Calculate the total price of items."""
    total = sum(item['price'] for item in items)
    return total
```

## Lists

### Unordered List

- First item in the list
- Second item with **bold text**
- Third item with [a link](https://example.com)
- Fourth item with `inline code`

### Ordered List

1. Primary step in the process
2. Secondary step with *emphasis*
3. Final step with important details

## Tables

| Feature | Description | Status |
|---------|-------------|--------|
| Translation | Convert text to target language | ✅ Active |
| Formatting | Preserve markdown structure | ✅ Active |
| Code Blocks | Keep code untranslated | ✅ Active |
| Links | Maintain URL integrity | ✅ Active |

## Links and Images

Visit our [documentation](https://github.com/example/markdown-translator) for more information.

![Sample Image](https://via.placeholder.com/300x200?text=Sample+Image)

## Blockquotes

> This is an important quote that should be translated while preserving the blockquote formatting.
> 
> Multiple paragraph quotes should also work correctly.

### Nested Blockquotes

> This is a main quote.
> 
> > This is a nested quote within the main quote.
> > It should maintain proper nesting structure.

## Mixed Content

You can combine `inline code` with **bold text** and *italic text* in the same paragraph. URLs like https://example.com should remain unchanged, as should email addresses like contact@example.com.

## Technical Terms

When dealing with technical documentation, terms like **API**, **JSON**, **HTTP**, and **URL** might need special handling depending on the target language and context.

### Code with Explanations

The following command installs the package:

```bash
npm install markdown-translator
```

This command should remain exactly as written, but this explanation text should be translated.

## Conclusion

This sample document tests various markdown elements to ensure the translation tool works correctly. The goal is to translate all readable text while preserving:

- Markdown formatting
- Code blocks and inline code
- URLs and file paths
- Technical syntax

---

*This document was created for testing purposes.* 