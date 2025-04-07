import {BookmarkletRunner, css, UiContainer} from "./bookmarklet-runner";
import {ChartHelper} from "./chart-helper";

try {
  window.bookmarketRunner?.tearDown();
} catch (e) {
  console.error(e)
}
window.bookmarketRunner = new BookmarkletRunner();


const panelStyle = {background: 'white', borderRadius: '2px', padding: '1px 2px', boxShadow: '2px -2px 4px #dddddd'};
const fixedAtBottom = {display: 'block', position: 'fixed', left: '5px', bottom: '5px'};
const clickable = {cursor: 'pointer'};

const getPanelCrossValue = () => {
  const panelCross = document.querySelector('.chart-panel.chart-selected-panel .chart-panel-cross');
  if (panelCross.style.display !== 'none') {
    const markedValue = parseFloat(panelCross.querySelector('.chart-price-label').innerText);
    return markedValue;
  }
  return null;
}


const toolBarButtons = {
  'zoom-auto': '.chart-icon-lock-axis-off',
  'zoom-greater': '.chart-icon-v-zoom-in',
  'zoom-smaller': '.chart-icon-v-zoom-out',
  'go-back': '.chart-icon-old-data',
}
const toolBarAction = (action) => {
  console.info("toolBarAction")
  const toolbar = document.querySelector('.chart-panel.chart-selected-panel .chart-top-toolbar');
  const openSubMenuButton = toolbar.querySelector('.chart-icon-scroll-group')
  openSubMenuButton.closest('a').click();
  const toolButton = toolbar.querySelector(toolBarButtons[action])
  toolButton.closest('a').click();
  openSubMenuButton.closest('a').click();
}


//

const br = window.bookmarketRunner;


// </div><div class="xs-toolbar-settings-icon"></div>
const optionPanelDiv = new UiContainer('div', `<div>{content}</div>`).style({
  ...fixedAtBottom, ...panelStyle,
}).childContainerStyle({
  display: 'flex'
});
br.addUiElement(optionPanelDiv);
console.info({optionPanelDiv})

const chartHelper = new ChartHelper(optionPanelDiv, br);
br.setInterval(() => chartHelper.updateSpread(), 1000)

br.addListener(window, 'keydown', e => {
  console.info(e)

  if (e.code === 'ArrowRight' && e.shiftKey && e.shiftKey) {
    toolBarAction('go-back');
  }
  if (e.code === 'NumpadAdd' && e.shiftKey && e.ctrlKey) {
    toolBarAction('zoom-greater');
  }
  if (e.code === 'NumpadSubtract' && e.shiftKey && e.ctrlKey) {
    toolBarAction('zoom-smaller');
  }
  if (e.code === 'NumpadMultiply' && e.shiftKey && e.ctrlKey) {
    toolBarAction('zoom-auto');
  }

  if (e.code.startsWith('Digit') && e.shiftKey) {
    chartHelper.performInput(e.code, getPanelCrossValue());
  }


  if (e.code === 'Space') {
    console.info(getPanelCrossValue());
  }

});
