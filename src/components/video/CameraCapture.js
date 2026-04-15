// src/components/video/CameraCapture.js
const React = require('react');
const { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Platform } = require('react-native');
const { Camera } = require('expo-camera');
const { Ionicons } = require('@expo/vector-icons');
const Colors = require('../../theme/Colors');

const CameraCapture = ({ onCapture, type = 'front', instruction = 'Align your face in the oval' }) => {
  const [hasPermission, setHasPermission] = React.useState(null);
  const [cameraType, setCameraType] = React.useState(type === 'front' ? 'front' : 'back');
  const [isReady, setIsReady] = React.useState(false);
  const [isRecording, setIsRecording] = React.useState(false);
  const cameraRef = React.useRef(null);

  const handleFileUpload = async () => {
    if (Platform.OS !== 'web') return;

    const file = await new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*,video/*';
      input.onchange = (e) => resolve(e.target.files[0]);
      input.click();
    });

    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      onCapture({ uri: event.target.result, name: file.name, type: file.type });
    };
    reader.readAsDataURL(file);
  };

  React.useEffect(() => {
    if (Platform.OS === 'web') {
      setHasPermission(true);
      setIsReady(true);
      return;
    }

    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      const { status: micStatus } = await Camera.requestMicrophonePermissionsAsync();
      setHasPermission(status === 'granted' && micStatus === 'granted');
    })();
  }, []);

  const handleCapture = async () => {
    if (cameraRef.current && isReady) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.7,
          skipProcessing: false,
        });
        onCapture(photo);
      } catch (error) {
        console.error('Capture error:', error);
      }
    }
  };

  const startVideoRecording = async () => {
    if (cameraRef.current && isReady) {
      try {
        setIsRecording(true);
        const video = await cameraRef.current.recordAsync({
          maxDuration: 5,
          quality: '720p',
        });
        onCapture(video);
      } catch (error) {
        console.error('Video recording error:', error);
      } finally {
        setIsRecording(false);
      }
    }
  };

  const stopVideoRecording = () => {
    if (cameraRef.current && isRecording) {
      cameraRef.current.stopRecording();
    }
  };

  if (hasPermission === null) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Camera and Microphone access denied.</Text>
      </View>
    );
  }

  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <View style={[styles.camera, { justifyContent: 'center', alignItems: 'center', padding: 20 }]}> 
          <Text style={styles.instruction}>Upload a photo or short video for verification</Text>
          <TouchableOpacity style={styles.uploadBtn} onPress={handleFileUpload}>
            <Text style={styles.uploadText}>Upload File</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        ref={cameraRef}
        style={styles.camera}
        type={cameraType}
        onCameraReady={() => setIsReady(true)}
      >
        <View style={styles.overlay}>
          <View style={styles.maskContainer}>
            <View style={styles.ovalMask} />
          </View>
          <View style={styles.controls}>
            <Text style={styles.instruction}>{instruction}</Text>
            <TouchableOpacity 
              style={[styles.captureBtn, isRecording && styles.recordingBtn]} 
              onPress={isRecording ? stopVideoRecording : handleCapture}
              onLongPress={startVideoRecording}
            >
              <View style={styles.captureInner} />
            </TouchableOpacity>
            <Text style={styles.subInstruction}>Tap for photo, Hold for 5s video</Text>
          </View>
        </View>
      </Camera>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, borderRadius: 20, overflow: 'hidden', backgroundColor: '#000' },
  camera: { flex: 1 },
  overlay: { flex: 1, justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.2)' },
  maskContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', width: '100%' },
  ovalMask: {
    width: 250,
    height: 350,
    borderRadius: 125,
    borderWidth: 2,
    borderColor: '#fff',
    backgroundColor: 'transparent',
    borderStyle: 'dashed',
  },
  controls: { paddingBottom: 40, alignItems: 'center', width: '100%' },
  instruction: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  subInstruction: { color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 10 },
  captureBtn: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 4,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordingBtn: { borderColor: Colors.error },
  captureInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fff',
  },
  uploadBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 18,
    marginTop: 24,
  },
  uploadText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' },
  errorText: { color: '#fff', fontSize: 16, textAlign: 'center', padding: 20 },
});

module.exports = CameraCapture;
