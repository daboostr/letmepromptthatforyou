(function () {
  const PROVIDERS = window.LMPTFY_PROVIDERS;
  const DEFAULT_PROVIDER = "copilot";
  const COMING_SOON = ["Gemini"];
  const REDIRECT_SECONDS = 5;

  const $ = (id) => document.getElementById(id);
  const params = new URLSearchParams(location.search);
  const provider = PROVIDERS[(params.get("p") || DEFAULT_PROVIDER).toLowerCase()] || PROVIDERS[DEFAULT_PROVIDER];
  const query = (params.get("q") || "").trim();
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  applyTheme(provider);
  renderProviderNav();

  if (query) startPlayer(query);
  else startGenerator();

  function applyTheme(p) {
    const root = document.documentElement.style;
    root.setProperty("--bg", p.theme.bg);
    root.setProperty("--surface", p.theme.surface);
    root.setProperty("--text", p.theme.text);
    root.setProperty("--muted", p.theme.muted);
    root.setProperty("--accent", p.theme.accent);
    root.setProperty("--gradient", p.theme.gradient);
    $("providerName").textContent = p.name;
    $("genProvider").textContent = p.name;
    $("fakeTitle").textContent = p.name;
    $("fakePh").textContent = p.placeholder;
    $("tagline").textContent = p.tagline;
    document.title = "Let me " + p.name + " that for you";
    const home = "?p=" + p.id;
    $("brandLink").href = home;
    $("makeOwn").href = home;
  }

  function renderProviderNav() {
    const nav = $("providerNav");
    Object.values(PROVIDERS).forEach((p) => {
      const a = document.createElement("a");
      a.href = "?p=" + p.id;
      a.textContent = p.name;
      if (p.id === provider.id) a.setAttribute("aria-current", "page");
      nav.appendChild(a);
    });
    COMING_SOON.filter((n) => !PROVIDERS[n.toLowerCase()]).forEach((n) => {
      const s = document.createElement("span");
      s.className = "soon";
      s.textContent = n + " (soon)";
      s.title = "Coming soon";
      nav.appendChild(s);
    });
  }

  function shareUrl(q) {
    const u = new URL(location.href);
    u.search = "";
    u.hash = "";
    u.searchParams.set("p", provider.id);
    u.searchParams.set("q", q);
    return u.toString();
  }

  // ---------- Generator ----------
  function startGenerator() {
    $("generator").hidden = false;
    const input = $("genInput");
    input.focus();

    // No <form>: sandboxed previews can block form submission.
    function generate() {
      const q = input.value.trim();
      if (!q) {
        input.focus();
        input.placeholder = "You have to type *something*. Even your coworker managed that.";
        return;
      }
      const url = shareUrl(q);
      $("linkOut").value = url;
      $("previewBtn").href = url;
      $("result").hidden = false;
      $("copyStatus").textContent = "";
      $("result").scrollIntoView({ behavior: "smooth", block: "nearest" });
      $("linkOut").select();
    }

    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        generate();
      }
    });
    $("genBtn").addEventListener("click", generate);

    $("copyBtn").addEventListener("click", async () => {
      const out = $("linkOut");
      try {
        await navigator.clipboard.writeText(out.value);
      } catch {
        out.select();
        document.execCommand("copy");
      }
      $("copyStatus").textContent = "Copied! Now go paste it with a straight face.";
    });
  }

  // ---------- Player ----------
  function startPlayer(q) {
    $("player").hidden = false;
    const target = provider.buildUrl(q);
    const cursor = $("cursor");
    const caption = $("caption");
    let cancelled = false;
    let countdown;

    $("goNow").href = target;
    $("skipBtn").addEventListener("click", () => { cancelled = true; location.href = target; });
    $("stayBtn").addEventListener("click", () => {
      clearInterval(countdown);
      $("redirectNote").textContent = "Fine. Take your time. Reflect on your choices.";
      $("stayBtn").hidden = true;
    });

    const sleep = (ms) => new Promise((r) => setTimeout(r, reducedMotion ? Math.min(ms, 50) : ms));

    function say(text) {
      caption.classList.remove("pop");
      void caption.offsetWidth;
      caption.textContent = text;
      caption.classList.add("pop");
    }

    function moveCursorTo(el) {
      const r = el.getBoundingClientRect();
      const x = r.left + Math.min(r.width / 2, 60);
      const y = r.top + r.height / 2;
      cursor.style.transform = `translate(${x}px, ${y}px)`;
    }

    async function click(el) {
      cursor.classList.add("click");
      el && el.classList.add("pressed");
      await sleep(180);
      cursor.classList.remove("click");
      el && el.classList.remove("pressed");
    }

    async function run() {
      say(provider.steps.open);
      await sleep(400);
      $("fakeApp").classList.add("shown");
      await sleep(900);
      if (cancelled) return;

      moveCursorTo($("fakeInput"));
      await sleep(1200);
      await click();
      $("fakePh").hidden = true;
      $("caret").classList.add("on");

      say(provider.steps.type);
      await sleep(500);
      const typed = $("typed");
      const perChar = Math.max(15, Math.min(70, 3500 / q.length));
      for (const ch of q) {
        if (cancelled) return;
        typed.textContent += ch;
        await sleep(perChar + (ch === " " ? perChar : 0));
      }
      await sleep(500);

      say(provider.steps.send);
      moveCursorTo($("fakeSend"));
      await sleep(1300);
      await click($("fakeSend"));
      $("caret").classList.remove("on");
      await sleep(400);

      say(provider.steps.done);
      $("after").hidden = false;
      $("skipBtn").hidden = true;

      let remaining = REDIRECT_SECONDS;
      const note = () => ($("redirectNote").textContent = provider.redirectNote.replace("{s}", remaining));
      note();
      countdown = setInterval(() => {
        remaining -= 1;
        if (remaining <= 0) {
          clearInterval(countdown);
          location.href = target;
        } else note();
      }, 1000);
    }

    run();
  }
})();
