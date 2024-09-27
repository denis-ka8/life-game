;(function () {
	class Life {
		constructor() {
			this.canvas = document.getElementById("life")
			this.ctx = this.canvas.getContext("2d")
			this.width = this.canvas.clientWidth
			this.height = this.canvas.clientHeight

			this.initControls()

			this.clearListener()
		}

		initControls() {
			this.inputWidth = document.getElementById("inp-field-width")
			this.inputHeight = document.getElementById("inp-field-height")
			this.btnSetSize = document.getElementById("btn-set-size")
			this.btnStart = document.getElementById("btn-start")
			this.btnStop = document.getElementById("btn-stop")
			this.btnGenerate = document.getElementById("btn-generate")
			this.btnClear = document.getElementById("btn-clear")
			this.infoGeneration = document.getElementById("info-generation")
			this.infoTime = document.getElementById("info-time")
			this.infoError = document.getElementById("info-error")

			this.inputWidth.addEventListener("keyup", this.changeListener.bind(this))
			this.inputHeight.addEventListener("keyup", this.changeListener.bind(this))
			this.btnSetSize.addEventListener("click", this.sizeListener.bind(this))
			this.btnStart.addEventListener("click", this.startListener.bind(this))
			this.btnStop.addEventListener("click", this.stopListener.bind(this))
			this.btnGenerate.addEventListener(
				"click",
				this.generateListener.bind(this)
			)
			this.btnClear.addEventListener("click", this.clearListener.bind(this))
		}

		stopListener(event) {
			clearInterval(this.infoInterval)
			if (this.generationStarted) {
				this.showInfo()
			}

			this.generated = false
			this.generation = 0
			this.generationStarted = false
			this.generationTime = 0
			this.generationPrevDate = 0
			this.currentSnapshot = []
			this.generationSnapshots = []
		}

		generateListener(event) {
			this.clearListener()
			this.drawRandomField()
		}

		clearListener(event) {
			this.stopListener()

			this.ctx = this.canvas.getContext("2d")
			this.imageData = this.ctx.createImageData(this.width, this.height)
			this.ctx.putImageData(this.imageData, 0, 0)

			let imageBuffer = new ArrayBuffer(this.imageData.data.length)
			this.clampedImageData = new Uint8ClampedArray(imageBuffer)
			this.clampedImageData.set(this.imageData.data)

			this.field = new Array(this.height)
			for (let i = 0; i < this.field.length; i++) {
				this.field[i] = new Array(this.width)
			}
			this.tempField = this.field.map(function (arr) {
				return arr.slice()
			})
			this.infoGeneration.innerText = "0"
			this.infoTime.innerText = "0"
			this.infoError.innerText = ""
		}

		changeListener(event) {
			const { value } = event.target
			let number = value.match(/\d+/g)
			event.target.value = !number ? "" : number[0]
		}

		sizeListener(event) {
			this.infoError.innerText = ""
			if (!this.inputWidth.value || !this.inputHeight.value) {
				this.infoError.innerText = "Введите размер"
				return
			}
			let _width = parseInt(this.inputWidth.value)
			let _height = parseInt(this.inputHeight.value)
			if (_width < 3 || _height < 3) {
				this.infoError.innerText = "Введите размер больше 3x3"
				return
			}
			this.clearListener()

			this.width = _width
			this.height = _height
			this.canvas.width = this.width
			this.canvas.height = this.height
		}

		startListener(event) {
			if (this.generationStarted) {
				this.infoError.innerText = "Игра уже запущена"
				return
			}
			if (!this.generated) {
				this.generateListener()
			}
			this.start()
		}

		showInfo() {
			this.infoGeneration.innerText = this.generation
			this.infoTime.innerText = `${this.generationTime}ms`
		}

		drawRandomField() {
			this.currentSnapshot = []
			let string32Bit = ""
			for (let i = 0; i < this.height; i++) {
				for (let j = 0; j < this.width; j++) {
					let isPainted = Math.random() < 0.5 ? 1 : 0

					string32Bit += isPainted
					if (i === this.height - 1 && j === this.width - 1) {
						string32Bit.padEnd(32, "0")
					}
					if (string32Bit.length === 32) {
						this.currentSnapshot.push(parseInt(string32Bit, 2))
						string32Bit = ""
					}

					this.field[i][j] = isPainted
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
			this.generationPrevDate = new Date().getTime()

			this.generationSnapshots.push(this.currentSnapshot)
			this.generated = true
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
			this.currentSnapshot = []
			let string32Bit = ""
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

					string32Bit += paint
					if (row === this.height - 1 && col === this.width - 1) {
						string32Bit.padEnd(32, "0")
					}
					if (string32Bit.length === 32) {
						this.currentSnapshot.push(parseInt(string32Bit, 2))
						string32Bit = ""
					}

					this.draw(paint, row, col)
				}
			}

			this.field = this.tempField.map(function (arr) {
				return arr.slice()
			})
			this.imageData.data.set(this.clampedImageData)

			this.generation++
			this.ctx.putImageData(this.imageData, 0, 0)
			let generationDate = new Date().getTime()
			this.generationTime = generationDate - this.generationPrevDate
			this.generationPrevDate = generationDate

			this.generationSnapshots.push(this.currentSnapshot)
			let repeatIndex = this.checkGenerationsRepeat()
			return { paintedCount, repeatIndex }
		}

		checkGenerationsRepeat() {
			let current = this.generationSnapshots.at(-1)
			for (let i = this.generationSnapshots.length - 2; i >= 0; i--) {
				let iter = this.generationSnapshots[i]
				if (current.every((el, index) => el === iter[index])) {
					return i
				}
			}
			return -1
		}

		rafCallback() {
			const { paintedCount, repeatIndex } = this.step()
			if (!paintedCount || repeatIndex >= 0) {
				this.generationStarted = false
				clearInterval(this.infoInterval)
				this.showInfo()
			}

			if (this.generationStarted) {
				window.requestAnimationFrame(this.rafCallback.bind(this))
			}
		}

		start() {
			this.infoInterval = setInterval(() => {
				this.showInfo()
			}, 1000)

			this.generationStarted = true
			window.requestAnimationFrame(this.rafCallback.bind(this))
		}
	}

	let life = new Life()
	life.drawRandomField()
	life.start()
})()
