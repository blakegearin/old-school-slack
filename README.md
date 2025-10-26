<p align="center">
  <img
    height="30%"
    width="30%"
    src="img/logo.svg"
    alt="Old School Slack logo"
    title="Old School Slack logo"
  />
</p>

# Old School Slack

![Dynamic JSON Badge](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fgreasyfork.org%2Fscripts%2F534329-old-school-slack.json&query=total_installs&suffix=%20installs&label=greasy%20fork&color=%23670000)
![Dynamic JSON Badge](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fopenuserjs.org%2Fmeta%2Fblakegearin%2FOld_School_Slack.meta.json&query=%24.OpenUserJS.installs%5B0%5D.value&suffix=%20installs&label=openuserjs&color=%23202d3b)
[![License: GPL v3](https://img.shields.io/badge/license-GPLv3-blue.svg)](LICENSE)

This is a [userscript](https://openuserjs.org/about/Userscript-Beginners-HOWTO) that updates Slack to look & feel like the old design.

<p>
  <img
    width="49%"
    src="img/screenshots/single-workspace.png"
    alt="Slack interface with only one workspace"
    title="Slack interface with only one workspace"
  />
  <img
    width="49%"
    src="img/screenshots/multiple-workspaces.png"
    alt="Slack interface with multiple workspaces"
    title="Slack interface with multiple workspaces"
  />
</p>

This can also be applied to the Slack desktop app on macOS through remote debugging. This command will launch, connect, and apply the userscript.

```bash
npm run launch-desktop
```

By default, a 3-second delay is added to allow the application to load. You can pass in a different delay amount as an argument.

```bash
# Example: 5 second delay
npm run launch-desktop 5
```

## Features

- [x] Works out of the box with sensible defaults
- [x] Fills in the gaps between the old and new design (e.g. navigating home from search)
- [x] Cleanly handles sidebar with only icons or icons & text
- [x] Ensures modal dialogs are positioned to keep elements in view
- [x] Preserves visual balance with uniform spacing
- [x] Granular configuration options for deep customization

## Usage

1. Install a userscript manager like [Tampermonkey](https://www.tampermonkey.net), [Violentmonkey](https://violentmonkey.github.io), or [Greasemonkey](https://addons.mozilla.org/en-US/firefox/addon/greasemonkey/)
1. Go to [GreasyFork](https://greasyfork.org/en/scripts/534329-old-school-slack) or [OpenUserJS](https://openuserjs.org/scripts/blakegearin/Old_School_Slack)
1. Click the install button
1. The userscript will open in your userscript manager where you can install it

## Documentation

### Configurations

All features are meant to be toggleable via boolean values. Configuration is stored near the top of the script.

### Archiving

To help maintain this project and in the spirit of aiding future developers, the HTML of the top navigation, tab rail (sidebar), and control strip will be archived periodically. These elements will also be archived in a post-script state with default configuration values.

### Maintenance

This was built with long-term maintenance in mind.

- Minimizing DOM traversal
- Clean logging with levels

## Background

In August 2023, Slack announced and began rolling out a [redesign](https://slack.com/blog/productivity/a-redesigned-slack-built-for-focus). Initially it was possible to set some values to revert the design, but eventually this was removed.

## Credit

- Archiving formatter: [Web Formatter](https://webformatter.com/html)
- [David Ethell](https://github.com/dethell) (@dethell) for desktop script prototyping ([source](https://gist.github.com/Kenny-MWI/6b1a88ad38b5ffef347527a82becf054?permalink_comment_id=5784742#gistcomment-5784742))

## Disclaimer

Not affiliated with Slack Technologies LLC, Salesforce, Inc., or any of their affiliations.

## Related Projects

Miss the old navigation of GitHub too? Check out my userscript: [GitHub Custom Global Navigation](https://github.com/blakegearin/github-custom-global-navigation#readme)

Miss the old design of YouTube's player too? Check out my userstyle: [Old School YouTube Player](https://github.com/blakegearin/old-school-youtube-player#readme)

Want to use the old Slack favicon? I'm working on a solution for that too: [Favicon Packs](https://github.com/blakegearin/favicon-packs#readme)
