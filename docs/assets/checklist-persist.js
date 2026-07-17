(() => {
  function storageKey(index) {
    return `checklist:${location.pathname}:${index}`;
  }

  function init() {
    const boxes = document.querySelectorAll(
      '.md-typeset .task-list-item > input[type="checkbox"]'
    );
    if (!boxes.length) return;

    boxes.forEach((box, index) => {
      const key = storageKey(index);
      const saved = localStorage.getItem(key);
      if (saved !== null) {
        box.checked = saved === "1";
      }

      box.addEventListener("change", () => {
        localStorage.setItem(key, box.checked ? "1" : "0");
      });
    });
  }

  if (typeof document$ !== "undefined") {
    // Material's instant-navigation observable — re-run on every page load
    document$.subscribe(init);
  } else {
    document.addEventListener("DOMContentLoaded", init);
  }
})();
