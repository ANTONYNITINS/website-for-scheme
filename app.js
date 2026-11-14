/* ==========================================================================
   ENVISION '26 — Client Application Logic (Vanilla JS)
   ========================================================================== */

let currentLang = "en";
let activeBookmarks = JSON.parse(localStorage.getItem("envision-bookmarks") || "[]");
let savedApplications = JSON.parse(localStorage.getItem("envision-applications") || "[]");
let comparedSchemes = [];
let currentFilteredSchemes = [...SCHEMES];
let lastProfile = null;
let currentSynthUtterance = null;

document.addEventListener("DOMContentLoaded", () => {
  initAccessibilityPanel();
  initRouter();
  initFilters();
  initEligibilityForm();
  initVoiceSearch();
  updateBookmarksBadge();
  renderSchemes(SCHEMES);
  loadApplicationsList();
});

/* --- ACCESSIBILITY PANEL & PREFERENCES --- */
function initAccessibilityPanel() {
  const panel = document.getElementById("accessibility-panel");
  const toggleBtn = document.getElementById("access-toggle");
  const closeBtn = document.getElementById("close-access-btn");
  const resetBtn = document.getElementById("reset-access-btn");

  // Load saved preferences from localStorage
  const savedScale = localStorage.getItem("envision-scale") || "100";
  const savedContrast = localStorage.getItem("envision-contrast") || "default";
  const savedPalette = localStorage.getItem("envision-palette") || "none";
  const savedFont = localStorage.getItem("envision-font") || "standard";
  const savedAlign = localStorage.getItem("envision-align") || "normal";
  const savedRuler = localStorage.getItem("envision-ruler") === "true";
  const savedLinks = localStorage.getItem("envision-links") === "true";
  const savedCursor = localStorage.getItem("envision-cursor") === "true";
  const savedMotion = localStorage.getItem("envision-motion") === "true";
  const savedLineSpace = localStorage.getItem("envision-linespace") || "1.6";
  const savedLetterSpace = localStorage.getItem("envision-letterspace") || "0";
  const savedWordSpace = localStorage.getItem("envision-wordspace") || "0";

  applyTextScale(savedScale);
  applyContrast(savedContrast);
  applyPalette(savedPalette);
  applyFont(savedFont);
  applyAlign(savedAlign);
  toggleReadingRuler(savedRuler);
  toggleLinkHighlight(savedLinks);
  toggleLargeCursor(savedCursor);
  toggleReduceMotion(savedMotion);
  applySpacing(savedLineSpace, savedLetterSpace, savedWordSpace);

  toggleBtn.addEventListener("click", () => {
    const expanded = toggleBtn.getAttribute("aria-expanded") === "true";
    toggleBtn.setAttribute("aria-expanded", !expanded);
    panel.hidden = expanded;
    if (!expanded) panel.focus();
  });

  closeBtn.addEventListener("click", () => {
    toggleBtn.setAttribute("aria-expanded", "false");
    panel.hidden = true;
    toggleBtn.focus();
  });

  // Global Alt+A shortcut
  window.addEventListener("keydown", (e) => {
    if (e.altKey && e.key.toLowerCase() === "a") {
      e.preventDefault();
      toggleBtn.click();
    }
  });

  resetBtn.addEventListener("click", () => {
    localStorage.clear();
    location.reload();
  });

  // Text size buttons & slider
  const slider = document.getElementById("text-scale-slider");
  slider.value = savedScale;
  document.getElementById("text-scale-val").textContent = savedScale + "%";
  slider.addEventListener("input", (e) => {
    applyTextScale(e.target.value);
  });

  document.querySelectorAll("[data-scale]").forEach(btn => {
    btn.addEventListener("click", () => {
      applyTextScale(btn.getAttribute("data-scale"));
    });
  });

  // Contrast buttons
  document.querySelectorAll("[data-contrast-opt]").forEach(btn => {
    btn.addEventListener("click", () => {
      applyContrast(btn.getAttribute("data-contrast-opt"));
    });
  });

  // Palette buttons
  document.querySelectorAll("[data-palette-opt]").forEach(btn => {
    btn.addEventListener("click", () => {
      applyPalette(btn.getAttribute("data-palette-opt"));
    });
  });

  // Font buttons
  document.querySelectorAll("[data-font-opt]").forEach(btn => {
    btn.addEventListener("click", () => {
      applyFont(btn.getAttribute("data-font-opt"));
    });
  });

  document.getElementById("toggle-left-align").addEventListener("click", function() {
    const isLeft = this.getAttribute("aria-pressed") === "true";
    applyAlign(isLeft ? "normal" : "left");
  });

  // Spacing Sliders
  document.getElementById("line-space-slider").addEventListener("input", (e) => {
    document.getElementById("line-space-val").textContent = e.target.value;
    applySpacing(e.target.value, null, null);
  });
  document.getElementById("letter-space-slider").addEventListener("input", (e) => {
    document.getElementById("letter-space-val").textContent = e.target.value + "px";
    applySpacing(null, e.target.value, null);
  });
  document.getElementById("word-space-slider").addEventListener("input", (e) => {
    document.getElementById("word-space-val").textContent = e.target.value + "px";
    applySpacing(null, null, e.target.value);
  });

  // Reading aids toggles
  document.getElementById("toggle-ruler").addEventListener("click", function() {
    const active = this.getAttribute("aria-pressed") === "true";
    toggleReadingRuler(!active);
  });
  document.getElementById("toggle-links").addEventListener("click", function() {
    const active = this.getAttribute("aria-pressed") === "true";
    toggleLinkHighlight(!active);
  });
  document.getElementById("toggle-cursor").addEventListener("click", function() {
    const active = this.getAttribute("aria-pressed") === "true";
    toggleLargeCursor(!active);
  });
  document.getElementById("toggle-motion").addEventListener("click", function() {
    const active = this.getAttribute("aria-pressed") === "true";
    toggleReduceMotion(!active);
  });

  // Mouse move handler for reading ruler
  window.addEventListener("mousemove", (e) => {
    const ruler = document.getElementById("reading-ruler");
    if (ruler.classList.contains("active")) {
      ruler.style.top = e.clientY + "px";
    }
  });

  // Language & Theme Quick Toggles
  document.getElementById("lang-toggle").addEventListener("click", toggleLanguage);
  document.getElementById("theme-quick-toggle").addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-contrast");
    applyContrast(current === "dark" ? "default" : "dark");
  });
}

