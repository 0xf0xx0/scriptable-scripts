// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: blue; icon-glyph: divide;
/**
 * Displays mempool info from bitcoinexplorer.org (or a self-hosted instance).
 * Name: Foxpool
 * Author: Ging
 * Year: 2025
 * Deps:
 * - https://github.com/supermamon/scriptable-no-background
 * - https://github.com/0xf0xx0/scriptable-scripts/blob/master/LibFoxxo.js
 */
/// First parameter given is assumed to be the instance wanted

// Widget setup
const { createImage, createStack, createText, formatNumber, isIniCloud, progressBar } = importModule('LibFoxxo')
const { transparent } = importModule('no-background')

const params = args.widgetParameter?.split(',') ?? []
// [0] = explorer instance

// Select file source
const files = isIniCloud(FileManager.local(), module.filename) ? FileManager.iCloud() : FileManager.local()

// Don't update until 5 minutes have passed
// This avoids any potential spamming
const DONT_UPDATE_UNTIL = 5 * 60 * 1000 // 5 mins in ms

const widget = new ListWidget()
// add 5 mins to the current date, and then wrap it up in a date
widget.refreshAfterDate = new Date(new Date().valueOf() + DONT_UPDATE_UNTIL)
widget.backgroundImage = await transparent(Script.name())
widget.url = params[0] || 'https://bitcoinexplorer.org'

let halvingReq = new Request(`${widget.url}/api/blockchain/next-halving`)

let halvingData
try {
    halvingData = await halvingReq.loadJSON()
} catch (e) {
    createText({
        parent: widget,
        textalign: 'center',
        content: e.toString(),
    })
    Script.setWidget(widget)
    return Script.complete()
}

createText({
    textalign: 'center',
    content: `Halving ${halvingData.nextHalvingIndex} @ ${halvingData.nextHalvingBlock}`,
    parent: widget,
    font: Font.headline(),
})

widget.addSpacer()
const infoStack = widget.addStack()
const subsidyStack = createStack({
    parent: infoStack,
    verticalLayout: true,
})
infoStack.addSpacer()
const blocksUntilStack = createStack({
    parent: infoStack,
    verticalLayout: true,
})

createText({ content: `Next Subsidy`, parent: subsidyStack, font: Font.headline() })
createText({ content: `₿ ${halvingData.nextHalvingSubsidy}`, parent: subsidyStack })

createText({ content: `Blocks Remaining`, parent: blocksUntilStack, font: Font.headline() })
createText({ content: `${formatNumber(halvingData.blocksUntilNextHalving)}`, parent: blocksUntilStack })

widget.addSpacer()
const estDateStack = createStack({ parent: widget })
createText({ content: 'Est date', parent: estDateStack, font: Font.headline() })
estDateStack.addSpacer()
createText({
    parent: estDateStack,
    content: `${new Date(halvingData.nextHalvingEstimatedDate).toString().split('GMT')[0]}`,
})

const halvingBar = await progressBar({
    width: 600,
    height: 12,
    backgroundColor: '#0000',
    fillColor: '#fff',
    progressPercentage: 100 * (1 - halvingData.blocksUntilNextHalving / 216000),
    cornerRadius: 12,
})
widget.addSpacer()
const barStack = createImage({
    parent: widget,
    image: halvingBar,
})

Script.setWidget(widget)
Script.complete()
widget.presentMedium()
