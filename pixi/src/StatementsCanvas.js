import * as React from 'react'
import * as PIXI from 'pixi.js'
import * as d3zoom from 'd3-zoom'
import * as d3selection from 'd3-selection'
import { keyframes } from '@emotion/core'
import styled from '@emotion/styled'

const NUM_COLS = 20
const CARD_WIDTH = 750
const CARD_PADDING = 50
const CARD_SPACING_X = 200
const CARD_SPACING_Y = 200
const CARD_CHILD__RECT = 'rect'
const CARD_CHILD__TEXT = 'text'
const CARD_BG_COLOR = 0xffffff
const CARD_BG_COLOR__HIGHLIGHTED = 0xe0f0f0

const textStyle = new PIXI.TextStyle({
  fontFamily: "Courier",
  fontSize: 25,
  fill: '#000',
  wordWrap: true,
  wordWrapWidth: CARD_WIDTH - CARD_PADDING * 2,
  // stroke: 'steelblue',
  // strokeThickness: 1,
  // dropShadow: true,
  // dropShadowColor: "#000000",
  // dropShadowBlur: 4,
  // dropShadowAngle: Math.PI / 6,
  // dropShadowDistance: 0,
})



export default class StatementsCanvas extends React.Component {

  constructor(props) {
    super(props)
    this.canvasRef = React.createRef()
  }

  componentDidMount() {
    const { width, height } = this.props
    const app = new PIXI.Application({
      width,
      height,
      transparent: true,
      view: this.canvasRef.current,
    })

    this.zoom = d3zoom.zoom()
      .on('zoom', this.handleZoom)

    this.getZoomTarget().call(this.zoom)
      .on('dblclick.zoom', null)

    this.app = app
    this.updateNodes(this.props.statements)
  }

  getZoomTarget = () => d3selection.select(this.canvasRef.current)

  componentWillReceiveProps(nextProps, nextContext) {
    if (nextProps.statements !== this.props.statements) {
      this.updateNodes(nextProps.statements)
    }
    if (nextProps.width !== this.props.width || nextProps.height !== this.props.height) {
      this.app.renderer.resize(nextProps.width, nextProps.height)
    }
  }


  drawCardRect = (card, color) => {
    const text = card.getChildByName(CARD_CHILD__TEXT)
    if (!text) return
    const height = text.height + CARD_PADDING * 2
    const width = CARD_WIDTH

    let rect = card.getChildByName(CARD_CHILD__RECT)
    if (!rect) {
      rect = new PIXI.Graphics()
      rect.name = CARD_CHILD__RECT
      card.addChildAt(rect, 0)
    }

    rect.beginFill(color)
    rect.drawRoundedRect(0, 0, width, height, CARD_PADDING/2)
    rect.endFill()
  }

  handleCardClick = (data) => {
    const { currentTarget } = data
    if (currentTarget) {
      this.getZoomTarget()
        .transition()
        .duration(3000)
        .call(
          this.zoom.transform,
          this.zoomTransformToPoint(
            [currentTarget.x + currentTarget.width/2, currentTarget.y + currentTarget.height / 2],
            0.75
          )
        )
      // this.drawCardRect(currentTarget, CARD_BG_COLOR__HIGHLIGHTED)
    }
  }

  handleCardMouseOver = (data) => {
    const { currentTarget } = data
    if (currentTarget) {
      this.drawCardRect(currentTarget, CARD_BG_COLOR__HIGHLIGHTED)
    }
  }

  handleCardMouseOut = (data) => {
    const { currentTarget } = data
    if (currentTarget) {
      this.drawCardRect(currentTarget, CARD_BG_COLOR)
    }
  }

  updateNodes(statements) {
    if (this.nodesContainer) {
      this.nodesContainer.destroy({ children: true })
    }

    if (statements) {
      const nodesContainer = new PIXI.Container()
      const nodes = []
      const columnHeights = new Array(NUM_COLS).fill(0)
      for (let i = 0; i < statements.length; i++) {
        const col = columnHeights.reduce(((m, d, i) => d < columnHeights[m] ? i : m), 0)
        const card = new PIXI.Container()
        card.interactive = true
        card.mouseover = this.handleCardMouseOver
        card.mouseout = this.handleCardMouseOut
        card.click = this.handleCardClick

        const text = new PIXI.Text(statements[i].statement, textStyle)
        text.name = CARD_CHILD__TEXT
        text.x = CARD_PADDING
        text.y = CARD_PADDING

        card.x = col * (CARD_WIDTH + CARD_SPACING_X)
        card.y = columnHeights[col]
        card.addChild(text)
        columnHeights[col] += text.height + CARD_PADDING * 2 + CARD_SPACING_Y
        this.drawCardRect(card, CARD_BG_COLOR)

        nodesContainer.addChild(card)
        nodes[i] = card
      }
      this.nodes = nodes
      this.nodesContainer = nodesContainer
      this.app.stage.addChild(nodesContainer)
      this.zoomToFit()
    }
  }


  zoomTransformToPoint = (point, scale) =>
    d3zoom.zoomIdentity
      .translate(this.props.width/2, this.props.height/2)
      .scale(scale)
      .translate(-point[0], -point[1])

  zoomToFit() {
    const { width, height } = this.props
    const zoomTarget = this.getZoomTarget()

    zoomTarget
      .call(
        this.zoom.transform,
        this.zoomTransformToPoint(
          [this.nodesContainer.width / 2, this.nodesContainer.height / 2],
          Math.min(
            width / this.nodesContainer.width,
            height / this.nodesContainer.height,
          ) * 0.7
        )
      )
  }

  handleZoom = () => {
    const { k, x, y } = d3selection.event.transform
    this.nodesContainer.scale = new PIXI.Point(k, k)
    this.nodesContainer.position = new PIXI.Point(x, y)
  }


  render() {
    const { width, height } = this.props
    return (
      <FadeIn>
        <canvas
          width={width}
          height={height}
          ref={this.canvasRef}
        />
      </FadeIn>
    )
  }
}

const fadeIn = keyframes`
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
`

const FadeIn = styled.div`
  animation: ${fadeIn} 3s ease-in;
`
