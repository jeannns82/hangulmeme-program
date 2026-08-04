(function () {
  var select = document.getElementById("style_kind");
  var tabs = document.querySelector(".style-tabs");
  var input = document.getElementById("t");
  var inputShell = document.querySelector(".input-shell");
  var colorArchiveCta = document.querySelector(".color-archive__cta");
  var count = document.querySelector(".result3");
  var preview = document.querySelector(".style-menu-preview");
  var previewImage = document.querySelector(".style-menu-preview__image");
  var previewFallback = document.querySelector(".style-menu-preview__fallback");
  var canvasFrame = document.querySelector(".canvas-frame");
  var kingGuide = document.querySelector(".king-guide");
  var kingSpeech = document.querySelector(".king-speech");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var canvasTimer;
  var completionTimer;
  var speechTimer;
  var placeholderTimer;
  var hasFocusedInput = false;
  var hasEnteredFirstCharacter = false;
  var previewSources = {
    "0": "색동.png",
    "1": "사각조각보.png",
    "2": "팔각조각보.png",
    "3": "원형조각보.png",
    "4": "물수제비.png",
    "5": "한울림.png",
    "6": "입방체.png",
    "7": "단청.png",
    "8": "만화경.png",
    "9": "세모.png"
  };

  function updateCount() {
    var length = input.value.replace(/ /g, "").length;
    count.innerHTML = length + " <span>/ 16</span>";
  }

  function resizeInput() {
    var style = window.getComputedStyle(input);
    var minHeight = parseFloat(style.getPropertyValue("--input-min-height")) || 58;
    var maxHeight = parseFloat(style.getPropertyValue("--input-max-height")) || 118;
    input.style.setProperty("--input-display-height", minHeight + "px");
    var nextHeight = Math.min(maxHeight, Math.max(minHeight, input.scrollHeight + 1));
    input.style.setProperty("--input-display-height", nextHeight + "px");
  }

  function getContrastColor(hex) {
    var value = hex.replace("#", "");
    var red = parseInt(value.slice(0, 2), 16);
    var green = parseInt(value.slice(2, 4), 16);
    var blue = parseInt(value.slice(4, 6), 16);
    var luminance = (red * 299 + green * 587 + blue * 114) / 1000;
    return luminance > 168 ? "#303030" : "#ffffff";
  }

  function applyJamoColors() {
    document.querySelectorAll(".jamo-item").forEach(function (item) {
      var button = item.querySelector("button");
      var colorMatch = button.title.match(/#[0-9a-f]{6}/i);
      if (!colorMatch) return;
      item.style.setProperty("--jamo-color", colorMatch[0]);
      item.style.setProperty("--jamo-contrast", getContrastColor(colorMatch[0]));
    });
  }

  function flashJamo(button) {
    var activeMark = button.parentElement.querySelector("span");
    if (!activeMark) return;
    $(activeMark).stop(true, true).show().delay(300).fadeOut(500);
  }

  function restartClass(element, className, duration) {
    if (!element || reduceMotion) return;
    element.classList.remove(className);
    void element.offsetWidth;
    element.classList.add(className);
    window.setTimeout(function () {
      element.classList.remove(className);
    }, duration);
  }

  function showKingSpeech(message) {
    if (!kingGuide || !kingSpeech) return;
    window.clearTimeout(speechTimer);
    kingSpeech.textContent = message;
    kingSpeech.classList.add("is-visible");
    restartClass(kingGuide, "is-reacting", 520);
    speechTimer = window.setTimeout(function () {
      kingSpeech.classList.remove("is-visible");
    }, 2400);
  }

  function runCanvasReaction() {
    window.clearTimeout(canvasTimer);
    canvasFrame.classList.remove("is-generating", "is-revealing");
    if (!input.value.replace(/\s/g, "")) return;
    if (reduceMotion) return;
    canvasFrame.classList.add("is-generating");
    window.requestAnimationFrame(function () {
      window.setTimeout(function () {
        canvasFrame.classList.remove("is-generating");
        canvasFrame.classList.add("is-revealing");
        canvasTimer = window.setTimeout(function () {
          canvasFrame.classList.remove("is-revealing");
        }, 500);
      }, 90);
    });
  }

  function scheduleCompletionSpeech(delay) {
    window.clearTimeout(completionTimer);
    if (!input.value.replace(/\s/g, "")) return;
    completionTimer = window.setTimeout(function () {
      showKingSpeech("한글이 그림이 되었어요.");
    }, delay);
  }

  function handleInputReaction() {
    var hasText = Boolean(input.value.replace(/\s/g, ""));
    updateCount();
    resizeInput();
    runCanvasReaction();
    if (hasText && !hasEnteredFirstCharacter) {
      hasEnteredFirstCharacter = true;
      showKingSpeech("소리와 모양을 살펴볼까요?");
      scheduleCompletionSpeech(2800);
    } else if (hasText) {
      scheduleCompletionSpeech(700);
    } else {
      hasEnteredFirstCharacter = false;
      window.clearTimeout(completionTimer);
    }
  }

  function getStyleOption(value) {
    return Array.prototype.find.call(select.options, function (option) {
      return option.value === String(value);
    });
  }

  function positionPreview(value) {
    var tab = tabs.querySelector('.style-tab[data-value="' + value + '"]');
    if (!tab) return;
    var tabCenter = tab.offsetLeft - tabs.scrollLeft + (tab.offsetWidth / 2);
    var previewLeft = tabCenter - (preview.offsetWidth / 2);
    var maxLeft = Math.max(0, preview.parentElement.clientWidth - preview.offsetWidth);
    preview.style.setProperty("--preview-x", Math.max(0, Math.min(previewLeft, maxLeft)) + "px");
  }

  function renderPreview(value, shouldAnimate) {
    var option = getStyleOption(value);
    if (!option) return;
    preview.dataset.style = option.value;
    preview.setAttribute("aria-label", option.text + " 그림꼴 미리보기");
    positionPreview(option.value);
    previewImage.alt = option.text + " 그림꼴 미리보기";
    if (previewSources[option.value]) {
      previewImage.src = previewSources[option.value];
      previewImage.hidden = false;
      previewFallback.hidden = true;
    } else {
      previewImage.removeAttribute("src");
      previewImage.hidden = true;
      previewFallback.hidden = false;
    }
    if (shouldAnimate) {
      restartClass(preview, "is-switching", 360);
    }
  }

  function updateStyleUI(shouldAnimate) {
    renderPreview(select.value, shouldAnimate);
    if (shouldAnimate) {
      showKingSpeech("다른 모습으로 바뀌었어요.");
    }
    tabs.querySelectorAll(".style-tab").forEach(function (tab) {
      tab.setAttribute("aria-selected", String(tab.dataset.value === select.value));
      tab.tabIndex = tab.dataset.value === select.value ? 0 : -1;
    });
  }

  Array.prototype.forEach.call(select.options, function (option) {
    var tab = document.createElement("button");
    tab.type = "button";
    tab.className = "style-tab";
    tab.setAttribute("role", "tab");
    tab.dataset.value = option.value;
    tab.textContent = option.text;
    tab.addEventListener("click", function () {
      if (tabs.scrollWidth > tabs.clientWidth) {
        var targetScroll = Math.max(0, tab.offsetLeft - tabs.offsetLeft);
        tabs.scrollTo({
          left: targetScroll,
          behavior: reduceMotion ? "auto" : "smooth"
        });
      }
      select.value = option.value;
      $(select).trigger("change");
      updateStyleUI(true);
    });
    tab.addEventListener("pointerenter", function () {
      renderPreview(option.value, true);
    });
    tab.addEventListener("focus", function () {
      renderPreview(option.value, true);
    });
    tabs.appendChild(tab);
  });

  tabs.addEventListener("pointerleave", function () {
    renderPreview(select.value, true);
  });
  tabs.addEventListener("focusout", function (event) {
    if (!tabs.contains(event.relatedTarget)) {
      renderPreview(select.value, true);
    }
  });
  tabs.addEventListener("keydown", function (event) {
    var tabItems = Array.prototype.slice.call(tabs.querySelectorAll(".style-tab"));
    var currentIndex = tabItems.indexOf(document.activeElement);
    if (currentIndex < 0) return;
    var nextIndex = currentIndex;
    if (event.key === "ArrowRight") nextIndex = (currentIndex + 1) % tabItems.length;
    else if (event.key === "ArrowLeft") nextIndex = (currentIndex - 1 + tabItems.length) % tabItems.length;
    else if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = tabItems.length - 1;
    else return;
    event.preventDefault();
    tabItems[nextIndex].focus();
  });
  tabs.addEventListener("scroll", function () {
    positionPreview(preview.dataset.style || select.value);
  }, { passive: true });
  window.addEventListener("resize", function () {
    positionPreview(preview.dataset.style || select.value);
    resizeInput();
  });

  select.addEventListener("change", function () {
    updateStyleUI(true);
  });
  input.addEventListener("focus", function () {
    if (hasFocusedInput) return;
    hasFocusedInput = true;
    showKingSpeech("한글을 입력해 보세요.");
  });
  input.addEventListener("keyup", handleInputReaction);
  input.addEventListener("input", resizeInput);
  if (colorArchiveCta) {
    colorArchiveCta.addEventListener("click", function () {
      var inputShellRect = inputShell.getBoundingClientRect();
      var inputIsOutsideViewport = inputShellRect.top < 0 || inputShellRect.bottom > window.innerHeight;

      if (inputIsOutsideViewport) {
        inputShell.scrollIntoView({
          behavior: reduceMotion ? "auto" : "smooth",
          block: "center"
        });
      }

      try {
        input.focus({ preventScroll: true });
      } catch (error) {
        input.focus();
      }

      restartClass(inputShell, "is-cta-cued", 680);
      window.clearTimeout(placeholderTimer);
      input.placeholder = "이름을 입력해 보세요";
      placeholderTimer = window.setTimeout(function () {
        input.placeholder = "한글을 입력하세요";
      }, 2400);
    });
  }
  previewImage.addEventListener("error", function () {
    previewImage.hidden = true;
    previewFallback.hidden = false;
  });
  updateStyleUI(false);
  updateCount();
  resizeInput();
  applyJamoColors();

  document.querySelectorAll(".jamo-item button").forEach(function (button) {
    button.addEventListener("click", function () {
      var start = input.selectionStart;
      var end = input.selectionEnd;
      var next = input.value.slice(0, start) + button.dataset.char + input.value.slice(end);
      if (next.replace(/\s/g, "").length > 16) return;
      input.value = next;
      input.selectionStart = input.selectionEnd = start + button.dataset.char.length;
      input.focus();
      $(input).trigger("keyup");
      handleInputReaction();
      flashJamo(button);
    });
  });

  $("#capture").on("click", function () {
    if ($("textarea[name=fname]").val() === "") {
      alert("내용을 입력하세요");
      return false;
    }

    window.clearTimeout(canvasTimer);
    canvasFrame.classList.remove("is-generating", "is-revealing");
    var temp_t = $("textarea[name=fname]").val();
    var capture_size = $("#captureArea").width();
    var capture_scale = 4000 / capture_size;
    var capture_font = capture_size / 40;
    window.scrollTo(0,0);
    $(".result").css("font-size", capture_font);
    $(".result").css("display", "block");

    html2canvas(document.getElementById("captureArea"), {
      scale: capture_scale,
      allowTaint: true,
      logging: true,
      letterRendering: 1,
      useCORS: true
    }).then(function (canvas) {
      if (navigator.msSaveBlob) {
        var blob = canvas.msToBlob();
        return navigator.msSaveBlob(blob, temp_t + ".jpg");
      }

      var img = new Image();
      img.crossOrigin = "Anonymous";
      img.id = "getshot";
      img.src = canvas.toDataURL("image/jpeg");
      document.body.appendChild(img);
      var el = document.getElementById("target");
      el.crossOrigin = "Anonymous";
      el.href = img.src;
      el.download = temp_t + ".jpg";
      el.click();
      document.body.removeChild(img);
      $(".result").css("display", "none");
    });
  });
})();
