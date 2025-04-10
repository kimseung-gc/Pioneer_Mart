import { router, Stack, useLocalSearchParams } from "expo-router";
import { useAuth } from "./contexts/AuthContext";
import { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL, SE_API_USER, SE_SECRET_KEY, SE_WORKFLOW } from "@/config";
import {
  ActivityIndicator,
  Alert,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import React from "react";
import { Entypo, MaterialIcons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import CameraModal from "@/components/CameraModal";
import { UserInfo } from "@/types/types";
import { PaginatedResponse } from "@/types/api";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const CATEGORIES = [
  { label: "Electronics", value: "electronics", id: 2 },
  { label: "Clothing", value: "clothing", id: 6 },
  { label: "Books", value: "books", id: 3 },
  { label: "Furniture", value: "furniture", id: 1 },
  { label: "Fitness", value: "fitness", id: 4 },
  { label: "Health", value: "health", id: 5 },
  { label: "Other", value: "other", id: 7 },
];

const EditItem = () => {
  const { item: itemString } = useLocalSearchParams();
  const originalItem = JSON.parse(itemString as string);
  const { authToken } = useAuth();

  const [title, setTitle] = useState(originalItem.title);
  const [description, setDescription] = useState(
    originalItem.description || ""
  );
  const [price, setPrice] = useState(originalItem.price.toString());
  const [selectedCategory, setSelectedCategory] = useState(
    originalItem.category
  );
  const [userData, setUserData] = useState<UserInfo>();
  const [image, setImage] = useState(originalItem.image || null);
  const [isNewImage, setIsNewImage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [loading, setLoading] = useState(false);
  const insets = useSafeAreaInsets();

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "Please allow access to your photo library"
      );
      return;
    }
    // The thing for picking images, we can crop and stuff like that
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setImage(result.assets[0].uri);
    }
  };

  // Function to handle this image
  const handleCapturedImage = (imageUri: string) => {
    setImage(imageUri);
    setShowCamera(false);
  };

  const prepareFormData = () => {
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("price", price);
    const category = CATEGORIES.find((cat) => cat.value === selectedCategory);
    formData.append("category", category ? category.id.toString() : "8"); // Default to "Other" (8) if not found
    if (isNewImage && image) {
      // Extract filename from the uri
      const filename = image.split("/").pop() || "image.jpg";
      // Infer the type of the image
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : "image/jpeg";
      formData.append("image", {
        uri: image,
        name: filename,
        type,
      } as any);
    }
    return formData;
  };

  // Function to open camera
  const openCamera = () => {
    setShowCamera(true);
  };

  const getProfile = async () => {
    if (!authToken) {
      // check if authenticated
      Alert.alert("Error", "You must be logged in to add items.");
      router.back();
      return;
    }
    // this gets the user's data but I don't think we need it paginated. I'll keep it for nw tho
    try {
      const cleanToken = authToken.trim();
      const response = await axios.get<PaginatedResponse<UserInfo>>(
        `${BASE_URL}/api/users/`,
        {
          headers: {
            Authorization: `Bearer ${cleanToken}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      if (response.data.results) {
        setUserData(response.data.results[0]);
      } else {
        Alert.alert("Error", "No user data found.");
      }
    } catch (error) {
      console.error("Error getting user profile:", error);
      Alert.alert("Error", "Failed to load profile. Please try again.");
    }
  };

  const handleSubmit = async () => {
    // if (!prepareFormData()) return;
    if (!title || !price || !selectedCategory) {
      Alert.alert("Validation Error", "Please fill in all required fields.");
      return;
    }

    // setLoading(true);

    try {
      setIsSaving(true);
      const formData = prepareFormData();
      if (!userData) {
        await getProfile();
      }

      if (image) {
        const sightEngineFormData = new FormData();
        const imageFileName = image.split("/").pop() || "image.jpg";
        const imageType = imageFileName.endsWith("png")
          ? "image/png"
          : "image/jpeg";
        sightEngineFormData.append("media", {
          uri: image,
          name: imageFileName,
          type: imageType,
        } as unknown as Blob);
        //TODO: append image to form data
        type SightEngineParams = {
          workflow: string;
          api_user: string;
          api_secret: string;
        };

        const params: SightEngineParams = {
          workflow: SE_WORKFLOW,
          api_user: SE_API_USER,
          api_secret: SE_SECRET_KEY,
        };

        (Object.keys(params) as (keyof SightEngineParams)[]).forEach((key) => {
          sightEngineFormData.append(key, params[key]);
        });
        // Make API call to SightEngine
        const sightEngineResponse = await axios.post(
          "https://api.sightengine.com/1.0/check-workflow.json",
          sightEngineFormData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        const output = sightEngineResponse.data;
        if (output.status === "failure") {
          console.error("SightEngine API error:", output.error);
          Alert.alert("Error", "Image validation failed. Please try again.");
          setLoading(false);
          return;
        }
        // Check if image should be rejected
        if (output.summary && output.summary.action === "reject") {
          console.log(
            "Image rejected with probability:",
            output.summary.reject_prob
          );
          console.log(
            "Rejection reasons:",
            output.summary.reject_reason[0].text
          );

          Alert.alert("NOT ALLOWED", `${output.summary.reject_reason[0].text}`);
          setLoading(false);
          return;
        }
      }

      //   const formDataObj = createFormData();
      const cleanToken = authToken?.trim();

      const config = {
        headers: {
          Authorization: `Bearer ${cleanToken}`,
          "Content-Type": "multipart/form-data",
          Accept: "application/json",
        },
      };
      const response = await axios.put(
        `${BASE_URL}/api/items/${originalItem.id}/`,
        formData,
        config
      );
      setIsSaving(false);

      Alert.alert("Success", "Item edited successfully", [
        {
          text: "OK",
          onPress: () => {
            // Go back to previous screen (which would be ItemDetails) with refreshed data
            router.back();

            // pass the updated item data back through URL params
            router.setParams({
              item: JSON.stringify(response.data),
              refreshKey: Date.now().toString(),
            });
          },
        },
      ]);
    } catch (error) {
      console.error("Error editting item:", error);
      Alert.alert("Error", "Could not edit item. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { paddingTop: insets.top }]}>
      <Text style={styles.title}>Edit Item</Text>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Name *</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Item name"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textarea]}
          value={description}
          onChangeText={setDescription}
          placeholder="Item Description"
          multiline
          numberOfLines={4}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Price *</Text>
        <TextInput
          style={styles.input}
          value={price}
          onChangeText={setPrice}
          placeholder="0.00"
          keyboardType="numeric"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Category*</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedCategory}
            onValueChange={(itemValue) => setSelectedCategory(itemValue)}
          >
            {CATEGORIES.map((cat) => (
              <Picker.Item
                key={cat.value}
                label={cat.label}
                value={cat.value}
              />
            ))}
          </Picker>
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Image *</Text>
        <View style={styles.imagePicker}>
          {image ? (
            <Image source={{ uri: image }} style={styles.image} />
          ) : (
            <Text style={styles.imagePickerText}>No Image Selected</Text>
          )}
        </View>
        <View style={styles.imageActions}>
          <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
            <MaterialIcons name="photo-library" size={24} color="#007BFF" />
            <Text style={styles.imageButtonText}>Gallery</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.imageButton} onPress={openCamera}>
            <MaterialIcons name="camera-alt" size={24} color="#007BFF" />
            <Text style={styles.imageButtonText}>Camera</Text>
          </TouchableOpacity>
        </View>
        <CameraModal
          visible={showCamera}
          onClose={() => setShowCamera(false)}
          onCapture={handleCapturedImage}
        />
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Save Item</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: "500",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textarea: {
    height: 100,
    textAlignVertical: "top",
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
  },
  imageActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 10,
  },
  imageButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
  },
  imageButtonText: {
    marginLeft: 8,
    color: "#007BFF",
    fontWeight: "500",
  },
  imagePicker: {
    height: 200,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  imagePickerText: {
    color: "#777",
  },
  button: {
    backgroundColor: "#007BFF",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginVertical: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default EditItem;
