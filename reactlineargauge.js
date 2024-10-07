// Bridges between React and the Canvas Gauge npm lib
// Custom attributes are maxAlertValue, minAlertValue, maxAlertColor, minAlertColor

import React, { useRef, useEffect, useMemo, useCallback } from 'react';
import { LinearGauge } from 'canvas-gauges';

const ReactLinearGauge = (props) => {
  const canvasRef = useRef(null);
  const gaugeRef = useRef(null);
  const alertRef = useRef({ alertChange: false, maxAlert: false, minAlert: false });

  const opts = useMemo(() => {
    const options = { ...props };
    const alert = alertRef.current;

    if (typeof options.maxAlertColor !== "undefined") {
      alert.alertChange = true;
      alert.maxAlert = true;
      alert.maxAlertColor = options.maxAlertColor;
      alert.maxAlertValue = options.maxAlertValue;
      alert.maxAlertHit = false;
      delete options.maxAlertColor;
      delete options.maxAlertValue;
    }

    if (typeof options.minAlertColor !== "undefined") {
      alert.alertChange = true;
      alert.minAlert = true;
      alert.minAlertColor = options.minAlertColor;
      alert.minAlertValue = options.minAlertValue;
      alert.minAlertHit = false;
      delete options.minAlertColor;
      delete options.minAlertValue;
    }

    return options;
  }, [props]);

  const resetColor = useCallback(() => {
    const gauge = gaugeRef.current;
    if (gauge) {
      gauge.options.colorBarProgress = opts.colorBarProgress;
      gauge.options.colorBorderOuter = opts.colorBorderOuter;
      gauge.update();
    }
  }, [opts]);

  const updateGauge = useCallback(() => {
    const gauge = gaugeRef.current;
    const alert = alertRef.current;

    if (gauge && gauge.value !== props.value) {
      gauge.value = props.value;

      if (alert.alertChange) {
        const go = gauge.options;

        if (alert.maxAlert) {
          if (props.value >= alert.maxAlertValue) {
            go.colorBarProgress = alert.maxAlertColor;
            go.colorBorderOuter = "#F00";
            alert.maxAlertHit = true;
            gauge.update();
          } else if (alert.maxAlertHit && props.value < alert.maxAlertValue) {
            alert.maxAlertHit = false;
            if ((alert.minAlert && !alert.minAlertHit) || !alert.minAlert) {
              resetColor();
            }
          }
        }

        if (alert.minAlert) {
          if (props.value <= alert.minAlertValue) {
            go.colorBarProgress = alert.minAlertColor;
            go.colorBorderOuter = "#00F";
            alert.minAlertHit = true;
            gauge.update();
          } else if (alert.minAlertHit && props.value > alert.minAlertValue) {
            alert.minAlertHit = false;
            if ((alert.maxAlert && !alert.maxAlertHit) || !alert.maxAlert) {
              resetColor();
            }
          }
        }
      }
    }
  }, [props.value, resetColor]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const options = { ...opts, renderTo: canvas };
    gaugeRef.current = new LinearGauge(options).draw();
    gaugeRef.current.value = props.value;

    return () => {
      if (gaugeRef.current) {
        gaugeRef.current.destroy();
      }
    };
  }, []);

  useEffect(() => {
    updateGauge();
  }, [updateGauge]);

  return <canvas ref={canvasRef} />;
};

export default ReactLinearGauge;
