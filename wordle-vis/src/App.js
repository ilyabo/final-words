import React, { Component } from 'react'
import { csvParse } from 'd3-dsv'
import WordCloud from './WordCloud'
import { insertGlobal, insertRule, css } from 'glamor'
import take from 'lodash/take'
import isEmpty from 'lodash/isEmpty'


insertRule(`
  @import url('https://fonts.googleapis.com/css?family=Lato');
`)

insertGlobal('body', {
  backgroundColor: '#cc381e',
  margin: 0,
  padding: 0,
})

class App extends Component {

  state = {
    counts: null,
  }

  componentDidMount() {
    fetch('counts/20181019-132045-word-counts.csv')
      .then(response => response.text())
      .then(text => this.setState({
        counts: csvParse(text).map(d => ({
          text: d.word,
          count: d.frequency,
        }))
      }))
  }

  render() {
    const { counts } = this.state
    console.log(take(counts, 150))
    return (
      <div className={css({
        display: 'flex',
        width: '100%',
        height: '100%',
        flexGrow: 1,
        alignContent: 'center',
        justifyContent: 'center',
      }).toString()}>
        {!isEmpty(counts) &&
        <WordCloud
          counts={take(counts, 150)}
          width={1024}
          height={600}
        />}
      </div>
    )
  }
}

export default App