function applyTextScale(scale) {
  document.documentElement.style.setProperty("--font-scale", scale / 100);
  document.getElementById("text-scale-val").textContent = scale + "%";
  document.getElementById("text-scale-slider").value = scale;
  localStorage.setItem("envision-scale", scale);
  document.querySelectorAll("[data-scale]").forEach(b => {
    b.classList.toggle("active", b.getAttribute("data-scale") === scale);
  });
}

function applyContrast(opt) {
  document.documentElement.setAttribute("data-contrast", opt);
  localStorage.setItem("envision-contrast", opt);
  document.querySelectorAll("[data-contrast-opt]").forEach(b => {
    b.classList.toggle("active", b.getAttribute("data-contrast-opt") === opt);
  });
  const isDark = opt === "dark" || opt === "aaa";
  document.getElementById("theme-icon").textContent = isDark ? "☀" : "☾";
}

function applyPalette(palette) {
  document.documentElement.setAttribute("data-palette", palette);
  localStorage.setItem("envision-palette", palette);
  document.querySelectorAll("[data-palette-opt]").forEach(b => {
    b.classList.toggle("active", b.getAttribute("data-palette-opt") === palette);
  });
}

function applyFont(font) {
  document.documentElement.setAttribute("data-font", font);
  localStorage.setItem("envision-font", font);
  document.querySelectorAll("[data-font-opt]").forEach(b => {
    b.classList.toggle("active", b.getAttribute("data-font-opt") === font);
  });
}

function applyAlign(align) {
  document.documentElement.setAttribute("data-align", align);
  localStorage.setItem("envision-align", align);
  const btn = document.getElementById("toggle-left-align");
  btn.setAttribute("aria-pressed", align === "left");
  btn.classList.toggle("active", align === "left");
}

function applySpacing(line, letter, word) {
  const root = document.documentElement;
  if (line !== null) {
    root.style.setProperty("--line-height-base", line);
    localStorage.setItem("envision-linespace", line);
  }
  if (letter !== null) {
    root.style.setProperty("--letter-spacing-base", letter + "px");
    localStorage.setItem("envision-letterspace", letter);
  }
  if (word !== null) {
    root.style.setProperty("--word-spacing-base", word + "px");
    localStorage.setItem("envision-wordspace", word);
  }
}

function toggleReadingRuler(active) {
  const ruler = document.getElementById("reading-ruler");
  ruler.classList.toggle("active", active);
  const btn = document.getElementById("toggle-ruler");
  btn.setAttribute("aria-pressed", active);
  btn.classList.toggle("active", active);
  localStorage.setItem("envision-ruler", active);
}

