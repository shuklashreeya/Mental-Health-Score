// ============================================================
// MindBalance: frontend logic
// ============================================================

const API_URL = "https://mental-health-score-t2ic.onrender.com";

// ---- field configuration (mirrors the StudentData pydantic model) -----
const FIELD_RULES = {
  age:                     { type: "number", min: 10, max: 100 },
  gender:                  { type: "select" },
  country:                 { type: "text" },
  academic_level:          { type: "select" },
  most_used_platform:      { type: "select" },
  purpose_of_use:          { type: "select" },
  avg_daily_usage_hours:   { type: "number", min: 1, max: 24 },
  daily_unlocks:           { type: "number", min: 0 },
  study_hours:             { type: "number", min: 0, max: 24 },
  physical_activity_hours: { type: "number", min: 0, max: 24 },
  sleep_hours_per_night:   { type: "number", min: 0, max: 24 },
  stress_level:            { type: "select" },
};

const form = document.getElementById("predict-form");
const submitBtn = document.getElementById("submit-btn");

const stateIdle = document.getElementById("state-idle");
const stateLoading = document.getElementById("state-loading");
const stateError = document.getElementById("state-error");
const stateResult = document.getElementById("state-result");
const errorMessageEl = document.getElementById("error-message");
const scoreValueEl = document.getElementById("score-value");
const scoreLabelEl = document.getElementById("score-label");
const scoreArcSvg = document.getElementById("score-arc");
const wheelSvg = document.getElementById("balance-wheel");
const strongestHabitEl = document.getElementById("strongest-habit");
const careHabitEl = document.getElementById("care-habit");
const loadingMessageEl = document.getElementById("loading-message");
const ciciImageEl = document.getElementById("cici-image");
const ciciMessageEl = document.getElementById("cici-message");

// ============================================================
// Balance wheel (live radar of 5 lifestyle habits)
// ============================================================

const WHEEL_AXES = [
  { key: "sleep_hours_per_night",       label: "Sleep",   max: 12, invert: false },
  { key: "physical_activity_hours",     label: "Activity",max: 6,  invert: false },
  { key: "study_hours",                 label: "Study",   max: 10, invert: false },
  { key: "avg_daily_usage_hours",       label: "Screen",  max: 12, invert: true  },
  { key: "stress_level",                label: "Calm",    max: 1,  invert: false, stress: true },
];

const STRESS_MAP = { "Low": 1, "Medium": 0.66, "High": 0.33, "Very High": 0 };

function getWheelValues() {
  const data = new FormData(form);
  return WHEEL_AXES.map(axis => {
    if (axis.stress) {
      const v = data.get(axis.key);
      return STRESS_MAP[v] ?? 0.5;
    }
    const raw = parseFloat(data.get(axis.key));
    if (isNaN(raw)) return 0.35; // gentle default so the wheel isn't empty
    let norm = raw / axis.max;
    if (axis.invert) norm = 1 - norm;
    return Math.max(0.06, Math.min(1, norm));
  });
}

function drawWheel() {
  const size = 300, cx = size / 2, cy = size / 2, r = 105;
  const values = getWheelValues();
  const n = WHEEL_AXES.length;
  const angleFor = i => (Math.PI * 2 * i) / n - Math.PI / 2;

  const ringLevels = [0.25, 0.5, 0.75, 1];
  let svg = "";

  // background rings
  ringLevels.forEach(level => {
    const pts = WHEEL_AXES.map((_, i) => pointAt(cx, cy, r * level, angleFor(i))).join(" ");
    svg += `<polygon points="${pts}" fill="none" stroke="#E3DDC5" stroke-width="1"/>`;
  });

  // spokes
  WHEEL_AXES.forEach((_, i) => {
    const [x, y] = pointAt(cx, cy, r, angleFor(i)).split(",").map(Number);
    svg += `<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke="#E3DDC5" stroke-width="1"/>`;
  });

  // data polygon
  const dataPts = values.map((v, i) => pointAt(cx, cy, r * v, angleFor(i))).join(" ");
  svg += `<polygon points="${dataPts}" fill="rgba(63,91,62,0.22)" stroke="#3F5B3E" stroke-width="2" stroke-linejoin="round"/>`;

  // data dots
  values.forEach((v, i) => {
    const [x, y] = pointAt(cx, cy, r * v, angleFor(i)).split(",").map(Number);
    svg += `<circle cx="${x}" cy="${y}" r="3.5" fill="#C08A34"/>`;
  });

  // labels
  WHEEL_AXES.forEach((axis, i) => {
    const [x, y] = pointAt(cx, cy, r + 24, angleFor(i)).split(",").map(Number);
    svg += `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="middle" font-family="Inter, sans-serif" font-size="12" font-weight="600" fill="#63684F">${axis.label}</text>`;
  });

  wheelSvg.innerHTML = svg;
}

