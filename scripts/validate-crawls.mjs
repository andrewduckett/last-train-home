import { resolve } from 'node:path';
import { validateCrawlDirectory } from '../src/lib/data/validate.js';

const directory = process.env.CRAWLS_DIR ?? resolve('static/crawls');
validateCrawlDirectory(directory);
