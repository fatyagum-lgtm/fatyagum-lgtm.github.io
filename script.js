/** Fatima Humbatova portfolio. Dependency-free interactions, respecting reduced motion. */
(() => {
  'use strict';
  const $ = (selector, parent = document) => parent.querySelector(selector);
  const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(pointer: fine)');
  const year = $('#year');
  if (year) year.textContent = String(new Date().getFullYear());

  // Short intro once per tab, then progressive three-line terminal entrance.
  // No-JS/reduced-motion fallback keeps the complete text visible.
  const intro = $('#intro');
  const heroText = $('#heroTyped');
  const heroFullText = heroText?.textContent || '';
  let introTimer;
  let heroStarted = false;
  let typingTimer;
  const runHero = () => {
    if (heroStarted || reducedMotion.matches) return;
    heroStarted = true;
    document.body.classList.add('hero-entrance');
    if (!heroText) return;
    // Only empty after hiding the full text from assistive tech via aria-label.
    const parent = heroText.parentElement;
    parent?.setAttribute('aria-label', heroFullText);
    heroText.textContent = '';
    let index = 0;
    typingTimer = window.setTimeout(() => {
      const typeNext = () => {
        index = Math.min(heroFullText.length, index + 2);
        heroText.textContent = heroFullText.slice(0, index);
        if (index < heroFullText.length) typingTimer = window.setTimeout(typeNext, 24);
        else document.body.classList.add('typing-done');
      };
      typeNext();
    }, 1870);
  };
  const endIntro = () => {
    window.clearTimeout(introTimer);
    if (intro) intro.hidden = true;
    try { sessionStorage.setItem('fatima-intro-played', 'yes'); } catch (_) { /* private browsing */ }
    runHero();
  };
  let seenIntro = false;
  try { seenIntro = sessionStorage.getItem('fatima-intro-played') === 'yes'; } catch (_) { /* storage unavailable */ }
  if (reducedMotion.matches || seenIntro) endIntro();
  else introTimer = window.setTimeout(endIntro, 2050);
  $('#skipIntro')?.addEventListener('click', endIntro);
  // If reduced-motion preference changes, show the full story immediately.
  reducedMotion.addEventListener?.('change', e => {
    if (e.matches) {
      window.clearTimeout(typingTimer);
      if (heroText) heroText.textContent = heroFullText;
      intro && (intro.hidden = true);
      document.body.classList.add('typing-done');
      $('#heroAnimation')?.pause();
    }
  });
  // Decorative looping video: don't force motion when the visitor requests less.
  const heroVideo = $('#heroAnimation');
  if (heroVideo) {
    // Browsers without WebM support still receive the genuine moving GIF.
    const fallBackGif = () => {
      if (!heroVideo.isConnected) return;
      const img = document.createElement('img');
      img.className = 'hero-illustration';
      img.src = './assets/fatima-cozy-desk-original.gif';
      img.width = 598; img.height = 448;
      img.alt = 'Animated cozy pixel-art coding desk';
      heroVideo.replaceWith(img);
    };
    if (!heroVideo.canPlayType('video/webm')) fallBackGif();
    else {
      heroVideo.addEventListener('error', fallBackGif, { once: true });
      heroVideo.querySelector('source')?.addEventListener('error', fallBackGif, { once: true });
      if (reducedMotion.matches) heroVideo.pause();
      else heroVideo.play().catch(() => { /* Poster remains visible if autoplay is blocked. */ });
    }
  }

  // Sections reveal only when visible; the original site works without scripts.
  if ('IntersectionObserver' in window && !reducedMotion.matches) {
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      }
    }, { threshold: .09, rootMargin: '0px 0px -25px 0px' });
    $$('.reveal').forEach(el => observer.observe(el));
    document.documentElement.classList.add('enhanced');
  }

  // Mobile nav is a true accessible toggle, not a decorative menu button.
  const toggle = $('#menuToggle');
  const mobileMenu = $('#mobileMenu');
  const closeMenu = () => {
    if (!toggle || !mobileMenu) return;
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open menu');
    mobileMenu.hidden = true;
  };
  toggle?.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    mobileMenu.hidden = !open;
  });
  mobileMenu?.addEventListener('click', (e) => { if (e.target.closest('a')) closeMenu(); });
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });
  window.addEventListener('resize', () => { if (window.innerWidth > 900) closeMenu(); }, { passive: true });

  // Active navbar section highlights based on actual scroll position.
  const sectionEls = $$('main section[id]');
  const navigation = $$('.nav-link');
  const updateActive = () => {
    const threshold = window.innerHeight * .35;
    let current = sectionEls[0]?.id || 'home';
    for (const section of sectionEls) {
      if (section.getBoundingClientRect().top < threshold) current = section.id;
    }
    navigation.forEach(a => a.classList.toggle('active', a.getAttribute('href') === `#${current}`));
  };
  window.addEventListener('scroll', updateActive, { passive: true });
  updateActive();

  // Readable, restrained 3D tilt for cards and the code window.
  if (finePointer.matches && !reducedMotion.matches) {
    $$('.project-card, .journey-console').forEach(card => {
      let request = 0;
      card.addEventListener('pointermove', e => {
        const bounds = card.getBoundingClientRect();
        const localX = (e.clientX - bounds.left) / bounds.width;
        const localY = (e.clientY - bounds.top) / bounds.height;
        card.style.setProperty('--mx', `${localX * 100}%`);
        card.style.setProperty('--my', `${localY * 100}%`);
        cancelAnimationFrame(request);
        request = requestAnimationFrame(() => {
          const x = (localY - .5) * -3.5;
          const y = (localX - .5) * 3.5;
          card.style.transform = `perspective(1100px) rotateX(${x}deg) rotateY(${y}deg) translateY(-2px)`;
        });
      }, { passive: true });
      card.addEventListener('pointerleave', () => {
        cancelAnimationFrame(request);
        card.style.transform = '';
        card.style.setProperty('--mx', '50%');
        card.style.setProperty('--my', '0%');
      }, { passive: true });
    });
  }

  // Fine cursor glow in hero/connect; only while pointer remains in those sections.
  const glow = $('#cursorGlow');
  if (glow && finePointer.matches && !reducedMotion.matches) {
    let gx = -999, gy = -999, tx = -999, ty = -999, active = false;
    let started = false;
    const tick = () => {
      gx += (tx - gx) * .13;
      gy += (ty - gy) * .13;
      glow.style.left = `${gx}px`;
      glow.style.top = `${gy}px`;
      if (active) requestAnimationFrame(tick); else started = false;
    };
    ['#home', '#connect'].forEach(selector => {
      const section = $(selector);
      section?.addEventListener('pointerenter', () => {
        active = true;
        document.body.classList.add('cursor-active');
        if (!started) { started = true; requestAnimationFrame(tick); }
      });
      section?.addEventListener('pointermove', e => { tx = e.clientX; ty = e.clientY; }, { passive: true });
      section?.addEventListener('pointerleave', () => { active = false; document.body.classList.remove('cursor-active'); });
    });
  }

  // Timeline orange line fills as the reader scrolls down.
  const timeline = $('#careerTimeline');
  const updateTimeline = () => {
    if (!timeline) return;
    const rect = timeline.getBoundingClientRect();
    const fraction = Math.min(1, Math.max(0, (window.innerHeight * .72 - rect.top) / Math.max(rect.height, 1)));
    timeline.style.setProperty('--timeline-progress', `${Math.round(fraction * 100)}%`);
  };
  window.addEventListener('scroll', updateTimeline, { passive: true });
  window.addEventListener('resize', updateTimeline, { passive: true });
  updateTimeline();

  // Lightweight ambient pixel rain. Motion is throttled in hidden tabs.
  const canvas = $('#pixelCanvas');
  const ctx = canvas?.getContext('2d', { alpha: true });
  if (canvas && ctx && !reducedMotion.matches) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = 0, height = 0;
    let particles = [];
    let pointerX = -9999, pointerY = -9999;
    let lastTime = 0;
    let frame = 0;
    let running = !document.hidden;
    const random = (min, max) => min + Math.random() * (max - min);
    const makeParticle = (anywhere = false) => ({
      x: random(0, width), y: anywhere ? random(0, height) : random(-height * .25, -6),
      v: random(7, 26), size: Math.random() < .3 ? 4 : 2,
      drift: random(-3, 3), a: random(.24, .63), phase: random(0, Math.PI * 2)
    });
    const resize = () => {
      width = window.innerWidth; height = window.innerHeight;
      canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(96, Math.max(22, Math.round(width / 17)));
      particles = Array.from({ length: count }, () => makeParticle(true));
    };
    const render = (timestamp) => {
      if (!running) return;
      const elapsed = Math.min((timestamp - (lastTime || timestamp)) / 1000, .035);
      lastTime = timestamp;
      ctx.clearRect(0, 0, width, height);
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.y += p.v * elapsed;
        p.x += (p.drift + Math.sin(timestamp * .0004 + p.phase) * 3) * elapsed;
        const dx = p.x - pointerX, dy = p.y - pointerY;
        const distance = Math.hypot(dx, dy);
        if (distance < 105 && distance > 0) {
          const force = (105 - distance) / 105;
          p.x += (dx / distance) * force * 35 * elapsed;
          p.y += (dy / distance) * force * 35 * elapsed;
        }
        if (p.y > height + 12 || p.x < -30 || p.x > width + 30) particles[i] = makeParticle(false);
        ctx.fillStyle = `rgba(235,157,104,${p.a})`;
        ctx.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size);
      }
      // Very faint connecting fragments add dimensionality without impairing readability.
      if (width > 700) {
        ctx.strokeStyle = 'rgba(231,146,98,.09)';
        ctx.lineWidth = 1;
        for (let i = 0; i < particles.length - 1; i += 4) {
          const p = particles[i], q = particles[i + 1];
          if (Math.abs(p.x - q.x) < 140 && Math.abs(p.y - q.y) < 120) {
            ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
          }
        }
      }
      frame = requestAnimationFrame(render);
    };
    resize();
    window.addEventListener('resize', resize, { passive: true });
    window.addEventListener('pointermove', e => { pointerX = e.clientX; pointerY = e.clientY; }, { passive: true });
    window.addEventListener('pointerleave', () => { pointerX = -9999; pointerY = -9999; });
    document.addEventListener('visibilitychange', () => {
      running = !document.hidden && !reducedMotion.matches;
      if (!running) cancelAnimationFrame(frame);
      else { lastTime = 0; frame = requestAnimationFrame(render); }
    });
    frame = requestAnimationFrame(render);
  }
  // V3.1 — smooth scroll-following path. A continuous (never dotted) track
  // is revealed through SVG arc-length, eased in time instead of jumping between wheel ticks.
  const journeyStage = $('#journeyPathStage');
  const journeyDesktop = $('#journeyStrokeDesktop');
  const journeyMobile = $('#journeyStrokeMobile');
  const journeyPoints = $$('.journey-waypoint', journeyStage || document);
  const journeyFinale = $('#journeyFinale');
  const useMobilePath = () => window.matchMedia('(max-width: 700px)').matches;
  const pathData = [journeyDesktop, journeyMobile].filter(Boolean).map(path => {
    const length = path.getTotalLength();
    const glow = $(`#journeyBloom${path === journeyDesktop ? 'Desktop' : 'Mobile'}`);
    path.style.strokeDasharray = `${length} ${length}`;
    if (glow) glow.style.strokeDasharray = `${length} ${length}`;
    return { path, length, glow, head: $(`#journeyHead${path === journeyDesktop ? 'Desktop' : 'Mobile'}`) };
  });
  const journeyNodeLocations = [
    [{ x: 110, y: 225 }, { x: 650, y: 265 }, { x: 985, y: 510 }, { x: 318, y: 735 }],
    [{ x: 45, y: 108 }, { x: 63, y: 340 }, { x: 77, y: 566 }, { x: 72, y: 833 }]
  ];
  const closestPathFraction = (path, x, y) => {
    const length = path.getTotalLength();
    let closest = 0, smallest = Infinity;
    for (let i = 0; i <= 480; i++) {
      const f = i / 480;
      const p = path.getPointAtLength(f * length);
      const d = (p.x - x) ** 2 + (p.y - y) ** 2;
      if (d < smallest) { smallest = d; closest = f; }
    }
    return closest;
  };
  const journeyFractions = pathData.map(({path}, i) => journeyNodeLocations[i].map(({x,y}) => closestPathFraction(path,x,y)));
  let pathProgress = reducedMotion.matches ? 1 : 0;
  let targetProgress = pathProgress;
  let journeyAnimation = 0;
  let previousFrame = 0;
  let pulseRaf = 0;
  let milestoneReached = false;
  const clamp01 = n => Math.max(0, Math.min(1, n));
  const currentPathIndex = () => useMobilePath() ? 1 : 0;

  const renderJourney = progress => {
    const activeIndex = currentPathIndex();
    pathData.forEach(({path,length,glow,head}, i) => {
      const end = length * clamp01(progress);
      const offset = String(length - end);
      path.style.strokeDashoffset = offset;
      if (glow) glow.style.strokeDashoffset = offset;
      if (head) {
        const pt = path.getPointAtLength(end);
        head.setAttribute('cx', pt.x.toFixed(2));
        head.setAttribute('cy', pt.y.toFixed(2));
        head.style.opacity = !reducedMotion.matches && progress > .008 && progress < .998 && i === activeIndex ? '.96' : '0';
      }
    });
    journeyPoints.forEach((wp, idx) => wp.classList.toggle('is-active', progress >= journeyFractions[activeIndex][idx] - .005));
    if (!milestoneReached && progress >= .998) {
      milestoneReached = true;
      journeyStage?.classList.add('is-complete');
      journeyFinale?.classList.add('is-revealed');
    }
  };

  const nextJourneyFrame = now => {
    journeyAnimation = 0;
    const elapsed = previousFrame ? Math.min(70, now - previousFrame) : 16;
    previousFrame = now;
    // Frame-rate independent damping: a fluid 180 ms response to wheel/touch scroll.
    const blend = 1 - Math.exp(-elapsed / 180);
    pathProgress += (targetProgress - pathProgress) * blend;
    if (Math.abs(targetProgress - pathProgress) < .0007) pathProgress = targetProgress;
    renderJourney(pathProgress);
    if (pathProgress !== targetProgress) journeyAnimation = requestAnimationFrame(nextJourneyFrame);
    else previousFrame = 0;
  };
  const requestJourneyFrame = () => {
    if (reducedMotion.matches) {
      cancelAnimationFrame(journeyAnimation);
      journeyAnimation = 0;
      previousFrame = 0;
      pathProgress = targetProgress = 1;
      renderJourney(1);
    } else if (!journeyAnimation) journeyAnimation = requestAnimationFrame(nextJourneyFrame);
  };
  const updateJourneyTarget = () => {
    if (!journeyStage || !pathData.length) return;
    const rect = journeyStage.getBoundingClientRect();
    // Begins when the stage enters the lower viewport; finishes when its final
    // point reaches the upper third. Full tracing remains synchronized to reading.
    const start = window.innerHeight * .78;
    const end = window.innerHeight * .28;
    targetProgress = clamp01((start - rect.top) / Math.max(1, rect.height + start - end));
    if (reducedMotion.matches) targetProgress = 1;
    requestJourneyFrame();
  };

  if (journeyStage && pathData.length) {
    renderJourney(pathProgress);
    window.addEventListener('scroll', updateJourneyTarget, {passive: true});
    window.addEventListener('resize', updateJourneyTarget, {passive: true});
    updateJourneyTarget();

    const endPulse = () => {
      cancelAnimationFrame(pulseRaf);
      pulseRaf = 0;
      ['journeyCometDesktop','journeyCometMobile'].forEach(id => {
        const comet = $(`#${id}`);
        if (comet) comet.style.opacity = '0';
      });
    };
    const pulseForward = index => {
      if (reducedMotion.matches) return;
      endPulse();
      const pathIndex = currentPathIndex();
      const {path,length} = pathData[pathIndex];
      const comet = $(`#journeyComet${pathIndex ? 'Mobile':'Desktop'}`);
      if (!comet) return;
      const first = journeyFractions[pathIndex][index];
      const last = journeyFractions[pathIndex][Math.min(index + 1, 3)];
      const travelEnd = Math.max(first, Math.min(last, pathProgress));
      if (travelEnd - first < .012) return;
      let start;
      const step = now => {
        if (start === undefined) start = now;
        const f = Math.min(1, (now - start) / 950);
        const pos = path.getPointAtLength(length * (first + (travelEnd - first) * f));
        comet.setAttribute('cx', pos.x.toFixed(2));
        comet.setAttribute('cy', pos.y.toFixed(2));
        comet.style.opacity = String(Math.sin(Math.PI * f) * .9);
        if (f < 1) pulseRaf = requestAnimationFrame(step);
        else endPulse();
      };
      pulseRaf = requestAnimationFrame(step);
    };
    journeyPoints.forEach((wp, index) => {
      wp.addEventListener('pointerenter', () => pulseForward(index));
      wp.addEventListener('focus', () => pulseForward(index));
      wp.addEventListener('pointerleave', endPulse);
      wp.addEventListener('blur', endPulse);
    });
    reducedMotion.addEventListener?.('change', () => {
      endPulse();
      if (reducedMotion.matches) {
        cancelAnimationFrame(journeyAnimation);
        journeyAnimation = 0;
      }
      updateJourneyTarget();
    });
  }

  // V3 desk lighting — a responsive amber bloom follows the cursor, without moving the GIF.
  const desk = $('#heroVisual');
  if (desk && finePointer.matches && !reducedMotion.matches) {
    let raf = 0, latestX = 65, latestY = 45;
    desk.addEventListener('pointerenter', () => desk.classList.add('is-lit'));
    desk.addEventListener('pointerleave', () => desk.classList.remove('is-lit'));
    desk.addEventListener('pointermove', event => {
      const rect = desk.getBoundingClientRect();
      latestX = Math.min(100,Math.max(0,(event.clientX-rect.left)/rect.width*100));
      latestY = Math.min(100,Math.max(0,(event.clientY-rect.top)/rect.height*100));
      if (!raf) raf=requestAnimationFrame(() => {
        desk.style.setProperty('--desk-lamp-x',`${latestX.toFixed(2)}%`);
        desk.style.setProperty('--desk-lamp-y',`${latestY.toFixed(2)}%`);
        raf=0;
      });
    }, {passive:true});
  }

  // V3 connect: one short terminal command on reveal, not an endlessly blinking typing effect.
  const connectPanel = $('#connectPanel');
  const connectTyped = $('#connectTyped');
  if (connectPanel && connectTyped && !reducedMotion.matches && 'IntersectionObserver' in window) {
    const full = connectTyped.textContent;
    let started = false;
    const observer = new IntersectionObserver(entries => {
      if (!entries.some(e => e.isIntersecting) || started) return;
      started=true;observer.disconnect();
      connectTyped.textContent='';
      let cursor=0;
      const typeCommand=()=>{
        cursor++;
        connectTyped.textContent=full.slice(0,cursor);
        if(cursor<full.length) window.setTimeout(typeCommand,65);
        else connectPanel.classList.add('terminal-complete');
      };
      window.setTimeout(typeCommand,220);
    },{threshold:.28});
    observer.observe(connectPanel);
    reducedMotion.addEventListener?.('change',e=>{if(e.matches){connectTyped.textContent=full;connectPanel.classList.add('terminal-complete');observer.disconnect();}});
  }
})();
