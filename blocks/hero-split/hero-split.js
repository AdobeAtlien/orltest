/**
 * Hero Split: text column (heading, intro, CTAs) beside a feature image.
 * Accepts either one row per part (image row, text row) or a single row
 * with an image cell and a text cell. Missing parts are tolerated.
 *
 * Optional background video: a link to a video file (.mp4/.webm) in the image cell.
 * The image stays as the still (and LCP element); the video loads after the page,
 * plays muted on a loop over it, and gets a pause/play button. Visitors who prefer
 * reduced motion get the still with a play button instead of autoplay.
 */
const VIDEO_EXT = /\.(mp4|webm)$/i;

function videoUrl(a) {
  try {
    const url = new URL(a.href, window.location.href);
    return VIDEO_EXT.test(url.pathname) ? url.href : null;
  } catch (e) {
    return null;
  }
}

/** True for a cell holding only media: a picture and/or a video link (and nothing else). */
function isMediaCell(el) {
  const videoLinks = [...el.querySelectorAll('a[href]')].filter(videoUrl);
  if (!el.querySelector('picture') && !videoLinks.length) return false;
  const linkText = videoLinks.map((a) => a.textContent).join('');
  return el.textContent.replace(linkText, '').trim() === '';
}

/** Removes a video link, and its paragraph wrapper when that is left empty. */
function removeLink(a) {
  const parent = a.parentElement;
  a.remove();
  if (parent && parent.tagName === 'P' && !parent.textContent.trim() && !parent.children.length) parent.remove();
}

function decorateVideo(frame, src) {
  const video = document.createElement('video');
  video.className = 'hero-split-video';
  video.muted = true;
  video.loop = true;
  video.playsInline = true;
  video.preload = 'none';
  video.setAttribute('aria-hidden', 'true');
  video.setAttribute('tabindex', '-1');

  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'hero-split-video-toggle';

  const setState = (playing) => {
    frame.classList.toggle('is-playing', playing);
    toggle.setAttribute('aria-label', playing ? 'Pause video' : 'Play video');
  };
  setState(false);

  let loaded = false;
  const play = () => {
    if (!loaded) {
      video.src = src;
      loaded = true;
    }
    const attempt = video.play();
    if (attempt) attempt.catch(() => setState(false));
  };

  video.addEventListener('playing', () => {
    frame.classList.add('is-video-ready');
    setState(true);
  });
  video.addEventListener('pause', () => setState(false));
  toggle.addEventListener('click', () => {
    if (video.paused) play();
    else video.pause();
  });

  frame.append(video, toggle);

  // autoplay only when motion is welcome, and only after the page (and its LCP image) has loaded
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const start = () => setTimeout(play, 0);
  if (document.readyState === 'complete') start();
  else window.addEventListener('load', start, { once: true });
}

/**
 * Returns the index in `textNode` where its second rendered line starts
 * (its full length when the text fits on one line or is not laid out yet).
 */
function firstLineEnd(textNode) {
  const text = textNode.textContent;
  const range = document.createRange();
  const words = /\S+/g;
  let top = null;
  let match = words.exec(text);
  while (match) {
    range.setStart(textNode, match.index);
    range.setEnd(textNode, match.index + 1);
    const rect = range.getClientRects()[0];
    if (rect) {
      if (top === null) top = rect.top;
      else if (rect.top > top + 1) return match.index;
    }
    match = words.exec(text);
  }
  return text.length;
}

/**
 * Adds the source's sparkle to a plain-text heading: three decorative stars at the end of its
 * first line ("Orlando" on phones, the whole heading when it fits on one line), fading in one
 * after another. The first line is re-measured when the heading resizes or web fonts load.
 */
function decorateSparkle(heading) {
  if (heading.children.length) return;
  const text = heading.textContent.replace(/\s+/g, ' ').trim();
  if (!text) return;

  const sparkle = document.createElement('span');
  sparkle.className = 'hero-split-sparkle';
  const label = document.createTextNode(text);
  const stars = document.createElement('span');
  stars.className = 'hero-split-stars';
  stars.setAttribute('aria-hidden', 'true');
  [1, 2, 3].forEach((n) => {
    const star = document.createElement('span');
    star.className = `star-${n}`;
    stars.append(star);
  });
  sparkle.append(label, stars);
  const rest = document.createTextNode('');
  heading.replaceChildren(sparkle, rest);

  const full = document.createTextNode(text);
  const layout = () => {
    heading.replaceChildren(full); // measure the plain text, laid out exactly as it renders
    const end = firstLineEnd(full);
    label.textContent = text.slice(0, end).trimEnd();
    rest.textContent = end < text.length ? ` ${text.slice(end)}` : '';
    heading.replaceChildren(sparkle, rest);
  };

  let width = 0;
  new ResizeObserver(([entry]) => {
    if (Math.round(entry.contentRect.width) === width) return;
    width = Math.round(entry.contentRect.width);
    layout();
  }).observe(heading);
  if (document.fonts) {
    document.fonts.ready.then(layout);
    document.fonts.addEventListener('loadingdone', layout);
  }

  // two frames: the stars are painted transparent first, so the fade-in transition runs
  requestAnimationFrame(() => requestAnimationFrame(() => sparkle.classList.add('is-active')));
}

export default function decorate(block) {
  const media = document.createElement('div');
  media.className = 'hero-split-media';
  const content = document.createElement('div');
  content.className = 'hero-split-content';

  const cells = [...block.children].flatMap((row) => [...row.children]);
  cells.forEach((cell) => {
    if (isMediaCell(cell)) {
      media.append(...cell.childNodes);
    } else {
      content.append(...cell.childNodes);
    }
  });

  // a picture authored inside the text cell (e.g. wrapped in a paragraph) still goes to media
  if (!media.querySelector('picture')) {
    const strayPic = content.querySelector('picture');
    if (strayPic) {
      const parent = strayPic.parentElement;
      media.append(strayPic);
      if (parent && parent !== content && parent.textContent.trim() === '' && !parent.children.length) {
        parent.remove();
      }
    }
  }

  // the first video link in the media cell becomes the background video
  const videoLinks = [...media.querySelectorAll('a[href]')].filter(videoUrl);
  const video = videoLinks.length ? videoUrl(videoLinks[0]) : null;
  videoLinks.forEach(removeLink);

  // group trailing CTA paragraphs so they can sit in one row
  const ctas = [...content.querySelectorAll(':scope > p')].filter((p) => {
    const links = p.querySelectorAll('a');
    return links.length > 0 && p.textContent.trim() === [...links].map((a) => a.textContent).join('').trim();
  });
  if (ctas.length) {
    const actions = document.createElement('div');
    actions.className = 'hero-split-actions';
    ctas[0].before(actions);
    actions.append(...ctas);
  }

  const heading = content.querySelector('h1, h2');
  if (heading) decorateSparkle(heading);

  block.replaceChildren(content);
  const pic = media.querySelector('picture') || media.querySelector('img');
  if (pic) {
    // the frame holds the image (and the video over it) and carries the rounded crop
    const frame = document.createElement('div');
    frame.className = 'hero-split-frame';
    media.replaceChildren(frame);
    frame.append(pic);
    block.append(media);
    block.classList.add('hero-split-has-media');
    // a hero in the first section holds the LCP image: fetch it eagerly at high priority
    const heroImg = frame.querySelector('img');
    if (heroImg && block.closest('.section') === document.querySelector('main .section')) {
      heroImg.loading = 'eager';
      heroImg.fetchPriority = 'high';
    }
    if (video) decorateVideo(frame, video);
  }
}
