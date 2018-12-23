import * as React from 'react'
import * as PIXI from 'pixi.js'
import * as d3zoom from 'd3-zoom'
import * as d3selection from 'd3-selection'

const boxWidth = 750
const boxHeight = 1000
const NUM_COLS = 30

const textStyle = new PIXI.TextStyle({
  fontFamily: "Courier",
  fontSize: 25,
  fill: '#000',
  wordWrap: true,
  wordWrapWidth: boxWidth * .8,
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

    const nodesContainer = new PIXI.Container()
    app.stage.addChild(nodesContainer)
    this.nodesContainer = nodesContainer
    this.app = app
    this.updateNodes(this.props.statements)

    this.zoom = d3zoom.zoom()
      .on('zoom', this.handleZoom)

    this.getZoomTarget().call(this.zoom)
      .on('dblclick.zoom', null)
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

  updateNodes(statements) {
    if (this.nodes) {
      // remove old nodes
      this.nodesContainer.removeChildren()
    }
    const nodes = []
    if (statements) {
      for (let i = 0; i < statements.length; i++) {
        const group = new PIXI.Container()
        const text = new PIXI.Text(statements[i], textStyle)
        group.x = (i % NUM_COLS) * boxWidth
        group.y = Math.floor(i / NUM_COLS) * boxHeight
        group.addChild(text)

        const rect = new PIXI.Graphics()
        const pad = 50
        rect.beginFill(0xffffff)
        rect.drawRoundedRect(-pad, -pad, text.width + pad * 2, text.height + pad * 2, pad/2)
        rect.endFill()
        group.addChildAt(rect, 0)

        this.nodesContainer.addChild(group)
        nodes[i] = group
      }
      this.zoomToFit()
    }
    this.nodes = nodes
  }

  zoomToFit() {
    const { width, height } = this.props
    const zoomTarget = this.getZoomTarget()
    this.zoom.translateTo(zoomTarget, this.nodesContainer.width/2, this.nodesContainer.height/2)
    this.zoom.scaleTo(zoomTarget,
      Math.min(
        width / this.nodesContainer.width,
        height / this.nodesContainer.height,
      ) * 0.85
    )
  }

  handleZoom = () => {
    const { k, x, y } = d3selection.event.transform
    this.nodesContainer.scale = new PIXI.Point(k, k)
    this.nodesContainer.position = new PIXI.Point(x, y)
  }

  // setup() {
    // this.app.ticker.add(delta => this.gameLoop(delta))
  // }

  // gameLoop(delta){
  //   for (let i = 0; i < this.nodes.length; i++) {
  //
  //     //Move the cat 1 pixel
  //     this.nodes[i].x += Math.random() * 1 - .5
  //     this.nodes[i].y += Math.random() * 1 - .5
  //     // nodes[i].rotation += Math.random() * 0.2 - 0.1
  //   }
  // }


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
