import React, { Component } from 'react'
import { csvParse } from 'd3-dsv'
import WordCloud from './WordCloud'
import { injectGlobal, css } from 'emotion'
import take from 'lodash/take'
import isEmpty from 'lodash/isEmpty'


injectGlobal(`
body {
  background-color: #cc381e;
  margin: 0;
  padding: 0;
}
svg {
  display: block;
}
`)

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
    return (
      <div className={css({
        display: 'flex',
        width: '100%',
        height: '100%',
        position: 'absolute',
        flexGrow: 1,
        alignContent: 'center',
        justifyContent: 'center',
      }).toString()}>
        {!isEmpty(counts) &&
        <WordCloud
          counts={take(counts, 150)}
        />}
      </div>
    )
  }
}

export default App