function toggleLinkHighlight(active) {
  document.documentElement.setAttribute("data-links", active ? "highlight" : "normal");
  const btn = document.getElementById("toggle-links");
  btn.setAttribute("aria-pressed", active);
  btn.classList.toggle("active", active);
  localStorage.setItem("envision-links", active);
}

function toggleLargeCursor(active) {
  document.documentElement.setAttribute("data-cursor", active ? "large" : "normal");
  const btn = document.getElementById("toggle-cursor");
  btn.setAttribute("aria-pressed", active);
  btn.classList.toggle("active", active);
  localStorage.setItem("envision-cursor", active);
}

function toggleReduceMotion(active) {
  document.documentElement.setAttribute("data-motion", active ? "reduce" : "normal");
  const btn = document.getElementById("toggle-motion");
  btn.setAttribute("aria-pressed", active);
  btn.classList.toggle("active", active);
  localStorage.setItem("envision-motion", active);
}

/* --- BILINGUAL I18N --- */
function toggleLanguage() {
  currentLang = currentLang === "en" ? "ta" : "en";
  document.getElementById("lang-label").textContent = currentLang === "en" ? "தமிழ்" : "English";
  document.documentElement.setAttribute("lang", currentLang);
  if (currentLang === "ta") {
    document.documentElement.style.setProperty("--font-family-base", "'Noto Sans Tamil', Inter, sans-serif");
  } else {
    const fontOpt = document.documentElement.getAttribute("data-font");
    document.documentElement.style.setProperty("--font-family-base", fontOpt === "dyslexic" ? "'Atkinson Hyperlegible', sans-serif" : "'Inter', sans-serif");
  }
  updateStaticTexts();
  renderSchemes(currentFilteredSchemes);
}

function updateStaticTexts() {
  const dict = I18N[currentLang];
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    if (dict[key]) {
      el.textContent = dict[key];
    }
  });
}

/* --- ROUTER & VIEW MANAGEMENT --- */
function initRouter() {
  document.querySelectorAll("[data-nav]").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const targetView = btn.getAttribute("data-nav");
      switchView(targetView);
    });
  });
}

function switchView(viewName) {
  document.querySelectorAll(".view").forEach(v => {
    v.classList.remove("active");
    v.hidden = true;
  });
  const target = document.getElementById("view-" + viewName);
  if (target) {
    target.classList.add("active");
    target.hidden = false;
    target.focus();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  document.querySelectorAll(".nav-btn").forEach(b => {
    b.classList.toggle("active", b.getAttribute("data-nav") === viewName);
  });
}

/* --- SCHEMES DIRECTORY & FILTERING --- */
function initFilters() {
  const catSelect = document.getElementById("filter-category");
  const categories = [...new Set(SCHEMES.map(s => s.category))];
  categories.forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    catSelect.appendChild(opt);
  });

  document.getElementById("scheme-search").addEventListener("input", applyFilters);
  document.getElementById("filter-category").addEventListener("change", applyFilters);
  document.getElementById("filter-disability").addEventListener("change", applyFilters);
  document.getElementById("filter-age").addEventListener("change", applyFilters);
  document.getElementById("sort-schemes").addEventListener("change", applyFilters);
  document.getElementById("clear-filters-btn").addEventListener("click", clearFilters);
  document.getElementById("bookmark-filter-btn").addEventListener("click", toggleBookmarkFilter);
  document.getElementById("open-compare-modal").addEventListener("click", openCompareModal);
  document.getElementById("close-compare-modal").addEventListener("click", closeCompareModal);
  document.getElementById("clear-compare-btn").addEventListener("click", clearCompare);
}

function applyFilters() {
  const query = document.getElementById("scheme-search").value.toLowerCase();
  const cat = document.getElementById("filter-category").value;
  const dis = document.getElementById("filter-disability").value;
  const age = document.getElementById("filter-age").value;
  const sort = document.getElementById("sort-schemes").value;
  const showSavedOnly = document.getElementById("bookmark-filter-btn").getAttribute("aria-pressed") === "true";

  let filtered = SCHEMES.filter(s => {
    const matchQuery = !query || s.name.toLowerCase().includes(query) || s.summary.toLowerCase().includes(query) || s.benefit.toLowerCase().includes(query);
    const matchCat = cat === "all" || s.category === cat;
    const matchDis = dis === "all" || s.disabilityType === dis || s.disabilityType === "any" || (Array.isArray(s.disabilityType) && s.disabilityType.includes(dis));
    const matchAge = age === "all" || s.ageGroup === age || s.ageGroup === "senior";
    const matchSaved = !showSavedOnly || activeBookmarks.includes(s.id);
    return matchQuery && matchCat && matchDis && matchAge && matchSaved;
  });

  if (sort === "az") {
    filtered.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sort === "category") {
    filtered.sort((a, b) => a.category.localeCompare(b.category));
  }

  currentFilteredSchemes = filtered;
  renderSchemes(filtered);
}

