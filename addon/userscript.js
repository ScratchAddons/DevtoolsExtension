import DevTools from "./DevTools.js";

export default async function ({ addon, global, console, msg, safeMsg: m }) {
  // noinspection JSUnresolvedVariable
  if (
    window.initGUI ||
    (!addon.self._isDevtoolsExtension && document.head.classList.contains("griffpatchDevtoolsExtensionEnabled"))
  ) {
    console.log("Extension running, stopping addon");
    return;
  }

  // 0-indexed 6 = July
  const releaseDate = new Date(2021, 1, 8);
  const releaseDateLocalized = new Intl.DateTimeFormat(msg.locale).format(releaseDate);

  const helpHTML = `
<div id="s3devHelpPop" class="modal_modal-overlay_1Lcbx">
<div class="modal_modal-content_1h3ll">
<div class="modal_header_1h7ps">
  <div class="modal_header-item_2zQTd modal_header-item-title_tLOU5">${m("help-title")}</div>
  <div class="modal_header-item_2zQTd modal_header-item-close_2XDeL">
    <div class="close-button close-button_close-button_lOp2G close-button_large_2oadS">
	  <img class="close-button_close-icon_HBCuO" src="/static/assets/cb666b99d3528f91b52f985dfb102afa.svg">
	</div>
  </div>
</div>
<div id="s3devHelpContent">
<p>${m("version", {
    version: "1.9.0",
    date: releaseDateLocalized,
    ndash: "&ndash;",
    url: '<a target="_blank" rel="noreferrer noopener" href="https://www.youtube.com/griffpatch">Griffpatch</a>',
  })}</p>
<hr />
<h2><strong>${m("changes024")}</strong></h2>
<p><strong>${m("ctrl-space")}</strong> &ndash; ${m("ctrl-space-desc")}</p>
<p><strong>${m("fixes")}</strong> &ndash; ${m("fixes-desc")}</p>
<hr />
<h2><strong>${m("code-tab-features")}</strong></h2>
<p><strong>${m("interactive-find-bar")}</strong> - ${m("interactive-find-bar-desc")}</p>
<p><strong>${m("improved-tidy-up")}</strong> &ndash; ${m("improved-tidy-up-desc")}</p>
<p><strong>${m("copy-to-clipboard")}</strong> &ndash; ${m("copy-to-clipboard-desc")}</p>
<p><strong>${m("paste-from-clipboard")}</strong> &ndash; ${m("paste-from-clipboard-desc")}</p>
<p><strong>${m("show-broadcast")}</strong> &ndash; ${m("show-broadcast-desc")}</p>
<p><strong>${m("swap-variable")}</strong> &ndash; ${m("swap-variable-desc")}</p>
<p><strong>${m("middleclick")}</strong> &ndash; ${m("middleclick-desc")}</p>
<p><strong>${m("ctrl-lr")}</strong> &ndash; ${m("ctrl-lr-desc")}</p>
<p><strong>${m("ctrl-space")}</strong> &ndash; ${m("ctrl-space-desc")}</p>
<hr />
<h2><strong>${m("costume-tab-features")}</strong></h2>
<p><strong>${m("find-bar")}</strong> &ndash; ${m("find-bar-costume-desc")}</p>
<p><strong>${m("ctrl-lr")}</strong> &ndash; ${m("ctrl-lr-desc")}</p>
<p><strong>${m("send-top-bottom")}</strong> &ndash; ${m("send-top-bottom-desc")}</p>
<hr />
<p>${m(
    "youtube"
  )} -&nbsp;<a target="_blank" href="https://www.youtube.com/griffpatch">https://www.youtube.com/user/griffpatch</a></p>
</div>
</div>
</div>
`;

  const devTools = new DevTools(addon, msg, m, helpHTML);
  devTools.init();
}
