import { CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import React, { useEffect, useRef, useState } from 'react';
import { Button, Image, Platform, StyleSheet, Text, TextInput, View } from 'react-native';

export default function App() {
  const [facing] = useState<CameraType>('back');
  const [isCapturing, setIsCapturing] = useState(false);
  const [metadata, setMetadata] = useState('');
  const [capturedImages, setCapturedImages] = useState<any[]>([]);
  const cameraRef = useRef<CameraView | null>(null);

  // Get camera permissions using useCameraPermissions
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();

  useEffect(() => {
    if (!cameraPermission?.granted) {
      requestCameraPermission();  // Request permissions if not granted
    }
  }, [cameraPermission, requestCameraPermission]);

  const handleStartStopCapture = () => {
    setIsCapturing((prev) => !prev);
  };

  const captureImage = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync();
      if (!photo) return;

      if (Platform.OS !== 'web') {
        await MediaLibrary.createAssetAsync(photo.uri);
      }

      // Save the metadata with the captured image
      setCapturedImages((prevImages) => [
        ...prevImages,
        { uri: photo.uri, metadata, timestamp: Date.now() },
      ]);
    }
  };

  const handleDeleteImage = (index: number) => {
    setCapturedImages((prevImages) => prevImages.filter((_, i) => i !== index));
  };

  return (
    <View style={styles.container}>
      {cameraPermission?.granted ? (
        <>
          <CameraView
            style={styles.camera}
            facing={facing}
            ref={cameraRef}
          >
            <View style={styles.cameraOverlay}>
              <TextInput
                style={styles.metadataInput}
                placeholder="Enter metadata"
                value={metadata}
                onChangeText={setMetadata}
              />
              <Button
                title={isCapturing ? 'Stop Capture' : 'Start Capture'}
                onPress={handleStartStopCapture}
              />
              {isCapturing && (
                <Button title="Capture Image" onPress={captureImage} />
              )}
            </View>
          </CameraView>
        </>
      ) : (
        <Text>No access to camera</Text>
      )}

      <View style={styles.imagesContainer}>
        {capturedImages.map((image, index) => (
          <View key={index} style={styles.imageContainer}>
            <Image source={{ uri: image.uri }} style={styles.image} />
            <Text>{image.metadata}</Text>
            <Button title="Delete" onPress={() => handleDeleteImage(index)} />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  camera: {
    width: '100%',
    height: 300,
    justifyContent: 'flex-end',
  },
  cameraOverlay: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
  },
  metadataInput: {
    width: '80%',
    padding: 10,
    borderColor: '#000',
    borderWidth: 1,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  imagesContainer: {
    marginTop: 20,
    width: '100%',
    padding: 10,
  },
  imageContainer: {
    marginBottom: 10,
    alignItems: 'center',
  },
  image: {
    width: 100,
    height: 100,
    marginBottom: 10,
  },
});
