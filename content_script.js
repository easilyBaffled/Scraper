import React, { PropTypes, Component } from 'react';
import io from 'socket.io-client/socket.io';
const socket = io('https://rwm.herokuapp.com/', {jsonp: false});

class Scraper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectorMode: false,
      confirmation: false,
      targetPath: '',
    };

    document.onkeydown = (keyEvent) => {
      if (keyEvent.ctrlKey && keyEvent.keyCode === 65 && this.state.selectorMode) {
        this.setState({selectorMode: false});
        location.reload();
      } else if (keyEvent.ctrlKey && keyEvent.keyCode === 65 && !this.state.selectorMode) {
        this.setState({selectorMode: true});
        document.body.style.border = '10px solid gold';
        document.onmousemove = (event) => {
          const target = event.target;
          const targetStyle = target.style;
          target.style.outline = '2px solid gold';
          target.onclick = (clickEvent) => {
            clickEvent.preventDefault();
            clickEvent.stopPropagation();
            document.onmousemove = '';
            this.setState({selectorMode: false, confirmation: true, targetPath: this._cssPath(clickEvent.target)});
          };
          target.onmouseout = () => {
            target.style = targetStyle;
          };
        };
      }
    };
  }

  render() {
    if (this.state.targetPath) {
      console.log(document.querySelector(this.state.targetPath).innerText);
    }
    return (
      <div id='scraper' style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', }}>
        {this.state.confirmation ?
          <div style={{position: 'absolute', height: '100%', width: '100%', top: '0', left: '0', color: 'white', backgroundColor: 'rgba(100, 100, 100, .8)', zIndex: '9999', display: 'inlineBlock'}}>
            <label>Target Path</label> <h3>{this.state.targetPath}</h3>
            <label>Target Text</label> <h3>{document.querySelector(this.state.targetPath).innerText}</h3>
            <button onClick={this._acceptSelection}>OK</button>
            <button onClick={this._resetSelection}>Cancel</button>
          </div>
          : ''};
      </div>
    );
  }

  _acceptSelection = () => {
    console.log(this.state.targetPath);
    console.log(document.querySelector(this.state.targetPath));
    console.log(document.querySelector(this.state.targetPath).innerText);
    socket.emit('selection', { path: this.state.targetPath, text: document.querySelector(this.state.targetPath).innerText, url: window.location.href});
    location.reload();
  }
  _resetSelection = () => {
    this.setState({ selectorMode: true, confirmation: false, targetPath: '' });
    document.onmousemove = (event) => {
      const target = event.target;
      const targetStyle = target.style;
      target.style.outline = '2px solid gold';
      target.onclick = (clickEvent) => {
        clickEvent.preventDefault();
        clickEvent.stopPropagation();
        document.onmousemove = '';
        this.setState({selectorMode: false, confirmation: true, targetPath: this._cssPath(clickEvent.target)});
      };
      target.onmouseout = () => {
        target.style = targetStyle;
      };
    };
  }

  _cssPath = (el) => {
    if (!(el instanceof Element)) return;
    let path = [];
    while (el.nodeType === Node.ELEMENT_NODE) {
      let selector = el.nodeName.toLowerCase();
      if (el.id) {
        selector += '#' + el.id;
        path.unshift(selector);
        break;
      } else {
        let sib = el;
        let nth = 1;
        while (sib = sib.previousElementSibling) {
          if (sib.nodeName.toLowerCase() == selector)
            nth++;
        }
        if (nth != 1)
          selector += ":nth-of-type(" + nth + ")";
      }
      path.unshift(selector);
      el = el.parentNode;
    }
    return path.join(" > ");
  }
}
const elemDiv = document.createElement('div');
elemDiv.id = 'reactAnchor';
document.body.appendChild(elemDiv);
React.render(<Scraper/>, document.getElementById('reactAnchor'));
