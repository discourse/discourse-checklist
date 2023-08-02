# frozen_string_literal: true

# name: discourse-checklist
# about: Add checklist support to Discourse
# version: 0.4.1
# authors: Matthew Wilkin
# url: https://github.com/discourse/discourse-checklist
# transpile_js: true

after_initialize do
  AdminDashboardData.add_problem_check do
    "The discourse-checklist plugin has been integrated into discourse core. Please remove the plugin from your app.yml and rebuild your container."
  end
end
