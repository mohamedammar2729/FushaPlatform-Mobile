import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Modal,
} from "react-native";
import img1 from "../../assets/Group.png";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Loading from "../../components/Loading";

const { width, height } = Dimensions.get("window");

const Login = ({ navigation }) => {
  const [loginError, setLoginError] = useState("");
  const [IsSubmit, setIsSubmit] = useState(false);
  const [showPassword, setShowPassword] = useState({
    password: false,
  });
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({
    email: false,
    password: false,
  });
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  // Add keyboard listeners
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  // Validation regex patterns
  const emailRegex = /^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+$/;
  const passwordRegex = /^(?=.*[A-Z])(?=.*[@#*+-]).{8,}$/;

  const validateField = (name, value) => {
    let isValid = true;

    switch (name) {
      case "email":
        isValid = emailRegex.test(value);
        break;
      case "password":
        isValid = passwordRegex.test(value);
        break;
    }

    setErrors((prev) => ({ ...prev, [name]: !isValid }));
    return isValid;
  };

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const handleSubmit = () => {
    if (IsSubmit) return;
    setIsSubmit(true);
    const valid = Object.keys(formData).every((key) =>
      validateField(key, formData[key])
    );

    if (valid) {
      const payload = {
        email: formData.email,
        password: formData.password,
      };

      axios
        .post("https://iti-server-production.up.railway.app/api/login", payload)
        .then(async (response) => {
          try {
            // Store user data and token
            await AsyncStorage.setItem(
              "user",
              JSON.stringify(response.data.user)
            );
            await AsyncStorage.setItem("token", response.data.token);
            console.log(response.data.user);

            await AsyncStorage.setItem(
              "firstname",
              response.data.user.firstname
            );
            await AsyncStorage.setItem("lastname", response.data.user.lastname);
            await AsyncStorage.setItem("email", response.data.user.email);
            setTimeout(() => {
              setIsSubmit(false);
              navigation.navigate("Home");
            }, 2000);
          } catch (error) {
            console.error("Error storing data:", error);
            setIsSubmit(false);
          }
        })
        .catch((error) => {
          console.error(error);
          setLoginError("خطأ في البريد او كلمة المرور");
          setIsSubmit(false);
        });
    } else {
      setIsSubmit(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
    >
      {/* Loading Modal */}
      <Modal
        transparent={true}
        animationType="fade"
        visible={IsSubmit}
        onRequestClose={() => {}}
      >
        <Loading message="جاري تسجيل الدخول..." />
      </Modal>

      {/* Background Images */}
      <View style={[
        styles.imageContainer, 
        keyboardVisible && styles.imageContainerKeyboardVisible
      ]}>
        <Image
          source={{
            uri: "https://images.pexels.com/photos/1169754/pexels-photo-1169754.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
          }}
          style={styles.backgroundImage}
          resizeMode="cover"
          blurRadius={1}
        />

        <Image source={img1} style={styles.overlayImage} resizeMode="contain" />
      </View>

      {/* Form ScrollView */}
      <ScrollView
        contentContainerStyle={styles.formContainer}
        style={[
          styles.scrollView,
          keyboardVisible && styles.scrollViewKeyboardVisible
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>تسجيل الدخول</Text>
        {/* Display the error message after the button */}
        {loginError !== "" && (
          <Text
            style={[
              styles.errorText,
              {
                fontSize: 16,
                textAlign: "center",
                marginTop: 0,
                marginBottom: 3,
              },
            ]}
          >
            {loginError}
          </Text>
        )}
        {/* Email Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, errors.email && styles.errorInput]}
            placeholder="البريد الإلكتروني"
            value={formData.email}
            onChangeText={(text) => handleChange("email", text)}
            textAlign="right"
            keyboardType="email-address"
          />
          {errors.email && (
            <Text style={styles.errorText}>
              الرجاء قم بإدخال بريد إلكتروني صحيح
            </Text>
          )}
        </View>

        {/* Password Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, errors.password && styles.errorInput]}
            placeholder="الرقم السري"
            secureTextEntry={!showPassword.password}
            value={formData.password}
            onChangeText={(text) => handleChange("password", text)}
            textAlign="right"
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() =>
              setShowPassword((prev) => ({
                ...prev,
                password: !prev.password,
              }))
            }
          >
            <Text>{showPassword.password ? "🙈" : "👁"}</Text>
          </TouchableOpacity>
          {errors.password && (
            <Text style={styles.errorText}>
              يجب أن يحتوي الرقم السري على 8 أحرف على الأقل، حرف كبير واحد ورمز
              واحد
            </Text>
          )}
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={styles.button}
          onPress={handleSubmit}
          disabled={IsSubmit}
        >
          <Text style={styles.buttonText}>تسجيل الدخول</Text>
        </TouchableOpacity>

        {/* Login Link */}
        <Text style={styles.loginText}>
          ليس لديك حساب ؟
          <Text
            style={styles.loginLink}
            onPress={() => navigation.navigate("Register")}
          >
            إنشاء حساب جديد
          </Text>
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
    backgroundColor: "#f5f6fa",
  },
  imageContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  imageContainerKeyboardVisible: {
    top: -100, // Move images up when keyboard is visible
  },
  backgroundImage: {
    width: width,
    height: 700,
    marginTop: -280,
    borderBottomRightRadius: 400,
    transform: [{ rotate: "35deg" }],
  },
  overlayImage: {
    position: "absolute",
    top: -50,
    left: 60,
    width: 250,
    height: 450,
    transform: [{ rotate: "5deg" }],
  },
  scrollView: {
    position: "absolute",
    top: height * 0.37,
    left: 15,
    right: 15,
    bottom: 20,
    zIndex: 0,
  },
  scrollViewKeyboardVisible: {
    top: height * 0.25, // Move form up when keyboard is visible
  },
  formContainer: {
    borderRadius: 35,
    backgroundColor: "#f5f6fa",
    padding: height * 0.05,
    marginTop: height * 0.03,
    justifyContent: "center",
    shadowColor: "#000",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#2d3436",
    fontFamily: "ArabicBold",
  },
  inputContainer: {
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#c7c7c7",
    borderRadius: 25,
    padding: 10,
    fontSize: 14,
    backgroundColor: "rgb(255, 255, 255)",
  },
  errorInput: {
    borderColor: "red",
  },
  errorText: {
    color: "red",
    fontSize: 12,
    textAlign: "right",
    marginTop: 4,
  },
  eyeIcon: {
    position: "absolute",
    left: 10,
    top: 10,
  },
  button: {
    backgroundColor: "#0984e3",
    padding: 10,
    borderRadius: 20,
    marginVertical: 15,
  },
  buttonText: {
    color: "white",
    fontSize: 15,
    fontWeight: "bold",
    textAlign: "center",
  },
  loginText: {
    textAlign: "center",
    marginTop: 8,
    fontSize: 14,
    color: "#2d3436",
  },
  loginLink: {
    color: "#0984e3",
    fontWeight: "bold",
  },
});

export default Login;
