import { PATTERNS } from './data/patterns.js';
import { DONATION_CAUSES, DONATION_THUMBS } from './data/donations.js';

// Temporary bridges for code that is still inline in index.html.
Object.assign(window, { PATTERNS, DONATION_CAUSES, DONATION_THUMBS });
