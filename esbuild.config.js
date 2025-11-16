
const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

const outdir = 'dist';

try {
    console.log('🚀 Starting new, robust build process from scratch...');

    // Ensure the output directory exists.
    if (!fs.existsSync(outdir)) {
        fs.mkdirSync(outdir, { recursive: true });
    }

    // --- Step 1: Read the source index.html ---
    // This file contains all the necessary styles and structure.
    let html = fs.readFileSync('index.html', 'utf-8');
    console.log('Read source index.html.');

    // --- Step 2: Clean the HTML for production ---
    // Remove the importmap, which is only for the development environment.
    html = html.replace(/<script type="importmap">[\s\S]*?<\/script>/, '<!-- Importmap removed for production -->');
    // Remove the development script that loads index.tsx directly.
    html = html.replace(/<script[^>]*src=["']\/index.tsx["'][^>]*><\/script>/, '<!-- Development script removed for production -->');
    console.log('Cleaned HTML for production.');

    // --- Step 3: Inject the production script tag ---
    // This is a robust way to add the script tag without complex regex.
    const bundleScript = '<script defer src="./bundle.js"></script>';
    html = html.replace('</body>', `${bundleScript}\n</body>`);
    console.log('Injected production script tag.');

    // --- Step 4: Write the final HTML files to the output directory ---
    const indexPath = path.join(outdir, 'index.html');
    fs.writeFileSync(indexPath, html);
    
    // Create a 404.html copy for GitHub Pages single-page app routing.
    fs.copyFileSync(indexPath, path.join(outdir, '404.html'));
    console.log('Generated production index.html and 404.html.');

    // --- Step 5: Bundle the JavaScript/TypeScript application ---
    esbuild.buildSync({
        entryPoints: ['index.tsx'],
        bundle: true,
        outfile: path.join(outdir, 'bundle.js'),
        minify: true,
        sourcemap: 'external', // Keep sourcemap for debugging, but in a separate file.
        format: 'iife', // A robust format that works everywhere.
        target: 'es2020', // Ensure compatibility with modern browsers.
        logLevel: 'info',
        define: {
            // Safely inject the API key.
            'process.env.API_KEY': JSON.stringify(process.env.API_KEY || '')
        },
    });

    console.log('\n\x1b[32m✅ Build completed successfully!\x1b[0m');
    console.log(`The '${outdir}' directory is now ready for deployment.`);

} catch (error) {
    console.error('\n\x1b[31m❌ Build failed:\x1b[0m', error);
    process.exit(1);
}
