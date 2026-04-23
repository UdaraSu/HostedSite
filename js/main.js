(function () {
  "use strict";

  var docEl = document.documentElement;
  var menuBtn = document.querySelector(".menu-btn");
  var nav = document.getElementById("nav");
  var themeToggle = document.getElementById("theme-toggle");
  var metaTheme = document.getElementById("meta-theme-color");
  var year = document.getElementById("year");
  var form = document.getElementById("contact-form");
  var formStatus = document.getElementById("form-status");
  var header = document.querySelector(".site-header");
  var scrollBar = document.getElementById("scroll-progress-bar");
  var navLinks = document.querySelectorAll('.nav a[href^="#"]');
  var sections = document.querySelectorAll("main section[id]");
  var milestoneJump = document.getElementById("milestone-jump");
  var domainDropdown = document.querySelector(".nav-dropdown");
  var domainToggle = document.querySelector(".nav-dropdown__toggle");
  // Set this to your Formspree/API endpoint to enable actual submission.
  var CONTACT_FORM_ENDPOINT = "https://formspree.io/f/xpqkoead";

  function setTheme(theme) {
    var isDark = theme === "dark";
    docEl.setAttribute("data-theme", isDark ? "dark" : "light");
    try {
      localStorage.setItem("agri-theme", isDark ? "dark" : "light");
    } catch (e) {}
    if (metaTheme) {
      metaTheme.setAttribute("content", isDark ? "#071307" : "#f3fbf3");
    }
    if (themeToggle) {
      themeToggle.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
      themeToggle.setAttribute("aria-pressed", isDark ? "true" : "false");
    }
  }

  var storedTheme = null;
  try {
    storedTheme = localStorage.getItem("agri-theme");
  } catch (e) {}
  setTheme(storedTheme === "dark" ? "dark" : "light");

  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      setTheme(docEl.getAttribute("data-theme") === "dark" ? "light" : "dark");
    });
  }

  if (menuBtn && nav) {
    menuBtn.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
      menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });

    nav.addEventListener("click", function (e) {
      var link = e.target.closest("a");
      if (!link) return;
      if (domainDropdown && domainToggle) {
        domainDropdown.classList.remove("is-open");
        domainToggle.setAttribute("aria-expanded", "false");
      }
      nav.classList.remove("is-open");
      menuBtn.setAttribute("aria-expanded", "false");
      menuBtn.setAttribute("aria-label", "Open menu");
    });
  }

  if (domainDropdown && domainToggle) {
    domainToggle.addEventListener("click", function (e) {
      e.preventDefault();
      var isOpen = domainDropdown.classList.toggle("is-open");
      domainToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    document.addEventListener("click", function (e) {
      if (!domainDropdown.contains(e.target)) {
        domainDropdown.classList.remove("is-open");
        domainToggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  if (year) year.textContent = String(new Date().getFullYear());

  if (form && formStatus) {
    form.addEventListener("submit", async function (e) {
      e.preventDefault();
      var name = document.getElementById("name");
      var email = document.getElementById("email");
      var message = document.getElementById("message");
      var submitBtn = form.querySelector('button[type="submit"]');

      if (!name.value.trim() || !email.value.trim() || !message.value.trim()) {
        formStatus.textContent = "Please fill all fields.";
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
        formStatus.textContent = "Please enter a valid email.";
        return;
      }

      if (!CONTACT_FORM_ENDPOINT) {
        formStatus.textContent = "Form endpoint is not configured yet. Please set CONTACT_FORM_ENDPOINT in js/main.js.";
        return;
      }

      if (submitBtn) submitBtn.disabled = true;
      formStatus.textContent = "Sending...";

      try {
        var response = await fetch(CONTACT_FORM_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({
            name: name.value.trim(),
            email: email.value.trim(),
            message: message.value.trim(),
          }),
        });

        if (!response.ok) {
          throw new Error("Request failed");
        }

        formStatus.textContent = "Thanks! Your message has been sent.";
        form.reset();
      } catch (err) {
        formStatus.textContent = "Could not send your message right now. Please try again.";
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  }

  function getScrollOffset() {
    return header ? header.offsetHeight + 8 : 80;
  }

  navLinks.forEach(function (link) {
    link.addEventListener("click", function (e) {
      var id = link.getAttribute("href");
      if (!id || id === "#") return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      var top = target.getBoundingClientRect().top + window.pageYOffset - getScrollOffset();
      window.scrollTo({ top: top, behavior: "smooth" });
      try {
        history.pushState(null, "", id);
      } catch (err) {}
    });
  });

  if (milestoneJump) {
    milestoneJump.addEventListener("change", function () {
      var targetId = milestoneJump.value;
      if (!targetId) return;
      var target = document.getElementById(targetId);
      if (!target) return;
      var top = target.getBoundingClientRect().top + window.pageYOffset - getScrollOffset();
      window.scrollTo({ top: top, behavior: "smooth" });
      try {
        history.pushState(null, "", "#" + targetId);
      } catch (err) {}
    });
  }

  var linkById = {};
  navLinks.forEach(function (link) {
    var href = link.getAttribute("href");
    if (href && href.startsWith("#") && href.length > 1) {
      if (!linkById[href]) linkById[href] = [];
      linkById[href].push(link);
    }
  });

  function setActiveNav() {
    var y = window.scrollY + getScrollOffset() + 20;
    var current = "#home";
    sections.forEach(function (sec) {
      if (sec.offsetTop <= y) {
        current = "#" + sec.id;
      }
    });
    navLinks.forEach(function (l) {
      l.classList.remove("is-active");
    });
    var toActivate = linkById[current];
    if (toActivate) {
      toActivate.forEach(function (l) {
        l.classList.add("is-active");
      });
    }
  }

  var scrollTimer;
  function onScroll() {
    if (scrollTimer) window.cancelAnimationFrame(scrollTimer);
    scrollTimer = window.requestAnimationFrame(function () {
      var scrollY = window.scrollY;
      if (header) {
        header.classList.toggle("is-scrolled", scrollY > 16);
      }
      if (scrollBar) {
        var doc = document.documentElement;
        var total = doc.scrollHeight - window.innerHeight;
        var p = total > 0 ? (scrollY / total) * 100 : 0;
        scrollBar.style.width = Math.min(100, Math.max(0, p)) + "%";
      }
      setActiveNav();
    });
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  window.addEventListener("resize", function () {
    if (window.matchMedia("(min-width: 861px)").matches && nav && menuBtn) {
      nav.classList.remove("is-open");
      menuBtn.setAttribute("aria-expanded", "false");
      menuBtn.setAttribute("aria-label", "Open menu");
    }
    if (domainDropdown && domainToggle) {
      domainDropdown.classList.remove("is-open");
      domainToggle.setAttribute("aria-expanded", "false");
    }
  });

  var bannerTypedEl = document.getElementById("banner-typed-feature");
  if (bannerTypedEl) {
    var featurePhrases = [
      "Labour & Equipment Hiring",
      "IoT Based Soil Monitoring",
      "Crop Recommendation",
      "Market Price Prediction",
      "Fertilizer Recommendation",
    ];
    var phraseIdx = 0;
    var charIdx = 0;
    var deleting = false;
    var typeDelay = 95;
    var deleteDelay = 52;
    var pauseDelay = 1200;

    (function stepTypewriter() {
      var full = featurePhrases[phraseIdx];
      if (!deleting) {
        charIdx += 1;
        bannerTypedEl.textContent = full.slice(0, charIdx);
        if (charIdx >= full.length) {
          deleting = true;
          return window.setTimeout(stepTypewriter, pauseDelay);
        }
        return window.setTimeout(stepTypewriter, typeDelay);
      }
      charIdx -= 1;
      bannerTypedEl.textContent = full.slice(0, Math.max(0, charIdx));
      if (charIdx <= 0) {
        deleting = false;
        phraseIdx = (phraseIdx + 1) % featurePhrases.length;
        return window.setTimeout(stepTypewriter, 260);
      }
      return window.setTimeout(stepTypewriter, deleteDelay);
    })();
  }

  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    revealEls.forEach(function (el) {
      io.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add("is-visible");
    });
  }
})();
