import {useRef} from 'react'
import Webcam from 'react-webcam';

function App() {
  const webcamRef = useRef()
  const imageSrc = webcamRef?.current?.getScreenshot();
  const img = document.createElement('img');
  img.src = imageSrc
  if (!('BarcodeDetector' in window)) {
      console.log(
          'Barcode Detector is not supported by this browser.'
      );
  } else {
      // create new detector
      var barcodeDetector = new window.BarcodeDetector({
          formats: ['code_39', 'codabar', 'ean_13']
      });

      barcodeDetector
          .detect(img)
          .then(barcodes => {
              console.log({barcodes})
          })
          .catch(err => {
              console.log({err})
          });
  }

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
      

    </div>
  );
}

export default App;
