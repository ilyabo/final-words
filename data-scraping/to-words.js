const _ = require('lodash');
const fs = require('fs');
const d3dsv = require('d3-dsv');

const statements = JSON.parse(fs.readFileSync('data/statements.json', 'utf8'))
let counts = _.sortBy(_.toPairs(_.countBy(_.words(statements
  .filter(s => !!s)
  .filter(s => s!='(Spoken statement)')
  .filter(s => s!='This offender declined to make a last statement.')
  .map(s =>
    _.trim(
      s
      .replace(/"/g, '\"')
      .replace(/&nbsp;/g, ' ')
      .replace(/&rsquo;/g, "'")
      .replace(/&ldquo;/g, "")
      .replace(/&rdquo;/g, "")
      .replace(/&quot;/g, '\"')
    ))
  .filter(s => !_.isEmpty(s))
  .join(' ')
),
  _.identity
)), d => -d[1])

console.log((statements))

fs.writeFileSync(
  'data/words.csv',
  d3dsv.csvFormatRows(counts)
)