function clearFilters() {
  document.getElementById("scheme-search").value = "";
  document.getElementById("filter-category").value = "all";
  document.getElementById("filter-disability").value = "all";
  document.getElementById("filter-age").value = "all";
  document.getElementById("sort-schemes").value = "featured";
  document.getElementById("bookmark-filter-btn").setAttribute("aria-pressed", "false");
  document.getElementById("bookmark-filter-btn").classList.remove("active");
  applyFilters();
}

function toggleBookmarkFilter() {
  const btn = document.getElementById("bookmark-filter-btn");
  const active = btn.getAttribute("aria-pressed") === "true";
  btn.setAttribute("aria-pressed", !active);
  btn.classList.toggle("active", !active);
  applyFilters();
}

function renderSchemes(list) {
  const grid = document.getElementById("schemes-grid");
  grid.innerHTML = "";
  document.getElementById("results-counter").textContent = `Showing ${list.length} schemes`;

  if (list.length === 0) {
    grid.innerHTML = `<div class="card" style="grid-column: 1/-1; text-align: center; padding: 40px;"><h3>No schemes found matching your filter criteria.</h3></div>`;
    return;
  }

  list.forEach(s => {
    const isSaved = activeBookmarks.includes(s.id);
    const isCompared = comparedSchemes.includes(s.id);

    const card = document.createElement("article");
    card.className = "scheme-card";
    card.innerHTML = `
      <div>
        <div class="scheme-card-top">
          <span class="cat-badge">${s.category}</span>
          <button type="button" class="btn btn-ghost btn-sm bookmark-btn" data-id="${s.id}" aria-label="Bookmark scheme">
            ${isSaved ? "★ Saved" : "☆ Save"}
          </button>
        </div>
        <h3>${s.name}</h3>
        <div class="easy-read-box"><strong>Easy-Read:</strong> ${s.easyRead}</div>
        <p style="margin: 10px 0; font-size: 0.95rem; color: var(--text-secondary);">${s.summary}</p>
        <div class="scheme-benefit-pill">🎁 ${s.benefit}</div>
      </div>
      <div class="scheme-card-actions">
        <button type="button" class="btn btn-primary btn-sm view-detail-btn" data-id="${s.id}">View Details &rarr;</button>
        <button type="button" class="btn btn-outline btn-sm compare-toggle-btn" data-id="${s.id}" aria-pressed="${isCompared}">
          ${isCompared ? "✓ Comparing" : "+ Compare"}
        </button>
        <button type="button" class="btn btn-outline btn-sm tts-read-btn" data-id="${s.id}" aria-label="Read scheme aloud">🔊 Listen</button>
      </div>
    `;
    grid.appendChild(card);
  });

  // Attach event listeners
  grid.querySelectorAll(".view-detail-btn").forEach(btn => {
    btn.addEventListener("click", () => openSchemeDetail(btn.getAttribute("data-id")));
  });
  grid.querySelectorAll(".bookmark-btn").forEach(btn => {
    btn.addEventListener("click", () => toggleBookmark(btn.getAttribute("data-id")));
  });
  grid.querySelectorAll(".compare-toggle-btn").forEach(btn => {
    btn.addEventListener("click", () => toggleCompare(btn.getAttribute("data-id")));
  });
  grid.querySelectorAll(".tts-read-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const scheme = SCHEMES.find(x => x.id === btn.getAttribute("data-id"));
      if (scheme) speakText(`${scheme.name}. ${scheme.summary}. Benefit: ${scheme.benefit}`);
    });
  });
}

function toggleBookmark(id) {
  if (activeBookmarks.includes(id)) {
    activeBookmarks = activeBookmarks.filter(x => x !== id);
  } else {
    activeBookmarks.push(id);
  }
  localStorage.setItem("envision-bookmarks", JSON.stringify(activeBookmarks));
  document.getElementById("saved-count").textContent = activeBookmarks.length;
  renderSchemes(currentFilteredSchemes);
}

