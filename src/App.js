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

const streamVideo = () => {

  navigator.mediaDevices.getUserMedia({video: { pan: true, tilt: true, zoom: true }}).then(mediaStream => {
    document.querySelector('video').srcObject = mediaStream;
    const [track] = mediaStream.getVideoTracks();
    const capabilities = track.getCapabilities();
    const settings = track.getSettings();
  
    if (!('zoom' in settings)) {
      return Promise.reject('Zoom is not supported by ' + track.label);
    }

    const input = document.querySelector('input[type="range"]');
    console.log({input})
    console.log({capabilities})
    // Map zoom to a slider element.
    input.min = capabilities?.zoom?.min || 1;
    input.max = capabilities?.zoom?.max || 100;
    input.step = capabilities.zoom.step;
    input.value = settings.zoom;
    input.oninput = function(event) {
      track.applyConstraints({advanced: [ {zoom: event.target.value} ]});
    }
    // input.hidden = false;

    

    // track.applyConstraints({advanced: [ {zoom: 100} ]});
  })

  
  // try {
  //   // User is prompted to grant both camera and PTZ access in a single call.
  //   // If camera doesn't support PTZ, it falls back to a regular camera prompt.
  //   const stream = await navigator.mediaDevices.getUserMedia({
  //     // Website asks to control camera PTZ as well without altering the
  //     // current pan, tilt, and zoom settings.
  //     video: { pan: true, tilt: true, zoom: true }
  //   });
  //   console.log({stream})
  //   // Show camera video stream to user.
  //   document.querySelector('#video').srcObject = stream;

  // } catch (error) {
  //   // User denies prompt or matching media is not available.
  //   console.log(error);
  // }
}
streamVideo()


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
          onUserMedia={(props) => {
            console.log(props)
          }}
      />
      <img id="img" src={imageSrc} />
      <input type="range"></input>
      {code}
    </div>
  );
}

export default App;
