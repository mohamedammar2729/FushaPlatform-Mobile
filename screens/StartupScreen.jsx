import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  Animated,
  StatusBar,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width, height } = Dimensions.get("window");

const StartupScreen = ({ navigation }) => {
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const progressWidth = useRef(new Animated.Value(0)).current;
  const progressOpacity = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    const checkUserAuth = async () => {
      try {
        // Native driver animations
        Animated.parallel([
          // Fade in logo
          Animated.timing(logoOpacity, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),

          // Fade in text
          Animated.timing(textOpacity, {
            toValue: 1,
            duration: 600,
            delay: 400,
            useNativeDriver: true,
          }),

          // Scale animation
          Animated.sequence([
            Animated.timing(scale, {
              toValue: 1.05,
              duration: 1200,
              useNativeDriver: true,
            }),
            Animated.timing(scale, {
              toValue: 1,
              duration: 300,
              useNativeDriver: true,
            }),
          ]),

          // Progress opacity fade out
          Animated.timing(progressOpacity, {
            toValue: 0,
            duration: 2500,
            delay: 2000,
            useNativeDriver: true,
          }),
        ]).start();

        // Start rotating animation
        Animated.loop(
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          })
        ).start();

        // Separate non-native animation for width
        Animated.timing(progressWidth, {
          toValue: 1, // We'll use this as a percentage
          duration: 2500,
          useNativeDriver: false,
        }).start();

        // Wait for animations to complete
        await new Promise((resolve) => setTimeout(resolve, 2500));

        const userData = await AsyncStorage.getItem("userData");
        navigation.replace(userData ? "Home" : "Login");
      } catch (error) {
        console.error("Error checking authentication:", error);
        navigation.replace("Login");
      }
    };

    checkUserAuth();
  }, [navigation]);

  // Interpolate the rotation animation
  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  // Use interpolate to convert our progress (0-1) to a width value
  const interpolatedWidth = progressWidth.interpolate({
    inputRange: [0, 1],
    outputRange: [0, width * 0.4], // Maximum width is 40% of screen width
  });

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#fff" barStyle="dark-content" />

      {/* Logo with fade-in and scale animation */}
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: logoOpacity,
            transform: [{ scale }],
          },
        ]}
      >
        <Image
          source={require("../assets/colored_logo.jpg")}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>

      {/* Text with fade-in animation */}
      <Animated.View style={[styles.textContainer, { opacity: textOpacity }]}>
        <Text style={styles.title}>فُسحتك عندنا</Text>
        <Text style={styles.subtitle}>اكتشف مصر بطريقة جديدة</Text>
      </Animated.View>

      {/* Loading indicator */}
      <View style={styles.loadingContainer}>
        {/* Fixed width container */}
        <View style={styles.progressBarOuterContainer}>
          {/* Animated inner bar */}
          <Animated.View
            style={[
              styles.progressBarContainer,
              {
                width: interpolatedWidth,
              },
            ]}
          >
            <View style={styles.progressBar} />
          </Animated.View>
        </View>

        {/* Rotating loading indicator - only opacity uses native driver */}
        {/* <Animated.View
          style={[
            styles.loadingIndicator,
            {
              transform: [{ rotate: spin }],
              opacity: progressOpacity,
            },
          ]}
        >
          <View style={styles.loadingCircle} />
        </Animated.View> */}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  logoContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  logo: {
    width: width * 0.5,
    height: height * 0.2,
  },
  textContainer: {
    alignItems: "center",
    marginBottom: 60,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#2c3350",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: "#666",
    textAlign: "center",
    paddingHorizontal: 20,
  },
  loadingContainer: {
    position: "absolute",
    bottom: height * 0.15,
    alignItems: "center",
  },
  progressBarOuterContainer: {
    width: width * 0.4, // Fixed maximum width container
    height: 4,
    backgroundColor: "#e0e0e0",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressBarContainer: {
    height: 4,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    width: "100%",
    backgroundColor: "#2c3350",
    borderRadius: 2,
  },
  loadingIndicator: {
    position: "absolute",
    top: -30,
  },
  loadingCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: "#2c3350",
    borderTopColor: "transparent",
  },
});

export default StartupScreen;