function pointAt(cx, cy, radius, angle) {
  const x = cx + radius * Math.cos(angle);
  const y = cy + radius * Math.sin(angle);
  return `${x.toFixed(2)},${y.toFixed(2)}`;
}

// redraw wheel live as the user types / selects
form.addEventListener("input", drawWheel);
form.addEventListener("change", drawWheel);
drawWheel();

// ============================================================
// Validation
// ============================================================

function clearFieldError(name) {
  const input = form.elements[name];
  const errEl = form.querySelector(`[data-error-for="${name}"]`);
  if (input) input.classList.remove("invalid");
  if (errEl) { errEl.textContent = ""; errEl.classList.remove("show"); }
}

function setFieldError(name, message) {
  const input = form.elements[name];
  const errEl = form.querySelector(`[data-error-for="${name}"]`);
  if (input) input.classList.add("invalid");
  if (errEl) { errEl.textContent = message; errEl.classList.add("show"); }
}

function validateForm() {
  let firstInvalid = null;
  const errors = [];

  Object.entries(FIELD_RULES).forEach(([name, rule]) => {
    clearFieldError(name);
    const input = form.elements[name];
    const rawValue = input ? input.value : "";

    if (rawValue === "" || rawValue === null) {
      setFieldError(name, "Required.");
      errors.push(name);
      if (!firstInvalid) firstInvalid = input;
      return;
    }

    if (rule.type === "number") {
      const num = Number(rawValue);
      if (isNaN(num)) {
        setFieldError(name, "Must be a number.");
        errors.push(name);
        if (!firstInvalid) firstInvalid = input;
        return;
      }
      if (rule.min !== undefined && num < rule.min) {
        setFieldError(name, `Must be ≥ ${rule.min}.`);
        errors.push(name);
        if (!firstInvalid) firstInvalid = input;
        return;
      }
      if (rule.max !== undefined && num > rule.max) {
        setFieldError(name, `Must be ≤ ${rule.max}.`);
        errors.push(name);
        if (!firstInvalid) firstInvalid = input;
        return;
      }
    }
  });

  if (firstInvalid) firstInvalid.focus();
  return errors.length === 0;
}

// clear a field's error as soon as the user fixes it
form.addEventListener("input", (e) => {
  if (e.target.name && FIELD_RULES[e.target.name]) clearFieldError(e.target.name);
});
form.addEventListener("change", (e) => {
  if (e.target.name && FIELD_RULES[e.target.name]) clearFieldError(e.target.name);
});

// ============================================================
// UI state machine
// ============================================================

function showState(state) {
  stateIdle.classList.add("hidden");
  stateLoading.classList.add("hidden");
  stateError.classList.add("hidden");
  stateResult.classList.add("hidden");

  if (state === "idle") stateIdle.classList.remove("hidden");
  if (state === "loading") stateLoading.classList.remove("hidden");
  if (state === "error") stateError.classList.remove("hidden");
  if (state === "result") stateResult.classList.remove("hidden");
}

