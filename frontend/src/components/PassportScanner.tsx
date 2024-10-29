import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Upload, Camera, CheckCircle, AlertCircle, X } from "lucide-react";
import { useDropzone } from 'react-dropzone';

// Types
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

    // Handle file drop
    const onDrop = useCallback((acceptedFiles: File[]) => {
        const selectedFile = acceptedFiles[0];
        handleFileSelection(selectedFile);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': []
        },
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

    // Camera handling
    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
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
            const response = await fetch('http://localhost:8000/api/extract-passport', {
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

    return (
        <div className="container mx-auto p-4 max-w-4xl">
            <Card>
                <CardHeader>
                    <CardTitle>Passport Information Extractor</CardTitle>
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
                                    <Button variant="outline" onClick={stopCamera}>
                                        <X className="mr-2 h-4 w-4" />
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Preview Section */}
                        {previewUrl && (
                            <div className="mt-4 relative">
                                <img
                                    src={previewUrl}
                                    alt="Passport preview"
                                    className="max-w-sm rounded-lg border mx-auto"
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
                                className="w-full sm:w-auto"
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

                        {/* Results Display */}
                        {passportData && (
                            <Card className="mt-6">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <CheckCircle className="h-5 w-5 text-green-500" />
                                        Extracted Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-4">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <Label>Passport Number</Label>
                                                <div className="font-medium">{passportData.passport_number}</div>
                                            </div>
                                            <div>
                                                <Label>Full Name</Label>
                                                <div className="font-medium">{passportData.full_name}</div>
                                            </div>
                                            <div>
                                                <Label>Date of Birth</Label>
                                                <div className="font-medium">{passportData.date_of_birth}</div>
                                            </div>
                                            <div>
                                                <Label>Nationality</Label>
                                                <div className="font-medium">{passportData.nationality}</div>
                                            </div>
                                            <div>
                                                <Label>Gender</Label>
                                                <div className="font-medium">{passportData.gender}</div>
                                            </div>
                                            <div>
                                                <Label>Date of Issue</Label>
                                                <div className="font-medium">{passportData.date_of_issue}</div>
                                            </div>
                                            <div>
                                                <Label>Date of Expiry</Label>
                                                <div className="font-medium">{passportData.date_of_expiry}</div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default PassportScanner;