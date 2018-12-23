import React, { Component } from 'react';
import { csvParseRows } from 'd3-dsv'
import StatementsCanvas from './StatementsCanvas'


class App extends Component {
  state = {
    width: 0,
    height: 0,
    statements: null,
  }

  componentDidMount() {
    window.addEventListener('resize', this.updateSizes)
    fetch('data/statements.csv')
      .then(response => response.text())
      .then(text => this.setState({
        statements: csvParseRows(text).map(([text]) => text)
      }))
    this.updateSizes()
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateSizes)
  }

  updateSizes = () => {
    this.setState({
      width: window.innerWidth,
      height: window.innerHeight,
    })
  }

  render() {
    const { width, height, statements } = this.state
    return (
      <div>
        {width > 0 &&
        <StatementsCanvas
          width={width}
          height={height}
          statements={statements}
        />
        }
      </div>
    );
  }

}

export default App;