// ============================================================
// Score gauge (semi-circular arc)
// ============================================================

// Assumed model output range for the visual gauge only.
const SCORE_MIN = 0;
const SCORE_MAX = 10;

function bandFor(score) {
  if (score <= SCORE_MAX * 0.4) return { label: "Needs a little care", color: "#B0503A" };
  if (score <= SCORE_MAX * 0.7) return { label: "Steady grower", color: "#C08A34" };
  return { label: "Balanced bloom", color: "#3F5B3E" };
}

function drawScoreArc(score) {
  const clamped = Math.max(SCORE_MIN, Math.min(SCORE_MAX, score));
  const pct = (clamped - SCORE_MIN) / (SCORE_MAX - SCORE_MIN);
  const band = bandFor(clamped);

  const cx = 110, cy = 110, r = 90;
  const startAngle = Math.PI;
  const endAngle = Math.PI + Math.PI * pct;

  const track = describeArc(cx, cy, r, Math.PI, Math.PI * 2);
  const fill = describeArc(cx, cy, r, startAngle, endAngle);

  scoreArcSvg.innerHTML = `
    <path d="${track}" fill="none" stroke="#EDE8D5" stroke-width="14" stroke-linecap="round"/>
    <path d="${fill}" fill="none" stroke="${band.color}" stroke-width="14" stroke-linecap="round"/>
  `;

  scoreValueEl.textContent = "0.00/10";
  scoreValueEl.style.color = band.color;
  scoreLabelEl.textContent = band.label;
  scoreLabelEl.style.color = band.color;

  const duration = 850;
  const start = performance.now();

  function animateScore(now) {
    const progress = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - progress, 3);
    scoreValueEl.textContent = `${(clamped * eased).toFixed(2)}/10`;
    if (progress < 1) requestAnimationFrame(animateScore);
    else scoreValueEl.textContent = `${clamped.toFixed(2)}/10`;
  }

  requestAnimationFrame(animateScore);
}

function describeArc(cx, cy, r, startAngle, endAngle) {
  const start = { x: cx + r * Math.cos(startAngle), y: cy + r * Math.sin(startAngle) };
  const end = { x: cx + r * Math.cos(endAngle), y: cy + r * Math.sin(endAngle) };
  const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
  return `M ${start.x.toFixed(2)} ${start.y.toFixed(2)} A ${r} ${r} 0 ${largeArc} 1 ${end.x.toFixed(2)} ${end.y.toFixed(2)}`;
}

// ============================================================
// Friendly result details
// ============================================================

const HABIT_NAMES = {
  sleep_hours_per_night: "Sleep",
  physical_activity_hours: "Activity",
  study_hours: "Study",
  avg_daily_usage_hours: "Screen"
};

function getHabitSummary() {
  const values = getWheelValues();
  const ranked = [0, 1, 2, 3]
    .map(index => ({ index, value: values[index], name: HABIT_NAMES[WHEEL_AXES[index].key] }))
    .sort((a, b) => b.value - a.value);

  const rawSleep = Number(new FormData(form).get("sleep_hours_per_night"));

  return {
    strongest: ranked[0].name,
    care: ranked[ranked.length - 1].name,
    sleepHours: isNaN(rawSleep) ? null : rawSleep,
  };
}

function updateResultDetails(score) {
  const summary = getHabitSummary();
  strongestHabitEl.textContent = summary.strongest;
  careHabitEl.textContent = summary.care;
  updateCici(score, summary);
}

// ============================================================
// Cici, the wellness companion
// ============================================================

function getCiciMood(score, habits) {
  if (habits.sleepHours !== null && habits.sleepHours < 5) return "sleepy";
  if (score >= SCORE_MAX * 0.7) return "happy";
  if (score >= SCORE_MAX * 0.4) return "calm";
  return "thoughtful";
}

