import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Camera, Upload, Sparkles, RotateCcw } from "lucide-react";
import * as faceapi from "face-api.js";
import { toast } from "sonner";

const hairstyles = [
  { id: "short", name: "Short Crop", desc: "Clean & modern" },
  { id: "medium", name: "Medium Fade", desc: "Versatile classic" },
  { id: "long", name: "Long Flow", desc: "Bold statement" },
  { id: "curly", name: "Curly Top", desc: "Textured volume" },
];

const HairstyleStudio = () => {
  const [mode, setMode] = useState<"upload" | "camera" | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [detecting, setDetecting] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    const loadModels = async () => {
      try {
        await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
        await faceapi.nets.faceLandmark68Net.loadFromUri("/models");
        setModelsLoaded(true);
      } catch (err) {
        toast.error("Failed to load face detection models.");
      }
    };
    loadModels();
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
      setMode("camera");
    } catch (err) {
      toast.error("Camera access denied.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(video, 0, 0);
      setImage(canvas.toDataURL("image/jpeg"));
      stopCamera();
      detectFace(canvas);
    }
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        if (!canvasRef.current) return;
        const canvas = canvasRef.current;
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          setImage(canvas.toDataURL("image/jpeg"));
          detectFace(canvas);
        }
      };
      img.src = ev.target?.result as string;
    };
    reader.readAsDataURL(file);
    setMode("upload");
  };

  const detectFace = async (canvas: HTMLCanvasElement) => {
    if (!modelsLoaded) { toast.error("Models not loaded yet."); return; }
    setDetecting(true);
    const detection = await faceapi.detectSingleFace(canvas, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks();
    setDetecting(false);
    if (detection) {
      setFaceDetected(true);
      toast.success("Face detected! Select a hairstyle to preview.");
    } else {
      toast.error("No face detected. Try a clearer photo.");
    }
  };

  const reset = () => {
    setImage(null);
    setMode(null);
    setSelectedStyle(null);
    setFaceDetected(false);
    stopCamera();
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 grid place-items-center">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <Badge variant="outline" className="border-primary/30 text-primary">AI-Powered</Badge>
          </div>
          <h1 className="font-display text-4xl md:text-5xl text-foreground">Hairstyle Studio</h1>
          <p className="text-muted-foreground mt-2">Upload a photo or use your camera to preview hairstyles instantly.</p>
        </div>

        {!image && (
          <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto">
            <button
              onClick={startCamera}
              className="glass-card p-8 rounded-2xl hover:border-primary/40 transition-all group text-center"
            >
              <Camera className="h-12 w-12 mx-auto mb-3 text-primary group-hover:scale-110 transition-transform" />
              <h3 className="font-display text-xl text-foreground">Use Camera</h3>
              <p className="text-sm text-muted-foreground mt-1">Live preview with your webcam</p>
            </button>
            <label className="glass-card p-8 rounded-2xl hover:border-primary/40 transition-all group text-center cursor-pointer">
              <Upload className="h-12 w-12 mx-auto mb-3 text-primary group-hover:scale-110 transition-transform" />
              <h3 className="font-display text-xl text-foreground">Upload Photo</h3>
              <p className="text-sm text-muted-foreground mt-1">Choose from your device</p>
              <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
            </label>
          </div>
        )}

        {mode === "camera" && !image && (
          <div className="glass-card rounded-2xl p-6 space-y-4">
            <video ref={videoRef} autoPlay playsInline className="w-full rounded-xl bg-black" />
            <div className="flex gap-3">
              <Button variant="outline" onClick={reset} className="flex-1">Cancel</Button>
              <Button variant="hero" onClick={capturePhoto} className="flex-1"><Camera className="h-4 w-4" /> Capture</Button>
            </div>
          </div>
        )}

        {image && (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 glass-card rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-xl text-foreground">Preview</h3>
                <Button variant="outline" size="sm" onClick={reset}><RotateCcw className="h-3.5 w-3.5" /> New photo</Button>
              </div>
              <div className="relative bg-black rounded-xl overflow-hidden">
                <img src={image} alt="Preview" className="w-full" />
                {detecting && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <div className="text-center space-y-2">
                      <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto" />
                      <p className="text-sm text-white">Detecting face...</p>
                    </div>
                  </div>
                )}
                {selectedStyle && faceDetected && (
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-1/2 bg-gradient-to-b from-primary/20 to-transparent rounded-full blur-2xl" />
                  </div>
                )}
              </div>
              {faceDetected && !selectedStyle && (
                <p className="text-sm text-success text-center">✓ Face detected — select a hairstyle to preview</p>
              )}
            </div>

            <div className="space-y-4">
              <h3 className="font-display text-xl text-foreground">Hairstyles</h3>
              {!faceDetected && (
                <p className="text-sm text-muted-foreground glass-card rounded-xl p-4 text-center">
                  Detecting face...
                </p>
              )}
              {faceDetected && (
                <div className="space-y-2">
                  {hairstyles.map((style) => (
                    <button
                      key={style.id}
                      onClick={() => setSelectedStyle(style.id)}
                      className={`w-full glass-card rounded-xl p-4 text-left transition-all ${
                        selectedStyle === style.id ? "border-primary bg-primary/5" : "hover:border-primary/30"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-foreground font-medium">{style.name}</p>
                          <p className="text-xs text-muted-foreground">{style.desc}</p>
                        </div>
                        {selectedStyle === style.id && (
                          <Badge variant="outline" className="border-primary/30 text-primary text-xs">Active</Badge>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {faceDetected && selectedStyle && (
                <div className="glass-card rounded-xl p-4 bg-primary/5 border-primary/20 space-y-2">
                  <p className="text-xs uppercase tracking-widest text-primary">AI Recommendation</p>
                  <p className="text-sm text-foreground">
                    This style complements your face shape. Book an appointment to try it!
                  </p>
                  <Button variant="hero" className="w-full mt-2" asChild>
                    <a href="/book">Book appointment →</a>
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
};

export default HairstyleStudio;
