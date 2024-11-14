import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:8000";

const MainContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background-color: #f0f0f0;
  min-height: 100vh;
`;

const CameraPreview = styled.video`
  width: 80%;
  max-width: 500px;
  border-radius: 10px;
  margin-bottom: 20px;
`;

const ImageCountText = styled.h2`
  // font-size: 14px;
  color: #333;
  margin: 0;
  padding: 10px;
`;

const MetadataInput = styled.input`
  width: 80%;
  padding: 10px;
  margin-bottom: 10px;
  font-size: 16px;
  border-radius: 5px;
  border: 1px solid #ccc;
`;

const CaptureButton = styled.button`
  padding: 10px 20px;
  font-size: 16px;
  color: white;
  background-color: #007bff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 10px;
`;

const StartCameraButton = styled(CaptureButton)`
  background-color: #28a745;
  margin-bottom: 10px;
`;

const CountdownText = styled.p`
  font-size: 14px;
  color: #666;
  margin: 10px;
`;

const IntervalSelect = styled.select`
  width: 80%;
  padding: 10px;
  font-size: 16px;
  border-radius: 5px;
  border: 1px solid #ccc;
  margin-bottom: 20px;
`;

const GalleryContainer = styled.div`
  width: 80%;
  max-width: 600px;
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const ImageContainer = styled.div`
  display: flex;
  flex-direction: column;
  border: 1px solid #ddd;
  padding: 10px;
  border-radius: 8px;
  background-color: #fff;
  position: relative;
`;

const CapturedImage = styled.img`
  width: 100%;
  border-radius: 5px;
  margin-bottom: 8px;
`;

const MetadataText = styled.p`
  font-size: 14px;
  color: #333;
  margin: 0;
`;

const CountFlowersButton = styled.button`
  position: absolute;
  top: 10px;
  right: 120px;
  background-color: #ffc107;
  color: white;
  border: none;
  border-radius: 5px;
  padding: 5px 10px;
  cursor: pointer;
  font-size: 12px;
`;

const EditButton = styled.button`
  position: absolute;
  top: 10px;
  right: 60px;
  background-color: #ffc107;
  color: white;
  border: none;
  border-radius: 5px;
  padding: 5px 10px;
  cursor: pointer;
  font-size: 12px;
`;

const DeleteButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 5px;
  padding: 5px 10px;
  cursor: pointer;
  font-size: 12px;