function updateBookmarksBadge() {
  document.getElementById("saved-count").textContent = activeBookmarks.length;
}

/* --- SIDE BY SIDE COMPARISON --- */
function toggleCompare(id) {
  if (comparedSchemes.includes(id)) {
    comparedSchemes = comparedSchemes.filter(x => x !== id);
  } else {
    if (comparedSchemes.length >= 3) {
      alert("You can compare up to 3 schemes side by side.");
      return;
    }
    comparedSchemes.push(id);
  }
  updateCompareBar();
  renderSchemes(currentFilteredSchemes);
}

function updateCompareBar() {
  const bar = document.getElementById("compare-bar");
  const namesSpan = document.getElementById("compare-list-names");
  if (comparedSchemes.length > 0) {
    bar.hidden = false;
    const names = comparedSchemes.map(id => SCHEMES.find(s => s.id === id)?.name).filter(Boolean);
    namesSpan.textContent = names.join(" | ");
  } else {
    bar.hidden = true;
  }
}

function clearCompare() {
  comparedSchemes = [];
  updateCompareBar();
  renderSchemes(currentFilteredSchemes);
}

function openCompareModal() {
  if (comparedSchemes.length === 0) return;
  const modal = document.getElementById("compare-modal");
  const wrap = document.getElementById("compare-table-wrap");

  const schemesToCompare = comparedSchemes.map(id => SCHEMES.find(s => s.id === id)).filter(Boolean);

  let html = `<table><thead><tr><th>Feature</th>`;
  schemesToCompare.forEach(s => html += `<th>${s.name}</th>`);
  html += `</tr></thead><tbody>`;

  html += `<tr><td><strong>Category</strong></td>`;
  schemesToCompare.forEach(s => html += `<td>${s.category}</td>`);
  html += `</tr>`;

  html += `<tr><td><strong>Easy-Read Summary</strong></td>`;
  schemesToCompare.forEach(s => html += `<td>${s.easyRead}</td>`);
  html += `</tr>`;

  html += `<tr><td><strong>Benefit</strong></td>`;
  schemesToCompare.forEach(s => html += `<td>${s.benefit}</td>`);
  html += `</tr>`;

  html += `<tr><td><strong>Required Documents</strong></td>`;
  schemesToCompare.forEach(s => html += `<td><ul>${s.documents.map(d => `<li>${d}</li>`).join("")}</ul></td>`);
  html += `</tr>`;

  html += `</tbody></table>`;
  wrap.innerHTML = html;
  modal.hidden = false;
}

function closeCompareModal() {
  document.getElementById("compare-modal").hidden = true;
}

/* --- ELIGIBILITY ENGINE & PLAIN WORDS REASONS --- */
function initEligibilityForm() {
  const form = document.getElementById("eligibility-form");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    runEligibilityMatching();
  });
}

function runEligibilityMatching() {
  const name = document.getElementById("inp-name").value.trim();
  if (!name) {
    showFormError("Please enter the applicant's full name.");
    return;
  }
  hideFormError();

  const profile = {
    name,
    age: Number(document.getElementById("inp-age").value),
    disabilityCategory: document.getElementById("inp-disability").value,
    disabilityPercent: Number(document.getElementById("inp-percent").value),
    income: Number(document.getElementById("inp-income").value),
    community: document.getElementById("inp-community").value,
    education: document.getElementById("inp-education").value,
    occupation: document.getElementById("inp-occupation").value,
    gender: document.getElementById("inp-gender").value,
    district: document.getElementById("inp-district").value,
    isResident: document.getElementById("chk-tn-resident").checked,
    isFirstGrad: document.getElementById("chk-first-grad").checked
  };

  lastProfile = profile;
  const { matched, unmatched } = evaluateSchemes(profile);

  document.getElementById("count-matched").textContent = matched.length;
  document.getElementById("count-unmatched").textContent = unmatched.length;
  document.getElementById("res-profile-summary").textContent = `Profile: ${profile.name}, Age ${profile.age}, ${profile.disabilityCategory} (${profile.disabilityPercent}%), Family Income ₹${profile.income.toLocaleString("en-IN")}, District: ${profile.district}`;

  renderResultsList("matched-results-list", matched, true, profile);
  renderResultsList("unmatched-results-list", unmatched, false, profile);

  switchView("results");
}

