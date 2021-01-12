let scratchVm;

const oldPrototypes = {
  functionBind: Function.prototype.bind,
};
Function.prototype.bind = function (...args) {
  if (
    args[0] &&
    Object.prototype.hasOwnProperty.call(args[0], "editingTarget") &&
    Object.prototype.hasOwnProperty.call(args[0], "runtime")
  ) {
    scratchVm = args[0];
    Function.prototype.bind = oldPrototypes.functionBind;
    return oldPrototypes.functionBind.apply(this, args);
  } else {
    return oldPrototypes.functionBind.apply(this, args);
  }
};

const MAIN_JS = "userscript.js";

const path = document.querySelector("script[id='devtools-extension-module'").getAttribute("data-path");
const scriptUrl = `${path}addon/${MAIN_JS}`;

const language = `; ${document.cookie}`.split("; scratchlanguage=").pop().split(";").shift() || navigator.language;

const addon = {
  self: {
    isDevtoolsExtension: true,
  },
  tab: {
    traps: {
      onceValues: {
        get vm() {
          return scratchVm;
        },
      },
    },
  },
};
const promise = import(scriptUrl).then((module) =>
  module.default({
    addon,
    global: {},
    console,
  })
);
