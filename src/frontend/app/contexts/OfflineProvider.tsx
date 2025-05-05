// import React, { useEffect, useState } from "react";
// import { TouchableOpacity, View, Text, StyleSheet } from "react-native";
// // import NetInfo from "@react-native-community/netinfo";

// // Create a component to detect network status
// const NetworkStatusProvider = ({ children }: any) => {
//   const [isConnected, setIsConnected] = useState(true);

//   useEffect(() => {
//     const unsubscribe = NetInfo.addEventListener((state) => {
//       setIsConnected(state.isConnected ?? false);
//     });

//     return () => unsubscribe();
//   }, []);

//   if (!isConnected) {
//     return (
//       <View style={styles.offlineContainer}>
//         <Text style={styles.offlineText}>
//           No internet connection. Please check your settings and try again.
//         </Text>
//         <TouchableOpacity
//           style={styles.retryButton}
//           onPress={() => NetInfo.fetch()}
//         >
//           <Text style={styles.buttonText}>Retry</Text>
//         </TouchableOpacity>
//       </View>
//     );
//   }

//   return children;
// };

// const styles = StyleSheet.create({
//   offlineContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     padding: 20,
//     backgroundColor: "#fff",
//   },
//   offlineText: {
//     fontSize: 16,
//     color: "#ff3b30",
//     marginBottom: 12,
//     textAlign: "center",
//   },
//   retryButton: {
//     backgroundColor: "#ff3b30",
//     paddingVertical: 10,
//     paddingHorizontal: 20,
//     borderRadius: 5,
//   },
//   buttonText: {
//     color: "#ffffff",
//     fontWeight: "bold",
//   },
// });

// export default NetworkStatusProvider;
