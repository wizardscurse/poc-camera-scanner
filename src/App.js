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
          console.error('Barcode detection failed:', e);
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
      <Webcam
          width={300}
          height={300}
          ref={webcamRef}
          screenshotFormat="image/png"
          videoConstraints={{
              facingMode: 'environment'
          }}
      />
      <img id="img" src={imageSrc} />
      {code}
    </div>
  );
}

export default App;
