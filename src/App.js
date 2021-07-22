import {useRef,useCallback,useEffect,useState} from 'react'
import Webcam from 'react-webcam';


if (!('BarcodeDetector' in window)) {
  console.log(
    'Barcode Detector is not supported by this browser.'
  );
}
else {
  console.log('supported')
}

const barcodeDetector = new window.BarcodeDetector({
  formats: ['code_39', 'code_128', 'ean_8', 'ean_13', 'upc_a', 'upc_e']
});

function App() {
  const webcamRef = useRef(null)
  const [imageSrc, setImageSrc] = useState('')
  const [code, setCode] = useState('')

  const capture = useCallback(
    () => {
      setImageSrc(webcamRef?.current?.getScreenshot())
    },
    [webcamRef],
  )

  useEffect(() => {
    const detector = async () => {
      if ('BarcodeDetector' in window) {
        try {
          const img = document.getElementById('img')
          const barcodes = await barcodeDetector.detect(img);
          barcodes.forEach(barcodes => {
            setCode(JSON.stringify(barcodes))
          });
        } catch (e) {
          setCode('not found');
        }
      }
    }

    detector()
  }, [imageSrc])

  useEffect(() => {
    setInterval(capture, 1000);
  }, [capture]);



  return (
    <div className="App">
    <input type="range"></input>
      <Webcam
          width={300}
          height={300}
          ref={webcamRef}
          screenshotFormat="image/png"
          videoConstraints={{
            exact: "environment"
          }}
          onUserMedia={(mediaStream) => {
            const [track] = mediaStream.getVideoTracks();
            const capabilities = track.getCapabilities();
            const settings = track.getSettings();

            if (!('zoom' in settings)) {
              return Promise.reject('Zoom is not supported by ' + track.label);
            }

            const input = document.querySelector('input[type="range"]');
            // Map zoom to a slider element.
            input.min = capabilities?.zoom?.min || 1;
            input.max = capabilities?.zoom?.max || 100;
            input.step = capabilities.zoom.step;
            input.value = settings.zoom;
            input.oninput = function(event) {
              track.applyConstraints({advanced: [ {zoom: event.target.value} ]});
            }
          }}
      />
      <img id="img" src={imageSrc} />
      {code}
    </div>
  );
}

export default App;
