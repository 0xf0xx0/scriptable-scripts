// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-gray; icon-glyph: book;
/**
 * Common methods shared by scripts from Ging.
 * Feel free to use in your own scripts :3
 * Author: Ging
 * Name: LibFoxxo
 * Year: 2025
 */

// Classes

// Horizontal progress bar
class ProgressBar {
    #ctx = new DrawContext()
    constructor({
        width = 100,
        height = 20,
        fillColor = '#7814CF',
        backgroundColor = '#00ffff',
        cornerRadius = 10,
        respectScreenScale = true,
        progressPercentage = 0,
        progressSteps = 100, // Progress precision
        transparent = true, // background
        vertical = false,
        startFromTop = false,
    }) {
        this.#ctx.opaque = !transparent
        this.#ctx.size = new Size(width, height)
        this.#ctx.respectScreenScale = respectScreenScale

        let progressStepLength
        if (vertical) {
            progressStepLength = (this.#ctx.size.height / progressSteps).toFixed(3)
        } else {
            progressStepLength = (this.#ctx.size.width / progressSteps).toFixed(3)
        }

        // draw the bar background
        const bgPath = new Path()
        const bgRect = new Rect(0, 0, this.#ctx.size.width, this.#ctx.size.height)
        bgPath.addRoundedRect(bgRect, cornerRadius, cornerRadius)
        this.#ctx.addPath(bgPath)
        this.#ctx.setFillColor(new Color(backgroundColor))
        this.#ctx.fillPath()

        // draw the progressbar
        // determine the number of pixels needed
        const progressLength = progressStepLength * progressPercentage
        const progressPath = new Path()
        let progressRect
        if (vertical) {
            let offset = 0
            if (startFromTop) {
                offset = this.#ctx.size.height - progressLength
            }
            progressRect = new Rect(0, offset, this.#ctx.size.width, progressLength)
        } else {
            progressRect = new Rect(0, 0, progressLength, this.#ctx.size.height)
        }
        progressPath.addRoundedRect(progressRect, cornerRadius, cornerRadius)
        this.#ctx.addPath(progressPath)
        this.#ctx.setFillColor(new Color(fillColor))
        this.#ctx.fillPath()
    }
    toImage() {
        return this.#ctx.getImage()
    }
    get canvas() {
        return this.#ctx
    }
}

module.exports = {
    /**
     * CreateAlert
     * @param {*} title - Title of the alert.
     * @param {*} msg - Message of the alert.
     * @param {*} options
     * @param {[any]} options.actions - Actions to add to the alert. An action object is formatted like this:
     * {
     *    "type": "default" // corresponds to the Alert methods. Other values: 'cancel', 'destructive', 'secure', 'text'
     *    "title": "FooBar" // title displayed on the action
     *    "text": "oh" // used with type = 'secure'||'text', this is the default text in the field.
     *    "placeholderText": "owo" // used alongside "text", this is the placeholder text displayed.
     * }
     * @returns {Alert} - An Alert object.
     */
    async createAlert(title, msg, options = { actions: [] }) {
        const alrt = new Alert()
        alrt.title = title
        alrt.message = msg

        for (const action of options.actions) {
            switch (action.type) {
                case 'cancel': {
                    alrt.addCancelAction(action.title)
                    break
                }
                case 'destructive': {
                    alrt.addDestructiveAction(action.title)
                    break
                }
                case 'secure': {
                    alrt.addSecureTextField(action.placeholderText, action.text)
                    break
                }
                case 'text': {
                    alrt.addTextField(action.placeholderText, action.text)
                    break
                }
                default: {
                    alrt.addAction(action.title)
                }
            }
        }
        return alrt
    },
    isIniCloud(fs, file) {
        return fs.isFileStoredIniCloud(file)
    },
    formatNumber(number, options) {
        return new Intl.NumberFormat(undefined, options).format(number)
    },
    getFile(fs, path) {
        return fs.joinPath(fs.documentsDirectory(), path)
    },
    async loadImage(imgUrl) {
        const req = new Request(imgUrl)
        return await req.loadImage()
    },
    getSymbol(name, font) {
        const symbol = SFSymbol.named(name)
        if (font) {
            symbol.applyFont(font)
        }
        return symbol
    },
    createStack({
        parent = null,
        width = 0, // px
        height = 0, // px
        backgroundColor = null, // hexadecimal notation
        borderColor = '#000000',
        borderRadius = 4, // px
        borderWidth = 0, // px
        verticalLayout = false,
        padding = [0, 0, 0, 0], // array of 4 numbers
        align = 'top', // 'top', 'center', 'bottom'
    }) {
        try {
            if (!parent) {
                throw Error('parent not defined')
            }
            const stacc = parent.addStack()

            stacc.size = new Size(width, height)
            stacc.borderWidth = borderWidth
            stacc.borderColor = new Color(borderColor)
            stacc.cornerRadius = borderRadius

            if (backgroundColor) {
                stacc.backgroundColor = new Color(backgroundColor)
            }
            if (verticalLayout) {
                stacc.layoutVertically()
            } else {
                stacc.layoutHorizontally()
            }
            stacc[`${align.toLowerCase()}AlignContent`]()
            stacc.setPadding(...padding)

            return stacc
        } catch (e) {
            throw Error(`[LibFoxxo][createStack]: ${e.stack}`)
        }
    },
    createImage({
        parent = null,
        image = null,
        width = 0,
        height = 0,
        resizable = true,
        color = null,
        align = 'left', // 'left', 'center', 'right'
    }) {
        try {
            if (!parent) {
                throw Error('parent not defined')
            }
            const img = parent.addImage(image)
            img.imageSize = new Size(width, height)
            img.resizable = resizable
            if (color) {
                img.tintColor = new Color(color)
            }
            img[`${align.toLowerCase()}AlignImage`]()
            return img
        } catch (e) {
            throw Error(`[LibFoxxo][createImage]: ${e.stack}`)
        }
    },
    createText({
        parent = null,
        content = '',
        font = null,
        maxLines = 0,
        minimumScaleFactor = 1,
        url = null,
        centered = false,
        align = 'left', // 'left', 'center', 'right'
    }) {
        try {
            if (!parent) {
                throw Error('parent not defined')
            }
            centered ? parent.addSpacer() : ''
            const txt = parent.addText(content)
            centered ? parent.addSpacer() : ''
            txt.lineLimit = maxLines
            if (font) {
                txt.font = font
            }
            txt.minimumScaleFactor = minimumScaleFactor
            if (url) {
                txt.url = url
            }
            txt[`${align.toLowerCase()}AlignText`]()
            return txt
        } catch (e) {
            throw Error(`[LibFoxxo][createText]: ${e.stack}`)
        }
    },
    determineDaysFromNow(date) {
        const msInDay = 24 * 60 * 60 * 1000
        const now = new Date()
        now.setHours(0, 0, 0, 0)
        date.setHours(0, 0, 0, 0)

        return (+now - +date) / msInDay
    },
    // https://stackoverflow.com/a/34841026, heavily tweaked
    toDDHHMM(secs, padding = false) {
        const markers = ['d', 'h', 'm']
        const totalHours = Math.floor(secs / 3600)
        const hours = totalHours % 24
        const days = Math.floor(totalHours / 24)
        const minutes = days > 99 ? 0 : Math.floor(secs / 60) % 60

        return [days, hours, minutes]
            .map((v) => {
                if (padding) {
                    return v > 9 ? v : '0' + v
                }
                return v
            }) // first add padding, if wanted ([2, 0, 13] -> ["02", "00", "13"])
            .map((v, i) => `${v}${markers[i]}`) // add time markers ([2, 0, 13] -> ["2d", "0h", "13m"])
            .filter((v) => (padding ? !v.startsWith('00') : !v.startsWith('0'))) // then filter out 0 values (["2d", "0h", "13m"] -> ["2d", "13m"])
            .join('') // and finally join ("2d13m")
    },
    ProgressBar,
    version: 1,
}
Script.complete()
