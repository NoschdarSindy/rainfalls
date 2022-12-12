const INSETS = {
  all: [
      "0 75% 0% 0%",
      "0% 0% 0% 25%",
      "0% 37.5% 0% 25%",
      "0% 0% 0% 62.5%",
      "0% 0% 0% 62.5%"
  ],
  intervals: [
      "0% 100% 0% 0%",
      "0%",
      "0% 50% 0% 0%",
      "0% 0% 0% 50%",
      "0% 0% 0% 50%"
  ],
  comparisonIntA: [
      "0% 75% 0% 0%",
      "0% 0% 0% 25%",
      "0% 0% 0% 25%",
      "0% 0% 0% 100%",
      "0% 0% 0% 100%"
  ],
  comparisonIntB: [
      "0% 75% 0% 0%",
      "0% 0% 0% 25%",
      "0% 75% 0% 25%",
      "0% 0% 0% 25%",
      "0% 0% 0% 25%"
  ],
  comparison: [
      "0%",
      "0% 0% 0% 100%",
      "0% 0% 0% 100%",
      "0% 0% 0% 100%",
      "0% 0% 0% 100%"
  ],
  intervalA: [
      "0% 100% 0% 0%",
      "0%",
      "0%",
      "0% 0% 0% 100%",
      "0% 0% 0% 100%"
  ],
  intervalB: [
      "0% 100% 0% 0%",
      "0%",
      "0% 100% 0% 0%",
      "0%",
      "0%"
  ],
  none: [
    "100%",
    "100%",
    "100%",
    "100%",
    "100%"
  ]
}

export default class WindowManager {
  static isVisible(id) {
    let parentStyle = document.getElementById(`${id}-mosaic`).parentElement.style;
    let inset = parseInt(parentStyle.inset);
    let right = parseInt(parentStyle.right);
    let left =  parseInt(parentStyle.left);
  
    return inset !== 100 && left + right !== 100;
  }

  static setInset(id) {
    let element = document.getElementById("mosaic-frame").firstChild.firstChild.firstChild;
    let i = 0;
    do {
      element.style.inset = INSETS[id][i];
      i += 1;
    }
    while (element = element.nextSibling);
  }

  static setState(selected) {
    if (selected.length === 3) {
      return WindowManager.setInset("all");
    }
    
    if (selected.length === 2) {
      if (selected.some(obj => obj.value === "comparison")) {
        if (selected.some(obj => obj.value === "intervalA")) {
          return WindowManager.setInset("comparisonIntA");
        }
        return WindowManager.setInset("comparisonIntB");
      }
      return WindowManager.setInset("intervals");
    }

    if (selected.length === 1) {
      return WindowManager.setInset(selected[0].value);
    }

    return WindowManager.setInset("none");
  }

  static close(id) {
    const comparison = WindowManager.isVisible("comparison");
    const intervalA = WindowManager.isVisible("intervalA");
    const intervalB = WindowManager.isVisible("intervalB");

    if (comparison) {
      if (intervalA && intervalB) {
        if (id === "comparison") {
          return WindowManager.setInset("intervals");
        }
        if (id === "intervalA") {
          return WindowManager.setInset("comparisonIntB");
        }
        if (id === "intervalB") {
          return WindowManager.setInset("comparisonIntA");
        }
        return;
      }

      if (intervalA) {
        if (id === "comparison") {
          return WindowManager.setInset("intervalA");
        }
        if (id === "intervalA") {
          return WindowManager.setInset("comparison");
        }
        return
      }

      if (intervalB) {
        if (id === "comparison") {
          return WindowManager.setInset("intervalB");
        }
        if (id === "intervalB") {
          return WindowManager.setInset("comparison");
        }
        return
      }

      if (id == "comparison") {
        return WindowManager.setInset("none");
      }
      return
    }

    if (intervalA) {
      if (intervalB) {
        if (id === "intervalA") {
          return WindowManager.setInset("intervalB");
        }
        if (id === "intervalB") {
          return WindowManager.setInset("intervalA");
        }
      }
      
      if (id === "intervalA") {
        return WindowManager.setInset("none");
      }
    }

    if (intervalB) {    
      if (id === "intervalB") {
        return WindowManager.setInset("none");
      }
    }
  }
}