function getCiciMessage(score, habits) {
  let opener;
  if (score >= SCORE_MAX * 0.7) {
    opener = "You're doing pretty well.";
  } else if (score >= SCORE_MAX * 0.4) {
    opener = "You have some good habits in place.";
  } else {
    opener = "It's okay, your routine could use a little more care.";
  }

  let habitNote = "";
  if (habits.strongest === "Study" && habits.care === "Screen") {
    habitNote = "Your study routine looks strong, maybe give yourself a few more screen-free breaks too.";
  } else if (habits.strongest === "Sleep") {
    habitNote = "Your sleep routine is looking good, that's a lovely habit to keep.";
  } else if (habits.care === "Screen") {
    habitNote = "A few more screen-free breaks could be a nice addition to your day.";
  } else if (habits.care === "Activity") {
    habitNote = "A little more movement could be a nice addition to your routine.";
  } else if (habits.care === "Sleep") {
    habitNote = "A little more rest could help your routine feel steadier.";
  } else if (habits.care === "Study") {
    habitNote = "A few more focused study moments could help your routine feel steadier.";
  }

  return habitNote ? `${opener} ${habitNote}` : opener;
}

function updateCici(score, habits) {
  const mood = getCiciMood(score, habits);
  ciciImageEl.src = `assets/cici-${mood}.png`;
  ciciImageEl.className = `cici-img mood-${mood}`;
  ciciMessageEl.textContent = getCiciMessage(score, habits);
}

const loadingMessages = [
  "Taking a quiet look at your habits...",
  "Finding the shape of your routine...",
  "Putting your balance together..."
];

let loadingTimer = null;
let loadingIndex = 0;

function startLoadingMessages() {
  loadingIndex = 0;
  loadingMessageEl.textContent = loadingMessages[0];
  loadingTimer = setInterval(() => {
    loadingIndex = (loadingIndex + 1) % loadingMessages.length;
    loadingMessageEl.textContent = loadingMessages[loadingIndex];
  }, 900);
}

function stopLoadingMessages() {
  if (loadingTimer) {
    clearInterval(loadingTimer);
    loadingTimer = null;
  }
}

// ============================================================
// Submit handler
// ============================================================

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!validateForm()) {
    showState("idle");
    return;
  }

  const data = new FormData(form);
  const payload = {
    age: Number(data.get("age")),
    gender: data.get("gender"),
    country: data.get("country").trim(),
    academic_level: data.get("academic_level"),
    most_used_platform: data.get("most_used_platform"),
    purpose_of_use: data.get("purpose_of_use"),
    avg_daily_usage_hours: Number(data.get("avg_daily_usage_hours")),
    daily_unlocks: Number(data.get("daily_unlocks")),
    study_hours: Number(data.get("study_hours")),
    physical_activity_hours: Number(data.get("physical_activity_hours")),
    sleep_hours_per_night: Number(data.get("sleep_hours_per_night")),
    stress_level: data.get("stress_level"),
  };

  submitBtn.disabled = true;
  showState("loading");
  startLoadingMessages();

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      let detail = `Server responded with status ${response.status}.`;
      try {
        const errJson = await response.json();
        if (errJson && errJson.detail) {
          detail = Array.isArray(errJson.detail)
            ? errJson.detail.map(d => `${(d.loc || []).slice(-1)[0]}: ${d.msg}`).join(" · ")
            : String(errJson.detail);
        }
      } catch (_) { /* body wasn't JSON, keep default message */ }
      throw new Error(detail);
    }

    const result = await response.json();
    const score = Number(result.predicted_mental_health_score);

    if (isNaN(score)) throw new Error("The server returned an unexpected response.");

    drawScoreArc(score);
    updateResultDetails(score);
    showState("result");

  } catch (err) {
    const isNetworkError = err instanceof TypeError;
    errorMessageEl.textContent = isNetworkError
      ? "Can't reach the API. Make sure the FastAPI server is running at http://127.0.0.1:8000."
      : err.message;
    showState("error");
  } finally {
    stopLoadingMessages();
    submitBtn.disabled = false;
  }
});
