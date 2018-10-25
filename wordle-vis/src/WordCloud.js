import * as React from 'react'
import d3cloud from 'd3-cloud'


class Words extends React.Component {

  render() {
    const { width, height, words } = this.props
    return (
      <svg
        width={width} height={height}
      >
        <g transform={`translate(${width/2},${height/2})`}>
          {words.map((d, i) =>
          <text
            key={i}
            style={{
              fill: '#fff',
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
    ready: false,
  }

  componentDidMount() {
    const { counts, width, height } = this.props
    d3cloud()
      .size([width, height])
      .words(counts)
      .padding(20)
      .rotate(() => 0)
      .fontSize(d =>  Math.pow(d.count, 0.7))
      .on("end", () => this.setState({ ready: true }))
      .start()
  }

  render() {
    const { width, height, counts } = this.props
    const { ready } = this.state
    return (
      <>
        {ready && <Words
          width={width}
          height={height}
          words={counts}
        />}
      </>
    )
  }

}
