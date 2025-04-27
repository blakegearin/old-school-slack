// ==UserScript==
// @name         Old School Slack
// @namespace    https://github.com/blakegearin/old-school-slack
// @version      0.0.1
// @description  Update Slack to look & feel like the old design
// @author       Blake Gearin <hello@blakeg.me> (https://blakegearin.com)
// @match        *://app.slack.com/*
// @icon         https://raw.githubusercontent.com/blakegearin/old-school-slack/refs/heads/main/img/logo.png
// @supportURL   https://github.com/blakegearin/old-school-slack/issues
// @license      GPL-3.0
// @copyright    2023–2025, Blake Gearin (https://blakegearin.com)
// ==/UserScript==

(function () {
  "use strict";

  const VERSION = '0.0.1';
  const USERSCRIPT_NAME = 'Old School Slack';

  const SILENT = 0;
  const QUIET = 1;
  const INFO = 2;
  const DEBUG = 3;
  const VERBOSE = 4;
  const TRACE = 5;

  const CONFIG = {
    logLevel: QUIET,
    sidebar: {
      hide: false,
      workspaceSwitcher: {
        hide: true,
        highlight: true,
      },
      tabs: {
        home: {
          hide: true,
          createNavButton: true,
        },
        // Note: Without home you'll need to use the back button to return when searching
        dms: {
          createNavButton: true,
        },
        activity: {
          hide: true,
          createNavButton: false,
        },
        later: {
          createNavButton: false,
        },
        templates: {
          createNavButton: false,
        },
        automations: {
          createNavButton: false,
        },
        canvases: {
          createNavButton: false,
        },
        files: {
          createNavButton: false,
        },
        channels: {
          createNavButton: false,
        },
        people: {
          createNavButton: false,
        },
        external: {
          createNavButton: false,
        },
        more: {
          hide: true,
          createNavButton: false,
        },
      },
      createButton: {
        moveUp: true,
      },
      avatar: {
        moveToNav: true,
      },
    },
    workspace: {
      squareOff: true,
    },
  }

  const LOG_LEVELS = {
    getName: (level) => {
      return {
        0: 'silent',
        1: 'quiet',
        2: 'info',
        3: 'debug',
        4: 'verbose',
        5: 'trace',
      }[level];
    },
    getValue: (name) => {
      return {
        silent: SILENT,
        quiet: QUIET,
        info: INFO,
        debug: DEBUG,
        verbose: VERBOSE,
        trace: TRACE,
      }[name];
    },
  };

  let CURRENT_LOG_LEVEL = CONFIG.logLevel;

  function log (level, message, variable = undefined) {
    if (CURRENT_LOG_LEVEL < level) return;

    const levelName = LOG_LEVELS.getName(level);

    const log = `[${VERSION}] [${levelName}] ${USERSCRIPT_NAME}: ${message}`;

    console.groupCollapsed(log);

    if (variable !== undefined) console.dir(variable, { depth: null });

    console.trace();
    console.groupEnd();
  }

  function logError (message, error = undefined) {
    const log = `[${VERSION}] [error] ${USERSCRIPT_NAME}: ${message}`;

    console.groupCollapsed(log);

    if (error !== undefined) console.error(error);

    console.trace();
    console.groupEnd();
  }

  log(QUIET, 'Starting');

  // Source: https://stackoverflow.com/a/61511955/5988852
  function waitForElement(selector) {
    return new Promise(resolve => {
      if (document.querySelector(selector)) {
        return resolve(document.querySelector(selector));
      }

      const observer = new MutationObserver(mutations => {
        if (document.querySelector(selector)) {
          observer.disconnect();
          resolve(document.querySelector(selector));
        }
      });

      // If you get "parameter 1 is not of type 'Node'" error, see https://stackoverflow.com/a/77855838/492336
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    });
  }

  function buildTabButton({ id, ariaLabel, svg, onClick }) {
    const outerDiv = document.createElement('div');
    outerDiv.id = id;
    outerDiv.classList.add('p-ia4_history_menu_button', 'oss-tab-button');

    const button = document.createElement('button');
    button.classList.add('c-button-unstyled', 'p-ia4_history_menu_button__button');
    button.setAttribute('data-qa', 'top-nav-history-menu');
    button.setAttribute('aria-label', ariaLabel);
    button.setAttribute('aria-disabled', 'false');
    button.setAttribute('aria-haspopup', 'menu');
    button.setAttribute('data-sk', 'tooltip_parent');
    button.type = 'button';
    button.tabIndex = 0;
    button.innerHTML = svg.outerHTML;

    // Add the click event listener
    button.addEventListener('click', onClick);

    // Append the button to the outer div
    outerDiv.appendChild(button);

    return outerDiv;
  }

  async function moveCreateButton() {
    log(DEBUG, 'moveCreateButton()');

    const moveCreateButtonStyleId = 'oss-move-create-button-style';
    if (!document.getElementById(moveCreateButtonStyleId)) {
      const moveCreateButtonStyle = document.createElement("style");
      moveCreateButtonStyle.id = moveCreateButtonStyleId;

      moveCreateButtonStyle.textContent += `
        .p-client_workspace__layout .p-control_strip[role="toolbar"],
        .p-control_strip[role="toolbar"] > div
        {
          display: none !important;
        }

        .p-control_strip
        {
          margin-top: 0px !important;
          position: relative;
        }

        .p-tab_rail
        {
          row-gap: 6px;
        }
      `;

      document.body.appendChild(moveCreateButtonStyle);
    }

    const controlStripToolbarSelector = '.p-client_workspace__layout .p-control_strip[role="toolbar"]';
    const controlStripToolbar = document.querySelector(controlStripToolbarSelector);
    log(DEBUG, 'controlStripToolbar', controlStripToolbar);

    const controlStripToolbarId = 'control-strip-toolbar-new';
    document.getElementById(controlStripToolbarId)?.remove();
    controlStripToolbar.id = controlStripToolbarId;

    document.querySelector('.p-tab_rail').appendChild(controlStripToolbar);

    // Wait for a new instance to appear, which happens on tab change
    await waitForElement(controlStripToolbarSelector);
    moveCreateButton();
  }

  function squareOffWorkspace() {
    log(DEBUG, 'squareOffWorkspace()');

    const squareOffWorkspaceStyle = document.createElement("style");
    squareOffWorkspaceStyle.id = "oss-expand-workspace-to-edge";

    squareOffWorkspaceStyle.textContent += `
      .p-client_workspace
      {
        padding: 0 !important;
      }

      .p-client_workspace__layout
      {
        border-radius: 0px !important;
        border-bottom: none !important;
        border-right: none !important;
      }

      .p-ia4_client .p-view_contents--primary,
      .p-ia4_client .p-view_contents--secondary,
      .p-ia4_client .p-view_contents--sidebar
      {
        max-height: 100% !important;
      }

      .p-client_workspace__layout
      {
        border-top-left-radius: 0 !important;
      }

      .p-tab_rail
      {
        border-top: 1px solid var(--dt_color-otl-ter) !important;
        padding-top: 15px;
      }
    `;

    document.body.appendChild(squareOffWorkspaceStyle);
  }

  function hideSidebar() {
    log(DEBUG, 'hideSidebar()');

    const hideSidebarStyle = document.createElement("style");
    hideSidebarStyle.id = "oss-hide-sidebar-style";

    hideSidebarStyle.textContent += `
      .p-tab_rail
      {
        display: none !important;
      }

      .p-client_workspace_wrapper
      {
        grid-template-columns: 0px auto !important;
      }

      .p-client_workspace__layout
      {
        border-left: none !important;
      }
    `;

    document.body.appendChild(hideSidebarStyle);
  }

  function moveAvatar() {
    log(DEBUG, 'moveAvatar()');

    const moveAvatarStyle = document.createElement("style");
    moveAvatarStyle.id = "oss-move-avatar-style";

    const statusDiv = document.querySelector('[aria-label="Control strip"] > div');
    if (!statusDiv) {
      logError('Could not find status div');
      return;
    }

    const rightNav = document.querySelector(".p-ia4_top_nav__right_container");
    rightNav.appendChild(statusDiv);

    moveAvatarStyle.textContent += `
      .ReactModal__Content:has(.p-ia__main_menu__user),
      .ReactModal__Content:has(.p-control_strip__user_tooltip)
      {
        margin-top: 32px !important;
      }

      .p-ia__nav__user
      {
        display: flex;
      }

      .p-ia4_top_nav__right_container > div:nth-child(1)
      {
        margin-right: 5px;
      }

      .p-ia4_top_nav__right_container > div:nth-child(2),
      .p-ia__nav__user__avatar > span.c-base_icon__width_only_container > img,
      .p-ia__nav__user__avatar > span.c-base_icon__width_only_container
      {
        height: 28px !important;
      }

      .p-ia__nav__user__avatar > span.c-base_icon__width_only_container > img,
      .p-ia__nav__user__avatar > span.c-base_icon__width_only_container
      {
        width: 28px !important;
      }

      .p-ia__nav__user__avatar
      {
        height: 28px !important;
        width: 28px !important;
        --avatar-image-size: 28px !important;
      }

      .p-ia__nav__user__status_icon
      {
        width: 28px;
        height: 28px;
        padding: 0 0 0 6px;
        font-size: 14px;
        line-height: 16px;
        display: flex;
        position: relative;
        margin-right: -2px;
        text-align: center;
      }

      .p-control_strip__circle_button
      {
        background-color: transparent;
      }

      .p-ia__nav__user__status_icon .c-emoji--inline
      {
        position: static;
      }

      .p-ia__nav__user__status_icon
      {
        position: relative;
        background-color: transparent !important;
        margin-left: 4px !important;
      }

      .p-ia__nav__user__status_icon::before {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        width: 35px;
        height: 100%;
        background-color: white;
        opacity: 0.25;
        border-radius: 8px 0px 0px 8px;
      }
    `;

    document.body.appendChild(moveAvatarStyle);
  }

  function highlightWorkspaceSwitcher() {
    log(DEBUG, 'highlightWorkspaceSwitcher()');

    const highlightWorkspaceSwitcherStyle = document.createElement("style");
    highlightWorkspaceSwitcherStyle.id = "oss-highlight-workspace-switcher-style";

    highlightWorkspaceSwitcherStyle.textContent += `
      .p-account_switcher
      {
        border-radius: clamp(var(--dt_static_radius-base), min(22.222%, var(--dt_static_radius-xlarge)), var(--dt_static_radius-xlarge));

        box-shadow: 0px 0px 0px 2pt white;
        height: 40px;
        width: 40px;
      }

      .p-account_switcher i
      {
        margin: 2px;
      }
    `;

    document.body.appendChild(highlightWorkspaceSwitcherStyle);
  }

  function processTabUpdates({ tabListSelector, historyNavigationSelector }) {
    log(DEBUG, 'processTabUpdates()');

    const tabButtonsStyle = document.createElement("style");
    tabButtonsStyle.id = "oss-tab-buttons-style";

    tabButtonsStyle.innerHTML = `
      .oss-tab-button
      {
        margin-left: 4px !important;
        margin-right: 0px !important;
      }

      .oss-tab-button:first-child
      {
        margin-left: 7px !important;
      }
    `;

    document.head.appendChild(tabButtonsStyle);

    const tabListDiv = document.querySelector(tabListSelector);
    log(INFO, 'tabListDiv', tabListDiv);

    if (!tabListDiv) {
      logError(`Could not find ${tabListSelector}`);
      return;
    }

    const historyNavigation = document.querySelector(historyNavigationSelector);

    // Find the first child before inserts occur
    const historyNavigationFirstChild = historyNavigation.firstChild;

    for (let tab of tabListDiv.children) {
      log(INFO, 'tab', tab);

      const name = tab.querySelector('.p-tab_rail__button__label').innerText;
      const tabConfig = CONFIG.sidebar.tabs[name?.toLowerCase()];
      log(INFO, 'tabConfig', tabConfig);

      if (!tabConfig) {
        log(INFO, `Skipping tab: ${name}`);
        continue;
      } else {

        if (tabConfig.hide) tab.style.cssText = 'display: none !important;';

        if (tabConfig.createNavButton) {
          const id = name + '-new';
          const svg = tab.querySelector('svg');

          // Watch for svg changes to reflect the selected tab
          const observer = new MutationObserver(() => {
            document.querySelector(`#${id} svg`).innerHTML = svg.outerHTML;
          });
          observer.observe(svg, { childList: true, subtree: true });

          const ariaLabel = tab.tagName === 'BUTTON' ? tab.ariaLabel : tab.querySelector('button').ariaLabel;
          const buttonSelector = `.p-tab_rail button[aria-label="${ariaLabel}"]`;
          const onClick = () => {
            log(INFO, 'buttonSelector', buttonSelector);
            document.querySelector(buttonSelector).click();
          };

          const tabButtonParams = { id, name, svg, onClick };
          log(INFO, 'tabButtonParams', tabButtonParams);

          const tabButton = buildTabButton(tabButtonParams);
          historyNavigation.insertBefore(tabButton, historyNavigationFirstChild);
        }
      }
    }
  }

  async function applyCustomizations() {
    log(INFO, 'applyCustomizations()');

    if (CONFIG.workspace.squareOff) squareOffWorkspace();
    if (CONFIG.sidebar.hide) hideSidebar();
    if (CONFIG.sidebar.workspaceSwitcher.highlight) highlightWorkspaceSwitcher();

    const tabListSelector = 'div.p-tab_rail__tab_menu[role="tablist"]';
    const historyNavigationSelector = 'div[aria-label="History Navigation"]';

    await waitForElement(tabListSelector);
    await waitForElement(historyNavigationSelector);

    processTabUpdates({ tabListSelector, historyNavigationSelector });

    if (CONFIG.sidebar.createButton.moveUp) moveCreateButton();
    if (CONFIG.sidebar.avatar.moveToNav) moveAvatar();

    log(QUIET, "Finished");
  }

  void applyCustomizations();
})();
