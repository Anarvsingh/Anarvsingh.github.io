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
      DATA_FILES.map((url) => fetch(url).then((r) => r.json()))
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
        <div class="checkpoint" data-section="${cp.id}">
          <div class="checkpoint-dot"></div>
          <span class="checkpoint-label">${cp.label}</span>
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
        .map((item) => `<a href="${item.href}" class="nav-link">${item.label}</a>`)
        .join('');
      const ctaHtml = data.ctaText
        ? `<a href="${data.ctaHref || '#contact'}" class="nav-cta">${data.ctaText}</a>`
        : '';
      const themeBtn = `<button id="theme-toggle" class="theme-toggle-nav" aria-label="Toggle theme"><i class="fas fa-moon"></i></button>`;
      navRight.innerHTML = linksHtml + ctaHtml + themeBtn;
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
            `<a href="${link.url}" target="_blank" class="social-btn" title="${link.label}"><i class="${link.icon}"></i></a>`
        )
        .join('');
    }

    // Tech badges
    const badgesContainer = document.querySelector('.tech-badges');
    if (badgesContainer && data.techBadges) {
      badgesContainer.innerHTML = data.techBadges
        .map(
          (badge) =>
            `<span class="tech-badge"><i class="${badge.icon}"></i> ${badge.label}</span>`
        )
        .join('');
    }

    // Terminal block
    renderTerminal(data.terminalCommands || {}, data.name || 'Developer');
  }

  function renderTerminal(cmds, name) {
    const terminalBody = document.querySelector('.terminal-body');
    if (!terminalBody) return;

    // Build ASCII art from name
    const initials = name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .toUpperCase();

    let lines = [];
    lines.push({ type: 'highlight', text: `Welcome to ${name}'s Terminal` });
    lines.push({ type: 'info', text: '─'.repeat(50) });
    lines.push({ type: 'output', text: `Interactive Terminal Resume` });
    lines.push({ type: 'info', text: '─'.repeat(50) });
    lines.push({ type: 'output', text: '' });

    // About section
    if (cmds.about) {
      lines.push({ type: 'prompt-cmd', prompt: '~$', cmd: 'about' });
      lines.push({ type: 'accent', text: cmds.about.title || 'About Me' });
      lines.push({ type: 'output', text: cmds.about.content || '' });
      if (cmds.about.highlights) {
        cmds.about.highlights.forEach((h) => {
          lines.push({ type: 'info', text: '  > ' + h });
        });
      }
      lines.push({ type: 'output', text: '' });
    }

    // Skills
    if (cmds.skills && cmds.skills.length) {
      lines.push({ type: 'prompt-cmd', prompt: '~$', cmd: 'skills' });
      lines.push({ type: 'highlight', text: 'Technical Skills' });
      // Chunk skills into rows
      const chunks = [];
      for (let i = 0; i < cmds.skills.length; i += 4) {
        chunks.push(cmds.skills.slice(i, i + 4).join('  |  '));
      }
      chunks.forEach((chunk) => lines.push({ type: 'command', text: '  ' + chunk }));
      lines.push({ type: 'output', text: '' });
    }

    // Experience
    if (cmds.experience && cmds.experience.length) {
      lines.push({ type: 'prompt-cmd', prompt: '~$', cmd: 'experience' });
      lines.push({ type: 'highlight', text: 'Professional Experience' });
      cmds.experience.forEach((exp) => {
        lines.push({ type: 'command', text: `  ${exp.title} @ ${exp.company}` });
        lines.push({ type: 'output', text: `  ${exp.period} | ${exp.location}` });
      });
      lines.push({ type: 'output', text: '' });
    }

    // Contact
    if (cmds.contact) {
      lines.push({ type: 'prompt-cmd', prompt: '~$', cmd: 'contact' });
      lines.push({ type: 'accent', text: 'Contact Information' });
      if (cmds.contact.email) lines.push({ type: 'output', text: '  Email:    ' + cmds.contact.email });
      if (cmds.contact.website) lines.push({ type: 'output', text: '  Website:  ' + cmds.contact.website });
      if (cmds.contact.github) lines.push({ type: 'output', text: '  GitHub:   ' + cmds.contact.github });
      if (cmds.contact.linkedin) lines.push({ type: 'output', text: '  LinkedIn: ' + cmds.contact.linkedin });
    }

    // Render lines
    terminalBody.innerHTML = lines
      .map((line) => {
        if (line.type === 'prompt-cmd') {
          return `<div class="terminal-line"><span class="terminal-prompt">${line.prompt}</span> <span class="terminal-command">${line.cmd}</span></div>`;
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

    card.innerHTML = data.paragraphs
      .map((para) => {
        let text = para.text || '';
        // Replace highlight placeholders
        if (para.highlights) {
          para.highlights.forEach((h) => {
            const colorClass = 'highlight-' + (h.color || 'yellow');
            const placeholder = `{${h.key}}`;
            text = text.replace(
              placeholder,
              `<span class="highlight ${colorClass}">${h.text}</span>`
            );
          });
        }
        return `<p class="text">${text}</p>`;
      })
      .join('');
  }

  function renderExperience(data) {
    const heading = document.querySelector('#experience .section-title-center');
    if (heading) heading.textContent = data.heading || 'My Journey';

    const timelineList = document.querySelector('.timeline-list');
    if (!timelineList || !data.positions) return;

    timelineList.innerHTML = data.positions
      .map(
        (pos) => `
      <div class="timeline-item-flat">
        <div class="timeline-dot"></div>
        <div class="timeline-content-flat">
          <h4 class="timeline-title">${escapeHtml(pos.title)} @ ${escapeHtml(pos.company)}</h4>
          <p class="timeline-date">${escapeHtml(pos.startDate)} - ${escapeHtml(pos.endDate || 'Present')}</p>
          <p class="timeline-description">${escapeHtml(pos.description)}</p>
          <p class="timeline-location"><i class="fas fa-map-marker-alt"></i> ${escapeHtml(pos.location || '')}</p>
        </div>
      </div>`
      )
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
          linksHtml.push(`<a href="${proj.githubUrl}" target="_blank" class="icon-link" title="GitHub"><i class="fab fa-github"></i></a>`);
        }
        if (proj.liveUrl) {
          linksHtml.push(`<a href="${proj.liveUrl}" target="_blank" class="icon-link" title="Live Demo"><i class="fas fa-external-link-alt"></i></a>`);
        }
        const techHtml = (proj.technologies || [])
          .map((t) => `<span class="tag">${escapeHtml(t)}</span>`)
          .join('');
        return `
        <div class="project-card">
          <div class="project-header">
            <h3 class="project-title">${escapeHtml(proj.name)}</h3>
            <div class="project-links">${linksHtml.join('')}</div>
          </div>
          <p class="project-desc">${escapeHtml(proj.description)}</p>
          <div class="tech-tags">${techHtml}</div>
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
        const entry = data.entries[0]; // Primary entry
        card.innerHTML = `
          <div class="education-header">
            <div>
              <h3 class="education-title">${escapeHtml(entry.degree)}</h3>
              <p class="education-school">${escapeHtml(entry.institution)}</p>
            </div>
            <span class="badge">${escapeHtml(entry.startDate || '')} - ${escapeHtml(entry.endDate || '')}</span>
          </div>
          <p class="education-location"><i class="fas fa-map-marker-alt"></i> ${escapeHtml(entry.location || '')}</p>`;

        // If multiple entries, append more
        if (data.entries.length > 1) {
          data.entries.slice(1).forEach((e) => {
            const extraCard = document.createElement('div');
            extraCard.className = 'card education-card';
            extraCard.style.marginTop = '1rem';
            extraCard.innerHTML = `
              <div class="education-header">
                <div>
                  <h3 class="education-title">${escapeHtml(e.degree)}</h3>
                  <p class="education-school">${escapeHtml(e.institution)}</p>
                </div>
                <span class="badge">${escapeHtml(e.startDate || '')} - ${escapeHtml(e.endDate || '')}</span>
              </div>
              <p class="education-location"><i class="fas fa-map-marker-alt"></i> ${escapeHtml(e.location || '')}</p>`;
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
        langCard.innerHTML = data.languages
          .map((lang) => {
            const stars = Array.from({ length: 3 }, (_, i) => {
              const filled = i < lang.level ? ' filled' : '';
              return `<span class="star${filled}"></span>`;
            }).join('');
            return `
            <div class="language-item">
              <span class="language-name-inline">${escapeHtml(lang.name)}</span>
              <div class="language-stars">${stars}</div>
            </div>`;
          })
          .join('');
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
      .map(
        (link) => `
      <a href="${link.url}" target="_blank" class="contact-card">
        <i class="${link.icon}"></i>
        <span>${escapeHtml(link.label)}</span>
      </a>`
      )
      .join('');
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
            `<a href="${link.url}" target="_blank" title="${link.label}"><i class="${link.icon}"></i></a>`
        )
        .join('');
    }

    const copyright = document.querySelector('.footer-copyright');
    if (copyright) {
      copyright.textContent = `\u00A9 ${data.year || new Date().getFullYear()} ${data.copyright || ''}`;
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

  function initHighlightAnimations() {
    const highlights = document.querySelectorAll('.highlight');
    if (!highlights.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Randomly set direction
            const direction = Math.random() > 0.5 ? 'right' : 'left';
            entry.target.setAttribute('data-direction', direction);
            entry.target.style.setProperty('--highlight-progress', '100%');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    highlights.forEach((el) => observer.observe(el));
  }

  function initLanguageStarAnimations() {
    const stars = document.querySelectorAll('.language-stars .star');
    if (!stars.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const starEls = entry.target.querySelectorAll('.star');
            starEls.forEach((star, i) => {
              setTimeout(() => star.classList.add('visible'), i * 150);
            });
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    document.querySelectorAll('.language-stars').forEach((el) => observer.observe(el));
  }

  function initProgressBar() {
    const fill = document.querySelector('.progress-bar-fill');
    if (!fill) return;

    function updateProgress() {
      const scrollTop = window.scrollY;
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

    // Falling SVG deco
    let terminalFallen = false;
    const decoTerminal = document.querySelector('.deco-terminal');
    const heroContent = document.querySelector('.hero-content');

    if (decoTerminal && heroContent) {
      function calculateFallDistance() {
        const heroContentRect = heroContent.getBoundingClientRect();
        const heroContentBottom = heroContentRect.bottom;
        const terminalRect = decoTerminal.getBoundingClientRect();
        const terminalFall = Math.max(0, heroContentBottom - terminalRect.bottom - 50);
        decoTerminal.style.setProperty('--fall-distance', `${terminalFall}px`);
      }

      calculateFallDistance();
      window.addEventListener('resize', calculateFallDistance);

      window.addEventListener('scroll', () => {
        if (!terminalFallen && window.scrollY > 5) {
          decoTerminal.classList.add('falling');
          terminalFallen = true;
        }
      }, { passive: true });
    }
  }

  function initPaperTearParallax() {
    const pageGap = document.querySelector('.page-gap');
    const paperTearBottom = document.querySelector('.paper-tear-bottom');
    const paperTearBottomBgGray = document.querySelector('.paper-tear-bottom svg path[fill="#d0d0d0"]');
    const tearTapeSticker = document.querySelector('.tear-tape-sticker');
    const minGapHeight = -30;

    if (!pageGap || !paperTearBottom) return;

    function updateTapePosition() {
      if (paperTearBottom && tearTapeSticker) {
        const rect = paperTearBottom.getBoundingClientRect();
        tearTapeSticker.style.setProperty('--tape-position', `${rect.top}px`);
      }
    }

    function updateGapParallax() {
      const isMobile = window.innerWidth <= 768;
      if (isMobile) return;

      const scrollY = window.scrollY;
      const initialGapHeight = 300;
      const scrollStart = 100;
      const scrollRange = 200;
      const stickerDelay = 30;
      const stickerStart = scrollStart + scrollRange + stickerDelay;
      const stickerRange = 60;

      updateTapePosition();

      if (scrollY <= scrollStart) {
        pageGap.style.setProperty('height', initialGapHeight + 'px', 'important');
        paperTearBottom.style.setProperty('margin-top', '0px', 'important');
        if (paperTearBottomBgGray) paperTearBottomBgGray.style.opacity = '1';
        if (tearTapeSticker) {
          tearTapeSticker.style.transform = 'rotate(-8deg) translateY(-40px) translateZ(30px) rotateX(35deg)';
          tearTapeSticker.style.opacity = '0';
        }
      } else if (scrollY >= scrollStart && scrollY <= scrollStart + scrollRange) {
        const progress = (scrollY - scrollStart) / scrollRange;
        const currentHeight = initialGapHeight - (initialGapHeight - minGapHeight) * progress;

        if (currentHeight >= 0) {
          pageGap.style.setProperty('height', currentHeight + 'px', 'important');
          paperTearBottom.style.setProperty('margin-top', '0px', 'important');
          if (paperTearBottomBgGray) paperTearBottomBgGray.style.opacity = '1';
          if (tearTapeSticker) {
            tearTapeSticker.style.transform = 'rotate(-8deg) translateY(-100px) translateZ(50px) rotateX(45deg)';
            tearTapeSticker.style.opacity = '0';
          }
        } else {
          pageGap.style.setProperty('height', '0px', 'important');
          paperTearBottom.style.setProperty('margin-top', currentHeight + 'px', 'important');
          const negativePart = Math.abs(minGapHeight);
          const negativeProgress = Math.abs(currentHeight) / negativePart;
          const opacity = 1 - negativeProgress;
          if (paperTearBottomBgGray) paperTearBottomBgGray.style.opacity = opacity;
          if (tearTapeSticker) {
            tearTapeSticker.style.transform = 'rotate(-8deg) translateY(-100px) translateZ(50px) rotateX(45deg)';
            tearTapeSticker.style.opacity = '0';
          }
        }
      } else if (scrollY > stickerStart && scrollY < stickerStart + stickerRange) {
        pageGap.style.setProperty('height', '0px', 'important');
        paperTearBottom.style.setProperty('margin-top', minGapHeight + 'px', 'important');
        if (paperTearBottomBgGray) paperTearBottomBgGray.style.opacity = '0';
        if (tearTapeSticker) {
          const stickerProgress = (scrollY - stickerStart) / stickerRange;
          const translateY = -40 + 40 * stickerProgress;
          const translateZ = 30 - 30 * stickerProgress;
          const rotateX = 35 - 35 * stickerProgress;
          const opacityVal = Math.min(1, Math.max(0, (stickerProgress - 0.35) * 1.54));
          tearTapeSticker.style.transform = `rotate(-8deg) translateY(${translateY}px) translateZ(${translateZ}px) rotateX(${rotateX}deg)`;
          tearTapeSticker.style.opacity = opacityVal;
        }
      } else if (scrollY >= stickerStart + stickerRange) {
        pageGap.style.setProperty('height', '0px', 'important');
        paperTearBottom.style.setProperty('margin-top', minGapHeight + 'px', 'important');
        if (paperTearBottomBgGray) paperTearBottomBgGray.style.opacity = '0';
        if (tearTapeSticker) {
          tearTapeSticker.style.transform = 'rotate(-8deg) translateY(0px) translateZ(0px) rotateX(0deg)';
          tearTapeSticker.style.opacity = '1';
        }
      } else {
        pageGap.style.setProperty('height', '0px', 'important');
        paperTearBottom.style.setProperty('margin-top', minGapHeight + 'px', 'important');
        if (paperTearBottomBgGray) paperTearBottomBgGray.style.opacity = '0';
        if (tearTapeSticker) {
          tearTapeSticker.style.transform = 'rotate(-8deg) translateY(-40px) translateZ(30px) rotateX(35deg)';
          tearTapeSticker.style.opacity = '0';
        }
      }
    }

    window.addEventListener('scroll', updateGapParallax, { passive: true });
    window.addEventListener('resize', updateGapParallax);
    requestAnimationFrame(updateGapParallax);
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

  async function init() {
    try {
      const data = await loadAllData();

      // Render all sections
      renderSiteConfig(data.siteConfig);
      renderNavigation(data.navigation);
      renderHero(data.hero);
      renderAbout(data.about);
      renderExperience(data.experience);
      renderSkills(data.skills);
      renderProjects(data.projects);
      renderEducation(data.education);
      renderContact(data.contact);
      renderFooter(data.footer);

      // Initialize interactions
      initScrollAnimations();
      initHighlightAnimations();
      initLanguageStarAnimations();
      initProgressBar();
      initNavbarHide();
      initThemeToggle();
      initHeroAnimations();
      initPaperTearParallax();
    } catch (err) {
      console.error('Failed to load portfolio data:', err);
    }
  }

  // Loading screen
  window.addEventListener('load', () => {
    const loader = document.querySelector('.loader-overlay');
    if (loader) {
      setTimeout(() => loader.classList.add('hidden'), 1200);
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
