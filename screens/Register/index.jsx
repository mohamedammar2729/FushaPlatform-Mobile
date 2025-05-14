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
  Animated,
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import img1 from "../../assets/Group.png";
import axios from "axios";

const { width, height } = Dimensions.get("window");

const Register = ({ navigation }) => {
  const [IsSubmit, setIsSubmit] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const fadeAnim = new Animated.Value(0);
  const [showPassword, setShowPassword] = useState({
    password: false,
    confirmPassword: false,
  });
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    city: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({
    firstName: false,
    lastName: false,
    city: false,
    email: false,
    password: false,
    confirmPassword: false,
  });
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  // Fade in animation for success message
  useEffect(() => {
    if (showSuccess) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();

      // Auto navigate after delay
      const timer = setTimeout(() => {
        navigation.navigate("Login");
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [showSuccess, fadeAnim, navigation]);

  // Add keyboard listeners
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => {
        setKeyboardVisible(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
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
  const nameRegex = /^[a-zA-Z\u0600-\u06FF\s]+$/;
  const emailRegex = /^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+$/;
  const passwordRegex = /^(?=.*[A-Z])(?=.*[@#*+-]).{8,}$/;

  const validateField = (name, value) => {
    let isValid = true;

    switch (name) {
      case "firstName":
      case "lastName":
      case "city":
        isValid = nameRegex.test(value);
        break;
      case "email":
        isValid = emailRegex.test(value);
        break;
      case "password":
        isValid = passwordRegex.test(value);
        break;
      case "confirmPassword":
        isValid = value === formData.password;
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
        firstname: formData.firstName,
        lastname: formData.lastName,
        city: formData.city,
        email: formData.email,
        password: formData.password,
      };

      axios
        .post("https://iti-server-production.up.railway.app/api/user", payload)
        .then((response) => {
          console.log(response);
          setShowSuccess(true);
        })
        .catch((error) => {
          console.error(error);
          setIsSubmit(false);
        });
    } else {
      setIsSubmit(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      {/* Background Images */}
      <View
        style={[
          styles.imageContainer,
          keyboardVisible && styles.imageContainerKeyboardVisible,
        ]}
      >
        <Image
          source={{
            uri: "https://images.pexels.com/photos/30668182/pexels-photo-30668182/free-photo-of-hot-air-balloons-sunrise-adventure-in-cappadocia.jpeg",
          }}
          style={styles.backgroundImage}
          resizeMode="cover"
          blurRadius={5}
        />
        <View style={styles.imageCurve} />
        <Image source={img1} style={styles.overlayImage} resizeMode="contain" />
      </View>

      {/* Form ScrollView - modified to slide under the image */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={[
          styles.scrollView,
          keyboardVisible && styles.scrollViewKeyboardVisible,
        ]}
        contentContainerStyle={styles.scrollViewContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.formContainer}>
          <Text style={styles.title}>إنشاء حساب جديد</Text>

          {/* First Name Input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, errors.firstName && styles.errorInput]}
              placeholder="الاسم الأول"
              value={formData.firstName}
              onChangeText={(text) => handleChange("firstName", text)}
              textAlign="right"
              accessibilityLabel="First Name Input"
              accessible={true}
              importantForAccessibility="yes"
            />
            {errors.firstName && (
              <Text style={styles.errorText}>
                الاسم الأول يجب أن يحتوي على حروف فقط
              </Text>
            )}
          </View>

          {/* Last Name Input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, errors.lastName && styles.errorInput]}
              placeholder="اسم العائلة"
              value={formData.lastName}
              onChangeText={(text) => handleChange("lastName", text)}
              textAlign="right"
            />
            {errors.lastName && (
              <Text style={styles.errorText}>
                إسم العائلة يجب أن يحتوي علي حروف فقط
              </Text>
            )}
          </View>

          {/* City Input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, errors.city && styles.errorInput]}
              placeholder="المدينة"
              value={formData.city}
              onChangeText={(text) => handleChange("city", text)}
              textAlign="right"
            />
            {errors.city && (
              <Text style={styles.errorText}>
                المدينة/المحافظة يجب أن تحتوي على حروف فقط
              </Text>
            )}
          </View>

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
                يجب أن يحتوي الرقم السري على 8 أحرف على الأقل، حرف كبير واحد
                ورمز واحد
              </Text>
            )}
          </View>

          {/* Confirm Password Input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={[
                styles.input,
                errors.confirmPassword && styles.errorInput,
              ]}
              placeholder="تأكيد الرقم السري"
              secureTextEntry={!showPassword.confirmPassword}
              value={formData.confirmPassword}
              onChangeText={(text) => handleChange("confirmPassword", text)}
              textAlign="right"
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() =>
                setShowPassword((prev) => ({
                  ...prev,
                  confirmPassword: !prev.confirmPassword,
                }))
              }
            >
              <Text>{showPassword.confirmPassword ? "🙈" : "👁"}</Text>
            </TouchableOpacity>
            {errors.confirmPassword && (
              <Text style={styles.errorText}>
                تأكيد الرقم السري يجب أن يطابق الرقم السري
              </Text>
            )}
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.button, IsSubmit && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={IsSubmit}
            activeOpacity={0.8}
          >
            {IsSubmit ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.buttonText}>سجل حساب جديد</Text>
            )}
          </TouchableOpacity>

          {/* Login Link */}
          <Text style={styles.loginText}>
            هل لديك حساب بالفعل؟{" "}
            <Text
              style={styles.loginLink}
              onPress={() => navigation.navigate("Login")}
            >
              تسجيل الدخول
            </Text>
          </Text>
        </View>
      </ScrollView>

      {/* Success Alert */}
      {showSuccess && (
        <Animated.View style={[styles.successAlert, { opacity: fadeAnim }]}>
          <View style={styles.alertIcon}>
            <Text style={styles.checkIcon}>✓</Text>
          </View>
          <Text style={styles.successText}>تم إنشاء الحساب بنجاح</Text>
          <Text style={styles.successSubText}>
            جاري تحويلك لصفحة تسجيل الدخول...
          </Text>
        </Animated.View>
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f6fa",
  },
  imageContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.35,
    zIndex: 1,
    elevation: 1,
  },
  imageContainerKeyboardVisible: {
    top: -100, // Move images up when keyboard is visible
    height: height * 0.25,
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
    top: height * 0.3,
    left: 15,
    right: 15,
    bottom: 20,
    zIndex: 0,
  },
  scrollViewKeyboardVisible: {
    top: height * 0.2, // Move form up when keyboard is visible
  },
  scrollViewContent: {
    paddingTop: 20,
    paddingBottom: 40,
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
  // Updated to match login input styling
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
  // Updated to match login eye icon
  eyeIcon: {
    position: "absolute",
    left: 10,
    top: 10,
    padding: 5,
    zIndex: 5,
  },
  button: {
    backgroundColor: "#0984e3",
    padding: 10,
    borderRadius: 20,
    marginVertical: 15,
    shadowColor: "#0984e3",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  disabledButton: {
    backgroundColor: "#74b9ff",
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
  // Success alert remains the same
  successAlert: {
    position: "absolute",
    top: height * 0.4,
    left: width * 0.1,
    right: width * 0.1,
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
    zIndex: 100,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 15,
  },
  alertIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#2ecc71",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  checkIcon: {
    color: "#fff",
    fontSize: 36,
    fontWeight: "bold",
  },
  successText: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#2d3436",
    fontFamily: "ArabicBold",
  },
  successSubText: {
    fontSize: 14,
    color: "#636e72",
    textAlign: "center",
  },
});

export default Register;
