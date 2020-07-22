# frozen_string_literal: true

class ChecklistSyntaxMigrator
  REGEX = /^ {0,3}\[(_|-|\*|\\\*)\]/
  OLD_CHARACTERS = /(_|-|\*|\\\*)/

  def initialize(post)
    @post = post
  end

  def update_syntax!
    lines =  @post.raw.split("\n")
    lines.each_with_index do |line, index|
      lines[index] = line.gsub(REGEX) {
        Regexp.last_match(0).gsub(OLD_CHARACTERS, "x")
      }
    end
    new_raw = lines.join("\n")
    @post.raw = new_raw
    @post.save
  end
end
