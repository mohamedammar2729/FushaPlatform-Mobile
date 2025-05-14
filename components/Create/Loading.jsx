import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Text, Animated, Easing } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext"; // Import theme context

const Loading = () => {
  const { theme, isDarkMode } = useTheme(); // Get theme context

  // Animation values
  const shakeAnimation = useRef(new Animated.Value(0)).current;
  const rotateAnimation = useRef(new Animated.Value(0)).current;
  const opacityAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade in
    Animated.timing(opacityAnimation, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    // Smoother shake animation using sine wave easing
    const shakeSequence = Animated.sequence([
      Animated.timing(shakeAnimation, {
        toValue: -4,
        duration: 400,
        useNativeDriver: true,
        easing: Easing.sinInOut, // Smoother sine wave movement
      }),
      Animated.timing(shakeAnimation, {
        toValue: 4,
        duration: 400,
        useNativeDriver: true,
        easing: Easing.sinInOut, // Smoother sine wave movement
      }),
      Animated.timing(shakeAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
        easing: Easing.sinInOut, // Smoother ease out
      }),
    ]);

    // Rotate animation
    const rotateSequence = Animated.timing(rotateAnimation, {
      toValue: 1,
      duration: 3000,
      useNativeDriver: true,
      easing: Easing.linear,
    });

    // Run animations in loop
    Animated.loop(shakeSequence, { iterations: -1 }).start();
    Animated.loop(rotateSequence, { iterations: -1 }).start();

    return () => {
      // Cleanup
      shakeAnimation.stopAnimation();
      rotateAnimation.stopAnimation();
      opacityAnimation.stopAnimation();
    }; 
  }, []);

  // Create the rotation interpolation
  const spin = rotateAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  // Important: Use scaleX transform instead of width for progress bar
  const progressWidth = rotateAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  // Colors based on theme
  const primaryColor = isDarkMode ? "#e29454" : "#387be0";
  const secondaryColor = isDarkMode ? "#d9843f" : "#4a72ac";
  const backgroundColor = isDarkMode ? theme.colors.background : "#f5f9ff";
  const textColor = isDarkMode ? "#fff" : "#34495e";
  const accentColor = isDarkMode ? "#ffd8b5" : "#c1d8ff";

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Animated.View
        style={[
          styles.contentContainer,
          {
            opacity: opacityAnimation,
            transform: [{ translateY: Animated.multiply(shakeAnimation, -1) }],
          },
        ]}
      >
        <Text style={[styles.creatingText, { color: primaryColor }]}>
          إبدأ رحلتك الان
        </Text>

        <View style={styles.iconRow}>
          <Animated.View
            style={[
              styles.outerCircle,
              {
                transform: [{ rotate: spin }],
                borderColor: accentColor,
              },
            ]}
          >
            <View
              style={[
                styles.innerCircle,
                {
                  backgroundColor: isDarkMode
                    ? "rgba(255, 255, 255, 0.15)"
                    : "rgba(255, 255, 255, 0.9)",
                  borderColor: isDarkMode
                    ? "rgba(255, 255, 255, 0.1)"
                    : "transparent",
                },
              ]}
            />
          </Animated.View>

          <Animated.View
            style={[
              styles.iconContainer,
              { transform: [{ translateX: shakeAnimation }] },
            ]}
          >
            <MaterialIcons
              name="travel-explore"
              size={60}
              color={primaryColor}
            />
          </Animated.View>
        </View>

        <View style={[styles.progressBar, { backgroundColor: accentColor }]}>
          <Animated.View
            style={[
              styles.progressFill,
              {
                backgroundColor: primaryColor,
                transform: [{ scaleX: progressWidth }],
                transformOrigin: "left",
              },
            ]}
          />
        </View>

        <Text style={[styles.pleaseWaitText, { color: secondaryColor }]}>
          انتظر لحظة من فضلك...
        </Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  contentContainer: {
    alignItems: "center",
    width: "80%",
  },
  creatingText: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 30,
    letterSpacing: 0.5,
    textAlign: "center",
  },
  iconRow: {
    position: "relative",
    height: 130,
    width: 130,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 40,
  },
  outerCircle: {
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 4,
    borderStyle: "dashed",
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
  },
  innerCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 1,
  },
  iconContainer: {
    position: "absolute",
    zIndex: 2,
  },
  progressBar: {
    height: 8,
    width: "100%",
    borderRadius: 4,
    marginBottom: 20,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    width: "100%",
    borderRadius: 4,
  },
  pleaseWaitText: {
    fontSize: 16,
    fontStyle: "italic",
  },
});

export default Loading;
