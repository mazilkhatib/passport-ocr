import {useCallback, useEffect, useState, FC} from 'react';
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert";
import {AlertCircle, Camera, CheckCircle, Upload, Wifi, X} from "lucide-react";
import {useDropzone} from 'react-dropzone';
import {PassportData} from "@/types/passportData.ts";
import {PassportInformation} from "@/components/PassportInformation.tsx";
import {PlaceholderContent} from "@/components/PlaceHolderContent.tsx";
import {LoadingSkeleton} from "@/components/LoadingSkeleton.tsx";

const PassportScanner: FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [passportData, setPassportData] = useState<PassportData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [showCamera, setShowCamera] = useState<boolean>(false);
    const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
    const [isMobile, setIsMobile] = useState<boolean>(false);
    const [isOnline, setIsOnline] = useState<boolean>(true);

    // Check if device is mobile and monitor online status
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
        };

        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        checkMobile();
        window.addEventListener('resize', checkMobile);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('resize', checkMobile);
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const selectedFile = acceptedFiles[0];
        handleFileSelection(selectedFile);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': [] },
        multiple: false
    });

    const handleFileSelection = (selectedFile: File) => {
        if (selectedFile) {
            setFile(selectedFile);
            setPreviewUrl(URL.createObjectURL(selectedFile));
            setError(null);
            setPassportData(null);
        }
    };

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }
            });
            setVideoStream(stream);
            setShowCamera(true);
        } catch (err) {
            setError('Failed to access camera. Please ensure camera permissions are granted.');
        }
    };

    const stopCamera = () => {
        if (videoStream) {
            videoStream.getTracks().forEach(track => track.stop());
            setVideoStream(null);
        }
        setShowCamera(false);
    };

    const captureImage = () => {
        const video = document.querySelector('video');
        const canvas = document.createElement('canvas');
        if (video) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            canvas.getContext('2d')?.drawImage(video, 0, 0);
            canvas.toBlob((blob) => {
                if (blob) {
                    const file = new File([blob], 'passport-capture.jpg', { type: 'image/jpeg' });
                    handleFileSelection(file);
                    stopCamera();
                }
            }, 'image/jpeg');
        }
    };

    const handleSubmit = async () => {
        if (!file) {
            setError("Please select or capture a passport image");
            return;
        }

        if (!isOnline) {
            setError("No internet connection. Please check your connection and try again.");
            return;
        }

        setLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch(`${import.meta.env.VITE_API_ENDPOINT}/api/extract-passport`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Failed to process passport data');
            }

            const data = await response.json();
            setPassportData(data);
        } catch (err) {
            if (!isOnline) {
                setError("Lost internet connection. Please check your connection and try again.");
            } else if (err instanceof TypeError && err.message === 'Failed to fetch') {
                setError("Unable to connect to the server. try again later.");
            } else {
                setError("An error occurred while processing the passport. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    const NetworkStatus = () => (
        !isOnline && (
            <Alert variant="destructive" className="mb-4">
                <Wifi className="h-4 w-4" />
                <AlertTitle>No Internet Connection</AlertTitle>
                <AlertDescription>
                    Please check your internet connection to use the passport scanner.
                </AlertDescription>
            </Alert>
        )
    );

    return (
        <div className="container mx-auto p-4">
            <NetworkStatus />
            <div className="grid lg:grid-cols-2 gap-6">
                {/* Left Column - Scanner */}
                <Card>
                    <CardHeader>
                        <CardTitle>Passport Scanner</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {/* File Upload Section */}
                            {!showCamera && (
                                <div
                                    {...getRootProps()}
                                    className={`
                                        border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
                                        transition-colors duration-200
                                        ${isDragActive ? 'border-primary bg-primary/10' : 'border-gray-300'}
                                        ${!isOnline ? 'opacity-50 pointer-events-none' : ''}
                                    `}
                                >
                                    <input {...getInputProps()} />
                                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                    <p className="mt-2">Drag & drop a passport image here, or click to select</p>
                                </div>
                            )}

                            {/* Camera Section */}
                            {!previewUrl && (
                                <div className="flex justify-center">
                                    <Button
                                        variant="outline"
                                        onClick={showCamera ? stopCamera : startCamera}
                                        className="mt-4"
                                        disabled={!isOnline}
                                    >
                                        <Camera className="mr-2 h-4 w-4" />
                                        {showCamera ? 'Stop Camera' : 'Use Camera'}
                                    </Button>
                                </div>
                            )}

                            {/* Camera View */}
                            {showCamera && (
                                <div className="relative">
                                    <video
                                        autoPlay
                                        playsInline
                                        ref={video => {
                                            if (video && videoStream) {
                                                video.srcObject = videoStream;
                                            }
                                        }}
                                        className="w-full rounded-lg"
                                    />
                                    <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-4">
                                        <Button onClick={captureImage}>
                                            <Camera className="mr-2 h-4 w-4" />
                                            Capture
                                        </Button>
                                        {!isMobile && (
                                            <Button variant="outline" onClick={stopCamera}>
                                                <X className="mr-2 h-4 w-4" />
                                                Cancel
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Preview Section */}
                            {previewUrl && (
                                <div className="mt-4 relative">
                                    <img
                                        src={previewUrl}
                                        alt="Passport preview"
                                        className="w-full rounded-lg border"
                                    />
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="absolute top-2 right-2"
                                        onClick={() => {
                                            setFile(null);
                                            setPreviewUrl(null);
                                        }}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}

                            {/* Submit Button */}
                            {previewUrl && (
                                <Button
                                    onClick={handleSubmit}
                                    disabled={!file || loading || !isOnline}
                                    className="w-full"
                                >
                                    {loading ? (
                                        "Processing..."
                                    ) : (
                                        <>
                                            <Upload className="mr-2 h-4 w-4" />
                                            Extract Information
                                        </>
                                    )}
                                </Button>
                            )}

                            {/* Error Display */}
                            {error && (
                                <Alert variant="destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertTitle>Error</AlertTitle>
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Right Column - Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            {loading && "Processing..."}
                            {passportData && (
                                <>
                                    <CheckCircle className="h-5 w-5 text-green-500" />
                                    Extracted Information
                                </>
                            )}
                            {!loading && !passportData && "Passport Information"}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading && <LoadingSkeleton />}
                        {passportData && <PassportInformation passportData={passportData} />}
                        {!loading && !passportData && <PlaceholderContent />}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default PassportScanner;