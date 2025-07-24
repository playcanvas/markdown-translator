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
.description('Translate markdown files to specified language')
.requiredOption('-i, --input <pattern>', 'Input file path or glob pattern (e.g., "*.md", "docs/**/*.md")')
.requiredOption('-l, --language <lang>', 'Target language (e.g., Spanish, French, German)')
.option('-o, --output <file>', 'Output file path (for single file translation)')
.option('-d, --output-dir <dir>', 'Output directory (for batch translation or single file)')
.option('-k, --key <apikey>', 'Google Gemini API key (or set GEMINI_API_KEY env var)')
.option('--flat', 'Use flat structure in output directory (default: preserve structure)')
.option('--suffix <suffix>', 'Custom suffix for output files (default: language name)')
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

        // Initialize translator
        const translator = new MarkdownTranslator(apiKey);

        // Check if input is a glob pattern (contains wildcards or multiple matches)
        const inputPattern = options.input;
        const { glob } = await import('glob');
        const matchedFiles = await glob(inputPattern, {
            ignore: ['node_modules/**', '.git/**', '**/.*']
        });

        const isPattern = inputPattern.includes('*') || inputPattern.includes('?') || matchedFiles.length > 1;

        if (isPattern) {
            // Batch translation mode
            if (!options.outputDir) {
                console.error(chalk.red('❌ Error: --output-dir is required for batch translation'));
                console.log(chalk.yellow('Use -d or --output-dir to specify the target directory'));
                process.exit(1);
            }

            const outputDir = path.resolve(options.outputDir);

            console.log(chalk.blue('📋 Batch Translation Details:'));
            console.log(chalk.gray(`   Pattern:  ${inputPattern}`));
            console.log(chalk.gray(`   Output:   ${outputDir}`));
            console.log(chalk.gray(`   Language: ${options.language}`));
            console.log(chalk.gray(`   Structure: ${options.flat ? 'Flat' : 'Preserved'}`));
            console.log('');

            // Create progress handler
            const spinner = ora({
                text: 'Finding files...',
                color: 'cyan'
            }).start();

            let currentFile = '';
            const progressCallback = (fileNum, totalFiles, chunk, totalChunks, fileName) => {
                currentFile = path.basename(fileName);
                spinner.text = `[${fileNum}/${totalFiles}] ${currentFile} - chunk ${chunk}/${totalChunks}`;
            };

            try {
                const results = await translator.translateFiles(
                    inputPattern,
                    outputDir,
                    options.language,
                    {
                        progressCallback,
                        preserveStructure: !options.flat,
                        suffix: options.suffix
                    }
                );

                const successful = results.filter(r => !r.error).length;
                const failed = results.length - successful;

                if (failed === 0) {
                    spinner.succeed(chalk.green('✅ All translations completed successfully!'));
                } else {
                    spinner.warn(chalk.yellow(`⚠️  Translation completed with ${failed} failures`));
                }

                // Show summary
                console.log(chalk.blue('\n📊 Summary:'));
                console.log(chalk.gray(`   Files processed: ${results.length}`));
                console.log(chalk.green(`   Successful: ${successful}`));
                if (failed > 0) {
                    console.log(chalk.red(`   Failed: ${failed}`));
                }
                console.log(chalk.gray(`   Output directory: ${outputDir}`));

            } catch (error) {
                spinner.fail(chalk.red('❌ Batch translation failed'));
                throw error;
            }

        } else {
            // Single file translation mode
            const inputPath = path.resolve(inputPattern);

            // Validate input file
            if (!await fs.pathExists(inputPath)) {
                console.error(chalk.red(`❌ Error: Input file not found: ${inputPath}`));
                process.exit(1);
            }

            // Validate file extension
            if (!inputPath.toLowerCase().endsWith('.md') &&
                !inputPath.toLowerCase().endsWith('.markdown') &&
                !inputPath.toLowerCase().endsWith('.mdx')) {
                console.error(chalk.red('❌ Error: Input file must be a markdown file (.md, .markdown, or .mdx)'));
                process.exit(1);
            }

            // Generate output path
            let outputPath;
            if (options.output) {
                outputPath = path.resolve(options.output);
            } else if (options.outputDir) {
                const parsed = path.parse(inputPath);
                const newName = options.suffix ? `${parsed.name}_${options.suffix}${parsed.ext}` : `${parsed.name}${parsed.ext}`;
                outputPath = path.join(path.resolve(options.outputDir), newName);
            } else {
                // When no output specified, add language suffix to avoid overwriting original
                const suffix = options.suffix || options.language.toLowerCase().replace(/\s+/g, '_');
                outputPath = path.join(
                    path.dirname(inputPath),
                    `${path.basename(inputPath, path.extname(inputPath))}_${suffix}${path.extname(inputPath)}`
                );
            }

            // Check if output file already exists
            if (await fs.pathExists(outputPath)) {
                console.log(chalk.yellow(`⚠️  Warning: Output file already exists: ${outputPath}`));
            }

            console.log(chalk.blue('📋 Translation Details:'));
            console.log(chalk.gray(`   Input:    ${inputPath}`));
            console.log(chalk.gray(`   Output:   ${outputPath}`));
            console.log(chalk.gray(`   Language: ${options.language}`));
            console.log('');

            // Create progress spinner
            const spinner = ora({
                text: 'Initializing translation...',
                color: 'cyan'
            }).start();

            const progressCallback = (chunk, total) => {
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
