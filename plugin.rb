# name: discourse-plugin-checklist
# about: Add checklist support to Discourse
# version: 0.1.2
# authors: Matthew Wilkin
# url: https://github.com/cpradio/discourse-plugin-checklist

enabled_site_setting :checklist_enabled

register_asset "javascripts/discourse/checklist_dialect.js", :server_side

register_asset 'stylesheets/checklist.scss'