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
} from "react-native";
import axios from "axios";
import { BASE_URL } from "@/config";
// import { BASE_URL, SE_API_USER, SE_SECRET_KEY, SE_WORKFLOW } from "@/config";
import { router } from "expo-router";
import { UserInfo } from "@/types/types";
import { useAuth } from "../contexts/AuthContext";
import { PaginatedResponse } from "@/types/api";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import CameraModal from "@/components/CameraModal";
import { MaterialIcons } from "@expo/vector-icons";

// TODO: make Camera feature better

// I also have a categories endpoint which I'm considering removing cause
// we could honestly just hardcode all the categories. Getting these from
// the backend seems like extra work esp cause the categories are so few
// We would however have to figure out this id stuff lol
const CATEGORIES = [
  { label: "Electronics", value: "electronics", id: 2 },
  { label: "Clothing", value: "clothing", id: 6 },
  { label: "Books", value: "books", id: 3 },
  { label: "Furniture", value: "furniture", id: 1 },
  { label: "Fitness", value: "fitness", id: 4 },
  { label: "Health", value: "health", id: 5 },
  { label: "Other", value: "other", id: 7 },
];

const AddItemScreen = () => {
  // initial form state w/ everything empty...we'll use this when submitting the form to reset for user
  const initialFormState = {
    name: "",
    description: "",
    price: "",
    category: "", //default category
  };
  const [formData, setFormData] = useState(initialFormState);

  const [image, setImage] = useState<string>("");
  const [showCamera, setShowCamera] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<UserInfo>();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const { authToken } = useAuth();
  const insets = useSafeAreaInsets();

  // helper function to fill in whatever form field we need
  const updateFormField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // function to reset form data
  const resetForm = () => {
    setFormData(initialFormState);
    setImage("");
  };

  // Effect for handling dropdown open state
  useEffect(() => {
    if (dropdownOpen && scrollViewRef.current) {
      // Scroll to make the dropdown visible when it opens
      scrollViewRef.current.scrollTo({ y: 300, animated: true });
    }
  }, [dropdownOpen]);

  // we need this for the purchaser's user info
  useEffect(() => {
    getProfile();
  }, []);

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

  // Function to open camera
  const openCamera = () => {
    setShowCamera(true);
  };

  // Function to handle this image
  const handleCapturedImage = (imageUri: string) => {
    setImage(imageUri);
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
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImage(result.assets[0].uri);
    }
  };

  const validateForm = () => {
    const { name, price } = formData;
    if (!name || !price || !image) {
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
    const selectedCategory = CATEGORIES.find((cat) => cat.value === category);
    formDataObj.append(
      "category",
      selectedCategory ? selectedCategory.id.toString() : "8"
    ); // Default to "Other" (8) if not found
    if (userData !== undefined) {
      formDataObj.append("seller", userData.id.toString());
    }

    if (image) {
      const imageFileName = image.split("/").pop() || "image.jpg";
      const imageType = imageFileName.endsWith("png")
        ? "image/png"
        : "image/jpeg";
      const fileUri =
        Platform.OS === "android"
          ? image
          : image.startsWith("file://")
          ? image
          : `file://${image}`;

      formDataObj.append("image", {
        uri: Platform.OS === "android" ? image : image.replace("file://", ""),
        name: imageFileName,
        type: imageType,
      } as unknown as Blob);
    }

    return formDataObj;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      if (!userData) {
        await getProfile();
      }

      // if (image) {
      //   const sightEngineFormData = new FormData();
      //   const imageFileName = image.split("/").pop() || "image.jpg";
      //   const imageType = imageFileName.endsWith("png")
      //     ? "image/png"
      //     : "image/jpeg";
      //   sightEngineFormData.append("media", {
      //     uri: image,
      //     name: imageFileName,
      //     type: imageType,
      //   } as unknown as Blob);
      //   //TODO: append image to form data
      //   type SightEngineParams = {
      //     workflow: string;
      //     api_user: string;
      //     api_secret: string;
      //   };

      //   const params: SightEngineParams = {
      //     workflow: SE_WORKFLOW,
      //     api_user: SE_API_USER,
      //     api_secret: SE_SECRET_KEY,
      //   };

      //   (Object.keys(params) as (keyof SightEngineParams)[]).forEach((key) => {
      //     sightEngineFormData.append(key, params[key]);
      //   });
      //   // Make API call to SightEngine
      //   const sightEngineResponse = await axios.post(
      //     "https://api.sightengine.com/1.0/check-workflow.json",
      //     sightEngineFormData,
      //     {
      //       headers: {
      //         "Content-Type": "multipart/form-data",
      //       },
      //     }
      //   );
      //   const output = sightEngineResponse.data;
      //   if (output.status === "failure") {
      //     console.error("SightEngine API error:", output.error);
      //     Alert.alert("Error", "Image validation failed. Please try again.");
      //     setLoading(false);
      //     return;
      //   }
      //   // Check if image should be rejected
      //   if (output.summary && output.summary.action === "reject") {
      //     console.log(
      //       "Image rejected with probability:",
      //       output.summary.reject_prob
      //     );
      //     console.log(
      //       "Rejection reasons:",
      //       output.summary.reject_reason[0].text
      //     );

      //     Alert.alert("NOT ALLOWED", `${output.summary.reject_reason[0].text}`);
      //     setLoading(false);
      //     return;
      //   }
      // }

      const formDataObj = createFormData();
      const cleanToken = authToken?.trim();
      console.log("Making request to:", `${BASE_URL}/api/items/`);
      const response = await axios.post(`${BASE_URL}/api/items/`, formDataObj, {
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
      Alert.alert("Success", "Item added successfully");
      router.back();
    } catch (error) {
      console.error("Error submitting item:", error);
      if (axios.isAxiosError(error) && error.response) {
        console.error("Response status:", error.response.status);
        console.error("Response data:", JSON.stringify(error.response.data));

        // Display specific validation errors
        let errorMessage = "Could not add item. Please try again later.";
        if (error.response.data) {
          if (typeof error.response.data === "object") {
            const errorDetails = Object.entries(error.response.data)
              .map(([key, value]) => `${key}: ${value}`)
              .join("\n");
            if (errorDetails) {
              errorMessage = `Validation errors:\n${errorDetails}`;
            }
          }
        }
        Alert.alert("Error", errorMessage);
      } else {
        Alert.alert(
          "Connection Error",
          "Could not connect to the server. Please check your network and try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = (value: string) => {
    updateFormField("category", value);
    setDropdownOpen(false);
  };

  const renderCategoryDropdown = () => {
    if (dropdownOpen) {
      return (
        <TouchableWithoutFeedback onPress={() => setDropdownOpen(false)}>
          <View style={styles.dropdownOverlay}>
            <View style={styles.dropdownContainer}>
              <ScrollView nestedScrollEnabled={true}>
                {CATEGORIES.map((category) => (
                  <TouchableOpacity
                    key={category.value}
                    style={[
                      styles.dropdownItem,
                      formData.category === category.value &&
                        styles.dropdownItemSelected,
                    ]}
                    onPress={() => handleCategorySelect(category.value)}
                  >
                    <Text
                      style={[
                        styles.dropdownItemText,
                        formData.category === category.value &&
                          styles.dropdownItemTextSelected,
                      ]}
                    >
                      {category.label}
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
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          ref={scrollViewRef}
          style={{ paddingTop: insets.top }}
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
              style={styles.dropdownTrigger}
              onPress={() => setDropdownOpen(!dropdownOpen)}
            >
              <Text style={styles.dropdownTriggerText}>
                {formData.category
                  ? CATEGORIES.find((cat) => cat.value === formData.category)
                      ?.label
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

        {/* Render the dropdown outside the ScrollView */}
        {renderCategoryDropdown()}
      </KeyboardAvoidingView>
    </SafeAreaView>
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
    width: "80%",
    maxHeight: 300,
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
});

export default AddItemScreen;
