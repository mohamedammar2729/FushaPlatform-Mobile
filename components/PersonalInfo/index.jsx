import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  Alert,
} from "react-native";
import { useTheme } from "../../context/ThemeContext";
import { ArrowRight, Save, Edit2 } from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const PersonalInfo = ({ myHandle }) => {
  const { theme, isDarkMode } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    phone: "",
    address: "",
    birthdate: "",
  });
  const [editedData, setEditedData] = useState({});

  // Fetch user data when component mounts
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const firstname = (await AsyncStorage.getItem("firstname")) || "";
        const lastname = (await AsyncStorage.getItem("lastname")) || "";
        const email = (await AsyncStorage.getItem("email")) || "";
        const phone = (await AsyncStorage.getItem("phone")) || "";
        const address = (await AsyncStorage.getItem("address")) || "";
        const birthdate = (await AsyncStorage.getItem("birthdate")) || "";

        const data = { firstname, lastname, email, phone, address, birthdate };
        setUserData(data);
        setEditedData(data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

  const handleInputChange = (field, value) => {
    setEditedData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      // Save data to AsyncStorage
      await AsyncStorage.setItem("firstname", editedData.firstname || "");
      await AsyncStorage.setItem("lastname", editedData.lastname || "");
      await AsyncStorage.setItem("phone", editedData.phone || "");
      await AsyncStorage.setItem("address", editedData.address || "");
      await AsyncStorage.setItem("birthdate", editedData.birthdate || "");

      // Update state
      setUserData(editedData);
      setIsEditing(false);

      Alert.alert("تم", "تم حفظ المعلومات بنجاح");
    } catch (error) {
      console.error("Error saving user data:", error);
      Alert.alert("خطأ", "حدث خطأ أثناء حفظ البيانات");
    }
  };

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => myHandle(false)}
        >
          <ArrowRight size={24} color={theme.colors.accent} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          المعلومات الشخصية
        </Text>
        <TouchableOpacity
          style={[styles.editButton, { backgroundColor: theme.colors.accent }]}
          onPress={() => (isEditing ? handleSave() : setIsEditing(true))}
        >
          {isEditing ? (
            <Save size={20} color={isDarkMode ? "#2D3250" : "#FFFFFF"} />
          ) : (
            <Edit2 size={20} color={isDarkMode ? "#2D3250" : "#FFFFFF"} />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentContainer}>
          {/* Personal Information Card */}
          <View
            style={[
              styles.card,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                ...(isDarkMode
                  ? { borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" }
                  : {
                      elevation: 2,
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.1,
                      shadowRadius: 3,
                    }),
              },
            ]}
          >
            <InfoField
              label="الاسم الأول"
              value={editedData.firstname}
              isEditing={isEditing}
              onChangeText={(text) => handleInputChange("firstname", text)}
              theme={theme}
            />

            <InfoField
              label="الاسم الأخير"
              value={editedData.lastname}
              isEditing={isEditing}
              onChangeText={(text) => handleInputChange("lastname", text)}
              theme={theme}
            />

            <InfoField
              label="البريد الإلكتروني"
              value={editedData.email}
              isEditing={false} // Email is not editable
              theme={theme}
            />

            <InfoField
              label="رقم الهاتف"
              value={editedData.phone}
              isEditing={isEditing}
              onChangeText={(text) => handleInputChange("phone", text)}
              keyboardType="phone-pad"
              theme={theme}
            />

            <InfoField
              label="العنوان"
              value={editedData.address}
              isEditing={isEditing}
              onChangeText={(text) => handleInputChange("address", text)}
              theme={theme}
            />

            <InfoField
              label="تاريخ الميلاد"
              value={editedData.birthdate}
              isEditing={isEditing}
              onChangeText={(text) => handleInputChange("birthdate", text)}
              placeholder="DD/MM/YYYY"
              theme={theme}
              isLast
            />
          </View>

          {/* Information notice */}
          <Text style={[styles.notice, { color: theme.colors.textSecondary }]}>
            * يمكنك تعديل معلوماتك الشخصية بالضغط على زر التعديل
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

// Reusable component for information fields
const InfoField = ({
  label,
  value,
  isEditing,
  onChangeText,
  keyboardType = "default",
  theme,
  placeholder = "",
  isLast = false,
}) => {
  return (
    <View
      style={[
        styles.fieldContainer,
        !isLast && styles.fieldBorder,
        !isLast && { borderBottomColor: theme.colors.border },
      ]}
    >
      <Text style={[styles.fieldLabel, { color: theme.colors.textSecondary }]}>
        {label}
      </Text>
      {isEditing ? (
        <TextInput
          style={[styles.fieldInput, { color: theme.colors.text }]}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textSecondary + "80"}
        />
      ) : (
        <Text style={[styles.fieldValue, { color: theme.colors.text }]}>
          {value || "غير محدد"}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 45,
    flex: 1,
  },
  header: {
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  editButton: {
    padding: 8,
    borderRadius: 8,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  fieldContainer: {
    paddingVertical: 16,
  },
  fieldBorder: {
    borderBottomWidth: 1,
  },
  fieldLabel: {
    fontSize: 14,
    marginBottom: 6,
  },
  fieldValue: {
    fontSize: 16,
    fontWeight: "500",
  },
  fieldInput: {
    fontSize: 16,
    paddingVertical: 4,
    paddingHorizontal: 0,
    textAlign: "right",
  },
  notice: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 20,
  },
});

export default PersonalInfo;
