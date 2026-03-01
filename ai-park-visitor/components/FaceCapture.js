"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { Camera, RefreshCw, CheckCircle, X, ShieldCheck, Upload, AlertCircle, Info } from "lucide-react";

/**
 * Stripped-down, ultra-resilient FaceCapture component
 */
export default function FaceCapture({ onCapture, onClear, capturedImage, onCaptureLandmarks }) {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);
    const fileInputRef = useRef(null);
    const intervalRef = useRef(null);

    const [cameraActive, setCameraActive] = useState(false);
    const [permissionDenied, setPermissionDenied] = useState(false);
    const [countdown, setCountdown] = useState(null);
    const [error, setError] = useState("");
    const [diagnostic, setDiagnostic] = useState("");

    // Face mesh states
    const overlayRef = useRef(null);
    const requestRef = useRef(null);
    const [landmarker, setLandmarker] = useState(null);
    const [isModelLoading, setIsModelLoading] = useState(true);

    // Diagnostic check on load
    useEffect(() => {
        if (typeof window !== "undefined") {
            const isSecure = window.isSecureContext;
            const hasMedia = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
            console.log(`[FaceCapture] Diagnostic: SecureContext=${isSecure}, MediaDevices=${hasMedia}`);
            if (!isSecure && window.location.hostname !== "localhost") {
                setDiagnostic("⚠️ Non-secure context: Browsers block camera access unless using HTTPS or localhost.");
            }
        }
    }, []);

    // Load FaceLandmarker Model
    useEffect(() => {
        let isMounted = true;
        async function loadModel() {
            try {
                const { FaceLandmarker, FilesetResolver } = await import("@mediapipe/tasks-vision");
                const vision = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm");
                const lm = await FaceLandmarker.createFromOptions(vision, {
                    baseOptions: {
                        modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
                        delegate: "GPU"
                    },
                    outputFaceBlendshapes: false,
                    runningMode: "VIDEO",
                    numFaces: 1
                });
                if (isMounted) {
                    setLandmarker(lm);
                    setIsModelLoading(false);
                    console.log("[FaceCapture] FaceLandmarker loaded");
                }
            } catch (e) {
                console.error("[FaceCapture] Failed to load FaceLandmarker", e);
                if (isMounted) {
                    setIsModelLoading(false);
                    setError("Facemesh model failed to load. Basic capture will be used.");
                }
            }
        }
        loadModel();
        return () => { isMounted = false; };
    }, []);

    // Store the last detected landmarks for exporting on capture
    const lastLandmarksRef = useRef(null);

    // Render loop for FaceLandmarker
    const renderLoop = useCallback(() => {
        if (!videoRef.current || !overlayRef.current || !landmarker || !cameraActive) return;

        const video = videoRef.current;
        const canvas = overlayRef.current;
        const ctx = canvas.getContext("2d");

        if (video.readyState >= 2) {
            // Match canvas size to video internal size
            if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
            }

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const startTimeMs = performance.now();
            if (video.currentTime > 0) {
                const results = landmarker.detectForVideo(video, startTimeMs);
                if (results.faceLandmarks && results.faceLandmarks.length > 0) {
                    // Save latest landmarks for capture
                    lastLandmarksRef.current = results.faceLandmarks[0];
                    for (const landmarks of results.faceLandmarks) {
                        ctx.fillStyle = "rgba(56, 189, 248, 0.8)"; // sky-blue
                        for (const point of landmarks) {
                            ctx.beginPath();
                            ctx.arc(point.x * canvas.width, point.y * canvas.height, 1.2, 0, 2 * Math.PI);
                            ctx.fill();
                        }
                    }
                }
            }
        }
        requestRef.current = requestAnimationFrame(renderLoop);
    }, [landmarker, cameraActive]);

    useEffect(() => {
        if (cameraActive && landmarker) {
            requestRef.current = requestAnimationFrame(renderLoop);
        }
        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [cameraActive, landmarker, renderLoop]);

    const startCamera = useCallback(async () => {
        console.log("[FaceCapture] startCamera() called");
        setError("");
        setPermissionDenied(false);
        setCameraActive(false);

        try {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error("Camera API not available in this browser environment.");
            }

            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
                audio: false,
            });

            console.log("[FaceCapture] MediaStream acquired:", stream.id);
            streamRef.current = stream;
            setCameraActive(true);

            // Give React a moment to render the video element, then link it
            setTimeout(() => {
                if (videoRef.current) {
                    console.log("[FaceCapture] Linking stream to <video>");
                    videoRef.current.srcObject = stream;
                    videoRef.current.play().catch(e => {
                        console.warn("[FaceCapture] Auto-play failed, requiring user click", e);
                        setError("Tap the black box or 'Start Camera' again if video doesn't appear.");
                    });
                }
            }, 100);

        } catch (err) {
            console.error("[FaceCapture] Error:", err.name, err.message);
            if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
                setPermissionDenied(true);
            } else {
                setError(err.message || "Could not start camera.");
            }
        }
    }, []);

    const stopCamera = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(t => {
                console.log("[FaceCapture] Stopping track:", t.label);
                t.stop();
            });
            streamRef.current = null;
        }
        setCameraActive(false);
    }, []);

    useEffect(() => {
        return () => {
            stopCamera();
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [stopCamera]);

    const handleCapture = () => {
        if (countdown !== null) return;
        let count = 3;
        setCountdown(count);
        intervalRef.current = setInterval(() => {
            count -= 1;
            if (count === 0) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
                setCountdown(null);
                takePhoto();
            } else {
                setCountdown(count);
            }
        }, 1000);
    };

    const takePhoto = () => {
        const video = videoRef.current;
        const mainCanvas = canvasRef.current;
        if (!video || !mainCanvas) {
            console.error("[FaceCapture] Capture failed: ref missing");
            return;
        }

        const w = video.videoWidth || 640;
        const h = video.videoHeight || 480;
        mainCanvas.width = w;
        mainCanvas.height = h;

        console.log(`[FaceCapture] Drawing to canvas: ${w}x${h}`);
        const ctx = mainCanvas.getContext("2d");
        ctx.translate(w, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0, w, h);

        const dataUrl = mainCanvas.toDataURL("image/jpeg", 0.9);
        onCapture(dataUrl);

        // Pass landmark vector to parent for biometric storage
        if (onCaptureLandmarks && lastLandmarksRef.current) {
            onCaptureLandmarks(lastLandmarksRef.current);
        }

        stopCamera();
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => onCapture(ev.target.result);
        reader.readAsDataURL(file);
    };

    // ─── RENDER ───
    return (
        <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-sky-50 rounded-lg text-sky-600">
                    <ShieldCheck size={24} />
                </div>
                <div>
                    <h3 className="font-bold text-gray-800">Identity Verification</h3>
                    <p className="text-xs text-gray-500">Capture or upload your photo for entry</p>
                </div>
            </div>

            <canvas ref={canvasRef} className="hidden" />
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />

            <div className="relative bg-gray-900 rounded-2xl overflow-hidden min-h-[320px] flex items-center justify-center">
                {capturedImage ? (
                    <div className="flex flex-col items-center gap-4 p-6 bg-white w-full h-full absolute inset-0">
                        <img src={capturedImage} className="w-48 h-48 rounded-full object-cover border-4 border-sky-400 shadow-md" alt="Captured" />
                        <p className="text-sky-600 font-bold flex items-center gap-2 mt-2">
                            <CheckCircle size={20} /> Ready to go!
                        </p>
                        <button type="button" onClick={() => { onClear(); startCamera(); }} className="mt-2 flex items-center gap-2 text-gray-500 text-sm font-semibold border-b border-dashed border-gray-300">
                            <RefreshCw size={14} /> Retake Photo
                        </button>
                    </div>
                ) : !cameraActive ? (
                    <div className="text-center p-8 space-y-6">
                        {diagnostic && <p className="text-amber-400 text-xs bg-amber-950/40 p-3 rounded-lg border border-amber-900/50">{diagnostic}</p>}

                        {(permissionDenied || error) ? (
                            <div className="space-y-4">
                                <div className="text-red-400 flex flex-col items-center gap-2">
                                    <AlertCircle size={48} />
                                    <p className="font-bold">{error || "Camera Permission Denied"}</p>
                                </div>
                                <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full bg-white text-gray-900 py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg">
                                    <Upload size={18} /> Upload Manually
                                </button>
                                <button type="button" onClick={startCamera} className="text-sky-400 text-sm font-semibold hover:underline">
                                    Try Camera Again
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto border border-white/10">
                                    <Camera size={40} className="text-white/20" />
                                </div>
                                <div className="flex flex-col gap-3">
                                    <button type="button" onClick={startCamera} className="bg-sky-500 hover:bg-sky-400 text-white py-4 px-8 rounded-2xl font-bold shadow-xl transition-all transform hover:scale-105 flex items-center justify-center gap-2">
                                        <Camera size={22} /> Open Real-time Camera
                                    </button>
                                    <button type="button" onClick={() => fileInputRef.current?.click()} className="text-white/60 hover:text-white text-sm font-medium flex items-center justify-center gap-2">
                                        <Upload size={16} /> or upload from gallery
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="w-full h-full absolute inset-0 bg-black flex flex-col items-center">
                        {/* Video Element */}
                        <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" style={{ transform: "scaleX(-1)" }} />

                        {/* Facemesh Overlay Canvas */}
                        <canvas ref={overlayRef} className="absolute inset-0 w-full h-full object-cover pointer-events-none" style={{ transform: "scaleX(-1)" }} />

                        {/* Overlays */}
                        <div className="absolute inset-0 pointer-events-none border-[40px] border-black/40 flex items-center justify-center">
                            <div className="w-full h-full rounded-full border-2 border-white/30" />
                        </div>

                        {/* Model Loading indicator overlay */}
                        {isModelLoading && (
                            <div className="absolute top-4 right-4 bg-black/60 text-white text-xs font-bold px-3 py-1 rounded-full border border-sky-400">
                                ⏳ Initializing Facemesh AI...
                            </div>
                        )}

                        {countdown !== null && (
                            <div className="absolute inset-0 flex items-center justify-center bg-sky-blue/20 pointer-events-none">
                                <span className="text-white text-[12rem] font-black drop-shadow-2xl font-fun animate-bounce">{countdown}</span>
                            </div>
                        )}

                        {/* Controls */}
                        <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-4 px-6 z-10">
                            <button type="button" onClick={handleCapture} disabled={countdown !== null} className="flex-1 bg-coral-orange hover:bg-orange-500 disabled:bg-gray-600 text-white h-16 rounded-2xl font-black text-lg uppercase tracking-widest shadow-2xl transition-all border border-orange-400">
                                {countdown ? "HOLD STEADY..." : "CAPTURE NOW"}
                            </button>
                            <button type="button" onClick={stopCamera} className="w-16 h-16 bg-white border border-white/20 hover:bg-gray-200 text-gray-900 rounded-2xl flex items-center justify-center shadow-lg transition-all">
                                <X size={24} strokeWidth={3} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <div className="mt-4 flex items-center gap-2 text-gray-400 text-[10px] leading-tight font-medium bg-gray-50 p-3 rounded-xl border border-gray-100">
                <Info size={14} className="text-sky-blue" />
                <p>We use AI to map your face for secure, frictionless ticket entry! Your data stays on your device.</p>
            </div>
        </div>
    );
}
