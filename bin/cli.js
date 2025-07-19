#!/usr/bin/env node

import path from 'path';

import chalk from 'chalk';
import { Command } from 'commander';
import fs from 'fs-extra';
import ora from 'ora';


import MarkdownTranslator from '../src/translator.js';

const program = new Command();

// ASCII art banner
const banner = `
╔═══════════════════════════════════════╗
║        Markdown Translator            ║
║     Powered by Google Gemini AI       ║
╚═══════════════════════════════════════╝
`;

program
.name('md-translate')
.description('Translate markdown files using Google Gemini AI')
.version('1.0.0');

program
.command('translate')
.description('Translate a markdown file to specified language')
.requiredOption('-i, --input <file>', 'Input markdown file path')
.requiredOption('-l, --language <lang>', 'Target language (e.g., Spanish, French, German)')
.option('-o, --output <file>', 'Output file path (optional)')
.option('-k, --key <apikey>', 'Google Gemini API key (or set GEMINI_API_KEY env var)')
.action(async (options) => {
    console.log(chalk.cyan(banner));

    try {
        // Get API key from options or environment
        const apiKey = options.key || process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.error(chalk.red('❌ Error: Google Gemini API key is required.'));
            console.log(chalk.yellow('Set GEMINI_API_KEY environment variable or use --key option'));
            console.log(chalk.blue('Get your API key from: https://aistudio.google.com/app/apikey'));
            process.exit(1);
        }

        // Validate input file
        const inputPath = path.resolve(options.input);
        if (!await fs.pathExists(inputPath)) {
            console.error(chalk.red(`❌ Error: Input file not found: ${inputPath}`));
            process.exit(1);
        }

        // Validate file extension
        if (!inputPath.toLowerCase().endsWith('.md') && !inputPath.toLowerCase().endsWith('.markdown')) {
            console.error(chalk.red('❌ Error: Input file must be a markdown file (.md or .markdown)'));
            process.exit(1);
        }

        // Generate output path if not provided
        const outputPath = options.output ?
            path.resolve(options.output) :
            path.join(
                path.dirname(inputPath),
                `${path.basename(inputPath, path.extname(inputPath))}_${options.language.toLowerCase().replace(/\s+/g, '_')}${path.extname(inputPath)}`
            );

        // Check if output file already exists
        if (await fs.pathExists(outputPath)) {
            console.log(chalk.yellow(`⚠️  Warning: Output file already exists: ${outputPath}`));
        }

        console.log(chalk.blue('📋 Translation Details:'));
        console.log(chalk.gray(`   Input:    ${inputPath}`));
        console.log(chalk.gray(`   Output:   ${outputPath}`));
        console.log(chalk.gray(`   Language: ${options.language}`));
        console.log('');

        // Initialize translator
        const translator = new MarkdownTranslator(apiKey);

        // Create progress spinner
        const spinner = ora({
            text: 'Initializing translation...',
            color: 'cyan'
        }).start();

        // eslint-disable-next-line no-unused-vars
        let currentChunk = 0;
        // eslint-disable-next-line no-unused-vars
        let totalChunks = 0;

        const progressCallback = (chunk, total) => {
            currentChunk = chunk;
            totalChunks = total;
            spinner.text = `Translating chunk ${chunk}/${total}...`;
        };

        try {
            const result = await translator.translateFile(
                inputPath,
                outputPath,
                options.language,
                progressCallback
            );

            spinner.succeed(chalk.green('✅ Translation completed successfully!'));

            // Show summary
            console.log(chalk.blue('\n📊 Summary:'));
            console.log(chalk.gray(`   Original length:  ${result.originalLength.toLocaleString()} characters`));
            console.log(chalk.gray(`   Translated length: ${result.translatedLength.toLocaleString()} characters`));
            console.log(chalk.gray(`   Language:         ${result.targetLanguage}`));
            console.log(chalk.gray(`   Output file:      ${result.outputPath}`));

        } catch (error) {
            spinner.fail(chalk.red('❌ Translation failed'));
            throw error;
        }

    } catch (error) {
        console.error(chalk.red(`\n❌ Error: ${error.message}`));
        if (error.message.includes('API_KEY_INVALID')) {
            console.log(chalk.yellow('Please check your Google Gemini API key'));
            console.log(chalk.blue('Get your API key from: https://aistudio.google.com/app/apikey'));
        }
        process.exit(1);
    }
});

program
.command('languages')
.description('List supported languages')
.action(() => {
    console.log(chalk.cyan(banner));
    console.log(chalk.blue('🌍 Supported Languages:'));
    console.log('');

    const languages = MarkdownTranslator.getSupportedLanguages();
    const columns = 3;
    const rows = Math.ceil(languages.length / columns);

    for (let i = 0; i < rows; i++) {
        let row = '';
        for (let j = 0; j < columns; j++) {
            const index = i + j * rows;
            if (index < languages.length) {
                row += `${chalk.gray(`${(index + 1).toString().padStart(2)}.`)} ${languages[index].padEnd(15)}`;
            }
        }
        console.log(row);
    }

    console.log(chalk.yellow('\n💡 Tip: You can also use any other language name that Gemini supports'));
});

program
.command('setup')
.description('Setup guide for Google Gemini API key')
.action(() => {
    console.log(chalk.cyan(banner));
    console.log(chalk.blue('🔧 Setup Guide:'));
    console.log('');
    console.log(chalk.yellow('1. Get your Google Gemini API key:'));
    console.log(chalk.gray('   Visit: https://aistudio.google.com/app/apikey'));
    console.log('');
    console.log(chalk.yellow('2. Set your API key (choose one):'));
    console.log(chalk.gray('   Option A - Environment variable:'));
    console.log(chalk.white('     export GEMINI_API_KEY="your-api-key-here"'));
    console.log('');
    console.log(chalk.gray('   Option B - Command line argument:'));
    console.log(chalk.white('     md-translate translate -i file.md -l Spanish --key your-api-key-here'));
    console.log('');
    console.log(chalk.yellow('3. Start translating:'));
    console.log(chalk.white('     md-translate translate -i README.md -l Spanish'));
    console.log('');
    console.log(chalk.blue('📚 For more help: md-translate --help'));
});

// Error handling
process.on('unhandledRejection', (reason, promise) => {
    console.error(chalk.red('Unhandled Rejection at:'), promise, chalk.red('reason:'), reason);
    process.exit(1);
});

process.on('uncaughtException', (error) => {
    console.error(chalk.red('Uncaught Exception:'), error);
    process.exit(1);
});

// Parse command line arguments
program.parse(process.argv);

// Show help if no command provided
if (!process.argv.slice(2).length) {
    console.log(chalk.cyan(banner));
    program.outputHelp();
}
