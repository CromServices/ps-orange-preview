(function () {
  var KEY = "ps-theme";

  function displayedTheme() {
    var t = document.documentElement.getAttribute("data-theme");
    if (t === "light" || t === "dark") return t;
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  function applyTheme(mode) {
    if (mode !== "light" && mode !== "dark") return;
    document.documentElement.setAttribute("data-theme", mode);
    try { localStorage.setItem(KEY, mode); } catch (e) {}
  }

  document.addEventListener("click", function (e) {
    var btn = e.target.closest(".theme-toggle");
    if (!btn) return;
    applyTheme(displayedTheme() === "dark" ? "light" : "dark");
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

  function bindQuoteForm(form) {
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

  var quoteForms = document.querySelectorAll("form.js-form");
  for (var q = 0; q < quoteForms.length; q++) bindQuoteForm(quoteForms[q]);

  function fillDates(box) {
    var days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    var start = new Date();
    start.setHours(0, 0, 0, 0);
    var name = box.getAttribute("data-name") || "b-day";
    var html = "";
    for (var i = 0; i < 14; i++) {
      var d = new Date(start.getTime());
      d.setDate(start.getDate() + i);
      var weekend = d.getDay() === 0 || d.getDay() === 6;
      var label = days[d.getDay()] + " " + d.getDate() + " " + months[d.getMonth()];
      html += '<label class="chip date-chip">' +
        '<input type="radio" name="' + name + '" value="' + label + '"' + (weekend ? " disabled" : "") + ">" +
        "<span>" + label + "</span></label>";
    }
    box.innerHTML = html;
  }

  function selectedRadio(form, name) {
    var el = form.querySelector('input[name="' + name + '"]:checked');
    return el ? el.value : "";
  }

  function showErr(el, on) {
    if (!el) return;
    if (on) el.classList.add("show");
    else el.classList.remove("show");
  }

  function bindBook(form) {
    var dateBox = form.querySelector("[data-dates]");
    if (dateBox) fillDates(dateBox);
    var summary = form.querySelector("[data-summary]");
    var errDate = form.querySelector("[data-err='date']");
    var errTime = form.querySelector("[data-err='time']");
    var errPhone = form.querySelector("[data-err='phone']");

    function updateSummary() {
      if (!summary) return;
      var day = selectedRadio(form, "b-day");
      var time = selectedRadio(form, "b-window");
      if (day && time) summary.textContent = day + ", " + time;
      else if (day) summary.textContent = day;
      else if (time) summary.textContent = time;
      else summary.textContent = "Choose a day and a time window";
    }

    form.addEventListener("change", function () {
      updateSummary();
      showErr(errDate, false);
      showErr(errTime, false);
      showErr(errPhone, false);
      var phone = form.querySelector('[name="b-phone"]');
      if (phone) phone.setAttribute("aria-invalid", "false");
    });
    form.addEventListener("input", function (e) {
      if (e.target && e.target.name === "b-phone") {
        showErr(errPhone, false);
        e.target.setAttribute("aria-invalid", "false");
      }
    });
    form.addEventListener("keydown", function (e) {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft" && e.key !== "ArrowUp" && e.key !== "ArrowDown") return;
      var t = e.target;
      if (!t || t.type !== "radio") return;
      var group = form.querySelectorAll('input[type="radio"][name="' + t.name + '"]:not(:disabled)');
      if (!group.length) return;
      var i = 0;
      for (; i < group.length; i++) if (group[i] === t) break;
      var dir = (e.key === "ArrowRight" || e.key === "ArrowDown") ? 1 : -1;
      var next = group[(i + dir + group.length) % group.length];
      if (next) {
        e.preventDefault();
        next.checked = true;
        next.focus();
        updateSummary();
      }
    });
    updateSummary();

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      e.stopPropagation();
      var day = selectedRadio(form, "b-day");
      var time = selectedRadio(form, "b-window");
      var phone = form.querySelector('[name="b-phone"]');
      var phoneVal = phone ? String(phone.value || "").replace(/\s/g, "") : "";
      var badDate = !day;
      var badTime = !time;
      var badPhone = phoneVal.length < 8;
      showErr(errDate, badDate);
      showErr(errTime, badTime);
      showErr(errPhone, badPhone);
      if (phone) phone.setAttribute("aria-invalid", badPhone ? "true" : "false");
      if (badDate || badTime || badPhone) {
        if (badDate && dateBox) {
          dateBox.setAttribute("tabindex", "-1");
          dateBox.focus();
        } else if (badTime) {
          var tset = form.querySelector("[aria-label='Time window']");
          if (tset) {
            tset.setAttribute("tabindex", "-1");
            tset.focus();
          }
        } else if (phone) phone.focus();
        return;
      }
      thankYou(form);
    });
  }

  var books = document.querySelectorAll("form.js-book");
  for (var b = 0; b < books.length; b++) bindBook(books[b]);

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
    lb.setAttribute("aria-labelledby", "lb-caption");
    lb.innerHTML = '<button type="button" class="lb-close" aria-label="Close">×</button>' +
      '<button type="button" class="lb-prev" aria-label="Previous photograph">‹</button>' +
      '<img alt="">' +
      '<button type="button" class="lb-next" aria-label="Next photograph">›</button>' +
      '<p class="lb-meta"><span class="lb-caption" id="lb-caption"></span><span class="lb-count"></span></p>';
    document.body.appendChild(lb);
    var img = lb.querySelector("img");
    var cap = lb.querySelector(".lb-caption");
    var count = lb.querySelector(".lb-count");
    var closeBtn = lb.querySelector(".lb-close");
    var prevBtn = lb.querySelector(".lb-prev");
    var nextBtn = lb.querySelector(".lb-next");
    var idx = 0;
    var lastFocus = null;
    var touchX = 0;
    var touchY = 0;

    function traps() { return [closeBtn, prevBtn, nextBtn]; }

    function show(i) {
      idx = (i + items.length) % items.length;
      var a = items[idx];
      var full = a.getAttribute("data-full") || a.getAttribute("href");
      var alt = a.getAttribute("data-alt") || "";
      img.src = full;
      img.alt = alt;
      cap.textContent = alt;
      count.textContent = (idx + 1) + " / " + items.length;
    }

    function openAt(i) {
      lastFocus = document.activeElement;
      show(i);
      lb.classList.add("open");
      document.body.classList.add("lb-lock");
      closeBtn.focus();
    }
    function close() {
      lb.classList.remove("open");
      document.body.classList.remove("lb-lock");
      img.removeAttribute("src");
      if (lastFocus && typeof lastFocus.focus === "function") lastFocus.focus();
    }

    for (var i = 0; i < items.length; i++) {
      (function (n) {
        items[n].addEventListener("click", function (e) {
          e.preventDefault();
          openAt(n);
        });
      })(i);
    }
    closeBtn.addEventListener("click", function (e) { e.stopPropagation(); close(); });
    prevBtn.addEventListener("click", function (e) { e.stopPropagation(); show(idx - 1); });
    nextBtn.addEventListener("click", function (e) { e.stopPropagation(); show(idx + 1); });
    lb.addEventListener("click", function (e) { if (e.target === lb) close(); });
    document.addEventListener("keydown", function (e) {
      if (!lb.classList.contains("open")) return;
      if (e.key === "Escape") { e.preventDefault(); close(); }
      if (e.key === "ArrowLeft") { e.preventDefault(); show(idx - 1); }
      if (e.key === "ArrowRight") { e.preventDefault(); show(idx + 1); }
      if (e.key === "Tab") {
        var list = traps();
        var first = list[0];
        var last = list[list.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    });
    lb.addEventListener("touchstart", function (e) {
      if (!e.changedTouches || !e.changedTouches[0]) return;
      touchX = e.changedTouches[0].clientX;
      touchY = e.changedTouches[0].clientY;
    }, { passive: true });
    lb.addEventListener("touchend", function (e) {
      if (!e.changedTouches || !e.changedTouches[0]) return;
      var dx = e.changedTouches[0].clientX - touchX;
      var dy = e.changedTouches[0].clientY - touchY;
      if (Math.abs(dx) < 40 && Math.abs(dy) < 40) return;
      if (Math.abs(dx) > Math.abs(dy)) {
        if (dx < 0) show(idx + 1);
        else show(idx - 1);
      } else if (dy > 0) {
        close();
      }
    }, { passive: true });
  }
})();
