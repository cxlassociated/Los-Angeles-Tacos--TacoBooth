import React, { useState, useRef, useEffect, useCallback } from 'react';
import { AppStep, UserData } from './types';
import { Button } from './components/Button';
import { processImageWithTemplate } from './services/imageService';

// Icons
const CameraIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
  </svg>
);

const RefreshIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
  </svg>
);

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
);

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>(AppStep.START);
  const [countdown, setCountdown] = useState<number>(3);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [finalImage, setFinalImage] = useState<string | null>(null);
  const [form, setForm] = useState<UserData>({ instagram: '', email: '' });
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // --- Handlers ---

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 1080 },
          height: { ideal: 1920 }
        },
        audio: false
      });
      streamRef.current = stream;
      setStep(AppStep.CAMERA);
    } catch (err) {
      console.error("Camera error:", err);
      alert("Please allow camera access to use the photo booth.");
    }
  };

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  const takePhoto = () => {
    setStep(AppStep.CAMERA); // Ensure UI stays on camera
    let count = 3;
    setCountdown(count);

    const timer = setInterval(() => {
      count--;
      if (count > 0) {
        setCountdown(count);
      } else {
        clearInterval(timer);
        captureFrame();
      }
    }, 1000);
  };

  const captureFrame = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      
      // Mirror the image horizontally to act like a mirror
      if (ctx) {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 1.0);
        setCapturedImage(dataUrl);
        setStep(AppStep.PREVIEW);
      }
    }
  };

  const retake = () => {
    setCapturedImage(null);
    setStep(AppStep.CAMERA);
  };

  const approvePhoto = async () => {
    if (!capturedImage) return;
    setStep(AppStep.PROCESSING);
    stopCamera();
    try {
      const processed = await processImageWithTemplate(capturedImage);
      setFinalImage(processed);
      setStep(AppStep.RESULT);
    } catch (err) {
      console.error(err);
      alert("Failed to process image.");
      setStep(AppStep.PREVIEW);
    }
  };

  const submitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.instagram) {
      alert("Please fill in all fields");
      return;
    }
    // Simulate API call
    console.log("Submitting:", form, "Image Length:", finalImage?.length);
    setStep(AppStep.FINISH);
  };

  const resetApp = () => {
    setCapturedImage(null);
    setFinalImage(null);
    setForm({ instagram: '', email: '' });
    setStep(AppStep.START);
  };

  // --- Effects ---

  useEffect(() => {
    if (step === AppStep.CAMERA && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [step]);

  // Clean up on unmount
  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  // --- Render Steps ---

  const renderStart = () => (
    <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-gradient-to-br from-yellow-500 to-red-600 animate-fade-in">
      <div className="bg-white/20 backdrop-blur-md p-12 rounded-3xl shadow-2xl border border-white/30 max-w-2xl w-full">
        <div className="text-8xl mb-6">🌮</div>
        <h1 className="text-6xl font-black mb-4 text-white drop-shadow-md">Taco Booth</h1>
        <p className="text-2xl mb-12 text-white/90 font-medium">Grab a taco, strike a pose, and get your custom photo!</p>
        <Button onClick={startCamera} size="xl" className="shadow-xl ring-4 ring-yellow-400/50">
          Start Experience
        </Button>
      </div>
    </div>
  );

  const renderCamera = () => (
    <div className="relative h-full w-full bg-black">
      {/* Video Feed */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="h-full w-full object-cover transform -scale-x-100"
      />
      
      {/* Overlay Frame Guide */}
      <div className="absolute inset-0 pointer-events-none border-[20px] border-white/10 flex items-center justify-center">
        <div className="w-3/4 h-3/4 border-4 border-dashed border-white/40 rounded-3xl flex items-end justify-center pb-10">
           <p className="text-white/60 font-bold text-2xl uppercase tracking-widest bg-black/20 px-4 py-2 rounded">Pose Here</p>
        </div>
      </div>

      {/* Countdown Overlay */}
      {countdown < 3 && (
        <div className="absolute inset-0 flex items-center justify-center z-50 bg-black/20 backdrop-blur-sm">
           <span className="text-[12rem] font-black text-white animate-ping">{countdown}</span>
        </div>
      )}

      {/* Controls */}
      <div className="absolute bottom-12 left-0 right-0 flex justify-center z-40">
        <button 
           onClick={takePhoto}
           disabled={countdown < 3}
           className="w-24 h-24 bg-white rounded-full border-8 border-gray-300 shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
        >
          <CameraIcon />
        </button>
      </div>
    </div>
  );

  const renderPreview = () => (
    <div className="h-full flex flex-col bg-gray-900 p-6">
       <div className="flex-1 flex items-center justify-center relative overflow-hidden rounded-2xl bg-black">
         {capturedImage && (
            <img src={capturedImage} alt="Preview" className="h-full w-full object-contain" />
         )}
       </div>
       <div className="h-32 flex items-center justify-center gap-8 mt-6">
         <Button onClick={retake} variant="secondary" size="lg" className="flex items-center gap-2">
           <RefreshIcon /> Retake
         </Button>
         <Button onClick={approvePhoto} variant="primary" size="lg" className="flex items-center gap-2 px-12">
            Looks Great! <CheckIcon />
         </Button>
       </div>
    </div>
  );

  const renderProcessing = () => (
    <div className="h-full flex flex-col items-center justify-center bg-gray-900">
      <div className="animate-spin text-8xl mb-8">🌮</div>
      <h2 className="text-3xl font-bold text-white">Cooking up your photo...</h2>
    </div>
  );

  const renderResult = () => (
    <div className="h-full flex flex-col bg-gray-800">
      <div className="flex-1 p-8 flex items-center justify-center">
        {finalImage && (
          <img src={finalImage} alt="Final" className="max-h-full shadow-2xl rounded-lg border-8 border-white transform rotate-1" />
        )}
      </div>
      <div className="p-8 bg-gray-900 flex justify-center">
        <Button onClick={() => setStep(AppStep.FORM)} size="xl" variant="primary">
          Get My Photo
        </Button>
      </div>
    </div>
  );

  const renderForm = () => (
    <div className="h-full flex flex-col items-center justify-center bg-gray-900 p-8">
      <div className="bg-gray-800 p-10 rounded-3xl shadow-2xl max-w-lg w-full border border-gray-700">
        <h2 className="text-3xl font-bold mb-6 text-white text-center">Where should we send it?</h2>
        <form onSubmit={submitForm} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Instagram Handle</label>
            <div className="relative">
              <span className="absolute left-4 top-4 text-gray-500 text-lg">@</span>
              <input
                type="text"
                value={form.instagram}
                onChange={(e) => setForm({...form, instagram: e.target.value})}
                className="w-full bg-gray-700 text-white text-lg py-3 pl-10 pr-4 rounded-xl border border-gray-600 focus:ring-2 focus:ring-yellow-500 outline-none placeholder-gray-500"
                placeholder="tacalover99"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Email Address</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({...form, email: e.target.value})}
              className="w-full bg-gray-700 text-white text-lg py-3 px-4 rounded-xl border border-gray-600 focus:ring-2 focus:ring-yellow-500 outline-none placeholder-gray-500"
              placeholder="you@example.com"
            />
          </div>
          <div className="pt-4">
            <Button type="submit" fullWidth size="lg">Send It!</Button>
          </div>
        </form>
      </div>
    </div>
  );

  const renderFinish = () => (
    <div className="h-full flex flex-col items-center justify-center bg-green-600 text-center p-8">
      <div className="bg-white/20 backdrop-blur-md p-16 rounded-full mb-8">
        <CheckIcon /> {/* We reuse icon but scale it via CSS if needed, or just standard text/emoji */}
        <div className="text-9xl">✅</div>
      </div>
      <h2 className="text-5xl font-black text-white mb-4">Sent!</h2>
      <p className="text-2xl text-white/90 mb-12">Check your inbox and tag us!</p>
      <Button onClick={resetApp} variant="secondary" size="lg">
        New Photo
      </Button>
    </div>
  );

  return (
    <div className="h-screen w-full overflow-hidden font-sans">
      {step === AppStep.START && renderStart()}
      {step === AppStep.CAMERA && renderCamera()}
      {step === AppStep.PREVIEW && renderPreview()}
      {step === AppStep.PROCESSING && renderProcessing()}
      {step === AppStep.RESULT && renderResult()}
      {step === AppStep.FORM && renderForm()}
      {step === AppStep.FINISH && renderFinish()}
    </div>
  );
};

export default App;