function evaluateSchemes(p) {
  const matched = [];
  const unmatched = [];

  SCHEMES.forEach(s => {
    const reasons = [];
    let isEligible = true;

    // Residency check
    if (!p.isResident) {
      isEligible = false;
      reasons.push("Applicant must be a permanent resident of Tamil Nadu.");
    } else {
      reasons.push("✓ Permanent resident of Tamil Nadu.");
    }

    // Disability Requirement
    if (s.criteria.disabilityRequired) {
      if (p.disabilityPercent < 40) {
        isEligible = false;
        reasons.push(`✗ Disability percentage is ${p.disabilityPercent}%. Benchmark requires at least 40%.`);
      } else {
        reasons.push(`✓ Benchmark disability percentage (${p.disabilityPercent}%) met.`);
      }

      if (s.criteria.disabilityType) {
        const types = Array.isArray(s.criteria.disabilityType) ? s.criteria.disabilityType : [s.criteria.disabilityType];
        if (!types.includes("any") && !types.includes(p.disabilityCategory)) {
          isEligible = false;
          reasons.push(`✗ Scheme requires disability type: ${types.join(", ")} (applicant has ${p.disabilityCategory}).`);
        } else {
          reasons.push(`✓ Disability category matches scheme requirement.`);
        }
      }
    }

    // Income Check
    if (s.criteria.maxIncome !== undefined) {
      if (p.income > s.criteria.maxIncome) {
        isEligible = false;
        reasons.push(`✗ Family income of ₹${p.income.toLocaleString("en-IN")} exceeds maximum limit of ₹${s.criteria.maxIncome.toLocaleString("en-IN")}.`);
      } else {
        reasons.push(`✓ Family income within permissible limit (≤ ₹${s.criteria.maxIncome.toLocaleString("en-IN")}).`);
      }
    }

    // Age Check
    if (s.criteria.minAge !== undefined && p.age < s.criteria.minAge) {
      isEligible = false;
      reasons.push(`✗ Age ${p.age} is below minimum requirement of ${s.criteria.minAge} years.`);
    }
    if (s.criteria.maxAge !== undefined && p.age > s.criteria.maxAge) {
      isEligible = false;
      reasons.push(`✗ Age ${p.age} exceeds maximum limit of ${s.criteria.maxAge} years.`);
    }

    // Community & Education Specifics (e.g., BC/MBC 11th-12th English)
    if (s.criteria.community && !s.criteria.community.includes(p.community)) {
      isEligible = false;
      reasons.push(`✗ Community category (${p.community.toUpperCase}) does not match scheme restriction.`);
    }
    if (s.criteria.education && !s.criteria.education.includes(p.education)) {
      isEligible = false;
      reasons.push(`✗ Educational qualification requirement not met for this scheme.`);
    }
    if (s.criteria.firstGenGraduate && !p.isFirstGrad) {
      isEligible = false;
      reasons.push(`✗ Scheme requires no graduate in family (first-generation graduate family).`);
    }

    if (isEligible) {
      matched.push({ scheme: s, reasons });
    } else {
      unmatched.push({ scheme: s, reasons });
    }
  });

  return { matched, unmatched };
}

