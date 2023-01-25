// Bridges between React and the Canvas Gauge npm lib
// Custom attributes are maxAlertValue, minAlertValue, maxAlertColor, minAlertColor

import React from 'react';
import { LinearGauge } from 'canvas-gauges';

class ReactLinearGauge extends React.Component {
  constructor(props) {
    super(props);
    this.canvasRef = React.createRef();
    this.opts = { ...props }; // need to copy as props are not editable and we need to remove fields
    this.alert = { alertChange: false, maxAlert: false, minAlert: false };

    if (typeof this.opts.maxAlertColor != "undefined") {
      this.alert = {
        alertChange: true,
        maxAlertColor: this.opts.maxAlertColor,
        maxAlertValue: this.opts.maxAlertValue,
        maxAlertHit: false,
        maxAlert: true
      };

      delete this.opts.maxAlertColor; // must use parameters within the scope of the radial library to prevent script errors
      delete this.opts.maxAlertValue;
    }

    if (typeof this.opts.minAlertColor != "undefined") {
      this.alert = Object.assign(this.alert, {
        alertChange: true,
        minAlertColor: this.opts.minAlertColor,
        minAlertValue: this.opts.minAlertValue,
        minAlertHit: false,
        minAlert: true
      });
      delete this.opts.minAlertColor; // must use parameters within the scope of the radial library to prevent script errors
      delete this.opts.minAlertValue;
    }
  }

  componentDidMount() {
    // creates initial required object, blends inherited props into it when they are available, and adds the element
    const Canvas = this.canvasRef.current;
    const options = Object.assign({}, this.opts, { renderTo: Canvas });
    // renders the element to the webpage
    this.gauge = new LinearGauge(options).draw();
    // assign the initial value
    this.gauge.value = this.props.value; // the value of the dial must be determined by the parent component (props). Do not use state or it will not animate
  }

  resetColor = () => { // resets colors to default values
    const go = this.gauge.options;
    go.colorBarProgress = this.opts.colorBarProgress;
    go.colorBorderOuter = this.opts.colorBorderOuter;
    this.gauge.update();
  }

  componentDidUpdate() {
    if (this.gauge.value !== this.props.value) {
      this.gauge.value = this.props.value;

      if (this.alert.alertChange) {
        const go = this.gauge.options;
        const al = this.alert;

        if (this.alert.maxAlert) {
          if (this.props.value >= al.maxAlertValue) {
            go.colorBarProgress = al.maxAlertColor;
            go.colorBorderOuter = "#F00";
            this.alert.maxAlertHit = true;
            this.gauge.update();
          }

          if (al.maxAlertHit && this.props.value < al.maxAlertValue) { // turn off and change color if we've fallen below the threshold value
            this.alert.maxAlertHit = false;
            if ((al.minAlert && !al.minAlertHit) || !al.minAlert) {
              this.resetColor();
            }
          }
        }  //eof maxAlert

        if (this.alert.minAlert) {
          if (this.props.value <= al.minAlertValue) {
            go.colorBarProgress = al.minAlertColor;
            go.colorBorderOuter = "#00F";
            this.alert.minAlertHit = true;
            this.gauge.update();
          }

          if (al.minAlertHit && this.props.value > al.minAlertValue) { // turn off and change color if we've fallen below the threshold value
            this.alert.minAlertHit = false;
            if ((al.maxAlert && !al.maxAlertHit) || !al.maxAlert) {
              this.resetColor();
            }
          }
        } // eof minAlert
      } //eof alertchange
    } //eof of block of code executed on value change
  }

  render() {
    return (
      <canvas ref={this.canvasRef} />
    )
  }
}

export default ReactLinearGauge;
