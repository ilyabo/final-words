import React, { Component } from 'react';
import { csvParse } from 'd3-dsv'
import Canvas from './Canvas'
import styled from '@emotion/styled'
import FadeIn from './FadeIn'


const STATEMENTS_STORY = [
  381, // "I saw his face and his smile and I knew he was a good man."
  313, // "Celebrating life"
  263, // To the guys on death row, stay strong and I hope to see you someday
  251, // "For almost nine years I have thought about the death penalty"
  245, //Tonight I dance on the streets   "And I want you to know that Christina, she did not suffer as much as you think she did.  I promise you that.  I give you my word.  I know you guys want to know where the rest of her remains are.  I put her remains in the Trinity River."
  85, // "I could hear Kinnamon talking but evidently the phone was not close to the mike, because I could not understand him"
]

class App extends Component {
  state = {
    width: 0,
    height: 0,
    statements: null,
    storyIndex: 0,
    selectedId: null,
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

  handleNext = () => {
    const { statements, storyIndex } = this.state
    let nextId
    if (storyIndex < STATEMENTS_STORY.length) {
      nextId = STATEMENTS_STORY[storyIndex].toString()
    } else {
      nextId = statements[Math.floor(Math.random() * statements.length)].id
    }
    console.log(nextId)
    this.setState({
      selectedId: nextId,
      storyIndex: storyIndex + 1,
    })
  }

  render() {
    const { width, height, statements, selectedId } = this.state
    return (
      <div>
        {width > 0 && statements &&
          <FadeIn>
            <Canvas
              width={width}
              height={height}
              statements={statements}
              selectedId={selectedId}
            />
            <ControlsArea>
              <Nav>
                {/*<Button>← To prev</Button>*/}
                {/*<Button>To random</Button>*/}
                <Button onClick={this.handleNext}>Next statement →</Button>
              </Nav>
            </ControlsArea>
          </FadeIn>
        }
      </div>
    );
  }

}

const ControlsArea = styled.div`
  position: absolute;
  pointer-events: none;
  display: flex;
  justify-content: center;
  left: 0;
  bottom: 20px;
  width: 100%;
`
const Nav = styled.div`
  background: #fff;                  
  border: 1px solid #ccd;
  border-radius: 0.5rem;
  padding: 1rem 2rem;
  display: flex;
  justify-content: center;
  text-align: center;
  box-shadow: 0 0 4px #667;
  & > * + * {
    margin-left: 0.25rem;
  }
`

const Button = styled.button`
  background: #fff;   
  border: 1px solid #333;
  cursor: pointer;
  border-radius: 0.5rem;
  font-size: 1rem;
  pointer-events: all;
  padding: 0.75rem;
  
  min-width: 7rem; 
  transition: background 0.5s; 
  &:focus {
    outline: none;
  }
  &:hover {
    background: #e0f0f0;
  }
  &:active {
    background: #c0c7c7;
  }
`

export default App;
