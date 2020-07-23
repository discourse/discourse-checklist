# frozen_string_literal: true

class ChecklistSyntaxMigrator
  REGEX = /^( {0,3})\[(_|-|\*|\\\*)\]/

  def initialize(post)
    @post = post
  end

  def update_syntax!
    @post.raw = @post.raw.gsub(REGEX) { "#{$1}[x]" }
    @post.save!
  end
end
