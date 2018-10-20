import * as React from 'react'
import d3cloud from 'd3-cloud'
import take from 'lodash/take'


class Words extends React.Component {

  render() {
    const { width, height, words } = this.props
    return (
      <svg
        width={width} height={height}
        style={{
          backgroundColor: "#cc381e",
        }}
      >
        <g transform={`translate(${width/2},${height/2})`}>
          {words.map((d, i) =>
          <text
            key={i}
            style={{
              fill: '#fff',
              fontFamily: 'Lato',
              fontSize: d.size + 'px',
              textAnchor: 'middle',
            }}
            transform={`translate(${d.x},${d.y})rotate(${d.rotate})`}
          >
            {d.text}
          </text>
          )}
        </g>
      </svg>
    )
  }

}


export default class WordCloud extends React.Component {

  state = {
    words: null,
  }

  componentDidMount() {
    const { counts, width, height } = this.props
    d3cloud()
      .size([width, height])
      // .canvas(this.svgRef.current)
      .words(take(counts, 150))
      .padding(30)
      .rotate(() => 0)
      // .font("Impact")
      .fontSize(d => d.count)
      .on("end", words => this.setState({ words }))
      .start()
  }

  render() {
    const { width, height } = this.props
    const { words } = this.state
    return (
      <>
        {words && <Words
          width={width}
          height={height}
          words={words}
        />}
      </>
    )
  }

}
