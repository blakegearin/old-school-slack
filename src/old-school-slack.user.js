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
      ifOneWorkspace: {
        hideSidebar: true,
        addWorkspaceButton: {
          createNavButton: true,
        },
        homeTab: {
          createNavButtonOnSearch: true,
        }
      },
      workspaceSwitcher: {
        hide: true,
        clickToGoHome: true,
        highlight: true,
        addOtherWorkspaceButtons: true,
      },
      tabs: {
        home: {
          hide: true,
          createNavButton: false,
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
        hide: true,
        moveUp: false,
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

  function updateWorkspaceToGoHome() {
    const workspaceSwitcher = document.querySelector('.p-account_switcher');
    workspaceSwitcher.click();
    workspaceSwitcher.addEventListener('click', async () => {
      const buttonSelector = `.p-tab_rail button[aria-label="Home"]`;
      document.querySelector(buttonSelector).click();

      await closeWorkspaceSwitcherModal();
    });
  }

  async function closeWorkspaceSwitcherModal() {
    const modalOverlaySelector = '.ReactModal__Overlay';
    await waitForElement(modalOverlaySelector);
    document.querySelector(modalOverlaySelector)?.click();
  }

  function openWorkspaceSwitcherDiscretely() {
    log(DEBUG, 'openWorkspaceSwitcherDiscretely()');

    // Temporarily hide the workspace switcher modal
    const style = document.createElement("style");
    style.id = "oss-temporary-modal-content-style";
    style.textContent += `.ReactModal__Content { display: none !important; }`;
    document.body.appendChild(style);

    // Open the workspace switcher modal
    const originalWorkspaceSwitcher = document.querySelector('.p-account_switcher');
    originalWorkspaceSwitcher.click();

    return style;
  }

  async function closeWorkspaceSwitcherDiscretely(style) {
    log(DEBUG, 'closeWorkspaceSwitcherDiscretely()');

    await closeWorkspaceSwitcherModal();
    style.remove();
  }

  async function getWorkspaceCount() {
    log(SILENT, 'maybeHideWorkspaceSwitcher()');

    const temporaryModalContentStyle = openWorkspaceSwitcherDiscretely();

    const workspacesSelector = '.p_team-switcher-menu__item__team .p_team-switcher-menu__item__team';
    await waitForElement(workspacesSelector);

    const workspaceCount = document.querySelectorAll(workspacesSelector).length;
    log(SILENT, 'workspaceCount', workspaceCount);

    await closeWorkspaceSwitcherDiscretely(temporaryModalContentStyle);

    return workspaceCount;
  }

  async function openAddWorkspaceDiscretely() {
    const createWorkspaceButtonStyle = openWorkspaceSwitcherDiscretely();

    const workspacesAddButtonSelector = '.p-team_switcher_menu__item--add';
    await waitForElement(workspacesAddButtonSelector);

    document.querySelector(workspacesAddButtonSelector).click();

    await closeWorkspaceSwitcherDiscretely(createWorkspaceButtonStyle);
  }

  async function addWorkspaceButtons() {
    log(DEBUG, 'addWorkspaceButtons()');

    const temporaryModalContentStyle = openWorkspaceSwitcherDiscretely();

    const workspacesSelector = '.p_team-switcher-menu__item__team .p_team-switcher-menu__item__team';
    await waitForElement(workspacesSelector);

    const workspaceDivs = Array.from(document.querySelectorAll(workspacesSelector));
    // Remove the first element, which is the current workspace
    workspaceDivs.shift();

    const workspaceMetadata = [];

    for (const workspaceDiv of workspaceDivs) {
      const icon = workspaceDiv.querySelector('.p-account_switcher__row_icon');
      const url = workspaceDiv.querySelector('.p-account_switcher__row_url').textContent;

      workspaceMetadata.push({ icon, url });
    }

    log(DEBUG, 'workspaceMetadata', workspaceMetadata);

    await closeWorkspaceSwitcherDiscretely(temporaryModalContentStyle);

    const addWorkspaceButtonStyle = document.createElement("style");
    addWorkspaceButtonStyle.id = "oss-add-workspace-button-style";
    addWorkspaceButtonStyle.textContent += `
      .p-tab_rail:has([data-qa="ellipsis-vertical-filled"]) .c-team_icon
      {
        height: 24px !important;
        width: 24px !important;
        min-width: auto !important;
      }

      .p-tab_rail:has([data-qa="ellipsis-vertical-filled"]) [role="tablist"] > div:last-child .p-tab_rail__button
      {
        margin-bottom: 0px !important;
      }

      .p-tab_rail .p-team_switcher_menu__item--add
      {
        padding: 0px !important;
      }

      .p-tab_rail .p-add_team_label > div:nth-child(2)
      {
        display: none !important;
      }

      #oss-create-workspace-button
      {
        display: flex !important;
      }

      .active-managed-focus-container .p-control_strip__circle_button
      {
        background-color: transparent;
      }
      .active-managed-focus-container .p-control_strip__circle_button:active
      {
        background-color: revert !important;
      }
    `;
    document.body.appendChild(addWorkspaceButtonStyle);

    const thirdElementInTabRail = document.querySelector('.p-tab_rail > div:nth-child(3)')
    log(QUIET, 'thirdElementInTabRail', thirdElementInTabRail);

    const tabRail = thirdElementInTabRail.parentElement;

    function buildTabRailDiv() {
      const tabRailDiv = document.createElement('div');

      tabRailDiv.classList.add('active-managed-focus-container');
      tabRailDiv.role = 'none';
      tabRailDiv.style.display = 'contents';

      const peekTriggerDiv = document.createElement('div');
      peekTriggerDiv.classList.add('p-peek_trigger');
      peekTriggerDiv.role = 'none';

      const peekTriggerDivInner = document.createElement('div');

      peekTriggerDiv.appendChild(peekTriggerDivInner);
      tabRailDiv.appendChild(peekTriggerDiv);

      return [tabRailDiv, peekTriggerDivInner];
    };

    for (const workspace of workspaceMetadata) {
      const [workspaceDiv, innerDiv] = buildTabRailDiv();

      const button = document.createElement('button');
      button.classList.add('c-button-unstyled', 'p-account_switcher', 'oss-account_switcher');
      button.innerHTML = workspace.icon.outerHTML;

      button.setAttribute('aria-label', 'Switch workspaces… (Bernie Slack) ');

      button.addEventListener('click', () => {
        window.location.href = `https://${workspace.url}`;
      });

      innerDiv.appendChild(button);
      tabRail.insertBefore(workspaceDiv, thirdElementInTabRail);
    }

    const [workspaceAddDiv, innerDiv] = buildTabRailDiv();

    const controlStripCreateButtonSelector = '.p-client_workspace__layout .p-control_strip[role="toolbar"] .p-control_strip__create_button';
    const controlStripCreateButton = document.querySelector(controlStripCreateButtonSelector);
    const workspacesAddButton = controlStripCreateButton.cloneNode(true);
    log(DEBUG, 'workspacesAddButton', workspacesAddButton);

    workspacesAddButton.id = 'oss-create-workspace-button';
    workspacesAddButton.classList.add('p-account_switcher');

    workspacesAddButton.addEventListener('click', async () => {
      await openAddWorkspaceDiscretely();
    });

    innerDiv.appendChild(workspacesAddButton);
    tabRail.insertBefore(workspaceAddDiv, thirdElementInTabRail);
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

        .c-tabs__tab_content:first-child
        {
          padding-top: 0px !important;
        }

        .p-control_strip
        {
          padding: 0px !important;
        }
      `;

      document.body.appendChild(moveCreateButtonStyle);
    }

    const controlStripToolbarSelector = '.p-client_workspace__layout .p-control_strip[role="toolbar"]';
    const controlStripToolbar = document.querySelector(controlStripToolbarSelector);
    log(DEBUG, 'controlStripToolbar', controlStripToolbar);

    const controlStripToolbarId = 'oss-control-strip-toolbar-moved';
    document.getElementById(controlStripToolbarId)?.remove();
    controlStripToolbar.id = controlStripToolbarId;

    document.querySelector('.p-tab_rail').appendChild(controlStripToolbar);

    // Wait for a new instance to appear, which happens on tab change
    await waitForElement(controlStripToolbarSelector);
    moveCreateButton();
  }

  function hideCreateButton() {
    log(DEBUG, 'hideCreateButton()');

    const hideCreateButtonStyle = document.createElement("style");
    hideCreateButtonStyle.id = "oss-hide-create-button-style";

    hideCreateButtonStyle.textContent += `
      [role="toolbar"] .p-control_strip__create_button
      {
        display: none !important;
      }
    `;

    document.body.appendChild(hideCreateButtonStyle);
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

      .p-client_workspace__layout .p-control_strip[role="toolbar"]
      {
        padding-bottom: 15px !important;
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

      [aria-label="Control strip"][role="toolbar"] > div:nth-child(2)
      {
        display: none !important;
      }
    `;

    document.body.appendChild(moveAvatarStyle);
  }

  function highlightWorkspaceSwitcher() {
    log(DEBUG, 'highlightWorkspaceSwitcher()');

    const highlightWorkspaceSwitcherStyle = document.createElement("style");
    highlightWorkspaceSwitcherStyle.id = "oss-highlight-workspace-switcher-style";

    highlightWorkspaceSwitcherStyle.textContent += `
      .p-tab_rail:has([data-qa="ellipsis-horizontal-filled"]) > div:first-child .p-account_switcher
      {
        position: relative;
        height: 40px;
        width: 40px;
        border-radius: clamp(var(--dt_static_radius-base), min(22.222%, var(--dt_static_radius-xlarge)), var(--dt_static_radius-xlarge));
        box-shadow: 0px 0px 0px 2pt white;
      }

      .p-tab_rail > div:first-child .p-account_switcher
      {
        position: relative;
        height: 28px;
        width: 28px;
        border-radius: clamp(var(--dt_static_radius-base), min(22.222%, var(--dt_static_radius-xlarge)), var(--dt_static_radius-xlarge));
        box-shadow: 0px 0px 0px 1.5pt white;
      }

      .p-tab_rail > div:first-child .p-account_switcher i
      {
        margin: 2px;
      }
    `;

    document.body.appendChild(highlightWorkspaceSwitcherStyle);
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
    button.addEventListener('click', onClick);

    outerDiv.appendChild(button);

    return outerDiv;
  }

  function addCreateWorkspaceButtonToNav(historyNavigationSelector) {
    log(DEBUG, 'addCreateWorkspaceButtonToNav()');

    const historyNavigation = document.querySelector(historyNavigationSelector);
    const historyNavigationFirstChild = historyNavigation.firstChild;

    const id = `oss-create-workspace-nav-tab`
    const name = 'Create workspace';
    const svg = document.querySelector('.p-control_strip__create_button__icon svg');
    const onClick = async () => {
      await openAddWorkspaceDiscretely();
    };

    const tabButtonParams = { id, name, svg, onClick };
    log(INFO, 'tabButtonParams', tabButtonParams);

    const tabButton = buildTabButton(tabButtonParams);
    historyNavigation.insertBefore(tabButton, historyNavigationFirstChild);
  }

  function processTabUpdates({ tabListSelector, historyNavigationSelector, workspaceCount }) {
    log(DEBUG, 'processTabUpdates()');

    const tabButtonsStyle = document.createElement("style");
    tabButtonsStyle.id = "oss-tab-buttons-style";

    const tabButtonHiddenClass = 'oss-tab-button-hidden';
    tabButtonsStyle.textContent = `
      .${tabButtonHiddenClass}
      {
        display: none !important;
      }

      .oss-tab-button
      {
        margin-left: 4px !important;
        margin-right: 0px !important;
      }

      .oss-tab-button:first-child
      {
        margin-left: 7px !important;
      }

      .ReactModal__Content:has([aria-label="More"][role="menu"])
      {
        margin-top: 32px !important;
      }

      .ReactModal__Content:has([aria-label="More"][role="menu"]) .p-more_menu__container
      {
        max-height: 85vh;
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
    let tabsHiddenCount = 0;

    for (let tab of tabListDiv.children) {
      log(INFO, 'tab', tab);

      const name = tab.querySelector('.p-tab_rail__button__label').innerText;
      const tabConfig = CONFIG.sidebar.tabs[name?.toLowerCase()];
      log(INFO, 'tabConfig', tabConfig);

      if (!tabConfig) {
        log(INFO, `Skipping tab: ${name}`);
        continue;
      } else {
        let hiddenHomeButton = false;

        if (
          workspaceCount <= 1 &&
          name === 'Home' &&
          CONFIG.sidebar.ifOneWorkspace.homeTab.createNavButtonOnSearch
        ) {
          hiddenHomeButton = true;
        }

        if (tabConfig.hide) {
          tab.classList.add(tabButtonHiddenClass);
          tabsHiddenCount++;
        }

        if (!tabConfig.createNavButton && !hiddenHomeButton) continue;

        const id = `oss-${name}-nav-tab`;
        const svg = tab.querySelector('svg');

        // Watch for svg changes to reflect the selected tab
        const observer = new MutationObserver(() => {
          document.querySelector(`#${id} svg`).innerHTML = svg.outerHTML;
        });
        observer.observe(svg, { childList: true, subtree: true });

        const ariaLabel = tab.tagName === 'BUTTON' ? tab.ariaLabel : tab.querySelector('button').ariaLabel;
        const buttonSelector = `.p-tab_rail button[aria-label="${ariaLabel}"]`;
        const onClick = () => {
          log(DEBUG, 'buttonSelector', buttonSelector);
          document.querySelector(buttonSelector).click();
        };

        const tabButtonParams = { id, name, svg, onClick };
        log(INFO, 'tabButtonParams', tabButtonParams);

        const tabButton = buildTabButton(tabButtonParams);
        if (hiddenHomeButton) {
          const setDisplay = () => {
            log(SILENT, 'setDisplay()');

            const searching = window.location.href.endsWith('/search');
            const display = searching ? 'flex' : 'none';
            tabButton.style.display = display;
          };

          setDisplay();

          const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
              if (mutation.type === 'childList' || mutation.type === 'characterData') setDisplay();
            });
          });

          observer.observe(document.body, { childList: true, subtree: true, characterData: true });
        }

        historyNavigation.insertBefore(tabButton, historyNavigationFirstChild);
      }
    }

    let allTabsHidden = tabsHiddenCount === tabListDiv.children.length;
    log(DEBUG, 'tabsHiddenCount', tabsHiddenCount);
    log(DEBUG, 'tabListDiv.children.length', tabListDiv.children.length);
    log(DEBUG, 'allTabsHidden', allTabsHidden);

    if (allTabsHidden) tabButtonsStyle.textContent += `.p-tab_rail > div:nth-child(2) { display: none !important; }`;
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

    const workspaceCount = await getWorkspaceCount();
    processTabUpdates({ tabListSelector, historyNavigationSelector, workspaceCount });

    if (!CONFIG.sidebar.hide) {
      let sidebarHidden = false;

      log(DEBUG, 'workspaceCount', workspaceCount);

      if (workspaceCount <= 1) {
        if (CONFIG.sidebar.ifOneWorkspace.hideSidebar) {
          hideSidebar();
          sidebarHidden = true;
        }

        if (CONFIG.sidebar.ifOneWorkspace.addWorkspaceButton.createNavButton) {
          addCreateWorkspaceButtonToNav(historyNavigationSelector);
        }
      }

      if (!sidebarHidden) {
        if (CONFIG.sidebar.workspaceSwitcher.clickToGoHome) updateWorkspaceToGoHome();
        if (CONFIG.sidebar.workspaceSwitcher.addOtherWorkspaceButtons) addWorkspaceButtons();

        if (CONFIG.sidebar.createButton.hide) hideCreateButton();
        else if (CONFIG.sidebar.createButton.moveUp) moveCreateButton();
      }
    }


    if (CONFIG.sidebar.avatar.moveToNav) moveAvatar();

    log(QUIET, "Finished");
  }

  void applyCustomizations();
})();
