
const fetch = require('fetch-filecache-for-crawling');
const HTMLParser = require('node-html-parser');
const _ = require('lodash');
const fs = require('fs');
const fetchOptions = {
  logToConsole: true,
  refresh: 'never',
}

const BASE_URL = 'http://www.tdcj.state.tx.us/death_row'


async function fetchLastStatement(page) {
  const res = await fetch(
    `${BASE_URL}/${page}`,
    fetchOptions
  );
  const body = await res.text();
  const paragraphs = HTMLParser.parse(body).querySelectorAll(
    '#content_right p'
  );

  return _.get(_.last(paragraphs), 'childNodes.0.rawText')

}


(async function() {
  const res = await fetch(
    `${BASE_URL}/dr_executed_offenders.html`,
    fetchOptions
  );
  const body = await res.text();

  const trs = HTMLParser.parse(body).querySelectorAll(
    '#content_right .overflow table tr'
  );

  const statements = [];
  const getHref = (link) => {
    const groups = link.rawAttrs.match(/href="(.*?)"/)
    return groups[1]
  }

  for (const tr of trs) {
    const links = tr.querySelectorAll('td a')
    if (_.isEmpty(links)) continue;
    const offenderInfoUrl = `${BASE_URL}/${getHref(links[0])}`
    const statement = await fetchLastStatement(getHref(links[1]))

    const [
      execution,
      _skip1, _skip2,
      lastName, firstName, tdcjNumber,
      age, date, race, county,
    ] = tr.querySelectorAll('td').map(d => _.get(d, 'childNodes.0.rawText'))
    const row = {
      execution,
      lastName, firstName, tdcjNumber,
      age, date, race, county,
      offenderInfoUrl,
      statement,
    }
    statements.push(row)
    console.log(JSON.stringify(row))
  }
  console.log(JSON.stringify(statements))

  fs.writeFileSync('data/statements.json', JSON.stringify(statements))


  // const result = await fetchLastStatement('dr_info/hernandezrodolfolast.html')
  // console.log(result)

})();
