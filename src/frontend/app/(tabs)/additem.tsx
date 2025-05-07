import React, { useEffect, useRef, useState } from "react";
import * as ImagePicker from "expo-image-picker";
import {
  Alert,
  ScrollView,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  FlatList,
} from "react-native";
import { router } from "expo-router";
import { UserInfo } from "@/types/types";
import { useAuth } from "../contexts/AuthContext";
import api, { PaginatedResponse } from "@/types/api";
import { SafeAreaView } from "react-native-safe-area-context";
import CameraModal from "@/components/CameraModal";
import { MaterialIcons } from "@expo/vector-icons";
import { useItemsStore } from "@/stores/useSearchStore";
import Toast from "react-native-toast-message";
import Constants from "expo-constants";
import { useTheme } from "../contexts/ThemeContext";

const SE_API_USER = Constants?.expoConfig?.extra?.SE_API_USER;
const SE_SECRET_KEY = Constants?.expoConfig?.extra?.SE_SECRET_KEY;
const SE_WORKFLOW = Constants?.expoConfig?.extra?.SE_WORKFLOW;

const sightEngineTextModeration = async (text: string) => {
  const textFormData = new URLSearchParams();
  textFormData.append("text", text);
  textFormData.append("lang", "en");
  textFormData.append("api_user", SE_API_USER);
  textFormData.append("api_secret", SE_SECRET_KEY);
  textFormData.append("mode", "rules");
  textFormData.append("categories", "profanity,drug,extremism,violence");
  const response = await api.post(
    "https://api.sightengine.com/1.0/text/check.json",
    textFormData,
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );
  return response.data;
};

