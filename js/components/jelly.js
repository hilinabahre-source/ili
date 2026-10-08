export function initJelly(){
  const TIPS = {
    'view-home': "Let's make your avatar! ✨ Click your profile icon (top right) to enter your measurements. Measure height barefoot, chest around the fullest part, waist at your natural waistline, and hip at the widest point for the best fit.",
    'view-browse': "Looking for a pattern? Filter by trend or difficulty up top to find your vibe faster!",
    'view-detail': "Tap 📐 Construction to see this pattern's actual pieces — front, back, seam allowances and all. Heads up: the printed pages only show half the piece! Fold your fabric in half first, line up the pattern's fold edge with your fabric's fold, then cut through both layers at once to get a full front or back piece.",
    'view-create': "Be honest with us here — there's no wrong answer, and every bit of feedback helps us make this easier for the next person.",
    'view-request': "The more detail you give (inspo pics, silhouette, fit notes), the better chance we bring it to life!",
    'view-mypatterns': "This is your stash! Come back anytime to pick up right where you left off.",
    'view-donate': "These are real, active crises that you can stay updated on and help out in. Donate what you can to help keep this project alive."
  };

  const wrap = document.getElementById('jellyHelper');
  const bubble = document.getElementById('jellyBubble');
  const text = document.getElementById('jellyText');
  const body = document.getElementById('jellyBody');
  const dockBtn = document.getElementById('jellyDock');
  const closeBtn = document.getElementById('jellyClose');

  let hideTimer;
  let lastViewId = null;

  function currentViewId(){
    const el = document.querySelector('.view.active');
    return el ? el.id : 'view-home';
  }

  function showTip(){
    const id = currentViewId();
    text.textContent = TIPS[id] || "Hi! I'm here if you need a hand.";
    bubble.classList.add('show');
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => bubble.classList.remove('show'), 9000);
  }

  function hideTip(){
    bubble.classList.remove('show');
    clearTimeout(hideTimer);
  }

  body.addEventListener('click', (e) => {
    if (e.target === dockBtn) return;
    showTip();
  });

  closeBtn.addEventListener('click', hideTip);

  dockBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    wrap.classList.toggle('docked');
    hideTip();
  });

  // Watch for view changes and greet with a fresh tip for that page.
  const observer = new MutationObserver(() => {
    const id = currentViewId();
    if (id !== lastViewId) {
      lastViewId = id;
      showTip();
    }
  });
  document.querySelectorAll('.view').forEach(el => {
    observer.observe(el, { attributes: true, attributeFilter: ['class'] });
  });

  // First greeting shortly after load.
  setTimeout(showTip, 1400);

  // Gentle periodic reminder if she's been quiet a while and isn't docked-and-dismissed.
  setInterval(() => {
    if (!bubble.classList.contains('show')) showTip();
  }, 50000);
}
