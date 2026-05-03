import {chromium} from 'playwright';
import path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');

const svgPath = path.join(repoRoot, 'scripts/og-image.svg');
const outPath = path.join(repoRoot, 'public/og-image.png');

const browser = await chromium.launch();
const page = await browser.newPage({viewport: {width: 1200, height: 630}, deviceScaleFactor: 1});
await page.goto(pathToFileURL(svgPath).href, {waitUntil: 'networkidle'});
await page.screenshot({path: outPath, type: 'png', clip: {x: 0, y: 0, width: 1200, height: 630}});
await browser.close();

console.log(`wrote ${path.relative(repoRoot, outPath)}`);
