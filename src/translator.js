import path from 'path';

import { GoogleGenerativeAI } from '@google/generative-ai';
import chalk from 'chalk';
import fs from 'fs-extra';

class MarkdownTranslator {
    constructor(apiKey, modelName = 'gemini-1.5-flash') {
        if (!apiKey) {
            throw new Error('Google Gemini API key is required');
        }
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.modelName = modelName;
        this.model = this.genAI.getGenerativeModel({ model: modelName });
        console.log(chalk.gray(`Using model: ${modelName}`));
    }

    /**
     * Split markdown content into chunks to handle large files
     * @param {string} content - The markdown content
     * @param {number} maxChunkSize - Maximum size per chunk
     * @returns {Array} Array of content chunks
     */
    splitIntoChunks(content, maxChunkSize = 4000) {
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
     * Create translation prompt for Gemini
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
     * Translate a single chunk of text
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
     * Translate markdown content
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
     * Translate a markdown file
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
     * Get supported languages (common ones)
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

    /**
     * Get available Gemini models for translation
     * @returns {Array} Array of available model information
     */
    static getAvailableModels() {
        return [
            {
                name: 'gemini-2.5-flash-preview-05-20',
                description: 'Latest: Best price-performance, adaptive thinking',
                recommended: true,
                tier: 'preview'
            },
            {
                name: 'gemini-2.5-pro-preview-05-06',
                description: 'Most powerful thinking model for complex tasks',
                recommended: false,
                tier: 'preview'
            },
            {
                name: 'gemini-2.0-flash',
                description: 'Next-gen features, speed, 1M token context',
                recommended: false,
                tier: 'stable'
            },
            {
                name: 'gemini-2.0-flash-lite',
                description: 'Cost-efficient, low latency',
                recommended: false,
                tier: 'stable'
            },
            {
                name: 'gemini-1.5-flash',
                description: 'Fast and versatile (current default)',
                recommended: false,
                tier: 'stable'
            },
            {
                name: 'gemini-1.5-flash-8b',
                description: 'Smaller model for high-volume tasks',
                recommended: false,
                tier: 'stable'
            },
            {
                name: 'gemini-1.5-pro',
                description: 'Complex reasoning tasks',
                recommended: false,
                tier: 'stable'
            }
        ];
    }
}

export default MarkdownTranslator;
