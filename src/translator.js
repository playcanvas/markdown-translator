import path from 'path';

import { GoogleGenerativeAI } from '@google/generative-ai';
import chalk from 'chalk';
import fs from 'fs-extra';
import { glob } from 'glob';

class MarkdownTranslator {
    /**
     * Default chunk size for gemini-2.5-flash. With gemini-2.5-flash's 1M token context
     * (~3.75M characters), most files can be processed in one chunk.
     */
    static DEFAULT_CHUNK_SIZE = 800000;

    constructor(apiKey) {
        if (!apiKey) {
            throw new Error('Google Gemini API key is required');
        }
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.modelName = 'gemini-2.5-flash';
        this.model = this.genAI.getGenerativeModel({ model: this.modelName });
        console.log(chalk.gray(`Using model: ${this.modelName}`));
    }

    /**
     * Split markdown content into chunks to handle large files.
     *
     * @param {string} content - The markdown content
     * @param {number} maxChunkSize - Maximum size per chunk
     * @returns {Array} Array of content chunks
     */
    splitIntoChunks(content, maxChunkSize = MarkdownTranslator.DEFAULT_CHUNK_SIZE) {
        // For most markdown files, this will result in a single chunk
        const lines = content.split('\n');
        const chunks = [];
        let currentChunk = '';

        for (const line of lines) {
            if (currentChunk.length + line.length + 1 > maxChunkSize && currentChunk.length > 0) {
                chunks.push(currentChunk.trim());
                currentChunk = line;
            } else {
                currentChunk += (currentChunk ? '\n' : '') + line;
            }
        }

        if (currentChunk.trim()) {
            chunks.push(currentChunk.trim());
        }

        return chunks;
    }

    /**
     * Create translation prompt for Gemini.
     *
     * @param {string} text - Text to translate
     * @param {string} targetLanguage - Target language
     * @returns {string} Translation prompt
     */
    createTranslationPrompt(text, targetLanguage) {
        return `Translate the following markdown content from English to ${targetLanguage}. 
    
IMPORTANT INSTRUCTIONS:
1. Preserve ALL markdown formatting (headers, links, code blocks, tables, etc.)
2. Do NOT translate code blocks themselves, URLs, or file paths
3. DO translate code comments within code blocks (// comments, /* comments */, # comments, etc.)
4. Do NOT translate markdown syntax characters
5. Maintain the exact structure and formatting
6. Only translate the actual text content, not the markup or code
7. If there are any technical terms or proper nouns that shouldn't be translated, keep them in English
8. Return ONLY the translated markdown, no explanations or additional text

Markdown content to translate:

${text}`;
    }

    /**
     * Translate a single chunk of text.
     *
     * @param {string} chunk - Text chunk to translate
     * @param {string} targetLanguage - Target language
     * @returns {Promise<string>} Translated text
     */
    async translateChunk(chunk, targetLanguage) {
        try {
            const prompt = this.createTranslationPrompt(chunk, targetLanguage);
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            return response.text().trim();
        } catch (error) {
            console.error(chalk.red(`Error translating chunk: ${error.message}`));
            throw error;
        }
    }

