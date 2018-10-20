const _ = require('lodash');
const fs = require('fs');
const d3dsv = require('d3-dsv');

const statements = JSON.parse(fs.readFileSync('data/statements.json', 'utf8'))
let rows = statements
  .filter(s => !!s)
  .filter(s => s!='(Spoken statement)')
  .filter(s => _.trim(s)!='This offender declined to make a last statement.')
  .map(s =>
    _.trim(
      s
      .replace(/"/g, '\"')
      .replace(/&nbsp;/g, ' ')
      .replace(/&rsquo;/g, "'")
      .replace(/&ldquo;/g, "")
      .replace(/&ndash;/g, "-")
      .replace(/&rdquo;/g, "")
      .replace(/&quot;/g, '\"')
    ))
  .filter(s => !_.isEmpty(s))
  .map(s => ([s]))

fs.writeFileSync(
  'data/statements.csv',
  d3dsv.csvFormatRows(rows)
)
