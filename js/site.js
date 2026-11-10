(function () {
  var KEY = "ps-theme";

  function currentMode() {
    try {
      var saved = localStorage.getItem(KEY);
      if (saved === "light" || saved === "dark" || saved === "system") return saved;
    } catch (e) {}
    return "system";
  }

  function applyTheme(mode) {
    if (mode === "light" || mode === "dark") {
      document.documentElement.setAttribute("data-theme", mode);
    } else {
      document.documentElement.removeAttribute("data-theme");
      mode = "system";
    }
    try { localStorage.setItem(KEY, mode); } catch (e) {}
    var buttons = document.querySelectorAll("[data-theme-btn]");
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].setAttribute("aria-pressed", buttons[i].getAttribute("data-theme-btn") === mode ? "true" : "false");
    }
  }

  applyTheme(currentMode());

  document.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-theme-btn]");
    if (!btn) return;
    applyTheme(btn.getAttribute("data-theme-btn"));
  });

  function thankYou(form) {
    var box = form.parentNode.querySelector(".thanks");
    form.hidden = true;
    if (box) {
      box.hidden = false;
      box.setAttribute("tabindex", "-1");
      box.focus();
    }
  }

  function bindForm(form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      e.stopPropagation();
      if (typeof form.checkValidity === "function" && !form.checkValidity()) {
        if (typeof form.reportValidity === "function") form.reportValidity();
        return;
      }
      thankYou(form);
    });
  }

  var forms = document.querySelectorAll("form.js-form");
  for (var f = 0; f < forms.length; f++) bindForm(forms[f]);

  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var reveals = document.querySelectorAll(".reveal");
  if (!reduce && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      for (var i = 0; i < entries.length; i++) {
        if (entries[i].isIntersecting) entries[i].target.classList.add("in");
      }
    }, { threshold: 0.12 });
    for (var r = 0; r < reveals.length; r++) io.observe(reveals[r]);
  } else {
    for (var r2 = 0; r2 < reveals.length; r2++) reveals[r2].classList.add("in");
  }

  var sliders = document.querySelectorAll("[data-ba]");
  for (var s = 0; s < sliders.length; s++) {
    (function (root) {
      var clip = root.querySelector(".ba-clip");
      var img = clip && clip.querySelector("img");
      var range = root.querySelector("input[type='range']");
      function size() {
        if (!img) return;
        img.style.width = root.clientWidth + "px";
        img.style.height = root.clientHeight + "px";
      }
      function pos() {
        if (clip && range) clip.style.width = range.value + "%";
      }
      size();
      pos();
      if (range) range.addEventListener("input", pos);
      window.addEventListener("resize", size);
    })(sliders[s]);
  }

  var items = document.querySelectorAll("[data-lb]");
  if (items.length) {
    var lb = document.createElement("div");
    lb.className = "lb";
    lb.setAttribute("role", "dialog");
    lb.setAttribute("aria-modal", "true");
    lb.setAttribute("aria-label", "Photograph");
    lb.innerHTML = '<button type="button" class="lb-close" aria-label="Close photograph">Close</button>' +
      '<button type="button" class="lb-prev" aria-label="Previous photograph">Previous</button>' +
      '<img alt="">' +
      '<button type="button" class="lb-next" aria-label="Next photograph">Next</button>';
    document.body.appendChild(lb);
    var img = lb.querySelector("img");
    var idx = 0;

    function openAt(i) {
      idx = (i + items.length) % items.length;
      var a = items[idx];
      img.src = a.getAttribute("data-full") || a.getAttribute("href");
      img.alt = a.getAttribute("data-alt") || "";
      lb.classList.add("open");
    }
    function close() {
      lb.classList.remove("open");
      img.removeAttribute("src");
    }

    for (var i = 0; i < items.length; i++) {
      (function (n) {
        items[n].addEventListener("click", function (e) {
          e.preventDefault();
          openAt(n);
        });
      })(i);
    }
    lb.querySelector(".lb-close").addEventListener("click", close);
    lb.querySelector(".lb-prev").addEventListener("click", function () { openAt(idx - 1); });
    lb.querySelector(".lb-next").addEventListener("click", function () { openAt(idx + 1); });
    lb.addEventListener("click", function (e) { if (e.target === lb) close(); });
    document.addEventListener("keydown", function (e) {
      if (!lb.classList.contains("open")) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") openAt(idx - 1);
      if (e.key === "ArrowRight") openAt(idx + 1);
    });
  }
})();
