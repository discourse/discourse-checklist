# Checklist Plugin

Adds simple helpers to build (interactive) checklists, rendering "[]", "[*]" and "[x]" into pretty UI parts you can interact with.

## Details

Here is a little screenshot of the plugin in action:

![Preview screenshot](https://raw.github.com/cpradio/discourse-plugin-checklist/master/preview-example.png)

On top, if there are our checklist-items on the post and the current user is able to edit the post, they are interactively able to toggle the checkbox from the post view by clicking the box:

![Interactive before](https://raw.github.com/cpradio/discourse-plugin-checklist/master/live-click-before.png)

![Interactive waiting](https://raw.github.com/cpradio/discourse-plugin-checklist/master/live-click-waiting.png)

![Interactive after](https://raw.github.com/cpradio/discourse-plugin-checklist/master/live-click-after.png)

Which will be recorded as a new version of the post:

![New version](https://raw.github.com/cpradio/discourse-plugin-checklist/master/new-version.png)

## Installation

Follow the directions at [Install a Plugin](https://meta.discourse.org/t/install-a-plugin/19157) using https://github.com/cpradio/discourse-plugin-checklist.git as the repository URL.

### Limitations:

 * If you want to make multiple changes it creates multiple versions
 * You can only toggle the default type

## Authors

Matthew Wilkin (project originally started by Benjamin Kampmann)

## License

GNU GPL v2
