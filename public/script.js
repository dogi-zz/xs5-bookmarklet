(()=>{
  const css = (styleObject) => {
    const parts = [];
    Object.keys(styleObject).forEach((key) => {
      let cssKey = key;
      while (true) {
        const match = cssKey.match(/([a-z]*)([A-Z])(.*)/);
        console.info(match)
        if (!match) {
          break;
        }
        cssKey = `${match[1]}-${match[2].toLowerCase()}${match[3]}`;
      }
      parts.push(`${cssKey}: ${styleObject[key]};`)
    })
    return parts.join('');
  }
  
  
  class BookmarkletRunner {
  
    constructor() {
      console.info("BookmarketRunner()")
      this.name = 'foo';
      this.uiElements = [];
      this.eventListeners = [];
      this.intervalls = [];
      this.timeouts = [];
    }
  
    tearDown() {
      const uiElements = [...this.uiElements];
      uiElements.forEach(uiElement => uiElement.remove());
      this.eventListeners.forEach(({domElement, event, callback}) => domElement.removeEventListener(event, callback));
      this.intervalls.forEach(intervall => clearInterval(intervall));
      this.timeouts.forEach(intervall => clearTimeout(intervall));
    }
  
    addUiElement(uiElement) {
      document.body.appendChild(uiElement.tag);
      this.uiElements.push(uiElement)
      uiElement.onRemove.push(() => {
        const idx = this.uiElements.indexOf(uiElement);
        if (idx >= 0) {
          this.uiElements.splice(idx, 1);
        }
      })
    }
  
    addListener(domElement, event, callback) {
      domElement.addEventListener(event, callback);
      this.eventListeners.push({domElement, event, callback})
    }
  
    setInterval(callback, time) {
      this.intervalls.push(setInterval(callback, time));
    }
    setTimeout(callback, time) {
      this.timeouts.push(setTimeout(callback, time));
    }
  }
  
  
  class UiTag {
  
    constructor(tagName, content) {
      this.tag = document.createElement(tagName);
      this.tag.innerHTML = content || '';
      this.onRemove = [];
      this.container = undefined;
    }
  
    appendTo(otherTag) {
      otherTag.appendChild(this.tag);
      return this;
    }
  
    remove() {
      this.tag.remove();
      if (this.container) {
        const idx = this.container.children.indexOf(this);
        if (idx >= 0) {
          this.container.children.splice(idx, 1);
        }
      }
      return this;
    }
  
    style(styles) {
      Object.assign(this.tag.style, styles);
      return this;
    }
  
    findTemplateElement(content){
      let result = null;
      this.tag.querySelectorAll('*').forEach(item => {
        if (item.innerHTML === content) {
          result = item;
          item.innerHTML = '';
        }
      })
      return result
    }
  
  
  }
  
  class UiContainer extends UiTag {
  
    constructor(tagName, content) {
      super(tagName, content);
      console.info("UiContainer", this)
      this.children = [];
      this.childElement = this.findTemplateElement('{content}');
    }
  
    addChild(uiElement) {
      this.children.push(uiElement);
      this.childElement.appendChild(uiElement.tag);
      uiElement.container = this;
      this.childElement.appendChild(uiElement.tag);
      return this;
    }
  
    childContainerStyle(styles) {
      Object.assign(this.childElement.style, styles);
      return this;
    }
  }
  
  
  class LabelValueDiv extends UiTag {
  
    constructor(label, initValue) {
      super('div', '<span>{label}</span><span>{value}</span>');
      this.labelElement = this.findTemplateElement('{label}');
      this.valueElement = this.findTemplateElement('{value}');
      this.labelElement.innerText = label || '';
      this.valueElement.innerText = initValue ?? '';
    }
  
    labelStyle(styles) {
      Object.assign(this.labelElement.style, styles);
      return this;
    }
  
    valueStyle(styles) {
      Object.assign(this.valueElement.style, styles);
      return this;
    }
  
    setValue(value) {
      this.valueElement.innerText = value
    }
  
    getValue() {
      return this.valueElement.innerText;
    }
  
  }
  
  
  
  const round3 = num => `${Math.round(num * 1000) / 1000}`;
  const round5 = num => `${Math.round(num * 100000) / 100000}`;
  
  class ChartHelper {
  
  
    constructor(
        optionPanelDiv,
        br,
    ) {
      this.optionPanelDiv = optionPanelDiv;
      this.br = br;
      this.measureInfo = new LabelValueDiv('(1)Take 10 Bits', 0);
      this.takeProfitInfo = new LabelValueDiv('(2)Take Profit', 0);
      this.stopLossInfo = new LabelValueDiv('(3)Stop Loss', 0);
      this.spreadInfo = new LabelValueDiv('Spread', 0);
      this.winLoss = new LabelValueDiv('Win/Loss', 0);
      [this.measureInfo, this.takeProfitInfo, this.stopLossInfo, this.spreadInfo, this.winLoss].forEach(label => {
        label.style({fontSize: '10px',})
            .labelStyle({color: 'gray', marginRight: '10px', width: '70px', display: 'inline-block'})
            .valueStyle({marginRight: '10px', width: '75px', display: 'inline-block'});
        optionPanelDiv.addChild(label);
      })
      this.winLoss.valueStyle({width: '150px'});
      this.measureInfo.labelStyle({width: '80px'});
  
      this.takeProfitValue = 0;
      this.stopLossValue = 0;
      this.measureStart = 0;
      this.measureRange = 0;
    }
  
    resetView() {
      this.stopLossInfo.setValue('0');
      this.takeProfitInfo.setValue('0');
      this.spreadInfo.setValue('0');
      this.winLoss.setValue('0');
    }
  
    updateSpread() {
      const [sellElement, buyElement] = [
        document.querySelector('.chart-panel.chart-selected-panel #sellButton'),
        document.querySelector('.chart-panel.chart-selected-panel #buyButton'),
      ];
      if (!sellElement || !buyElement) {
        return this.resetView();
      }
      const actualValue = parseFloat(sellElement.innerText);
      const highValue = parseFloat(buyElement.innerText);
      const spread = highValue - actualValue;
      this.spreadInfo.setValue(round5(spread))
  
      if (this.measureStart) {
        this.measureInfo.setValue(`${round3(this.measureStart)}....`);
      } else if (this.measureRange) {
        this.measureInfo.setValue(`${round3(10 / this.measureRange)}`);
      } else {
        this.measureInfo.setValue('---');
      }
  
  
      let winValue = 0;
      let lossValue = 0;
      let bits = 1;
      if (this.takeProfitValue) {
        winValue = this.takeProfitValue - highValue;
        this.takeProfitInfo.setValue(`${round3(this.takeProfitValue)} (${round3(winValue)})`);
      } else {
        this.takeProfitInfo.setValue('---');
      }
      if (this.stopLossValue) {
        lossValue = actualValue - this.stopLossValue;
        this.stopLossInfo.setValue(`${round3(this.stopLossValue)} (${round3(lossValue)})`);
      } else {
        this.stopLossInfo.setValue('---');
      }
      if (winValue || lossValue) {
        const realValue = winValue || lossValue;
        bits = 100 / realValue;
      }
      this.winLoss.setValue(`(${round3(bits)}) (W/L): ${round3(winValue * bits)}/${round3(lossValue * bits)}`)
    }
  
  
    copyValue(labelValueDiv) {
      const valueToCopy = `${labelValueDiv.getValue()}`;
      console.info(valueToCopy)
      navigator.clipboard.writeText(valueToCopy);
      labelValueDiv.labelStyle({color: 'green'});
      this.br.setTimeout(() => labelValueDiv.labelStyle({color: 'gray'}), 500)
    }
  
  
    performInput(keyCode, value) {
      console.info("keyCode", keyCode, value, this);
      if (keyCode === 'Digit1') {
        if (value) {
          if (!this.measureStart) {
            this.measureStart = value;
          } else {
            this.measureRange = Math.abs(this.measureStart - value);
            this.measureStart = 0;
          }
        }
      }
  
      if (keyCode === 'Digit2') {
        if (value) {
          this.takeProfitValue = value;
        } else {
          this.copyValue(this.takeProfitInfo);
        }
      }
  
      if (keyCode === 'Digit3') {
        if (value) {
          this.stopLossValue = value;
        } else {
          this.copyValue(this.stopLossInfo);
        }
      }
  
      this.updateSpread();
    }
  
  
  }
  
  
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
  
})();