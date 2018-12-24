import React, { Component } from 'react';
import { csvParse } from 'd3-dsv'
import StatementsCanvas from './StatementsCanvas'
import styled from '@emotion/styled'


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
        statements: csvParse(text)
          .sort((a, b) => b.statement.length - a.statement.length)
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
        {width > 0 && statements &&
        <StatementsCanvas
          width={width}
          height={height}
          statements={statements}
        />
        }
        <NavControlsArea>
          <Button>Prev</Button>
          <Button>Next</Button>
        </NavControlsArea>
      </div>
    );
  }

}

const Button = styled.div`
  background: #fff;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 10px;
  min-width: 
`
const NavControlsArea = styled.div`
  position: absolute;
  display: flex;
  justify-content: center;
  width: 100%;
  text-align: center;
  bottom: 20px;
`

export default App;
