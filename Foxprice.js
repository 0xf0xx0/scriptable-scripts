// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: blue; icon-glyph: dollar-sign;
// Permission is hereby granted, free of charge, to any person obtaining a copy of this software
// and associated documentation files (the "Software"), to deal in the Software without restriction,
// including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense,
// and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so,
// subject to the following conditions:
// The above copyright notice and this permission notice shall be included in all copies
// or substantial portions of the Software.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
// INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE
// AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////
//// I dont know if i need this notice, as i've rewritten most of the code to bring it up to date,
//// as well as added functionality. Oh well!
//////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * Displays cryptocurrency price information from CoinGecko.
 * Heavily modified from the featured "Crypto Price" widget.
 * Name: Foxprice
 * Author: Ging
 * Year: 2025
 * Deps:
 * - https://github.com/supermamon/scriptable-no-background
 * - https://github.com/0xf0xx0/scriptable-scripts/blob/master/LibFoxxo.js
 */
const PRESENT_SIZE = 'Small'
const GREEN = new Color('#4AF956')
const RED = new Color('#FD4E00')
// Widget setup
const { isIniCloud, determineDaysFromNow, createStack, createImage, formatNumber, loadImage } = importModule('LibFoxxo')
const { transparent } = importModule('no-background')
const FONT = Font.mediumSystemFont(16)

const params = args.widgetParameter?.split(',') ?? ['bitcoin', 'ethereum']

// Select file source
const files = isIniCloud(FileManager.local(), module.filename) ? FileManager.iCloud() : FileManager.local()

const widget = new ListWidget()
const DONT_UPDATE_UNTIL = 10 * 60 * 1000 // 10m
widget.refreshAfterDate = new Date(new Date().valueOf() + DONT_UPDATE_UNTIL) // make sure we're not abusing the ratelimit
widget.backgroundImage = await transparent(Script.name())

async function draw() {
    const data = await fetchCoinInfo(params)
    for (const { image, id, symbol, price, grow, growPercent } of data) {
        const rowStack = createStack({
            parent: widget,
            padding: [2, 2, 0, 0],
            align: 'center',
            verticalLayout: false,
        })

        if (config.runsInWidget && config.widgetFamily !== 'small') {
            rowStack.url = `https://www.coingecko.com/en/coins/${id}`
            const imageStack = createStack({ parent: rowStack, padding: [0, 0, 0, 5] })
            createImage({
                parent: imageStack,
                image: await loadImage(image),
                width: 20,
                height: 20,
                align: 'left',
            })
        }
        const symbolStack = createStack({ parent: rowStack, padding: [0, 0, 0, 5] })
        rowStack.addSpacer()
        const priceStack = createStack({ parent: rowStack, padding: [0, 0, 0, 0] })

        // The text
        const symbolText = symbolStack.addText(symbol)
        symbolText.font = FONT
        symbolText.leftAlignText()

        const priceText = priceStack.addText(price)
        priceText.font = FONT
        priceText.rightAlignText()

        if (config.runsInWidget && config.widgetFamily === 'small') {
            if (grow) {
                priceText.textColor = GREEN
            } else {
                priceText.textColor = RED
            }
        }

        if (config.runsInWidget && config.widgetFamily !== 'small') {
            const percentStack = createStack({ parent: rowStack, padding: [0, 0, 8, 0] })
            const percentText = percentStack.addText(growPercent)
            if (grow) {
                percentText.textColor = GREEN
                percentText.text = `+${percentText.text}`
            } else {
                percentText.textColor = RED
            }
        }
    }
}

async function fetchCoinInfo(coinIDs) {
    const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${coinIDs.join(',')}`
    const req = new Request(url)
    let res = []
    const apiResult = await req.loadJSON()
    if (apiResult.status && apiResult.status.error_code) {
        // back off if we have a error
        const DONT_UPDATE_UNTIL = 30 * 60 * 1000 // 30m
        widget.refreshAfterDate = new Date(new Date().valueOf() + DONT_UPDATE_UNTIL)
        return []
    }

    for (const coin of apiResult) {
        const info = {
            price: formatNumber(coin.current_price, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            grow: coin.price_change_24h > 0,
            growPercent: `${coin.price_change_percentage_24h.toFixed(2)}%`, // i dont trust JS around negatives...
            symbol: coin.symbol.toUpperCase(),
            image: coin.image,
            id: coin.id,
        }
        res.push(info)
    }
    return res
}

try {
    await draw()
    Script.setWidget(widget)
    Script.complete()
    widget[`present${PRESENT_SIZE}`]()
} catch (e) {
    console.error(e)
}
