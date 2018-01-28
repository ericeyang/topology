class Topology {
  init() {
    this.canvas = document.getElementsByTagName('canvas')[0]
    this.canvas.style.width = '100vw'
    this.canvas.style.height = '100vh'

    if (!this.canvas.getContext) {
      throw new Error('Oops, your browser not support canvas.')
    }

    this.draw()
  }

  draw() {
    this.ctx = this.canvas.getContext('2d')
  }
}

export default Topology