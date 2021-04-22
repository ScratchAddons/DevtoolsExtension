import Localization from "./l10n.js";

// Make sure SA doesn't run editor-devtools
window.initGUI = true;

const MAIN_JS = "userscript.js";

const path = document.querySelector("script[id='devtools-extension-module']").getAttribute("data-path");
const getURL = (x) => `${path}${x}`;
const scriptUrl = getURL(`addon/${MAIN_JS}`);

class WaitForElementSingleton {
  constructor() {
    this._waitForElementSet = new WeakSet();
    this.getBindedFunc = () => this.waitForElement.bind(this);
  }
  waitForElement(selector, opts = {}) {
    // Identical to SA
    const markAsSeen = !!opts.markAsSeen;
    const firstQuery = document.querySelectorAll(selector);
    for (const element of firstQuery) {
      if (this._waitForElementSet.has(element)) continue;
      if (markAsSeen) this._waitForElementSet.add(element);
      return Promise.resolve(element);
    }
    return new Promise((resolve) =>
      new MutationObserver((mutationsList, observer) => {
        const elements = document.querySelectorAll(selector);
        for (const element of elements) {
          if (this._waitForElementSet.has(element)) continue;
          observer.disconnect();
          resolve(element);
          if (markAsSeen) this._waitForElementSet.add(element);
          break;
        }
      }).observe(document.documentElement, {
        attributes: false,
        childList: true,
        subtree: true,
      })
    );
  }
}

const addon = {
  self: {
    _isDevtoolsExtension: true,
  },
  settings: {
    get(settingName) {
      const returnTrue = ["enableCleanUpPlus", "enablePasteBlocksAtMouse", "enableMiddleClickFinder"];
      if (returnTrue.includes(settingName)) return true;
      else throw "Invalid setting name";
    },
  },
  tab: {
    traps: {
      get vm() {
        return Object.values(document.querySelector('div[class^="stage-wrapper_stage-wrapper_"]')).find((x) => x.child)
          .child.child.child.stateNode.props.vm;
      },

      // All of these are needed for getBlockly()
      _cache: Object.create(null),
      _getEditorMode() {
        const isWWW = !!document.querySelector("meta[name='format-detection']");
        const editorMode = (() => {
          const pathname = location.pathname.toLowerCase();
          const split = pathname.split("/").filter(Boolean);
          if (!split[0] || split[0] !== "projects") return null;
          if (split.includes("editor")) return "editor";
          if (split.includes("fullscreen")) return "fullscreen";
          if (split.includes("embed")) return "embed";
          return "projectpage";
        })();
        return isWWW && editorMode;
      },
      _waitForElement: new WaitForElementSingleton().getBindedFunc(),
      _react_internal_key: undefined,
      get REACT_INTERNAL_PREFIX() {
        return "__reactInternalInstance$";
      },

      async getBlockly() {
        // Identical to SA
        if (this._cache.Blockly) return this._cache.Blockly;
        const editorMode = this._getEditorMode();
        if (!editorMode || editorMode === "embed") throw new Error("Cannot access Blockly on this page");
        const BLOCKS_CLASS = '[class^="gui_blocks-wrapper"]';
        let elem = document.querySelector(BLOCKS_CLASS);
        if (!elem) {
          elem = await this._waitForElement(BLOCKS_CLASS);
        }
        if (!this._react_internal_key) {
          this._react_internal_key = Object.keys(elem).find((key) => key.startsWith(this.REACT_INTERNAL_PREFIX));
        }
        const internal = elem[this._react_internal_key];
        let childable = internal;
        /* eslint-disable no-empty */
        while (
          ((childable = childable.child), !childable || !childable.stateNode || !childable.stateNode.ScratchBlocks)
        ) {}
        /* eslint-enable no-empty */
        return (this._cache.Blockly = childable.stateNode.ScratchBlocks);
      },
    },
    scratchClass(...args) {
      const classNamesArr = [
        ...new Set(
          [...document.styleSheets]
            .filter(
              (styleSheet) =>
                !(
                  styleSheet.ownerNode.textContent.startsWith(
                    "/* DO NOT EDIT\n@todo This file is copied from GUI and should be pulled out into a shared library."
                  ) &&
                  (styleSheet.ownerNode.textContent.includes("input_input-form") ||
                    styleSheet.ownerNode.textContent.includes("label_input-group_"))
                )
            )
            .map((e) => {
              try {
                return [...e.cssRules];
              } catch (e) {
                return [];
              }
            })
            .flat()
            .map((e) => e.selectorText)
            .filter((e) => e)
            .map((e) => e.match(/(([\w-]+?)_([\w-]+)_([\w\d-]+))/g))
            .filter((e) => e)
            .flat()
        ),
      ];
      let res = "";
      args
        .filter((arg) => typeof arg === "string")
        .forEach((classNameToFind) => {
          res +=
            classNamesArr.find(
              (className) =>
                className.startsWith(classNameToFind + "_") && className.length === classNameToFind.length + 6
            ) || "";
          res += " ";
        });
      if (typeof args[args.length - 1] === "object") {
        const options = args[args.length - 1];
        const classNames = Array.isArray(options.others) ? options.others : [options.others];
        classNames.forEach((string) => (res += string + " "));
      }
      res = res.slice(0, -1);
      // Sanitize just in case
      res = res.replace(/"/g, "");
      return res;
    },
  },
};

const langCode = `; ${document.cookie}`.split("; scratchlanguage=").pop().split(";").shift() || navigator.language;
function getL10NURLs() {
  // Note: not identical to Scratch Addons function
  const urls = [getURL(`l10n/${langCode}`)];
  if (langCode === "pt") {
    urls.push(getURL(`addons-l10n/pt-br`));
  }
  if (langCode.includes("-")) {
    urls.push(getURL(`l10n/${langCode.split("-")[0]}`));
  }
  const enJSON = getURL("l10n/en");
  if (!urls.includes(enJSON)) urls.push(enJSON);
  return urls;
}
const l10nObject = new Localization(getL10NURLs());

const msg = (key, placeholders) => l10nObject.get(`editor-devtools/${key}`, placeholders);
msg.locale = langCode;

const isPageReady = () =>
  // Make sure <title> element exists to make sure Scratch <style>s were injected,
  // which are necessary for addon.tab.scratchClass() calls.
  // We also need the stage element to be there to get the VM object.
  document.querySelector("title") && document.querySelector('div[class^="stage-wrapper_stage-wrapper_"]');

l10nObject.loadByAddonId("editor-devtools").then(() =>
  import(scriptUrl).then((module) => {
    const loaded = () => {
      // Remove SA CSS that might affect ours if versions don't match
      const styles = document.querySelector("link[rel=stylesheet][href$='addons/editor-devtools/userscript.css']");
      if (styles) styles.remove();

      // Run
      module.default({
        addon,
        global: {},
        console,
        msg,
        safeMsg: (key, placeholders) => l10nObject.escaped(`editor-devtools/${key}`, placeholders),
      });
    };
    if (isPageReady()) {
      if (document.readyState === "complete") loaded();
      else window.addEventListener("load", () => loaded(), { once: true });
    } else {
      const observer = new MutationObserver(() => {
        if (isPageReady()) {
          if (document.readyState === "complete") loaded();
          else window.addEventListener("load", () => loaded(), { once: true });
          observer.disconnect();
        }
      });
      observer.observe(document.documentElement, { childList: true, subtree: true });
    }
  })
);
