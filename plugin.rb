# name: discourse-checklist
# about: Add checklist support to Discourse
# version: 0.4.1
# authors: Matthew Wilkin
# url: https://github.com/discourse/discourse-checklist

enabled_site_setting :checklist_enabled

register_asset 'stylesheets/checklist.scss'

register_svg_icon 'spinner' if respond_to?(:register_svg_icon)
