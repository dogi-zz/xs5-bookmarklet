import {LabelValueDiv} from "./bookmarklet-runner";


const round3 = num => `${Math.round(num * 1000) / 1000}`;
const round5 = num => `${Math.round(num * 100000) / 100000}`;

export class ChartHelper {


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
