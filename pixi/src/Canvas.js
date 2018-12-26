import * as React from 'react'
import * as PIXI from 'pixi.js'
import * as d3zoom from 'd3-zoom'
import * as d3selection from 'd3-selection'

const NUM_COLS = 20
const CARD_WIDTH = 600
const CARD_PADDING = 50
const CARD_SPACING_X = 150
const CARD_SPACING_Y = 150
const CARD_CHILD__RECT = 'rect'
const CARD_CHILD__TEXT = 'text'
const CARD_BG_COLOR = 0xffffff
const CARD_BG_COLOR__HIGHLIGHTED = 0xe0f0f0
const CARD_FOCUS_SCALE = 0.85
const ZOOM_TO_FIT_SCALE = 0.85
const FOCUS_TRANSITION_DURATION = 2000
const ZOOM_TO_FIT_TRANSITION_DURATION = 1000
const CARD_TEXT_VISIBILITY_ZOOM_THRESHOLD = 0.15

const textStyle = new PIXI.TextStyle({
  fontFamily: "Courier",
  fontSize: 25,
  fill: '#000',
  wordWrap: true,
  wordWrapWidth: CARD_WIDTH - CARD_PADDING * 2,
  lineHeight: 30,
  // stroke: 'steelblue',
  // strokeThickness: 1,
  // dropShadow: true,
  // dropShadowColor: "#000000",
  // dropShadowBlur: 4,
  // dropShadowAngle: Math.PI / 6,
  // dropShadowDistance: 0,
})



export default class Canvas extends React.Component {

  state = {
    selectedIndex: null
  }

  constructor(props) {
    super(props)
    this.canvasRef = React.createRef()
  }

  componentDidMount(prevProps, prevState) {
    const { width, height, statements } = this.props
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
    this.updateCards(statements)
  }

  static getDerivedStateFromProps(props, state) {
    const { selectedId, statements } = props
    if (selectedId) {
      const { selectedIndex } = state
      const nextIndex = statements.findIndex(s => s.id === selectedId)
      if (selectedIndex !== nextIndex) {
        return {
          selectedIndex: nextIndex
        }
      }
    }
    return null
  }

  componentDidUpdate(prevProps, prevState) {
    const { width, height } = this.props
    if (prevProps.width !== width || prevProps.height !== height) {
      this.app.renderer.resize(width, height)
    }
    const { statements } = this.props
    if (prevProps.statements !== statements) {
      this.updateCards(prevProps.statements)
    }
    const { selectedIndex } = this.state
    if (prevState.selectedIndex !== selectedIndex) {
      if (selectedIndex) {
        this.focusOnCard(this.cardsContainer.children[selectedIndex])
      }
    }
  }

  getZoomTarget = () => d3selection.select(this.canvasRef.current)


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
      this.focusOnCard(currentTarget)
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

  updateCards(statements) {
    if (this.cardsContainer) {
      this.cardsContainer.destroy({ children: true })
    }

    if (statements) {
      const cardsContainer = new PIXI.Container()
      const cards = []
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

        cardsContainer.addChild(card)
        cards[i] = card
      }
      this.nodes = cards
      this.cardsContainer = cardsContainer
      this.app.stage.addChild(cardsContainer)
      this.fitToShowAll()
    }
  }


  zoomTransformToPoint = (point, scale) =>
    d3zoom.zoomIdentity
      .translate(this.props.width/2, this.props.height/2)
      .scale(scale)
      .translate(-point[0], -point[1])

  focusOnCard = (card) => {
    const scale = Math.min(CARD_FOCUS_SCALE, 0.95 * this.props.width / CARD_WIDTH)
    this.getZoomTarget()
      .transition()
      .duration(FOCUS_TRANSITION_DURATION)
      .call(
        this.zoom.transform,
        this.zoomTransformToPoint(
          [
            card.x + card.width/2,
            card.y +
              (card.height > this.props.height/scale/2 ?
                this.props.height/2/scale*0.95
              : card.height/2)
            ,

          ],
          scale
        )
      )
  }

  fitToShowAll() {
    const { width, height } = this.props
    const zoomTarget = this.getZoomTarget()
    zoomTarget
      .transition()
      .duration(ZOOM_TO_FIT_TRANSITION_DURATION)
      .call(
        this.zoom.transform,
        this.zoomTransformToPoint(
          [
            this.cardsContainer.x + this.cardsContainer.width / 2,
            this.cardsContainer.y + this.cardsContainer.height / 2
          ],
          Math.min(
            width / this.cardsContainer.width,
            height / this.cardsContainer.height,
          ) * ZOOM_TO_FIT_SCALE
        )
      )
  }

  setCardTextAlpha(alpha) {
    for (const child of this.cardsContainer.children) {
      child.getChildByName(CARD_CHILD__TEXT).alpha = alpha
    }
  }

  // setShowCardText(value) {
  //   this.setState({
  //     showCardText: value,
  //   })
  //   for (const child of this.cardsContainer.children) {
  //     child.getChildByName(CARD_CHILD__TEXT).alpha = value ? 1 : 0
  //   }
  // }

  handleZoom = () => {
    const { k, x, y } = d3selection.event.transform
    const { stage } = this.app
    stage.scale = new PIXI.Point(k, k)
    stage.position = new PIXI.Point(x, y)

    // const { showCardText } = this.state
    // if (showCardText) {
    //   if (k < CARD_TEXT_VISIBILITY_ZOOM_THRESHOLD) {
    //     this.setShowCardText(false)
    //   }
    // } else {
    //   if (k >= CARD_TEXT_VISIBILITY_ZOOM_THRESHOLD) {
    //     this.setShowCardText(true)
    //   }
    // }
    this.setCardTextAlpha(Math.min(1, Math.pow(k, 3)/CARD_TEXT_VISIBILITY_ZOOM_THRESHOLD))
  }


  render() {
    const { width, height } = this.props
    return (
      <canvas
        width={width}
        height={height}
        ref={this.canvasRef}
      />
    )
  }
}
