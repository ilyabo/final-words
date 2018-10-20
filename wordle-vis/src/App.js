import React, { Component } from 'react'
import { csvParse } from 'd3-dsv'
import WordCloud from './WordCloud'

class App extends Component {

  state = {
    counts: null,
  }

  componentDidMount() {
    fetch('counts/20181019-132043-trigram-counts.csv')
      .then(response => response.text())
      .then(text => this.setState({
        counts: csvParse(text).map(d => ({
          text: d['trigram phrase'],
          count: d.frequency,
        }))
      }))
  }

  render() {
    const { counts } = this.state
    return (
      <div>
        {counts &&
        <WordCloud
          counts={counts}
          width={1024}
          height={600}
        />}
      </div>
    )
  }
}

export default App
