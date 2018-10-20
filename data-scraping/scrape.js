
const fetch = require('node-fetch');
const HTMLParser = require('node-html-parser');
const _ = require('lodash');
const fs = require('fs');


async function fetchLastStatement(page) {
  const res = await fetch(`http://www.tdcj.state.tx.us/death_row/${page}`);
  const body = await res.text();
  const paragraphs = HTMLParser.parse(body).querySelectorAll(
    '#content_right p'
  );

  return _.get(_.last(paragraphs), 'childNodes.0.rawText')

}


(async function() {
  const res = await fetch('http://www.tdcj.state.tx.us/death_row/dr_executed_offenders.html');
  const body = await res.text();

  const links = HTMLParser.parse(body).querySelectorAll(
    '#content_right .overflow table tr td a'
  );

  const statements = [];
  for (var i = 1; i < links.length; i+=2) {
    const attrs = links[i].rawAttrs
    const groups = attrs.match(/href="(.*?)"/)
    const statement = await fetchLastStatement(groups[1])
    statements.push(statement)
  }
  console.log(JSON.stringify(statements))

  fs.writeFileSync('data/statements.json', JSON.stringify(statements))


  // const result = await fetchLastStatement('dr_info/hernandezrodolfolast.html')
  // console.log(result)

})();
