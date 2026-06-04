function initServicesAccordion() {
  const items = document.querySelectorAll('.services-accordion');
  if (!items.length) return;

  items.forEach((item) => {
    const head = item.querySelector('.services-accordion__head');
    const body = item.querySelector('.services-accordion__body');
    if (!head || !body) return;

    head.addEventListener('click', () => {
      const willOpen = !item.classList.contains('is-open');

      if (willOpen) {
        item.classList.add('is-open');
        head.setAttribute('aria-expanded', 'true');
        body.style.maxHeight = body.scrollHeight + 'px';
      } else {
        item.classList.remove('is-open');
        head.setAttribute('aria-expanded', 'false');
        body.style.maxHeight = '0';
      }
    });
  });
}

function parseStatValue(text) {
  const match = text.trim().match(/^(\d+)(.*)$/);
  if (!match) return null;
  return { end: Number(match[1]), suffix: match[2] };
}

function animateStatValue(el, end, suffix, duration = 1600) {
  const startTime = performance.now();

  function frame(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(end * eased);
    el.textContent = current + suffix;
    if (progress < 1) requestAnimationFrame(frame);
    else el.textContent = end + suffix;
  }

  requestAnimationFrame(frame);
}

function initArchDomesCarousel() {
  const section = document.querySelector('.arch-domes');
  if (!section) return;

  const track = section.querySelector('[data-dome-track]');
  const viewport = section.querySelector('.arch-domes__viewport');
  const domeDesc = section.querySelector('[data-dome-desc]');
  const prevBtn = section.querySelector('.arch-domes__arrow--prev');
  const nextBtn = section.querySelector('.arch-domes__arrow--next');
  if (!track || !viewport || !domeDesc || !prevBtn || !nextBtn) return;

  const slides = [
    {
      src: 'imgg/3 страница/золото-куп.png',
      text: 'Золотые купола — знак небесной славы. Посвящается Христу или двунадесятым праздникам',
    },
    {
      src: 'imgg/3 страница/серебро-куп.png',
      text: 'Серебрянные купола — храм посвящён какому-либо святому',
    },
    {
      src: 'imgg/3 страница/синий-куп.png',
      text: 'Голубые купола — храм посвящается Богородице Деве Марии символизируют небесную чистоту её',
    },
    {
      src: 'imgg/3 страница/зеленый-куп.png',
      text: 'Зелёные купола — храм посвящён Святой Троице',
    },
  ];

  const count = slides.length;
  const copies = 7;
  const activeWidth = 442;
  const gap = 60;
  const step = activeWidth + gap;
  const startIndex = count * Math.floor(copies / 2);
  let index = startIndex;
  let isAnimating = false;
  let isNormalizing = false;

  const getRealIndex = () => ((index % count) + count) % count;

  const createSlide = (slide) => {
    const slideEl = document.createElement('div');
    slideEl.className = 'arch-domes__slide';

    const item = document.createElement('div');
    item.className = 'arch-domes__item arch-domes__item--side';

    const box = document.createElement('div');
    box.className = 'arch-domes__dome-box';

    const img = document.createElement('img');
    img.src = slide.src;
    img.alt = '';
    img.className = 'arch-domes__dome arch-domes__dome--side';
    img.width = 351;
    img.height = 351;

    box.appendChild(img);
    item.appendChild(box);
    slideEl.appendChild(item);
    return slideEl;
  };

  const buildTrack = () => {
    track.textContent = '';
    for (let copy = 0; copy < copies; copy += 1) {
      for (let i = 0; i < count; i += 1) {
        track.appendChild(createSlide(slides[i]));
      }
    }
  };

  const getOffset = () => {
    const viewportWidth = viewport.offsetWidth;
    return -index * step + (viewportWidth - activeWidth) / 2;
  };

  const updateActiveState = () => {
    const slideEls = track.querySelectorAll('.arch-domes__slide');
    slideEls.forEach((slideEl, i) => {
      const active = i === index;
      slideEl.classList.toggle('is-active', active);
      const item = slideEl.querySelector('.arch-domes__item');
      const img = slideEl.querySelector('.arch-domes__dome');
      item.classList.toggle('arch-domes__item--active', active);
      item.classList.toggle('arch-domes__item--side', !active);
      img.classList.toggle('arch-domes__dome--active', active);
      img.classList.toggle('arch-domes__dome--side', !active);
      img.width = active ? 442 : 351;
      img.height = active ? 442 : 351;
    });
    domeDesc.textContent = slides[getRealIndex()].text;
  };

  const setPosition = (animated) => {
    track.style.transition = animated
      ? 'transform 0.55s cubic-bezier(0.25, 0.8, 0.25, 1)'
      : 'none';
    track.style.transform = `translateX(${getOffset()}px)`;
    if (!animated) {
      requestAnimationFrame(() => {
        track.style.transition = '';
      });
    }
  };

  const normalizePosition = () => {
    const low = count;
    const high = count * (copies - 1);
    let shifted = false;

    if (index >= high) {
      index -= count;
      shifted = true;
    } else if (index < low) {
      index += count;
      shifted = true;
    }

    if (!shifted) return;

    isNormalizing = true;
    track.classList.add('is-normalizing');
    updateActiveState();
    setPosition(false);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        track.classList.remove('is-normalizing');
        isNormalizing = false;
      });
    });
  };

  const go = (delta) => {
    if (isAnimating) return;
    isAnimating = true;
    index += delta;
    updateActiveState();
    setPosition(true);
  };

  track.addEventListener('transitionend', (event) => {
    if (event.target !== track || event.propertyName !== 'transform' || !isAnimating || isNormalizing) return;

    normalizePosition();
    isAnimating = false;
  });

  prevBtn.addEventListener('click', () => go(-1));
  nextBtn.addEventListener('click', () => go(1));

  buildTrack();
  updateActiveState();
  setPosition(false);
}

