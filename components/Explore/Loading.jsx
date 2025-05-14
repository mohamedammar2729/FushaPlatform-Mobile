import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Text, Animated, Easing } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext"; // Import theme context

const Loading = () => {
  const { theme, isDarkMode } = useTheme(); // Get theme context

  // Animation values
  const shakeAnimation = useRef(new Animated.Value(0)).current;
  const pulseAnimation = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Smoother shake animation using sine wave easing
    const shakeSequence = Animated.sequence([
      Animated.timing(shakeAnimation, {
        toValue: 8,
        duration: 400,
        useNativeDriver: true,
        easing: Easing.sinInOut, // Smoother sine wave movement
      }),
      Animated.timing(shakeAnimation, {
        toValue: -8,
        duration: 400,
        useNativeDriver: true,
        easing: Easing.sinInOut, // Smoother sine wave movement
      }),
    ]);

    // Pulse animation
    const pulseSequence = Animated.sequence([
      Animated.timing(pulseAnimation, {
        toValue: 1.15, // Slightly less extreme to feel smoother
        duration: 1000, // Longer duration for smoother feel
        useNativeDriver: true,
        easing: Easing.inOut(Easing.quad), // Smoother quadratic easing
      }),
      Animated.timing(pulseAnimation, {
        toValue: 1,
        duration: 1000, // Longer duration for smoother feel
        useNativeDriver: true,
        easing: Easing.inOut(Easing.quad), // Smoother quadratic easing
      }),
    ]);

    // Run animations in loop - starting both at the same time for better harmony
    Animated.loop(Animated.parallel([shakeSequence, pulseSequence])).start();

    return () => {
      // Cleanup animations when component unmounts
      shakeAnimation.stopAnimation();
      pulseAnimation.stopAnimation();
    };
  }, []);

  // Get app palette colors based on theme
  const primaryColor = isDarkMode ? "#e29454" : "#387be0";
  const secondaryColor = isDarkMode ? "#d9843f" : "#4a72ac";
  const backgroundColor = isDarkMode ? theme.colors.background : "#f5f9ff";
  const textColor = isDarkMode ? "#fff" : "#34495e";

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Animated.View
        style={[
          styles.iconContainer,
          {
            transform: [
              { translateX: shakeAnimation },
              { scale: pulseAnimation },
            ],
            backgroundColor: isDarkMode
              ? "rgba(255, 255, 255, 0.1)"
              : "rgba(255, 255, 255, 0.9)",
            shadowColor: isDarkMode ? primaryColor : "#000",
          },
        ]}
      >
        <MaterialIcons name="explore" size={80} color={primaryColor} />
      </Animated.View>

      <Text style={[styles.loadingText, { color: textColor }]}>
        استكشف العالم
      </Text>

      <View style={styles.dotsContainer}>
        {[0, 1, 2].map((index) => (
          <Animated.View
            key={index}
            style={[
              styles.dot,
              {
                backgroundColor: primaryColor,
                opacity: shakeAnimation.interpolate({
                  inputRange: [-8, 0, 8],
                  outputRange: [0.4, 0.9, 0.4], // Smoother opacity transitions
                  extrapolate: "clamp",
                }),
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  iconContainer: {
    padding: 25,
    borderRadius: 75,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    marginBottom: 40,
  },
  loadingText: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  dot: {
    height: 10,
    width: 10,
    borderRadius: 5,
    margin: 5,
  },
});

export default Loading;