function renderResultsList(containerId, list, isMatch, profile) {
  const container = document.getElementById(containerId);
  container.innerHTML = "";

  if (list.length === 0) {
    container.innerHTML = `<div class="card"><p>No schemes in this category for the current profile.</p></div>`;
    return;
  }

  list.forEach(item => {
    const s = item.scheme;
    const div = document.createElement("article");
    div.className = `result-item ${isMatch ? "matched" : "unmatched"}`;
    div.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 10px; margin-bottom: 10px;">
        <div>
          <span class="cat-badge">${s.category}</span>
          <h3 style="margin: 6px 0 2px;">${s.name}</h3>
        </div>
        <span class="status-pill ${isMatch ? "match" : "miss"}">
          ${isMatch ? "✓ Likely Eligible" : "ℹ Missing Criteria"}
        </span>
      </div>
      <p><strong>Benefit:</strong> ${s.benefit}</p>
      <div class="easy-read-box" style="margin: 10px 0;"><strong>Easy-Read:</strong> ${s.easyRead}</div>
      <p><strong>Why this result:</strong></p>
      <ul class="reason-list">
        ${item.reasons.map(r => `<li>${r}</li>`).join("")}
      </ul>
      <div style="margin-top: 14px; display: flex; gap: 10px;">
        <button type="button" class="btn btn-primary btn-sm view-detail-btn" data-id="${s.id}">View Details &amp; Draft PDF &rarr;</button>
      </div>
    `;
    container.appendChild(div);
  });

  container.querySelectorAll(".view-detail-btn").forEach(btn => {
    btn.addEventListener("click", () => openSchemeDetail(btn.getAttribute("data-id")));
  });
}

function showFormError(msg) {
  const err = document.getElementById("form-error-msg");
  err.textContent = msg;
  err.hidden = false;
  err.scrollIntoView({ behavior: "smooth" });
}

function hideFormError() {
  document.getElementById("form-error-msg").hidden = true;
}

/* --- SCHEME DETAIL & DRAFT PDF GENERATION --- */
function openSchemeDetail(id) {
  const scheme = SCHEMES.find(s => s.id === id);
  if (!scheme) return;

  const card = document.getElementById("scheme-detail-card");
  const profileName = lastProfile ? lastProfile.name : "Kavitha / Arjun";
  const profileAge = lastProfile ? lastProfile.age : "22";
  const profileIncome = lastProfile ? lastProfile.income : "72,000";

  card.innerHTML = `
    <span class="cat-badge">${scheme.category}</span>
    <h1 style="margin: 10px 0;">${scheme.name}</h1>
    <p class="lead">${scheme.summary}</p>
    
    <div class="easy-read-box" style="margin: 20px 0;">
      <h3 style="margin-top: 0;">Easy-Read Summary</h3>
      <p style="margin-bottom: 0;">${scheme.easyRead}</p>
    </div>

    <div class="detail-section">
      <h3>Benefit Details</h3>
      <p><strong>${scheme.benefit}</strong></p>
    </div>

    <div class="detail-section">
      <h3>Required Documents to Check</h3>
      <ul>
        ${scheme.documents.map(d => `<li>${d}</li>`).join("")}
      </ul>
    </div>

    <div class="detail-section">
      <h3>Step-by-Step How to Apply</h3>
      <ol style="padding-left: 20px; line-height: 1.7;">
        <li>Verify your eligibility using the ENVISION check tool and confirm your UDID / Disability Identity card is up to date.</li>
        <li>Gather the required original documents listed above.</li>
        <li>Visit your nearest <strong>TN e-Sevai Centre</strong> or <strong>Common Service Centre (CSC)</strong>, or approach the District Differently Abled Welfare Officer (DDAWO) at the District Collectorate.</li>
        <li>Submit the pre-filled draft form and reference code.</li>
      </ol>
      <div class="alert alert-info" style="margin-top: 14px;">
        <span>ℹ️</span>
        <span>Note: If specific department guidelines or office addresses are updated, confirm directly with the Department for the Welfare of Differently Abled Persons.</span>
      </div>
    </div>

    <div class="card" style="background: var(--bg-subtle); margin-top: 24px;">
      <h3 style="margin-top: 0;">Pre-Filled Draft Application Preview</h3>
      <p style="font-size: 0.9rem; color: var(--text-secondary);">This draft is generated instantly on your device for demonstration and offline printing.</p>
      <div style="background: var(--bg-surface); border: 1px dashed var(--border-color); padding: 16px; border-radius: 8px; margin: 12px 0;">
        <p><strong>Applicant Name:</strong> ${profileName}</p>
        <p><strong>Age:</strong> ${profileAge} &bull; <strong>Annual Income:</strong> ₹${profileIncome}</p>
        <p><strong>Scheme:</strong> ${scheme.name}</p>
        <p style="color: #dc2626; font-size: 0.85rem; font-weight: 700; margin-bottom: 0;">DEMO ONLY — NOT AN OFFICIAL GOVERNMENT SUBMISSION</p>
      </div>
      <div style="display: flex; flex-wrap: wrap; gap: 10px; margin-top: 16px;">
        <button type="button" id="generate-pdf-btn" class="btn btn-primary" data-id="${scheme.id}">
          🖨️ Download / Print Draft PDF Form
        </button>
      </div>
    </div>
  `;

  // Bookmark button in detail view
  const bookmarkBtn = document.getElementById("detail-bookmark-btn");
  const isSaved = activeBookmarks.includes(scheme.id);
  bookmarkBtn.textContent = isSaved ? "★ Saved" : "☆ Save";
  bookmarkBtn.onclick = () => {
    toggleBookmark(scheme.id);
    bookmarkBtn.textContent = activeBookmarks.includes(scheme.id) ? "★ Saved" : "☆ Save";
  };

  document.getElementById("detail-print-btn").onclick = () => window.print();
  document.getElementById("detail-share-btn").onclick = () => {
    if (navigator.share) {
      navigator.share({ title: scheme.name, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Scheme link copied to clipboard!");
    }
  };

  document.getElementById("generate-pdf-btn").onclick = () => {
    generateDraftPDF(scheme, profileName, profileAge, profileIncome);
  };

  document.getElementById("back-from-detail").onclick = () => {
    switchView(lastProfile ? "results" : "browse");
  };

  switchView("detail");
}

function generateDraftPDF(scheme, name, age, income) {
  const refCode = "ENV-TN-" + Math.floor(100000 + Math.random() * 900000);
  const dateStr = new Date().toLocaleDateString("en-IN");

  const newApp = {
    reference: refCode,
    applicantName: name,
    schemeId: scheme.id,
    schemeName: scheme.name,
    status: "Draft created (Print-Ready)",
    createdAt: dateStr
  };

  savedApplications.unshift(newApp);
  localStorage.setItem("envision-applications", JSON.stringify(savedApplications));
  updateAppBadge();

  // Trigger print dialog as simulated PDF draft
  window.print();
  alert(`Draft application successfully created!\nReference Number: ${refCode}\nSaved to "My applications".`);
}

function updateAppBadge() {
  document.getElementById("app-count-badge").textContent = savedApplications.length;
}

function loadApplicationsList() {
  updateAppBadge();
  const container = document.getElementById("applications-container");
  if (savedApplications.length === 0) {
    container.innerHTML = `<div class="card"><p>No draft applications created yet. Browse schemes and generate a draft PDF to save records here.</p></div>`;
    return;
  }

  let html = `<div class="table-responsive"><table><thead><tr><th>Reference</th><th>Applicant Name</th><th>Scheme Name</th><th>Status</th><th>Date</th></tr></thead><tbody>`;
  savedApplications.forEach(a => {
    html += `<tr><td><strong>${a.reference}</strong></td><td>${a.applicantName}</td><td>${a.schemeName}</td><td><span class="status-pill match">${a.status}</span></td><td>${a.createdAt}</td></tr>`;
  });
  html += `</tbody></table></div>`;
  container.innerHTML = html;
}

/* --- VOICE & SPEECH SYNTHESIS --- */
function speakText(text) {
  if (!('speechSynthesis' in window)) {
    alert("Speech synthesis is not supported in this browser.");
    return;
  }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = currentLang === "ta" ? "ta-IN" : "en-IN";
  utterance.rate = Number(document.getElementById("tts-rate").value);

  const player = document.getElementById("tts-player");
  player.hidden = false;
  document.getElementById("tts-status-text").textContent = "Reading aloud...";

  utterance.onend = () => { player.hidden = true; };
  utterance.onerror = () => { player.hidden = true; };

  currentSynthUtterance = utterance;
  window.speechSynthesis.speak(utterance);

  document.getElementById("tts-pause-btn").onclick = () => window.speechSynthesis.pause();
  document.getElementById("tts-resume-btn").onclick = () => window.speechSynthesis.resume();
  document.getElementById("tts-stop-btn").onclick = () => {
    window.speechSynthesis.cancel();
    player.hidden = true;
  };
}

document.getElementById("read-results-btn")?.addEventListener("click", () => {
  const matchedCount = document.getElementById("count-matched").textContent;
  speakText(`You have ${matchedCount} matching schemes based on your eligibility profile.`);
});

/* --- VOICE SEARCH & DICTATION --- */
function initVoiceSearch() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) return;

  const recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;

  document.getElementById("voice-search-btn").addEventListener("click", () => {
    recognition.lang = currentLang === "ta" ? "ta-IN" : "en-IN";
    recognition.start();
    document.getElementById("scheme-search").placeholder = "Listening...";
  });

  recognition.onresult = (e) => {
    const text = e.results[0][0].transcript;
    document.getElementById("scheme-search").value = text;
    applyFilters();
    document.getElementById("scheme-search").placeholder = "Search by keyword, benefit...";
  };

  recognition.onerror = () => {
    document.getElementById("scheme-search").placeholder = "Search by keyword, benefit...";
  };

  // Mic buttons for form fields
  document.querySelectorAll(".mic-field-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const targetId = btn.getAttribute("data-target");
      const field = document.getElementById(targetId);
      const rec = new SpeechRecognition();
      rec.lang = currentLang === "ta" ? "ta-IN" : "en-IN";
      rec.start();
      rec.onresult = (evt) => {
        field.value = evt.results[0][0].transcript;
      };
    });
  });
}
