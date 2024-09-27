;(function () {
	class Life {
		constructor() {
			this.canvas = document.getElementById("life")
			this.ctx = this.canvas.getContext("2d")
			this.width = this.canvas.clientWidth
			this.height = this.canvas.clientHeight
			this.imageData = this.ctx.createImageData(this.width, this.height)

			this.field = new Array(this.width)
			for (let i = 0; i < this.field.length; i++) {
				this.field[i] = new Array(this.height)
			}
			this.tempField = this.field.map(function (arr) {
				return arr.slice()
			})
			this.generation = 0

			console.log(this.imageData)
		}

		drawRandomField() {
			for (let i = 0; i < this.height; i++) {
				for (let j = 0; j < this.width; j++) {
					let isPainted = Math.random() < 0.5
					this.field[i][j] = isPainted ? 1 : 0
					let coord = (i * this.width + j) * 4
					this.imageData.data[coord + 0] = isPainted ? 0 : 255
					this.imageData.data[coord + 1] = isPainted ? 0 : 255
					this.imageData.data[coord + 2] = isPainted ? 0 : 255
					this.imageData.data[coord + 3] = 255
				}
			}
			this.tempField = this.field.map(function (arr) {
				return arr.slice()
			})
			this.generation++
			this.ctx.putImageData(this.imageData, 0, 0)
		}

		checkAround(row, col) {
			let dotsAround = []
			for (let _col = col - 1; _col <= col + 1; _col++) {
				for (let _row = row - 1; _row <= row + 1; _row++) {
					if (_col == col && _row == row) {
						dotsAround.push(0)
					} else {
						let x = _col
						let y = _row
						if (_row < 0) {
							y = this.height - 1
						} else if (_row >= this.height) {
							y = 0
						}

						if (_col < 0) {
							x = this.width - 1
						} else if (_col >= this.width) {
							x = 0
						}

						dotsAround.push(this.field[y][x])
					}
				}
			}

			let coloredCountAround = dotsAround.filter((x) => x).length
			let paint = this.field[row][col]
			if (!paint) {
				// current not colored
				if (coloredCountAround == 3) {
					// set current colored
					paint = 1
				}
			} else {
				// current colored
				if (coloredCountAround < 2 || coloredCountAround > 3) {
					// clear current color
					paint = 0
				}
			}

			this.tempField[row][col] = paint
			return { paint }
		}

		draw(paint, row, col) {
			let coord = (row * this.width + col) * 4
			this.clampedImageData[coord + 0] = paint ? 0 : 255
			this.clampedImageData[coord + 1] = paint ? 0 : 255
			this.clampedImageData[coord + 2] = paint ? 0 : 255
			this.clampedImageData[coord + 3] = 255
		}

		step() {
			this.tempField = this.field.map(function (arr) {
				return arr.slice()
			})
			let imageBuffer = new ArrayBuffer(this.imageData.data.length)
			this.clampedImageData = new Uint8ClampedArray(imageBuffer)
			this.clampedImageData.set(this.imageData.data)

			let paintedCount = 0

			for (let row = 0; row < this.height; row++) {
				for (let col = 0; col < this.width; col++) {
					const { paint } = this.checkAround(row, col)
					paintedCount += paint

					this.draw(paint, row, col)
				}
			}

			this.field = this.tempField.map(function (arr) {
				return arr.slice()
			})
			this.imageData.data.set(this.clampedImageData)

			this.generation++
			this.ctx.putImageData(this.imageData, 0, 0)
			debugger
			return paintedCount
		}

		init() {
			this.drawRandomField()
			debugger
		}

		end() {
			console.log(this.generation)
		}

		start() {
			let i = setInterval(() => {
				let paintedCount = this.step()
				if (!paintedCount) {
					clearInterval(i)
					this.end()
				}
			}, 50)
		}
	}

	let life = new Life()
	life.init()
	life.start()
})()
