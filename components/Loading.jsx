import React, { useRef, useEffect } from "react";
import { View, Text, StyleSheet, Dimensions, Animated, Image } from "react-native";
import { Plane } from "lucide-react-native"; // Using a different icon

const { width } = Dimensions.get("window");

export default function LoadingScreen() {
  const dots = [0, 1, 2, 3];
  const dotAnimations = dots.map(() => useRef(new Animated.Value(1)).current);
  const logoScale = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const titleFadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate dots
    dots.forEach((_, index) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(index * 200),
          Animated.timing(dotAnimations[index], {
            toValue: 1.5,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(dotAnimations[index], {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
        ])
      ).start();
    });

    // Animate logo
    Animated.loop(
      Animated.sequence([
        Animated.spring(logoScale, {
          toValue: 1.1,
          friction: 2,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 2,
          tension: 40,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Fade in animations
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    Animated.timing(titleFadeAnim, {
      toValue: 1,
      duration: 1000,
      delay: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const dotStyles = dots.map((_, index) => ({
    transform: [{ scale: dotAnimations[index] }],
    opacity: dotAnimations[index],
  }));

  return (
    <View style={styles.container}>
      <Animated.Image
        source={{
          uri: "https://images.pexels.com/photos/1169754/pexels-photo-1169754.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
        }}
        style={[styles.backgroundImage, { opacity: fadeAnim }]}
      />
      <View style={styles.overlay} />

      <Animated.View
        style={[styles.logoContainer, { transform: [{ scale: logoScale }] }]}
      >
        <Plane size={48} color="#ffffff" strokeWidth={1.5} />
      </Animated.View>

      <Animated.Text style={[styles.title, { opacity: titleFadeAnim }]}>
        Fusha
      </Animated.Text>

      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>is loading</Text>
        <View style={styles.dotsContainer}>
          {dots.map((dot, index) => (
            <Animated.View key={dot} style={[styles.dot, dotStyles[index]]} />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  backgroundImage: {
    position: "absolute",
    width: width,
    height: "100%",
    resizeMode: "cover",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.10)",
  },
  logoContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 42,
    fontWeight: "600",
    color: "#ffffff",
    marginBottom: 8,
    fontFamily: "Inter-Bold",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 20,
    color: "#ffffff",
    marginRight: 8,
    fontFamily: "Inter-Regular",
  },
  dotsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ffffff",
    marginHorizontal: 4,
  },
});
