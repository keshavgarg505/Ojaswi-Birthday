document.addEventListener('DOMContentLoaded', () => {
  const yes = document.getElementById('yesBtn');
  const no = document.getElementById('noBtn');
  const response = document.getElementById('response');
  if (yes) yes.addEventListener('click', () => {
    window.location.href = 'memories.html';
  });
  if (no) {
    const dodge = () => {
      const parent = no.parentElement;
      const maxX = Math.max(0, parent.clientWidth - no.offsetWidth);
      no.style.position = 'relative';
      no.style.left = (Math.random() * Math.min(maxX, 180) - 25) + 'px';
      no.style.top = (Math.random() * 55 - 28) + 'px';
      if (response) response.textContent = 'Nice try 😂 that button is not for you.';
    };
    no.addEventListener('mouseenter', dodge);
    no.addEventListener('click', (e) => { e.preventDefault(); dodge(); });
    no.addEventListener('touchstart', (e) => { e.preventDefault(); dodge(); }, {passive:false});
  }

  // Slideable photo dump, with arrows, dots, and touch scrolling.
  const slides = document.getElementById('slides');
  if (slides) {
    const items = Array.from(slides.querySelectorAll('.slide'));
    const dotsWrap = document.getElementById('photoDots');
    const count = document.getElementById('photoCount');
    let current = 0;
    const update = (index) => {
      current = (index + items.length) % items.length;
      slides.scrollTo({left: items[current].offsetLeft, behavior: 'smooth'});
      if (count) count.textContent = `${current + 1} / ${items.length}`;
      if (dotsWrap) Array.from(dotsWrap.children).forEach((dot, i) => dot.classList.toggle('active', i === current));
    };
    items.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', `Show photo ${i + 1}`);
      dot.addEventListener('click', () => update(i));
      dotsWrap.appendChild(dot);
    });
    document.getElementById('prevPhoto').addEventListener('click', () => update(current - 1));
    document.getElementById('nextPhoto').addEventListener('click', () => update(current + 1));
    let scrollTimer;
    slides.addEventListener('scroll', () => {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        const index = Math.round(slides.scrollLeft / slides.clientWidth);
        if (index !== current) {
          current = Math.max(0, Math.min(items.length - 1, index));
          if (count) count.textContent = `${current + 1} / ${items.length}`;
          Array.from(dotsWrap.children).forEach((dot, i) => dot.classList.toggle('active', i === current));
        }
      }, 80);
    });
  }

  // Candle: tap or press button to blow it out. Optional microphone blow detection.
  const scene = document.getElementById('cakeScene');
  const blowBtn = document.getElementById('blowBtn');
  const hint = document.getElementById('candleHint');
  const wishMessage = document.getElementById('wishMessage');
  let blown = false;
  const blowOut = () => {
    if (blown) return;
    blown = true;
    if (scene) scene.classList.add('blown');
    if (hint) hint.textContent = 'Candle blown out! Your wish is officially in the universe. ✨';
    if (wishMessage) wishMessage.textContent = '🎉 Happy Birthday! Now cut the cake (and save me a piece). 💗';
    if (blowBtn) blowBtn.textContent = '🎉 Candle blown!';
    burstConfetti(28);
  };
  if (scene) {
    scene.addEventListener('click', blowOut);
    scene.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); blowOut(); }});
  }
  if (blowBtn) blowBtn.addEventListener('click', blowOut);
  // Mic support requires a secure context and permission; tapping always works.
  if (hint && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    hint.textContent = '🕯️ Tap the flame, press the button, or allow mic access to blow!';
    scene?.addEventListener('dblclick', async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({audio:true});
        const audio = new AudioContext();
        const analyser = audio.createAnalyser();
        const source = audio.createMediaStreamSource(stream);
        source.connect(analyser);
        analyser.fftSize = 256;
        const data = new Uint8Array(analyser.frequencyBinCount);
        const listen = () => {
          if (blown) { stream.getTracks().forEach(t => t.stop()); audio.close(); return; }
          analyser.getByteTimeDomainData(data);
          let energy = 0;
          for (const v of data) energy += Math.abs(v - 128);
          if (energy / data.length > 12) { stream.getTracks().forEach(t => t.stop()); audio.close(); blowOut(); }
          else requestAnimationFrame(listen);
        };
        listen();
      } catch (_) {
        if (hint) hint.textContent = 'Mic unavailable here—tap the candle or button instead. 💗';
      }
    });
  }

  const button = document.getElementById('confettiBtn');
  const message = document.getElementById('magicMessage');
  if (button) button.addEventListener('click', () => {
    if (message) message.textContent = '🎉 Surprise! You deserve a really good year. 💖';
    burstConfetti(42);
  });
  function burstConfetti(n) {
    const pieces = ['💗','✨','🎀','🌸','💕','⭐','🎉'];
    for (let i = 0; i < n; i++) {
      const el = document.createElement('span');
      el.className = 'confetti';
      el.textContent = pieces[Math.floor(Math.random() * pieces.length)];
      el.style.left = Math.random() * 100 + 'vw';
      el.style.animationDelay = Math.random() * 1.2 + 's';
      el.style.fontSize = (14 + Math.random() * 20) + 'px';
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 4200);
    }
  }
});