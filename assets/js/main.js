/**
 * Neo-Brutalist Portfolio - main.js
 * Loads all data/*.json files in parallel via Promise.all,
 * then renders each section dynamically. ZERO hardcoded content.
 */

(function () {
  'use strict';

  // ======================================================================
  // DATA LOADING
  // ======================================================================

  const DATA_FILES = [
    'data/site-config.json',
    'data/navigation.json',
    'data/hero.json',
    'data/about.json',
    'data/experience.json',
    'data/skills.json',
    'data/projects.json',
    'data/education.json',
    'data/contact.json',
    'data/footer.json',
  ];

  async function loadAllData() {
    const responses = await Promise.all(
      DATA_FILES.map((url) =>
        fetch(url)
          .then((r) => r.json())
          .catch((err) => {
            console.warn('Failed to load ' + url, err);
            return null;
          })
      )
    );
    return {
      siteConfig: responses[0],
      navigation: responses[1],
      hero: responses[2],
      about: responses[3],
      experience: responses[4],
      skills: responses[5],
      projects: responses[6],
      education: responses[7],
      contact: responses[8],
      footer: responses[9],
    };
  }

  // ======================================================================
  // RENDERING FUNCTIONS
  // ======================================================================

  function renderSiteConfig(data) {
    document.title = data.siteName || 'Portfolio';

    // Meta description
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && data.metaDescription) {
      metaDesc.setAttribute('content', data.metaDescription);
    }

    // Loader initials
    const loaderLetters = document.querySelectorAll('.loader-letter');
    if (data.loaderInitials && loaderLetters.length) {
      data.loaderInitials.forEach((letter, i) => {
        if (loaderLetters[i]) loaderLetters[i].textContent = letter;
      });
    }

    // Progress bar checkpoints
    const checkpointsContainer = document.querySelector('.progress-checkpoints');
    if (checkpointsContainer && data.progressCheckpoints) {
      checkpointsContainer.innerHTML = data.progressCheckpoints
        .map(
          (cp) => `
        <div class="checkpoint" data-section="${escapeHtml(cp.id)}">
          <div class="checkpoint-dot"></div>
          <span class="checkpoint-label">${escapeHtml(cp.label)}</span>
        </div>`
        )
        .join('');
    }
  }

  function renderNavigation(data) {
    const navBrand = document.querySelector('.nav-brand');
    if (navBrand) navBrand.textContent = data.logo;

    const navRight = document.querySelector('.nav-right');
    if (navRight && data.items) {
      const linksHtml = data.items
        .map((item) => `<a href="${item.href}" class="nav-link">${escapeHtml(item.label)}</a>`)
        .join('');
      const ctaHtml = data.ctaText
        ? `<a href="${data.ctaHref || '#contact'}" class="nav-cta">${escapeHtml(data.ctaText)}</a>`
        : '';
      const themeBtn = `<button id="theme-toggle" class="theme-toggle-nav" aria-label="Toggle theme"><i class="fas fa-moon"></i></button>`;
      navRight.innerHTML = linksHtml + ctaHtml + themeBtn;
    }

    // Mobile hamburger button (inserted into .nav-content after .nav-right)
    const navContent = document.querySelector('.nav-content');
    if (navContent && navRight && !navContent.querySelector('.hamburger')) {
      const hamburger = document.createElement('button');
      hamburger.className = 'hamburger';
      hamburger.setAttribute('aria-label', 'Open menu');
      hamburger.setAttribute('aria-expanded', 'false');
      hamburger.innerHTML = '<span></span><span></span><span></span>';
      navContent.appendChild(hamburger);

      hamburger.addEventListener('click', () => {
        const isOpen = hamburger.classList.toggle('active');
        navRight.classList.toggle('mobile-open', isOpen);
        hamburger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      });

      // Clicking any nav link closes the menu
      navRight.addEventListener('click', (e) => {
        if (e.target.closest('a')) {
          hamburger.classList.remove('active');
          navRight.classList.remove('mobile-open');
          hamburger.setAttribute('aria-expanded', 'false');
        }
      });
    }
  }

  function renderHero(data) {
    const greetingEl = document.getElementById('hero-greeting');
    if (greetingEl) greetingEl.textContent = data.greeting || '';

    const nameEl = document.querySelector('.hero-name');
    if (nameEl) nameEl.textContent = "I'm " + (data.name || 'Developer') + '.';

    const descEl = document.querySelector('.hero-description');
    if (descEl) descEl.textContent = data.description || '';

    // Avatar
    const imageWrapper = document.querySelector('.hero-image-wrapper');
    if (imageWrapper) {
      const existingPhoto = imageWrapper.querySelector('.hero-photo');
      const existingPlaceholder = imageWrapper.querySelector('.hero-avatar-placeholder');

      if (data.avatarUrl) {
        if (existingPlaceholder) existingPlaceholder.remove();
        if (!existingPhoto) {
          const img = document.createElement('img');
          img.className = 'hero-photo';
          img.alt = data.name || 'Avatar';
          img.src = data.avatarUrl;
          img.width = 400;
          img.height = 400;
          // Insert after tape sticker
          const tape = imageWrapper.querySelector('.tape-sticker');
          if (tape) tape.after(img);
          else imageWrapper.prepend(img);
        } else {
          existingPhoto.src = data.avatarUrl;
          existingPhoto.alt = data.name || 'Avatar';
        }
      } else {
        // No avatar — show initials placeholder
        if (existingPhoto) existingPhoto.remove();
        if (!existingPlaceholder) {
          const placeholder = document.createElement('div');
          placeholder.className = 'hero-avatar-placeholder';
          const initials = (data.name || 'D')
            .split(' ')
            .map((w) => w[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
          placeholder.textContent = initials;
          const tape = imageWrapper.querySelector('.tape-sticker');
          if (tape) tape.after(placeholder);
          else imageWrapper.prepend(placeholder);
        }
      }
    }

    // Deco label (tagline)
    const decoLabel = document.querySelector('.deco-label');
    if (decoLabel) decoLabel.textContent = data.tagline || '';

    // Social buttons
    const socialContainer = document.querySelector('.hero-social');
    if (socialContainer && data.socialLinks) {
      socialContainer.innerHTML = data.socialLinks
        .map(
          (link) =>
            `<a href="${link.url}" target="_blank" rel="noopener noreferrer" class="social-btn" title="${escapeHtml(link.label)}" aria-label="${escapeHtml(link.label)}"><i class="${link.icon}"></i></a>`
        )
        .join('');
    }

    // Terminal block
    renderTerminal(data.terminalCommands || {}, data.name || 'Developer', data.tagline || '');
  }

  function renderTerminal(cmds, name, tagline) {
    const terminalBody = document.querySelector('.terminal-body');
    if (!terminalBody) return;

    const lines = [];
    lines.push({ type: 'highlight', text: `Welcome to ${name}'s Terminal` });

    // whoami
    lines.push({ type: 'prompt-cmd', prompt: '~$', cmd: 'whoami' });
    lines.push({ type: 'output', text: tagline ? `${name} — ${tagline}` : name });

    // skills (max ~8, formatted in 2 rows)
    const skills = (cmds.skills || []).slice(0, 8);
    if (skills.length) {
      lines.push({ type: 'prompt-cmd', prompt: '~$', cmd: 'ls skills/' });
      const half = Math.ceil(skills.length / 2);
      [skills.slice(0, half), skills.slice(half)].forEach((row) => {
        if (row.length) lines.push({ type: 'command', text: '  ' + row.join('  ') });
      });
    }

    // contact
    if (cmds.contact) {
      lines.push({ type: 'prompt-cmd', prompt: '~$', cmd: 'contact' });
      if (cmds.contact.email) lines.push({ type: 'output', text: '  Email:    ' + cmds.contact.email });
      if (cmds.contact.github) lines.push({ type: 'output', text: '  GitHub:   ' + cmds.contact.github });
      if (cmds.contact.linkedin) lines.push({ type: 'output', text: '  LinkedIn: ' + cmds.contact.linkedin });
    }

    // Render lines
    terminalBody.innerHTML = lines
      .map((line) => {
        if (line.type === 'prompt-cmd') {
          return `<div class="terminal-line"><span class="terminal-prompt">${escapeHtml(line.prompt)}</span> <span class="terminal-command">${escapeHtml(line.cmd)}</span></div>`;
        }
        const cls =
          line.type === 'highlight'
            ? 'terminal-highlight'
            : line.type === 'accent'
            ? 'terminal-accent'
            : line.type === 'info'
            ? 'terminal-info'
            : line.type === 'command'
            ? 'terminal-command'
            : 'terminal-output';
        return `<div class="terminal-line"><span class="${cls}">${escapeHtml(line.text)}</span></div>`;
      })
      .join('') + '<div class="terminal-line"><span class="terminal-prompt">~$</span> <span class="terminal-cursor"></span></div>';
  }

  function renderAbout(data) {
    const heading = document.querySelector('#about .section-title');
    if (heading) heading.textContent = data.heading || 'ABOUT';

    const card = document.querySelector('#about .card');
    if (!card || !data.paragraphs) return;

    card.className = 'about-content';
    card.innerHTML = data.paragraphs
      .map((para) => {
        let text = escapeHtml(para.text || '');
        // Replace highlight placeholders
        if (para.highlights) {
          para.highlights.forEach((h) => {
            const colorClass = 'highlight-' + (h.color || 'yellow');
            const placeholder = `{${h.key}}`;
            text = text.replace(
              placeholder,
              `<span class="highlight ${colorClass}">${escapeHtml(h.text)}</span>`
            );
          });
        }
        return `<p class="about-paragraph">${text}</p>`;
      })
      .join('');
  }

  function renderExperience(data) {
    const heading = document.querySelector('#experience .section-title-center');
    if (heading) heading.textContent = data.heading || 'My Journey';

    const timelineList = document.querySelector('.timeline-list');
    if (!timelineList || !data.positions) return;

    timelineList.innerHTML = data.positions
      .map((pos) => {
        const date = `${escapeHtml(pos.startDate)} – ${escapeHtml(pos.endDate || 'Present')}`;
        const companyText = pos.location
          ? `${escapeHtml(pos.company)} · ${escapeHtml(pos.location)}`
          : escapeHtml(pos.company);
        const logoHtml = pos.logo
          ? `<img class="timeline-logo" src="${escapeHtml(pos.logo)}" alt="" loading="lazy">`
          : '';
        const achievementsHtml = (pos.achievements || [])
          .map((a) => `<li>${escapeHtml(a)}</li>`)
          .join('');
        const techHtml = (pos.technologies || [])
          .map((t) => `<span class="tech-tag">${escapeHtml(t)}</span>`)
          .join('');
        return `
      <div class="timeline-item">
        <div class="timeline-marker-col">
          <div class="timeline-dot"></div>
          <div class="timeline-line"></div>
        </div>
        <div class="timeline-card">
          <div class="timeline-card-header">
            <h3 class="timeline-job-title">${escapeHtml(pos.title)}</h3>
            <div class="timeline-company-wrap">${logoHtml}<span class="timeline-company">${companyText}</span></div>
            <div class="timeline-date">${date}</div>
          </div>
          ${achievementsHtml ? `<ul class="timeline-achievements">${achievementsHtml}</ul>` : ''}
          ${techHtml ? `<div class="timeline-technologies">${techHtml}</div>` : ''}
        </div>
      </div>`;
      })
      .join('');
  }

  function renderSkills(data) {
    const heading = document.querySelector('#skills .section-title');
    if (heading) heading.textContent = data.heading || 'SKILLS';

    const grid = document.querySelector('.skills-grid-modern');
    if (!grid || !data.categories) return;

    grid.innerHTML = data.categories
      .map((cat) => {
        const isHighlight = cat.isHighlight ? ' highlight-box' : '';
        const tagsHtml = (cat.items || [])
          .map(
            (item) =>
              `<span class="tag"><i class="${item.icon || 'fas fa-code'}"></i> ${escapeHtml(item.name)}</span>`
          )
          .join('');
        return `
        <div class="skill-box${isHighlight}">
          <div class="skill-box-header">
            <i class="${cat.icon || 'fas fa-code'} skill-icon-large"></i>
            <h3 class="skill-box-title">${escapeHtml(cat.name)}</h3>
          </div>
          <div class="tech-tags">${tagsHtml}</div>
        </div>`;
      })
      .join('');
  }

  function renderProjects(data) {
    const section = document.getElementById('projects');
    if (!section || !data.projects || !data.projects.length) {
      if (section) section.style.display = 'none';
      return;
    }

    const heading = section.querySelector('.section-title');
    if (heading) heading.textContent = data.heading || 'Projects';

    const grid = section.querySelector('.projects-grid');
    if (!grid) return;

    grid.innerHTML = data.projects
      .map((proj) => {
        const linksHtml = [];
        if (proj.githubUrl) {
          linksHtml.push(
            `<a href="${proj.githubUrl}" target="_blank" rel="noopener noreferrer" class="project-link">Code</a>`
          );
        }
        if (proj.liveUrl && proj.liveUrl !== proj.githubUrl) {
          linksHtml.push(
            `<a href="${proj.liveUrl}" target="_blank" rel="noopener noreferrer" class="project-link">Live Demo</a>`
          );
        }
        const techHtml = (proj.technologies || [])
          .map((t) => `<span class="tech-tag">${escapeHtml(t)}</span>`)
          .join('');
        return `
        <div class="project-card">
          <h3 class="project-name">${escapeHtml(proj.name)}</h3>
          <p class="project-description">${escapeHtml(proj.description)}</p>
          <div class="project-technologies">${techHtml}</div>
          <div class="project-links">${linksHtml.join('')}</div>
        </div>`;
      })
      .join('');
  }

  function renderEducation(data) {
    // Education entries
    const eduColumn = document.querySelector('.education-column');
    if (eduColumn) {
      const heading = eduColumn.querySelector('.section-title');
      if (heading) heading.textContent = data.heading || 'EDUCATION';

      const card = eduColumn.querySelector('.education-card');
      if (card && data.entries && data.entries.length) {
        const entryHtml = (entry) => {
          const date = entry.endDate
            ? `${escapeHtml(entry.startDate || '')} – ${escapeHtml(entry.endDate)}`
            : escapeHtml(entry.startDate || '');
          return `
          <h3 class="education-degree">${escapeHtml(entry.degree)}</h3>
          <p class="education-institution">${escapeHtml(entry.institution)}</p>
          <div class="education-meta">
            <span>${date}</span>
          </div>`;
        };

        card.innerHTML = entryHtml(data.entries[0]);

        // If multiple entries, append more
        if (data.entries.length > 1) {
          data.entries.slice(1).forEach((e) => {
            const extraCard = document.createElement('div');
            extraCard.className = 'card education-card';
            extraCard.style.marginTop = '1rem';
            extraCard.innerHTML = entryHtml(e);
            card.after(extraCard);
          });
        }
      }
    }

    // Languages
    const langColumn = document.querySelector('.languages-column');
    if (langColumn && data.languages && data.languages.length) {
      const langCard = langColumn.querySelector('.languages-card');
      if (langCard) {
        const itemsHtml = data.languages
          .map((lang) => {
            const dots = Array.from({ length: 3 }, (_, i) => {
              const filled = i < lang.level ? ' filled' : '';
              return `<span class="language-dot${filled}"></span>`;
            }).join('');
            return `
            <div class="language-card">
              <span class="language-name">${escapeHtml(lang.name)}</span>
              <div class="language-dots">${dots}</div>
            </div>`;
          })
          .join('');
        langCard.innerHTML = `<div class="language-items">${itemsHtml}</div>`;
      }
    } else if (langColumn) {
      // Hide languages column if no data
      langColumn.style.display = 'none';
      const eduGrid = document.querySelector('.education-languages-grid');
      if (eduGrid) eduGrid.style.gridTemplateColumns = '1fr';
    }
  }

  function renderContact(data) {
    const heading = document.querySelector('#contact .section-title');
    if (heading) heading.textContent = data.heading || 'GET IN TOUCH';

    const intro = document.querySelector('.contact-intro');
    if (intro) intro.textContent = data.subheading || '';

    const grid = document.querySelector('.contact-grid');
    if (!grid || !data.links) return;

    grid.innerHTML = data.links
      .map((link) => {
        const url = link.url || '';
        const isMailto = url.indexOf('mailto:') === 0;
        let detail = '';
        if (isMailto) {
          detail = url.slice('mailto:'.length);
        } else {
          try {
            detail = new URL(url).hostname;
          } catch (err) {
            detail = url;
          }
        }
        const targetAttrs = isMailto ? '' : ' target="_blank" rel="noopener noreferrer"';
        return `
      <a href="${url}"${targetAttrs} class="contact-card">
        <i class="${link.icon}"></i>
        <span>${escapeHtml(link.label)}</span>
        <span class="contact-detail">${escapeHtml(detail)}</span>
      </a>`;
      })
      .join('');

    // Availability badge (after the grid)
    const existingAvailability = grid.parentElement
      ? grid.parentElement.querySelector('.contact-availability')
      : null;
    if (existingAvailability) existingAvailability.remove();
    if (data.availability) {
      const availability = document.createElement('div');
      availability.className = 'contact-availability';
      availability.innerHTML = `<span class="availability-badge"><span class="availability-dot"></span>${escapeHtml(data.availability)}</span>`;
      grid.after(availability);
    }
  }

  function renderFooter(data) {
    const brandStrong = document.querySelector('.footer-brand-compact strong');
    const brandSpan = document.querySelector('.footer-brand-compact span');
    if (brandStrong) brandStrong.textContent = data.brandName || '';
    if (brandSpan) brandSpan.textContent = data.brandTitle || '';

    const footerNav = document.querySelector('.footer-nav-compact');
    if (footerNav && data.navLinks) {
      footerNav.innerHTML = data.navLinks
        .map((link) => `<a href="${link.href}">${escapeHtml(link.label)}</a>`)
        .join('');
    }

    const footerSocial = document.querySelector('.footer-social-compact');
    if (footerSocial && data.socialLinks) {
      footerSocial.innerHTML = data.socialLinks
        .map(
          (link) =>
            `<a href="${link.url}" target="_blank" rel="noopener noreferrer" title="${escapeHtml(link.label)}" aria-label="${escapeHtml(link.label)}"><i class="${link.icon}"></i></a>`
        )
        .join('');
    }

    const copyright = document.querySelector('.footer-copyright');
    if (copyright) {
      copyright.textContent = `© ${data.year || new Date().getFullYear()} ${data.copyright || ''}`;
    }
  }

  // ======================================================================
  // SCROLL ANIMATIONS & INTERACTIONS
  // ======================================================================

  function initScrollAnimations() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('.section, .timeline-item, .skill-box').forEach((el) => {
      observer.observe(el);
    });
  }

  function initProgressBar() {
    const container = document.querySelector('.progress-bar-container');
    const fill = document.querySelector('.progress-bar-fill');
    if (!fill) return;

    // Give each checkpoint a title attribute equal to its label
    document.querySelectorAll('.checkpoint').forEach((cp) => {
      const label = cp.querySelector('.checkpoint-label');
      if (label) cp.setAttribute('title', label.textContent);
    });

    function updateProgress() {
      const scrollTop = window.scrollY;

      if (container) {
        container.classList.toggle('visible', scrollTop > 100);
      }

      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      fill.style.width = progress + '%';

      // Update checkpoints
      const checkpoints = document.querySelectorAll('.checkpoint');
      checkpoints.forEach((cp) => {
        const sectionId = cp.getAttribute('data-section');
        const section = document.getElementById(sectionId);
        if (section) {
          const rect = section.getBoundingClientRect();
          if (rect.top <= window.innerHeight / 2) {
            cp.classList.add('active');
          } else {
            cp.classList.remove('active');
          }
        }
      });
    }

    window.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress();

    // Checkpoint click navigation
    document.addEventListener('click', (e) => {
      const cp = e.target.closest('.checkpoint');
      if (cp) {
        const sectionId = cp.getAttribute('data-section');
        const section = document.getElementById(sectionId);
        if (section) section.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  function initBackToTop() {
    const btn = document.createElement('button');
    btn.className = 'back-to-top';
    btn.setAttribute('aria-label', 'Back to top');
    btn.innerHTML = '<i class="fas fa-arrow-up" aria-hidden="true"></i>';
    document.body.appendChild(btn);

    window.addEventListener(
      'scroll',
      () => {
        btn.classList.toggle('visible', window.scrollY > 600);
      },
      { passive: true }
    );

    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  function initNavbarHide() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    let lastScroll = 0;
    window.addEventListener(
      'scroll',
      () => {
        const currentScroll = window.scrollY;
        if (currentScroll > lastScroll && currentScroll > 100) {
          navbar.classList.add('navbar-hidden');
        } else {
          navbar.classList.remove('navbar-hidden');
        }
        lastScroll = currentScroll;
      },
      { passive: true }
    );
  }

  function initThemeToggle() {
    const savedTheme = localStorage.getItem('portfolio-theme') || 'light';
    if (savedTheme === 'dark') {
      document.body.setAttribute('data-theme', 'dark');
    }

    document.addEventListener('click', (e) => {
      const btn = e.target.closest('#theme-toggle');
      if (!btn) return;

      const isDark = document.body.getAttribute('data-theme') === 'dark';
      if (isDark) {
        document.body.removeAttribute('data-theme');
        localStorage.setItem('portfolio-theme', 'light');
        btn.innerHTML = '<i class="fas fa-moon"></i>';
      } else {
        document.body.setAttribute('data-theme', 'dark');
        localStorage.setItem('portfolio-theme', 'dark');
        btn.innerHTML = '<i class="fas fa-sun"></i>';
      }
    });

    // Set initial icon
    setTimeout(() => {
      const btn = document.getElementById('theme-toggle');
      if (btn) {
        const isDark = document.body.getAttribute('data-theme') === 'dark';
        btn.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
      }
    }, 100);
  }

  function initHeroAnimations() {
    // Photo tilt on scroll
    let photoTilted = false;
    const heroPhoto = document.querySelector('.hero-photo') || document.querySelector('.hero-avatar-placeholder');

    if (heroPhoto) {
      window.addEventListener('scroll', () => {
        if (!photoTilted && window.scrollY > 5) {
          heroPhoto.classList.add('tilted');
          photoTilted = true;
        }
      }, { passive: true });

      heroPhoto.addEventListener('mouseenter', () => heroPhoto.classList.remove('tilted'));
      heroPhoto.addEventListener('mouseleave', () => {
        if (photoTilted) heroPhoto.classList.add('tilted');
      });
    }
  }

  // ======================================================================
  // UTILITIES
  // ======================================================================

  function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ======================================================================
  // INITIALIZATION
  // ======================================================================

  function safeRender(name, fn, data) {
    try {
      if (data) fn(data);
    } catch (err) {
      console.warn('Failed to render ' + name + ':', err);
    }
  }

  async function init() {
    let data = {};
    try {
      data = await loadAllData();
    } catch (err) {
      console.error('Failed to load portfolio data:', err);
    }

    // Render all sections (each isolated so one bad file can't blank the page)
    safeRender('siteConfig', renderSiteConfig, data.siteConfig);
    safeRender('navigation', renderNavigation, data.navigation);
    safeRender('hero', renderHero, data.hero);
    safeRender('about', renderAbout, data.about);
    safeRender('experience', renderExperience, data.experience);
    safeRender('skills', renderSkills, data.skills);
    safeRender('projects', renderProjects, data.projects);
    safeRender('education', renderEducation, data.education);
    safeRender('contact', renderContact, data.contact);
    safeRender('footer', renderFooter, data.footer);

    // Initialize interactions (always, regardless of data failures)
    initScrollAnimations();
    initProgressBar();
    initBackToTop();
    initNavbarHide();
    initThemeToggle();
    initHeroAnimations();
  }

  // Loading screen
  window.addEventListener('load', () => {
    const loader = document.querySelector('.loader-overlay');
    if (loader) {
      setTimeout(() => loader.classList.add('hidden'), 300);
    }
  });

  // Scroll to top on reload
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }
  window.scrollTo(0, 0);

  // Start
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
