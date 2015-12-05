# name: discourse-plugin-checklist
# about: Add checklist support to Discourse
# version: 0.1
# authors: Matthew Wilkin
# url: https://github.com/cpradio/discourse-plugin-checklist

enabled_site_setting :checklist_enabled

register_asset "javascripts/checklist_dialect.js", :server_side
register_asset "javascripts/discourse/templates/composer-help.hbs"

register_asset 'stylesheets/checklist.scss'