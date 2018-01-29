import * as d3 from 'd3'

const TWO_PI = Math.PI * 2

class Topology {
  constructor(option) {
    const { el, height, width } = option || {}

    this.el = el || null
    this.height = height || 600
    this.width = width || 960
  }

  init(option) {
    const { data, on } = option || {}
    const { links, nodes } = data || {}

    this.events = on || {}
    this.links = links || []
    this.nodes = nodes || []

    this.canvas = this.el || document.getElementsByTagName('canvas')[0]
    this.canvas.height = this.height * 2
    this.canvas.width = this.width * 2
    this.canvas.style.width = `${this.width}px`
    this.canvas.style.height = `${this.height}px`

    if (!this.canvas.getContext) {
      throw new Error('Oops, your browser not support canvas.')
    }

    this.draw()
    this.bindEvents()
  }

  draw() {
    this.ctx = this.canvas.getContext('2d')
    this.ctx.scale(2, 2) // 适应 retina 屏
    this.simulation = d3
      .forceSimulation()
      .force('link', d3.forceLink().id(d => d.id))
      .force(
        'charge',
        d3
          .forceManyBody()
          .strength(-10)
          .distanceMax(this.width)
      )
      .force('center', d3.forceCenter(this.width / 2, this.height / 2))
      .force('vertical', d3.forceY().strength(0.05))
      .force('horizontal', d3.forceX().strength(0.006))
      .force(
        'collide',
        d3
          .forceCollide()
          .strength(0.15)
          .radius(d => d.radius * 2)
          .iterations(2)
      )

    this.simulation
      .nodes(this.nodes)
      .on('tick', this.ticked.bind(this))
      .force('link')
      .links(this.links)
  }

  bindEvents() {
    d3.select(this.canvas).call(
      d3
        .drag()
        .container(this.canvas)
        .subject(this.dragSubject.bind(this))
        .on('start', this.handleDragStarted.bind(this))
        .on('drag', this.handleDragged.bind(this))
        .on('end', this.handleDragEnded.bind(this))
    )
  }

  dragSubject() {
    return this.simulation.find(d3.event.x, d3.event.y)
  }

  handleDragStarted() {
    if (!d3.event.active) this.simulation.alphaTarget(0.3).restart()
    d3.event.subject.fx = d3.event.subject.x
    d3.event.subject.fy = d3.event.subject.y
  }

  handleDragged() {
    d3.event.subject.fx = d3.event.x
    d3.event.subject.fy = d3.event.y
  }

  handleDragEnded() {
    if (!d3.event.active) this.simulation.alphaTarget(0)
    d3.event.subject.fx = null
    d3.event.subject.fy = null
  }

  ticked() {
    this.clearCanvas()
    this.drawLinks()
    this.drawCircles()
    // this.drawLegend()
  }

  clearCanvas() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
  }

  drawCircles() {
    this.ctx.beginPath()
    this.ctx.stroke()
    this.nodes.forEach(this.drawCircle.bind(this))
  }

  drawCircle(d) {
    this.ctx.beginPath()
    this.ctx.strokeStyle = d.color
    this.ctx.fillStyle = d.color
    this.ctx.moveTo(d.x + d.radius, d.y)
    this.ctx.arc(d.x, d.y, d.radius, 0, TWO_PI)
    this.ctx.stroke()
    this.ctx.fill()
  }

  drawLinks() {
    this.links.forEach(this.drawLink.bind(this))
  }

  drawLink(d) {
    const { color } = d || {}
    const newSource = this._calcNewSource(d)
    const newTarget = this._calcNewTarget(d)
    this.ctx.beginPath()
    this.drawLine(newSource, newTarget)
    this.drawArrow(newSource, newTarget)
    this.ctx.fillStyle = color
    this.ctx.strokeStyle = color
    this.ctx.stroke()
    this.ctx.fill()
  }

  drawLine(s, t) {
    this.ctx.moveTo(s.x, s.y)
    this.ctx.lineTo(t.x, t.y)
  }

  drawArrow(s, t) {
    const angle = this._calcAngle(t, s)
    this.ctx.save()                       // 暂存画布状态
    this.ctx.translate(t.x, t.y)          // 临时更改画布原点，后面用 ctx.restore 恢复
    this.ctx.rotate(angle - Math.PI / 4)  // 旋转
    this.ctx.moveTo(0, 0)
    this.ctx.lineTo(0, 4)
    this.ctx.lineTo(4, 0)
    this.ctx.restore()                    // 释放画布上一个状态
  }

  _calcNewSource(d) {
    const { source, target } = d
    const angle = this._calcAngle(source, target)
    const offsetX = source.radius * Math.cos(angle)
    const offsetY = source.radius * Math.sin(angle)
    return { x: source.x + offsetX, y: source.y + offsetY }
  }

  _calcNewTarget(d) {
    const { source, target } = d
    const angle = this._calcAngle(target, source)
    const offsetX = target.radius * Math.cos(angle)
    const offsetY = target.radius * Math.sin(angle)
    return { x: target.x + offsetX, y: target.y + offsetY }
  }

  _calcAngle(source, target) {
    const offsetX = target.x - source.x
    const offsetY = target.y - source.y
    return Math.atan(offsetY / offsetX) + (offsetX < 0 ? Math.PI : 0) // 修正箭头方向
  }
}

export default Topology