function initDarkTimeCountUp() {
  const timeEl = document.querySelector('.dark__time');
  const section = document.querySelector('.dark');
  if (!timeEl || !section) return;

  const match = timeEl.textContent.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return;

  const endHours = Number(match[1]);
  const endMinutes = Number(match[2]);
  const startTotalMinutes = 9 * 60;
  const endTotalMinutes = endHours * 60 + endMinutes;
  const endLabel = `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;

  let animated = false;

  const runAnimation = () => {
    if (animated) return;
    animated = true;

    const duration = 2000;
    const startTime = performance.now();
    timeEl.textContent = '09:00';

    function frame(now) {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const currentMinutes = Math.round(
        startTotalMinutes + (endTotalMinutes - startTotalMinutes) * eased
      );
      const hours = Math.floor(currentMinutes / 60);
      const minutes = currentMinutes % 60;
      timeEl.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
      if (progress < 1) requestAnimationFrame(frame);
      else timeEl.textContent = endLabel;
    }

    requestAnimationFrame(frame);
  };

  const timeObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          runAnimation();
          timeObserver.unobserve(section);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  timeObserver.observe(section);
}

function initHistoryStatsCountUp() {
  const section = document.querySelector('.history-stats');
  if (!section) return;

  const stats = Array.from(section.querySelectorAll('.history-stats__value'))
    .map((el) => {
      const parsed = parseStatValue(el.textContent);
      if (!parsed) return null;
      return { el, end: parsed.end, suffix: parsed.suffix };
    })
    .filter(Boolean);

  if (!stats.length) return;

  let animated = false;

  const runAnimation = () => {
    if (animated) return;
    animated = true;

    stats.forEach(({ el, end, suffix }, index) => {
      el.textContent = '0' + suffix;
      setTimeout(() => animateStatValue(el, end, suffix), index * 80);
    });
  };

  const statsObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          runAnimation();
          statsObserver.unobserve(section);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  statsObserver.observe(section);
}

document.addEventListener('DOMContentLoaded', () => {
  const revealElements = document.querySelectorAll('.reveal');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  revealElements.forEach((el) => observer.observe(el));

  initArchDomesCarousel();
  initDarkTimeCountUp();
  initHistoryStatsCountUp();
  initServicesAccordion();

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href');
      if (!id || id === '#') return;
      if (id === '#top') {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  const blockImageBrowserMenu = (e) => {
    if (!e.target.closest('img')) return;
    e.preventDefault();
  };

  document.addEventListener('contextmenu', blockImageBrowserMenu);
  document.addEventListener('dragstart', blockImageBrowserMenu);
  document.addEventListener('auxclick', blockImageBrowserMenu);
});
