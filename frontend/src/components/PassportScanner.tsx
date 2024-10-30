import { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Upload, Camera, CheckCircle, AlertCircle, X, Scan } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useDropzone } from 'react-dropzone';

interface PassportData {
    passport_number: string;
    full_name: string;
    date_of_birth: string;
    date_of_issue: string;
    date_of_expiry: string;
    nationality: string;
    gender: string;
}

const PassportScanner: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [passportData, setPassportData] = useState<PassportData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [showCamera, setShowCamera] = useState<boolean>(false);
    const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
    const [isMobile, setIsMobile] = useState<boolean>(false);

    // Check if device is mobile
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Auto-start camera on mobile
    useEffect(() => {
        if (isMobile && !file && !videoStream) {
            startCamera();
        }
    }, [isMobile, file, videoStream]);

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
                video: { facingMode: isMobile ? 'environment' : 'user' }
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
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to extract passport data');
            }

            const data = await response.json();
            setPassportData(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const LoadingSkeleton = () => (
        <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                    <div key={i}>
                        <Skeleton className="h-4 w-20 mb-2" />
                        <Skeleton className="h-6 w-full" />
                    </div>
                ))}
            </div>
        </div>
    );

    const PlaceholderContent = () => (
        <div className="flex flex-col items-center justify-center h-full py-12 text-center text-gray-500">
            <Scan className="w-16 h-16 mb-4" />
            <h3 className="text-lg font-medium mb-2">No Passport Scanned Yet</h3>
            <p className="max-w-sm">
                Upload or capture a passport image using the scanner on the left to extract information
            </p>
        </div>
    );

    const PassportInformation = () => (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
                { label: "Passport Number", value: passportData?.passport_number },
                { label: "Full Name", value: passportData?.full_name },
                { label: "Date of Birth", value: passportData?.date_of_birth },
                { label: "Nationality", value: passportData?.nationality },
                { label: "Gender", value: passportData?.gender },
                { label: "Date of Issue", value: passportData?.date_of_issue },
                { label: "Date of Expiry", value: passportData?.date_of_expiry }
            ].map((field, index) => (
                <div key={index}>
                    <Label>{field.label}</Label>
                    <div className="font-medium">{field.value}</div>
                </div>
            ))}
        </div>
    );

    return (
        <div className="container mx-auto p-4">
            <div className="grid lg:grid-cols-2 gap-6">
                {/* Left Column - Scanner */}
                <Card>
                    <CardHeader>
                        <CardTitle>Passport Scanner</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {/* File Upload Section */}
                            {!showCamera && !isMobile && (
                                <div
                                    {...getRootProps()}
                                    className={`
                                        border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
                                        transition-colors duration-200
                                        ${isDragActive ? 'border-primary bg-primary/10' : 'border-gray-300'}
                                    `}
                                >
                                    <input {...getInputProps()} />
                                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                    <p className="mt-2">Drag & drop a passport image here, or click to select</p>
                                </div>
                            )}

                            {/* Camera Section */}
                            {!previewUrl && !isMobile && (
                                <div className="flex justify-center">
                                    <Button
                                        variant="outline"
                                        onClick={showCamera ? stopCamera : startCamera}
                                        className="mt-4"
                                    >
                                        <Camera className="mr-2 h-4 w-4" />
                                        {showCamera ? 'Stop Camera' : 'Use Camera'}
                                    </Button>
                                </div>
                            )}

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
                                    disabled={!file || loading}
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
                        {passportData && <PassportInformation />}
                        {!loading && !passportData && <PlaceholderContent />}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default PassportScanner;