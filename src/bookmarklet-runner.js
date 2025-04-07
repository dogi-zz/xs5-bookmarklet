export const css = (styleObject) => {
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


export class BookmarkletRunner {

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


export class UiTag {

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

export class UiContainer extends UiTag {

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


export class LabelValueDiv extends UiTag {

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
