import { MaterialIcons } from "@expo/vector-icons";
import { CameraType, CameraView, useCameraPermissions } from "expo-camera";
import React from "react";
import { useRef, useState } from "react";
import { Modal, TouchableOpacity, View, StyleSheet } from "react-native";

type CameraModalProps = {
  visible: boolean;
  onClose: () => void;
  onCapture: (imageUri: string) => void;
};

const CameraModal = ({ visible, onClose, onCapture }: CameraModalProps) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>("front");
  const camera = useRef<CameraView>(null);

  // request permission if not granted
  React.useEffect(() => {
    if (visible && !permission?.granted) {
      requestPermission();
    }
  }, [visible, permission, requestPermission]);

  const takePicture = async () => {
    if (camera.current) {
      try {
        console.log("taking picture...");
        const photo = await camera.current.takePictureAsync();
        console.log("Picture taken...", photo?.uri);
        if (photo) onCapture(photo?.uri);
        console.log(photo);
      } catch (error) {
        console.error("Failed to take picture:", error);
      }
    } else {
      console.log("Caerma ref is null");
    }
  };

  const toggleCameraFacing = () => {
    setFacing((current) => (current === "back" ? "front" : "back"));
    console.log("Turning camera...");
  };

  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.cameraContainer}>
        <CameraView style={styles.camera} facing={facing} ref={camera}>
          <View style={styles.cameraControlsContainer}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <MaterialIcons name="close" size={24} color="white" />
            </TouchableOpacity>

            <View style={styles.cameraButtons}>
              <TouchableOpacity
                style={styles.flipButton}
                onPress={toggleCameraFacing}
              >
                <MaterialIcons name="flip-camera-ios" size={28} color="white" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.captureButton}
                onPress={takePicture}
              >
                <View style={styles.captureButtonInner} />
              </TouchableOpacity>
            </View>
          </View>
        </CameraView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  cameraContainer: {
    flex: 1,
    backgroundColor: "black",
  },
  camera: {
    flex: 1,
  },
  cameraControlsContainer: {
    flex: 1,
    backgroundColor: "transparent",
    flexDirection: "column",
    justifyContent: "space-between",
    padding: 20,
  },
  closeButton: {
    alignSelf: "flex-end",
    padding: 10,
  },
  cameraButtons: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
  },
  flipButton: {
    padding: 10,
    position: "absolute",
    right: 20,
  },
  captureButton: {
    borderWidth: 6,
    borderColor: "white",
    backgroundColor: "transparent",
    height: 70,
    width: 70,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
  },
  captureButtonInner: {
    backgroundColor: "white",
    height: 52,
    width: 52,
    borderRadius: 26,
  },
});

export default CameraModal;
