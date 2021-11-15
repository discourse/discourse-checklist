# frozen_string_literal: true

# name: discourse-checklist
# about: Add checklist support to Discourse
# version: 0.4.1
# authors: Matthew Wilkin
# url: https://github.com/discourse/discourse-checklist
# transpile_js: true

enabled_site_setting :checklist_enabled

register_asset 'stylesheets/checklist.scss'

register_svg_icon 'spinner' if respond_to?(:register_svg_icon)

after_initialize do
  [
    "../lib/checklist_syntax_migrator.rb"
  ].each { |path| load File.expand_path(path, __FILE__) }
end
