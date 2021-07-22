import { useRef, useCallback, useEffect, useState } from "react";
import Webcam from "react-webcam";
import moduleName from "./App.css";

if (!("BarcodeDetector" in window)) {
  console.log("Barcode Detector is not supported by this browser.");
} else {
  console.log("supported");
}

const barcodeDetector = new window.BarcodeDetector({
  formats: ["code_39", "code_128", "ean_8", "ean_13", "upc_a", "upc_e"],
});

function App() {
  const webcamRef = useRef(null);
  const [imageSrc, setImageSrc] = useState("");
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");

  const [deviceId, setDeviceId] = useState();
  const [devices, setDevices] = useState([]);

  const handleDevices = useCallback(
    (mediaDevices) => {
      setDevices(mediaDevices.filter(({ kind }) => kind === "videoinput"));
    },
    [setDevices]
  );

  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then(handleDevices);
  }, [handleDevices]);

  const capture = useCallback(() => {
    setImageSrc(webcamRef?.current?.getScreenshot());
  }, [webcamRef]);

  useEffect(() => {
    const detector = async () => {
      if ("BarcodeDetector" in window) {
        try {
          const img = document.getElementById("img");
          const barcodes = await barcodeDetector.detect(img);
          barcodes.forEach((barcodes) => {
            setCode(JSON.stringify(barcodes));
          });
        } catch (e) {
          setCode("not found");
        }
      }
    };

    detector();
  }, [imageSrc]);

  useEffect(() => {
    setInterval(capture, 1000);
  }, [capture]);
  console.log({ message });
  return (
    <div className="App">
      <input type="range"></input>
      <select
        name="camera"
        id="camera"
        onChange={(value) => {
          setDeviceId(value.target.value);
        }}
      >
        <option value={""}>select</option>
        {devices.map((device, key) => (
          <option value={device.deviceId}>{device.deviceId}</option>
        ))}
      </select>

      <input
        id="zoom-slider"
        min="0"
        max="0"
        name="zoom"
        title="Zoom"
        type="range"
        hidden
      />
      <output id="zoom-slider-value"></output>

      {deviceId && (
        <Webcam
          width={300}
          height={300}
          ref={webcamRef}
          screenshotFormat="image/png"
          videoConstraints={{ deviceId }}
          onUserMedia={(mediaStream) => {
            const [track] = mediaStream.getVideoTracks();
            const capabilities = track.getCapabilities();
            const settings = track.getSettings();

            const zoomSlider = document.getElementById("zoom-slider");
            const zoomSliderValue =
              document.getElementById("zoom-slider-value");

            if (!("zoom" in settings)) {
              setMessage((message) => {
                return (
                  message + "Zoom is not supported by " + track.label + "\n"
                );
              });
              console.warn("Zoom is not supported by " + track.label);
            } else {
              // Map zoom to a slider element.
              zoomSlider.min = capabilities.zoom.min;
              zoomSlider.max = capabilities.zoom.max;
              zoomSlider.step = capabilities.zoom.step;
              zoomSlider.value = settings.zoom;
              zoomSlider.oninput = (event) => {
                zoomSliderValue.value = zoomSlider.value;
                track.applyConstraints({
                  advanced: [{ zoom: event.target.value }],
                });
              };
              zoomSlider.parentElement.hidden = false;
            }

            if (!("focusMode" in settings)) {
              setMessage((message) => {
                return (
                  message +
                  "FocusMode is not supported by " +
                  track.label +
                  "\n"
                );
              });
              console.warn("FocusMode is not supported by " + track.label);
            } else {
              track.applyConstraints({
                focusMode: "continuous",
              });
            }
          }}
        />
      )}

      <img id="img" src={imageSrc} hidden />
      {code}
      <textarea>{message}</textarea>
    </div>
  );
}

export default App;