const AddItemScreen = () => {
  const BASE_URL = Constants?.expoConfig?.extra?.apiUrl;
  // initial form state w/ everything empty...we'll use this when submitting the form to reset for user
  const initialFormState = {
    name: "",
    description: "",
    price: "",
    category: "", //default category
  };
  const [formData, setFormData] = useState(initialFormState);
  const { colors } = useTheme();
  const [images, setImages] = useState<string[]>([]);
  const [showCamera, setShowCamera] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<UserInfo>();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const { authToken } = useAuth();
  const { categories } = useItemsStore();

  // helper function to fill in whatever form field we need
  const updateFormField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // function to reset form data
  const resetForm = () => {
    setFormData(initialFormState);
    setImages([]);
  };

  // function to remove the image
  const removeImage = (indexToRemove: number) => {
    setImages(images.filter((_, index) => index !== indexToRemove));
  };

  // Effect for handling dropdown open state
  useEffect(() => {
    if (dropdownOpen && scrollViewRef.current) {
      // Scroll to make the dropdown visible when it opens
      scrollViewRef.current.scrollTo({ y: 300, animated: true });
    }
  }, [dropdownOpen]);

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
      const response = await api.get<PaginatedResponse<UserInfo>>(
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

  // Function to open camera
  const openCamera = () => {
    setShowCamera(true);
  };

  // function to add selected images to the images array
  const handleCapturedImage = (imageUri: string) => {
    setImages((prevImages) => [...prevImages, imageUri]);
    setShowCamera(false);
  };

  // Function to pick an image from the phone's gallery
  const pickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.status !== "granted") {
      if (!permissionResult.canAskAgain) {
        Alert.alert(
          "Permission required",
          "You've previously denied access to your photo library. Please enable it from your phone's settings to continue."
        );
      } else {
        Alert.alert(
          "Permission needed",
          "Please allow access to your photo library to select an image."
        );
      }
      return;
    }

    // The thing for picking images, we can crop and stuff like that
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"], //might have to change this???
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
      // TODO: THIS DOESNT WORK ON ANDROID
      allowsMultipleSelection: true, // to allow selecting multiple images
    });

    if (!result.canceled && result.assets.length > 0) {
      const newImages = result.assets.map((asset) => asset.uri);
      setImages((prevImages) => [...prevImages, ...newImages]);
    }
  };

  const validateForm = () => {
    const { name, price } = formData;
    if (!name || !price || images.length === 0) {
      Alert.alert(
        "Missing information",
        "Please fill out all required fields and add an image"
      );
      return false;
    }
    return true;
  };

  const createFormData = () => {
    const { name, description, price, category } = formData;
    const formDataObj = new FormData();

    formDataObj.append("title", name);
    formDataObj.append("description", description);
    formDataObj.append("price", price);
    // Find the matching category object and send its ID instead of string value
    const selectedCategory = categories.find((cat) => cat.name === category);
    formDataObj.append(
      "category",
      selectedCategory ? selectedCategory.id.toString() : "7"
    ); // Default to "Other" (7) if not found
    if (userData !== undefined) {
      formDataObj.append("seller", userData.id.toString());
    }

    if (images.length > 0) {
      const primaryImage = images[0];
      const imageFileName = primaryImage.split("/").pop() || "image.jpg";
      const imageType = imageFileName.endsWith("png")
        ? "image/png"
        : "image/jpeg";
      // const fileUri =
      //   Platform.OS === "android"
      //     ? image
      //     : image.startsWith("file://")
      //     ? image
      //     : `file://${image}`;

      formDataObj.append("image", {
        uri:
          Platform.OS === "android"
            ? primaryImage
            : primaryImage.replace("file://", ""),
        name: imageFileName,
        type: imageType,
      } as unknown as Blob);
    }

    if (images.length > 1) {
      // skip the first image since it's already added as the primary image
      for (let i = 1; i < images.length; i++) {
        const additionalImage = images[i];
        const imageFileName =
          additionalImage.split("/").pop() || `image_${i}.jpg`;
        const imageType = imageFileName.endsWith("png")
          ? "image/png"
          : "image/jpeg";
        formDataObj.append("additional_images", {
          uri:
            Platform.OS === "android"
              ? additionalImage
              : additionalImage.replace("file://", ""),
          name: imageFileName,
          type: imageType,
        } as unknown as Blob);
      }
    }

    return formDataObj;
  };

  const handleSubmit = async () => {
    console.log("Hello");
    if (!validateForm()) return;
    try {
      setLoading(true);
      if (!userData) {
        await getProfile();
      }

      // TODO: Uncomment for sightengine stuff
      const combinedText = `${formData.name}\n${formData.description}`; //combine all the text
      const textModerationResult = await sightEngineTextModeration(
        combinedText
      );

      if (textModerationResult.status === "failure") {
        console.error(
          "SightEngine text moderation error:",
          textModerationResult.error
        );
        Alert.alert("Error", "Text validation failed. Please try again");
        setLoading(false);
        return;
      }
      if (
        (textModerationResult.profanity.matches[0] &&
          textModerationResult.profanity.matches[0].intensity === "high") ||
        (textModerationResult.drug.matches[0] &&
          textModerationResult.drug.matches[0].intensity === "high") ||
        (textModerationResult.extremism.matches[0] &&
          textModerationResult.extremism.matches[0].intensity === "high") ||
        (textModerationResult.violence.matches[0] &&
          textModerationResult.violence.matches[0].intensity === "high")
      ) {
        Alert.alert(
          "NOT ALLOWED",
          "Please make sure all text is free of profanity, illegal content, extremism, and violence"
        );
        setLoading(false);
        return;
      }
      for (const image of images) {
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

          (Object.keys(params) as (keyof SightEngineParams)[]).forEach(
            (key) => {
              sightEngineFormData.append(key, params[key]);
            }
          );
          // Make API call to SightEngine
          const sightEngineResponse = await api.post(
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
            Alert.alert(
              "NOT ALLOWED",
              `${output.summary.reject_reason[0].text}`
            );
            setLoading(false);
            return;
          }
        }
      }
      const formDataObj = createFormData();
      const cleanToken = authToken?.trim();
      const response = await api.post(`${BASE_URL}/api/items/`, formDataObj, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${cleanToken}`,
          Accept: "application/json",
        },
        transformRequest: (data) => {
          return data;
        },
      });
      resetForm(); //reset the form after submitting
      Toast.show({
        type: "success",
        text1: "Added",
        text2: "Item uploaded successfully",
      });
      router.back();
    } catch (error) {
      console.error("Error submitting item:", error);
      Alert.alert("Error", "Could not add item. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = (name: string) => {
    updateFormField("category", name);
    setDropdownOpen(false);
  };

  const renderCategoryDropdown = () => {
    if (dropdownOpen) {
      return (
        <TouchableWithoutFeedback onPress={() => setDropdownOpen(false)}>
          <View style={styles.dropdownOverlay}>
            <View style={styles.dropdownContainer}>
              <ScrollView nestedScrollEnabled={true}>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category.name}
                    style={[
                      styles.dropdownItem,
                      formData.category === category.name &&
                        styles.dropdownItemSelected,
                    ]}
                    onPress={() => handleCategorySelect(category.name)}
                  >
                    <Text
                      style={[
                        styles.dropdownItemText,
                        formData.category === category.name &&
                          styles.dropdownItemTextSelected,
                      ]}
                    >
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </TouchableWithoutFeedback>
      );
    }
    return null;
  };

  return (
    // flex: 1 makes the SafeAreaView fill the whole screen...without it the screen goes blank
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: colors.background }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          ref={scrollViewRef}
          // style={{ paddingTop: insets.top }}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled={true}
        >
          <Text style={styles.title}>Add New Item</Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Name *</Text>
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(text) => updateFormField("name", text)}
              placeholder="Item name"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textarea]}
              value={formData.description}
              onChangeText={(text) => updateFormField("description", text)}
              placeholder="Item Description"
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Price *</Text>
            <TextInput
              style={styles.input}
              value={formData.price}
              onChangeText={(text) => updateFormField("price", text)}
              placeholder="0.00"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Category</Text>
            <TouchableOpacity
              testID="category-selector"
              style={styles.dropdownTrigger}
              onPress={() => setDropdownOpen(!dropdownOpen)}
            >
              <Text style={styles.dropdownTriggerText}>
                {formData.category
                  ? categories.find((cat) => cat.name === formData.category)
                      ?.name
                  : "Select a category"}
              </Text>
              <MaterialIcons
                name={dropdownOpen ? "arrow-drop-up" : "arrow-drop-down"}
                size={24}
                color="#007BFF"
              />
            </TouchableOpacity>
          </View>

          <View
            style={[styles.formGroup, { marginTop: dropdownOpen ? 120 : 0 }]}
          >
            <Text style={styles.label}>
              Images * ({images.length} selected)
            </Text>
            {images.length > 0 ? (
              <View style={styles.imageGallery}>
                <FlatList
                  data={images}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  keyExtractor={(item, index) => index.toString()}
                  renderItem={({ item, index }) => (
                    <View style={styles.imageContainer}>
                      <Image
                        source={{ uri: item }}
                        style={styles.thumbnailImage}
                      />
                      <TouchableOpacity
                        style={styles.removeIcon}
                        onPress={() => removeImage(index)}
                      >
                        <MaterialIcons name="close" size={24} color="#fff" />
                      </TouchableOpacity>
                      {index === 0 && (
                        <View
                          style={[
                            styles.primaryBadge,
                            { backgroundColor: colors.accent },
                          ]}
                        >
                          <Text style={styles.primaryBadgeText}>Primary</Text>
                        </View>
                      )}
                    </View>
                  )}
                />
              </View>
            ) : (
              <View style={styles.imagePicker}>
                <Text style={styles.imagePickerText}>No Image Selected</Text>
              </View>
            )}
            <View style={styles.imageActions}>
              <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
                <MaterialIcons
                  name="photo-library"
                  size={24}
                  color={colors.accent}
                />
                <Text style={styles.imageButtonText}>Gallery</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.imageButton} onPress={openCamera}>
                <MaterialIcons
                  name="camera-alt"
                  size={24}
                  color={colors.accent}
                />
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
            style={styles.saveButton}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>Save Item</Text>
            )}
          </TouchableOpacity>
        </ScrollView>

        {/* Render the dropdown outside the ScrollView */}
        {renderCategoryDropdown()}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
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
    backgroundColor: "#FFFFFF",
  },
  textarea: {
    height: 100,
    backgroundColor: "#FFFFFF",
    textAlignVertical: "top",
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
  },
  imageActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 10,
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
    position: "relative",
  },
  imageGallery: {
    height: 150,
    marginBottom: 10,
  },
  imageContainer: {
    width: 120,
    height: 120,
    margin: 5,
    borderRadius: 8,
    overflow: "hidden",
    position: "relative",
  },
  thumbnailImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  primaryBadge: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 4,
    alignItems: "center",
  },
  primaryBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  imagePickerText: {
    color: "#777",
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#B45757",
    paddingVertical: 14,
    borderRadius: 30,
    marginTop: 30,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFF9F0",
  },
  dropdownStyle: {
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  dropdownContainerStyle: {
    borderColor: "#ddd",
    backgroundColor: "#fff",
  },
  dropdownItemStyle: {
    justifyContent: "flex-start",
  },
  dropdownTrigger: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#fff",
  },
  dropdownTriggerText: {
    fontSize: 16,
    color: "#333",
  },
  dropdownOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  dropdownContainer: {
    width: "85%",
    height: "70%",
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 10,
    zIndex: 1001,
  },
  dropdownItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  dropdownItemText: {
    fontSize: 16,
    color: "#333",
  },
  dropdownItemSelected: {
    backgroundColor: "#f0f8ff",
  },
  dropdownItemTextSelected: {
    color: "#007BFF",
    fontWeight: "bold",
  },
  removeIcon: {
    position: "absolute",
    top: 8,
    right: 8,
    padding: 4,
    zIndex: 10,
  },
});

export default AddItemScreen;
