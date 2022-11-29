import { isHTML, sanitizer } from 'shared/utils/htmlUtils'

describe('htmlUtils', () => {
  describe('isHTML', () => {
    const truthyCases = [
      ['returns true if input contains a div tag', '<div>hello</div>'],
      ['returns true if input contains an ordered  lis tag', '<div><ol><li>hello</li></ol></div>'],
      ['returns true if input contains a table tag', '<table><td><tr>hello</tr><td></table>'],
      ['returns true if input contains only opening HTML tag', '<p>Hey I am just an htmless text'],
    ]
    it.each(truthyCases)('%s', (title, input) => {
      expect(isHTML(input)).toBeTruthy()
    })

    const falsyCases = [
      ['returns false if input contains fake HTML tag', '<fake>foo</fake>'],
      ['returns false if input does not contain html tag', 'Hey I am just an htmless text'],
      ['returns false if input contains a <script> tag', '<script>hello</script>'],
    ]
    it.each(falsyCases)('%s', (title, input) => {
      expect(isHTML(input)).toBeFalsy()
    })

    it.each([null, 0, undefined])('returns false if content is %s', (input) => expect(isHTML(input)).toBeFalse())
  })

  describe('sanitizer', () => {
    const cases = [
      [
        'Removes link',
        "<li>Removes link <math><mi//xlink:href='data:x,<script>alert(4)</script>'></mi></math></li>",
        '<li>Removes link <math><mi></mi></math></li>',
      ],
      ['Removes comment', '<li>Removes comment <!--sale commentaire--></li>', '<li>Removes comment </li>'],
      [
        'Sanitizes styles',
        '<li>Sanitizes styles <style>#red{color:yellow}</style></li>',
        '<li>Sanitizes styles <style>#red{color:yellow}</style></li>',
      ],
      [
        'Lower cases tag P tag',
        '<li>Lower cases tag <P>I used to be Bigger</p></li>',
        '<li>Lower cases tag <p>I used to be Bigger</p></li>',
      ],
      [
        'Removes all URLs from anchors',
        '<form action="https://google.com"> <label>Removes all URLs from anchors:</label><a href="https://google.com">click</a><a xlink:href="https://google.com">foo</a></form>',
        '<form> <label>Removes all URLs from anchors:</label><a>click</a><a>foo</a></form>',
      ],
      [
        'Adds missing ul enclosing tag',
        '<li><UL><li>Adds missing UL enclosing tag and removes UR from anchors:<A>click</li></li>',
        '<li><ul><li>Adds missing UL enclosing tag and removes UR from anchors:<a>click</a></li></ul></li>',
      ],
      ['Recognizes strings as they are', 'foo', 'foo'],
    ]
    it.each(cases)('%s', (title, input, output) => {
      expect(sanitizer(input)).toEqual(output)
    })
  })
})
