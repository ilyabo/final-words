import React, { Component } from 'react'
import { csvParse, csvParseRows } from 'd3-dsv'
import WordCloud from './WordCloud'
import { injectGlobal, css } from 'emotion'
import take from 'lodash/take'
import isEmpty from 'lodash/isEmpty'
import beltSvg from './belt.svg'
import { Parallax, ParallaxLayer } from 'react-spring/dist/addons'
import styled from 'react-emotion'


injectGlobal(`
  body {
    background-color: #d4dad8;
    font-family: Lato, sans-serif;
    margin: 0;
    padding: 0;
  }
  svg {
    display: block;
  }
  text  {
    // font-family: 'Courier';
    // font-family: 'Give You Glory', cursive;
    font-family: 'Ultra', serif;
  }
`)


const Column = styled('div')(`
  display: flex;
  flex-direction: column;
`)

const Credits = styled('div')(`
  display: flex;
  flex-direction: column;
  color: #d4dad8;
`)

const PageTitle = styled('h1')(`
  font-family: 'Ultra', serif;
  font-size: 4rem;
  letter-spacing: 5px;
  color: #fff;
  max-width: 300px;
`)

const Statement = styled('div')(`
  font-family: 'Give You Glory', cursive;
  padding: 1rem 0;
  font-size: 2rem;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  justify-content: center;
  letter-spacing: 1px;
`)


const Next = () =>
  <div
    className={css({
      fontSize: '10rem',
      cursor: 'pointer',
      fontFamily: 'Lato, sans-serif',
    })}
  >
    &gt;&gt;&gt;
  </div>

const Belt = () =>
  <div className={css({
    padding: '0 50px',
    '& > img': {
      display: 'block',
    },
  })}>
    <img src={beltSvg} width={60} />
  </div>

class App extends Component {

  state = {
    counts: null,
    statements: null,
    selectedWord: null,
  }

  componentDidMount() {
    fetch('data/20181019-132045-word-counts.csv')
      .then(response => response.text())
      .then(text => this.setState({
        counts: csvParse(text).map(d => ({
          text: d.word,
          count: d.frequency,
        }))
      }))

    fetch('data/statements.csv')
      .then(response => response.text())
      .then(text => this.setState({
        statements: csvParseRows(text).map(([text]) => text)
      }))

    // this.parallax.scrollTo(1)
  }

  handleSelectWord = (word) => {
    this.setState({
      selectedWord: word.toLowerCase(),
    })
  }

  render() {
    // console.log(this.parallax && this.parallax.onScroll)
    const {
      counts,
      selectedWord,
      statements,
    } = this.state
    return (
      <Parallax pages={2.6 + (statements ? statements.length : 0)} scrolling={true} horizontal  ref={ref => this.parallax = ref}>

        <ParallaxLayer offset={0.7} speed={0.25}>
          <div className={css({
            position: 'absolute',
            width: '100%',
            height: '100%',
          })}>

            {!isEmpty(counts) &&
            <WordCloud
              onSelectWord={this.handleSelectWord}
              counts={take(counts, 150)}
            />}
            {/*{selectedWord && statements &&*/}
            {/*<div>{*/}
              {/*statements.filter(s =>*/}
                {/*s.toLowerCase().indexOf(selectedWord) >= 0*/}
              {/*).map(s =>*/}
                {/*<div>{s}</div>*/}
              {/*)*/}
            {/*}</div>*/}
            {/*}*/}
          </div>
        </ParallaxLayer>

        <ParallaxLayer offset={0} speed={1.5}>
          <div className={css({
            backgroundColor: '#000d',
            width: '100%',
            height: 361,
          })}>
          </div>
        </ParallaxLayer>

        <ParallaxLayer offset={0} speed={2}>
          <div className={css({
            display: 'flex',
            padding: 0,
          })}>
            <Belt/>
            <Column>
              <PageTitle>FINAL <span style={{color:'#d4dad8'}}>WORDS</span></PageTitle>
              <Credits>by Ilya Boyandin, Jon Schwabish, Leigh Steiner, Stephanie Carleklev</Credits>
            </Column>
            <Belt/>
            <Belt/>
            <Belt/>
          </div>
        </ParallaxLayer>

        <ParallaxLayer offset={0.1} speed={0.4} factor={0.5} onClick={() => this.parallax.scrollTo(0.6)}>
          <div className={css({
            marginTop: '65%',
            fontSize: '1.2rem',
            lineHeight: 1.6,
            backgroundColor: '#d4dad8ee',
          })}>
            <b>What are the last words spoken by death row prisoners seconds before
            their execution? Are those prayers, expressions of hate or final messages
              of regret? </b> An analysis of 555 last statemenets of prisoners fated to die,
            recorded by the Department of Justice in Texas, reveal myriad stories.
          </div>
          <Next/>
        </ParallaxLayer>

        {
          statements && statements.filter(s => s.toLowerCase().indexOf('love') >= 0).map((s, i) =>
            <ParallaxLayer offset={1.6 + i} speed={0.5} factor={0.7} onClick={() => this.parallax.scrollTo(1.6 + i + 0.75)}>
              <Statement>
                {s}
                <Next/>
              </Statement>
            </ParallaxLayer>
          )
        }


        <ParallaxLayer offset={1.6} speed={0}>
          <div className={css({
            fontSize: '7rem',
            fontWeight: 'bold',
            fontFamily: 'Give You Glory',
          })}>
            love
          </div>
        </ParallaxLayer>

      </Parallax>
    )
  }
}

export default App
