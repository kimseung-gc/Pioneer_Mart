import { ItemType } from "@/types/types";
import { AntDesign } from "@expo/vector-icons";
import { ReactNativeZoomableView } from "@openspacelabs/react-native-zoomable-view";
import React from "react";
import {
  Modal,
  TouchableOpacity,
  View,
  StyleSheet,
  Image,
  Dimensions,
} from "react-native";

interface ZoomModalProps {
  isVisible: boolean;
  onClose: () => void;
  item: ItemType;
}

const { width, height } = Dimensions.get("window");

const ZoomModal: React.FC<ZoomModalProps> = ({ isVisible, onClose, item }) => {
  return (
    <Modal visible={isVisible} transparent={true} animationType="fade">
      <View style={styles.modalContainer}>
        {/* Close Button */}
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <AntDesign name="close" size={30} color="white" />
        </TouchableOpacity>

        {/* Zoomable Image */}
        <ReactNativeZoomableView
          maxZoom={3}
          minZoom={1}
          zoomStep={0.5}
          initialZoom={1}
          bindToBorders={true}
          style={styles.zoomContainer}
        >
          <Image
            source={{ uri: item.image }}
            style={styles.zoomedImage}
            resizeMode="contain"
          />
        </ReactNativeZoomableView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  closeButton: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 10,
  },
  zoomContainer: {
    width: width * 0.9, // Make the zoom container responsive
    height: height,
    justifyContent: "center",
    alignItems: "center",
  },
  zoomedImage: {
    width: "100%",
    height: "100%",
  },
});

export default ZoomModal;