`;

interface CapturedImageData {
  src: string;
  metadata: string;
  timestamp: number;
  isEditing: boolean;
}

const MainCapture: React.FC = () => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [metadata, setMetadata] = useState('');
  const [countdown, setCountdown] = useState(5);
  const [interval, setIntervalTime] = useState(5); // Capture interval in seconds
  const [capturedImages, setCapturedImages] = useState<CapturedImageData[]>([]);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const captureIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleStartCamera = async () => {
    if (!videoRef.current) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: 'environment'
        }
      });
      mediaStreamRef.current = stream;
      videoRef.current.srcObject = stream;
      videoRef.current.play();
      setIsCameraOn(true);
    } catch (error) {
      console.error("Error accessing the camera:", error);
      alert("Please allow camera access in your browser settings.");
    }
  };

  const captureImage = () => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const context = canvas.getContext('2d');

    if (context) {
      context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const imageSrc = canvas.toDataURL('image/png');
      setCapturedImages((prevImages) => [
        ...prevImages,
        { src: imageSrc, metadata, timestamp: Date.now(), isEditing: false },
      ]);
    }
  };

  const handleStartStopCapture = () => {
    if (isCapturing) {
      if (captureIntervalRef.current) {
        clearInterval(captureIntervalRef.current);
        captureIntervalRef.current = null;
      }
      setCountdown(interval);
    } else {
      captureIntervalRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev === 1) {
            captureImage();
            return interval;
          }
          return prev - 1;
        });
      }, 1000);
    }
    setIsCapturing((prev) => !prev);
  };

  const handleIntervalChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newInterval = parseInt(e.target.value, 10);
    setIntervalTime(newInterval);
    setCountdown(newInterval); // Reset countdown for new interval
  };

  const handleDeleteImage = (index: number) => {
    setCapturedImages((prevImages) => prevImages.filter((_, i) => i !== index));
  };

  const toggleEditMode = (index: number) => {
    setCapturedImages((prevImages) =>
      prevImages.map((image, i) =>
        i === index ? { ...image, isEditing: !image.isEditing } : image
      )
    );
  };

  function dataURLtoBlob(dataURL: string): Blob {
    const [mimePart, base64Part] = dataURL.split(',');
    const binaryString = atob(base64Part);
    const byteArray = new Uint8Array(binaryString.length);

    for (let i = 0; i < binaryString.length; i++) {
      byteArray[i] = binaryString.charCodeAt(i);
    }

    return new Blob([byteArray], { type: mimePart.split(':')[1].split(';')[0] });
  }

  const handleCountFlowers = async (index: number) => {
    const dataURL = capturedImages[index].src;

    const imageBlob = dataURLtoBlob(dataURL);
    const formData = new FormData();
    formData.append('file', imageBlob, (new Date()).getTime().toString() + '.png');

    try {
      const response = await fetch(`${apiUrl}/upload/`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        console.log(data);
        alert(`Flowers Count: ${data.flowers_count}.`);
      } else {
        console.error('Failed to upload photo');
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
    }

  };

  const handleMetadataChange = (index: number, newMetadata: string) => {
    setCapturedImages((prevImages) =>
      prevImages.map((image, i) =>
        i === index ? { ...image, metadata: newMetadata } : image
      )
    );
  };

  useEffect(() => {
    return () => {
      mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
      if (captureIntervalRef.current) {
        clearInterval(captureIntervalRef.current);
      }
    };
  }, []);

  return (
    <MainContainer>
      {!isCameraOn && (
        <StartCameraButton onClick={handleStartCamera}>Start Camera</StartCameraButton>
      )}
      <CameraPreview ref={videoRef} autoPlay style={{ display: isCameraOn ? 'block' : 'none' }} />
      <ImageCountText>Image Count: {capturedImages.length}</ImageCountText>
      <MetadataInput
        type="text"
        placeholder="Enter Metadata"
        value={metadata}
        onChange={(e) => setMetadata(e.target.value)}
      />

      <IntervalSelect value={interval} onChange={handleIntervalChange}>
        <option value="1">1 second</option>
        <option value="2">2 seconds</option>
        <option value="5">5 seconds</option>
        <option value="10">10 seconds</option>
      </IntervalSelect>

      <CountdownText>{isCapturing ? `Next capture in ${countdown} seconds` : ''}</CountdownText>
      <CaptureButton onClick={handleStartStopCapture}>
        {isCapturing ? "Stop" : "Start"} Capture
      </CaptureButton>

      <GalleryContainer>
        {capturedImages.map((image, index) => (
          <ImageContainer key={index}>
            <DeleteButton onClick={() => handleDeleteImage(index)}>Delete</DeleteButton>
            <EditButton onClick={() => toggleEditMode(index)}>
              {image.isEditing ? 'Save' : 'Edit'}
            </EditButton>
            <CountFlowersButton onClick={() => handleCountFlowers(index)}>Count Flowers</CountFlowersButton>
            <CapturedImage src={image.src} alt={`Capture ${index + 1}`} />
            {image.isEditing ? (
              <MetadataInput
                type="text"
                value={image.metadata}
                onChange={(e) => handleMetadataChange(index, e.target.value)}
              />
            ) : (
              <MetadataText>Metadata: {image.metadata}</MetadataText>
            )}
            <MetadataText>
              Timestamp: {new Date(image.timestamp).toLocaleString()}
            </MetadataText>
          </ImageContainer>
        ))}
      </GalleryContainer>
    </MainContainer>
  );
};

export default MainCapture;