    /**
     * Translate markdown content.
     *
     * @param {string} content - Markdown content to translate
     * @param {string} targetLanguage - Target language
     * @param {Function} progressCallback - Optional progress callback
     * @returns {Promise<string>} Translated content
     */
    async translateMarkdown(content, targetLanguage, progressCallback) {
        const chunks = this.splitIntoChunks(content);
        const translatedChunks = [];

        console.log(chalk.blue(`Translating ${chunks.length} chunk(s) to ${targetLanguage}...`));

        for (let i = 0; i < chunks.length; i++) {
            if (progressCallback) {
                progressCallback(i + 1, chunks.length);
            }

            // eslint-disable-next-line no-await-in-loop
            const translatedChunk = await this.translateChunk(chunks[i], targetLanguage);
            translatedChunks.push(translatedChunk);

            // Add a small delay to avoid rate limiting
            if (i < chunks.length - 1) {
                // eslint-disable-next-line no-await-in-loop,no-promise-executor-return
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        }

        const translatedContent = translatedChunks.join('\n\n');

        // Ensure the content ends with a newline
        return translatedContent.endsWith('\n') ? translatedContent : `${translatedContent}\n`;
    }

    /**
     * Translate a markdown file.
     *
     * @param {string} inputPath - Path to input markdown file
     * @param {string} outputPath - Path to output file
     * @param {string} targetLanguage - Target language
     * @param {Function} progressCallback - Optional progress callback
     * @returns {object} Translation result
     */
    async translateFile(inputPath, outputPath, targetLanguage, progressCallback) {
        try {
            // Check if input file exists
            if (!await fs.pathExists(inputPath)) {
                throw new Error(`Input file does not exist: ${inputPath}`);
            }

            // Read the markdown file
            console.log(chalk.blue(`Reading file: ${inputPath}`));
            const content = await fs.readFile(inputPath, 'utf8');

            if (!content.trim()) {
                throw new Error('Input file is empty');
            }

            // Translate the content
            const translatedContent = await this.translateMarkdown(content, targetLanguage, progressCallback);

            // Ensure output directory exists
            const outputDir = path.dirname(outputPath);
            await fs.ensureDir(outputDir);

            // Write translated content
            await fs.writeFile(outputPath, translatedContent, 'utf8');
            console.log(chalk.green(`Translation completed: ${outputPath}`));

            return {
                inputPath,
                outputPath,
                targetLanguage,
                originalLength: content.length,
                translatedLength: translatedContent.length
            };
        } catch (error) {
            console.error(chalk.red(`Error translating file: ${error.message}`));
            throw error;
        }
    }

    /**
     * Translate multiple markdown files using glob patterns.
     *
     * @param {string} inputPattern - Glob pattern for input files (e.g., "docs/\*\*\/\*.md")
     * @param {string} outputDir - Target directory for translated files
     * @param {string} targetLanguage - Target language
     * @param {Object} options - Translation options
     * @param {Function} options.progressCallback - Optional progress callback
     * @param {boolean} options.preserveStructure - Whether to preserve directory structure (default: true)
     * @param {string} options.suffix - Suffix to add to output files (default: empty)
     * @returns {Promise<Array>} Array of translation results
     */
    async translateFiles(inputPattern, outputDir, targetLanguage, options = {}) {
        const {
            progressCallback,
            preserveStructure = true,
            suffix = ''
        } = options;

        try {
            // Normalize Windows paths for glob matching
            const normalizedPattern = inputPattern.replace(/\\/g, '/');

            // Find all matching files
            console.log(chalk.blue(`Finding files matching pattern: ${inputPattern}`));
            const files = await glob(normalizedPattern, {
                ignore: ['node_modules/**', '.git/**', '**/.*'],
                windowsPathsNoEscape: true
            });

            if (files.length === 0) {
                throw new Error(`No files found matching pattern: ${inputPattern}`);
            }

            // Filter for markdown files only
            const markdownFiles = files.filter((file) => {
                const ext = path.extname(file).toLowerCase();
                return ext === '.md' || ext === '.markdown' || ext === '.mdx';
            });

            if (markdownFiles.length === 0) {
                throw new Error('No markdown files found in the matched files');
            }

            console.log(chalk.green(`Found ${markdownFiles.length} markdown file(s) to translate`));

            // Ensure output directory exists
            await fs.ensureDir(outputDir);

            const results = [];
            let processedFiles = 0;

            for (const inputFile of markdownFiles) {
                try {
                    // Calculate output path
                    let outputPath;
                    if (preserveStructure) {
                        // Preserve relative directory structure
                        const normalizedInputFile = inputFile.replace(/\\/g, '/');
                        const normalizedInputPattern = inputPattern.replace(/\\/g, '/');

                        // Extract the base directory from the pattern
                        let baseDir = '';
                        if (path.isAbsolute(normalizedInputPattern)) {
                            // For absolute patterns like "C:/path/to/docs/**/*.md"
                            const patternParts = normalizedInputPattern.split('/');
                            const wildcardIndex = patternParts.findIndex(part => part.includes('*'));
                            if (wildcardIndex > 0) {
                                baseDir = patternParts.slice(0, wildcardIndex).join('/');
                            }
                        }

                        let relativePath;
                        if (baseDir && normalizedInputFile.startsWith(baseDir)) {
                            relativePath = path.relative(baseDir, normalizedInputFile);
                        } else {
                            relativePath = path.relative(process.cwd(), normalizedInputFile);
                        }

                        const parsed = path.parse(relativePath);
                        const newName = suffix ? `${parsed.name}_${suffix}${parsed.ext}` : `${parsed.name}${parsed.ext}`;
                        outputPath = path.join(outputDir, parsed.dir, newName);
                    } else {
                        // Flat structure in output directory
                        const parsed = path.parse(inputFile);
                        const newName = suffix ? `${parsed.name}_${suffix}${parsed.ext}` : `${parsed.name}${parsed.ext}`;
                        outputPath = path.join(outputDir, newName);
                    }

                    console.log(chalk.yellow(`\n[${processedFiles + 1}/${markdownFiles.length}] Translating: ${inputFile}`));

                    // Create per-file progress callback
                    const currentFileIndex = processedFiles + 1;
                    const fileProgressCallback = progressCallback ?
                        (chunk, total) => progressCallback(currentFileIndex, markdownFiles.length, chunk, total, inputFile) :
                        undefined;

                    // Translate the file
                    // eslint-disable-next-line no-await-in-loop
                    const result = await this.translateFile(inputFile, outputPath, targetLanguage, fileProgressCallback);
                    results.push(result);

                    processedFiles++;
                    console.log(chalk.green(`✅ Completed: ${outputPath}`));

                } catch (error) {
                    console.error(chalk.red(`❌ Failed to translate ${inputFile}: ${error.message}`));
                    results.push({
                        inputPath: inputFile,
                        error: error.message,
                        success: false
                    });
                }
            }

            // Summary
            const successful = results.filter(r => !r.error).length;
            const failed = results.length - successful;

            console.log(chalk.blue('\n📊 Batch Translation Summary:'));
            console.log(chalk.green(`   ✅ Successful: ${successful}`));
            if (failed > 0) {
                console.log(chalk.red(`   ❌ Failed: ${failed}`));
            }
            console.log(chalk.gray(`   📁 Output directory: ${outputDir}`));

            return results;

        } catch (error) {
            console.error(chalk.red(`Error in batch translation: ${error.message}`));
            throw error;
        }
    }

    /**
     * Get supported languages (common ones).
     *
     * @returns {Array} Array of supported language names
     */
    static getSupportedLanguages() {
        return [
            'Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Dutch',
            'Russian', 'Chinese', 'Japanese', 'Korean', 'Arabic', 'Hindi',
            'Turkish', 'Polish', 'Swedish', 'Norwegian', 'Danish', 'Finnish',
            'Greek', 'Hebrew', 'Thai', 'Vietnamese', 'Indonesian', 'Malay',
            'Ukrainian', 'Czech', 'Hungarian', 'Romanian', 'Bulgarian',
            'Croatian', 'Serbian', 'Slovak', 'Slovenian', 'Estonian',
            'Latvian', 'Lithuanian', 'Catalan', 'Basque', 'Welsh', 'Irish'
        ];
    }
}

export default MarkdownTranslator;
