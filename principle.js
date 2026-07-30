(function () {
  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var reveals = document.querySelectorAll(".reveal");
  var sections = document.querySelectorAll(".principle-section[id]");
  var navLinks = document.querySelectorAll(".section-nav a");
  var styleButtons = document.querySelectorAll(".style-selector button");
  var styleDisplay = document.querySelector(".style-display");
  var styleImage = styleDisplay.querySelector("img");
  var styleName = styleDisplay.querySelector("h3");
  var styleDescription = styleDisplay.querySelector("div:last-child span");

  if (reducedMotion || !("IntersectionObserver" in window)) {
    reveals.forEach(function (item) {
      item.classList.add("is-visible");
    });
  } else {
    var revealObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, {
      rootMargin: "0px 0px -12% 0px",
      threshold: 0.08
    });

    reveals.forEach(function (item) {
      revealObserver.observe(item);
    });
  }

  if ("IntersectionObserver" in window) {
    var sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (link) {
          var isCurrent = link.getAttribute("href") === "#" + entry.target.id;
          link.classList.toggle("is-active", isCurrent);
          if (isCurrent) {
            link.setAttribute("aria-current", "true");
          } else {
            link.removeAttribute("aria-current");
          }
        });
      });
    }, {
      rootMargin: "-28% 0px -58% 0px",
      threshold: 0
    });

    sections.forEach(function (section) {
      sectionObserver.observe(section);
    });
  }

  function selectStyle(button) {
    styleButtons.forEach(function (item) {
      var selected = item === button;
      item.classList.toggle("is-active", selected);
      item.setAttribute("aria-selected", String(selected));
    });

    styleImage.src = button.dataset.image;
    styleImage.alt = button.dataset.name + " 그림꼴 예시";
    styleName.textContent = button.dataset.name;
    styleDescription.textContent = button.dataset.description;

    if (!reducedMotion) {
      styleDisplay.classList.remove("is-changing");
      void styleDisplay.offsetWidth;
      styleDisplay.classList.add("is-changing");
      window.setTimeout(function () {
        styleDisplay.classList.remove("is-changing");
      }, 360);
    }
  }

  styleButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      selectStyle(button);
    });
  });

})();
