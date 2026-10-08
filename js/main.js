import { state } from './state.js';
import { navigate, render, toast } from './router.js';
import { toggleSave } from './views/browse.js';
import { renderDetail, toggleStep, resetProgress, showMiniJelly, hideMiniJelly } from './views/detail.js';
import { openConstructionModal } from './views/construction.js';
import { submitRequest, searchPinterest } from './views/request.js';
import { setFeedbackLevel, submitFeedback } from './views/feedback.js';
import './services/cloud-sync.js';
import './components/profile-modal.js';
import { initJelly } from './components/jelly.js';

// Inline onclick/onmouseenter/onmouseleave handlers (in index.html and in
// the views' template strings) look these up as globals.
Object.assign(window, {
  navigate, toggleSave, renderDetail, toggleStep, resetProgress,
  openConstructionModal, setFeedbackLevel, submitFeedback,
  submitRequest, searchPinterest, showMiniJelly, hideMiniJelly,
});

// Temporary bridges for code that is still inline in index.html.
Object.assign(window, { state, render, toast });

navigate('home');
initJelly();

// Accounts (Supabase) and the BodyDouble avatar viewer load separately, so a
// slow or unavailable BodyDouble CDN can't hold up the rest of the site.
import('./services/supabase.js');
