require 'rails_helper'

describe PrettyText do

  context 'markdown it' do
    before do
      SiteSetting.enable_experimental_markdown_it = true
    end

    it 'can properly bake boxes' do
      md = <<~MD
        [],[ ],[_];[-]X[x]X [*] [\\*] are all checkboxes
        `[ ]` [x](hello) *[ ]* **[ ]** are not checkboxes
      MD

      html = <<~HTML
        <p><span class="chcklst-box fa fa-square-o"></span>,<span class="chcklst-box fa fa-square-o"></span>,<span class="chcklst-box fa fa-square"></span>;<span class="chcklst-box fa fa-minus-square-o"></span>X<span class="chcklst-box checked fa fa-check-square"></span>X <span class="chcklst-box checked fa fa-check-square-o"></span> <span class="chcklst-box checked fa fa-check-square-o"></span> are all checkboxes<br>
        <code>[ ]</code> <a>x</a> <em>[ ]</em> <strong>[ ]</strong> are not checkboxes</p>
      HTML
      cooked = PrettyText.cook(md)
      expect(cooked).to eq(html.strip)
    end
  end
end