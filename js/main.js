import { PATTERNS } from './data/patterns.js';
import { DONATION_CAUSES, DONATION_THUMBS } from './data/donations.js';
import { state, FEEDBACK_LEVELS, TRENDS, DIFFICULTIES, TREND_COLOR, DIFF_COLOR } from './state.js';
import { navigate, render, toast } from './router.js';
import { sampleSideCurve, pointsToPath, mirrorPoints, scaledLength } from './lib/geometry.js';
import { svgDiagram, constructionIcon, printPagePreview, assemblyPieceSvg, miniJellySvg, thumbGradient } from './lib/diagrams.js';

// Temporary bridges for code that is still inline in index.html.
Object.assign(window, {
  PATTERNS, DONATION_CAUSES, DONATION_THUMBS,
  state, FEEDBACK_LEVELS, TRENDS, DIFFICULTIES, TREND_COLOR, DIFF_COLOR,
  navigate, render, toast,
  sampleSideCurve, pointsToPath, mirrorPoints, _iliScaledLength: scaledLength,
  svgDiagram, constructionIcon, printPagePreview, assemblyPieceSvg, miniJellySvg, thumbGradient,
});

navigate('home');
