(function () {
  var select = document.getElementById("style_kind");
  var tabs = document.querySelector(".style-tabs");
  var selectedName = document.querySelector(".selected-style-name");
  var input = document.getElementById("t");
  var count = document.querySelector(".result3");
  var preview = document.querySelector(".style-preview");
  var previewImage = document.querySelector(".style-preview__image");
  var previewFallback = document.querySelector(".style-preview__fallback");
  var canvasFrame = document.querySelector(".canvas-frame");
  var kingGuide = document.querySelector(".king-guide");
  var kingSpeech = document.querySelector(".king-speech");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var canvasTimer;
  var completionTimer;
  var speechTimer;
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

  function updateStyleUI(shouldAnimate) {
    var selectedOption = select.options[select.selectedIndex];
    selectedName.textContent = selectedOption.text;
    preview.dataset.style = select.value;
    previewImage.alt = selectedOption.text + " 예시 이미지";
    if (previewSources[select.value]) {
      previewImage.src = previewSources[select.value];
      previewImage.hidden = false;
      previewFallback.hidden = true;
    } else {
      previewImage.removeAttribute("src");
      previewImage.hidden = true;
      previewFallback.hidden = false;
    }
    if (shouldAnimate) {
      restartClass(preview, "is-switching", 460);
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
      select.value = option.value;
      $(select).trigger("change");
      updateStyleUI(true);
    });
    tabs.appendChild(tab);
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
  previewImage.addEventListener("error", function () {
    previewImage.hidden = true;
    previewFallback.hidden = false;
  });
  updateStyleUI(false);
  updateCount();
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
