import * as React from 'react'
import d3cloud from 'd3-cloud'
import { Spring, config } from 'react-spring'
import { injectGlobal } from 'emotion'
import Measure from 'react-measure'
import { css } from 'emotion'

injectGlobal(`
  @import url('https://fonts.googleapis.com/css?family=Give+You+Glory');
  text  {
   font-family: 'Give You Glory', cursive;
  }
`)



class Cloud extends React.Component {
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
      .fontSize(d =>  Math.pow(d.count, 0.75))
      .on("end", () => this.setState({ ready: true }))
      .start()
  }

  renderWords() {
    const { width, height, counts } = this.props
    return (
      <svg width={width} height={height}>
        <g transform={`translate(${width/2},${height/2})`}>
          <Spring
            from={{ opacity: 0, transform: `scale(0.95)` }}
            to={{ opacity: 1, transform: `scale(1)` }}
            enter={{ opacity: 0 }}
            leave={{ opacity: 0 }}
            config={config.molasses}
          >
            {props =>
              counts.map((d, i) =>
                <text
                  key={i}
                  style={{
                    ...props,
                    fill: '#fff',
                    fontSize: d.size + 'px',
                    textAnchor: 'middle',
                  }}
                  x={d.x}
                  y={d.y}
                >
                  {d.text}
                </text>
              )
            }
          </Spring>
        </g>
      </svg>
    )
  }

  render() {
    const { ready } = this.state
    return (
      <>
        {ready && this.renderWords()}
      </>
    )
  }

}


export default class WordCloud extends React.Component {

  state = {
    dimensions: {
      width: -1,
      height: -1
    },
  }
  render() {
    const { dimensions: { width, height }} = this.state
    const { counts } = this.props
    console.log(width, height)
    return (
      <Measure
        bounds
        onResize={(contentRect) => {
          this.setState({ dimensions: contentRect.bounds })
        }}
      >
        {({ measureRef }) =>
          <div
            ref={measureRef}
            className={css({
              position: 'absolute',
              width: '100%',
              height: '100%',
            })}
          >
            {width > 0 && height > 0 &&
            <Cloud
              width={width}
              height={height}
              counts={counts}
            />}
          </div>}
      </Measure>
    )
  }
}
