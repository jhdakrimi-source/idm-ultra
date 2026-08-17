(function () {
  "use strict";

  var CONFIG = {
    BASE_DOWNLOADS: 0,
    STORAGE_KEY: "idm_ultra_download_count",
    ANIMATE_MS: 1100
  };

  function formatNumber(n) {
    return n.toLocaleString("en-US");
  }

  function getCount() {
    var stored = parseInt(localStorage.getItem(CONFIG.STORAGE_KEY) || "0", 10);
    if (isNaN(stored) || stored < 0) stored = 0;
    return CONFIG.BASE_DOWNLOADS + stored;
  }

  function bumpCount() {
    var stored = parseInt(localStorage.getItem(CONFIG.STORAGE_KEY) || "0", 10);
    if (isNaN(stored) || stored < 0) stored = 0;
    localStorage.setItem(CONFIG.STORAGE_KEY, String(stored + 1));
    return CONFIG.BASE_DOWNLOADS + stored + 1;
  }

  function setText(id, value) {
    var el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  function animateNumber(el, target, fmt) {
    var start = 0;
    var startTime = null;
    fmt = fmt || formatNumber;

    function frame(ts) {
      if (!startTime) startTime = ts;
      var progress = Math.min((ts - startTime) / CONFIG.ANIMATE_MS, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      var value = Math.round(start + (target - start) * eased);
      el.textContent = fmt(value);
      if (progress < 1) {
        requestAnimationFrame(frame);
      } else {
        el.textContent = fmt(target);
      }
    }

    requestAnimationFrame(frame);
  }

  function initCounters() {
    var count = getCount();
    var main = document.getElementById("downloadCount");
    var stat = document.getElementById("statDownloads");

    if (main) animateNumber(main, count);
    if (stat) animateNumber(stat, count);

    var autoStats = document.querySelectorAll(".stat-num[data-count]");
    Array.prototype.forEach.call(autoStats, function (el) {
      var target = parseFloat(el.getAttribute("data-count"));
      var fmt = el.getAttribute("data-format");
      var formatter = fmt === "pct"
        ? function (v) { return v.toLocaleString("en-US") + "%"; }
        : formatNumber;
      animateNumber(el, target, formatter);
    });
  }

  function updateCounters() {
    var count = getCount();
    setText("downloadCount", formatNumber(count));
    setText("statDownloads", formatNumber(count));
  }

  function onDownload() {
    bumpCount();
    updateCounters();
    var btn = document.getElementById("downloadBtn");
    if (btn) {
      var original = btn.textContent;
      btn.innerHTML = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Starting download…';
      setTimeout(function () {
        btn.innerHTML = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Download APK';
      }, 1600);
    }
  }

  function revealOnScroll() {
    var els = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) {
      Array.prototype.forEach.call(els, function (el) { el.classList.add("visible"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    Array.prototype.forEach.call(els, function (el) { io.observe(el); });
  }

  function initNav() {
    var toggle = document.getElementById("navToggle");
    var links = document.querySelector(".nav-links");
    if (!toggle || !links) return;
    toggle.addEventListener("click", function () {
      links.classList.toggle("open");
    });
    Array.prototype.forEach.call(links.querySelectorAll("a"), function (a) {
      a.addEventListener("click", function () { links.classList.remove("open"); });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    var btn = document.getElementById("downloadBtn");
    if (btn) btn.addEventListener("click", onDownload);
    initCounters();
    initNav();
    revealOnScroll();
  });
})();
