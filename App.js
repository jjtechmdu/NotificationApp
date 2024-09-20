import { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { Alert, Button, StyleSheet, View, Platform } from "react-native";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function App() {
  const [permissionStatus, setPermissionStatus] = useState(null);

  // Request notification permissions on app load
  useEffect(() => {
    async function configurePushNotifications() {
      const { status } = await Notifications.getPermissionsAsync();
      let finalStatus = status;
      if (finalStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      setPermissionStatus(status);
      if (finalStatus !== "granted") {
        Alert.alert(
          "Permission required",
          "Push Notification need appropriate permissions!"
        );
        return;
      }

      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ??
        Constants?.easConfig?.projectId;
      if (!projectId) {
        Alert.alert("Project ID", "Project ID not found");
        return;
      }

      const pushTokenData = await Notifications.getExpoPushTokenAsync({
        projectId,
      });
      console.log(pushTokenData);

      if (Platform.OS === "android") {
        Notifications.setNotificationChannelAsync("default", {
          name: "default",
          importance: Notifications.AndroidImportance.DEFAULT,
        });
      }
    }

    configurePushNotifications();
  }, []);

  useEffect(() => {
    const subscription1 = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log(notification);
        const userName = notification.request.content.data.userName;
        console.log(userName);
      }
    );

    const subscription2 = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log(response);
      }
    );

    return () => {
      subscription1.remove();
      subscription2.remove();
    };
  }, []);

  async function scheduleNotificationHandler() {
    if (permissionStatus !== "granted") {
      Alert.alert("Permission required", "You need to enable notifications");
      return;
    }

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "My first local notification",
          body: "This is body of the notification",
          data: { userName: "Seeni" },
        },
        trigger: {
          seconds: 5,
        },
      });
    } catch (error) {
      console.log("Error scheduling notification: ", error);
    }
  }
  return (
    <View style={styles.container}>
      <Button
        title="Schedule Notification"
        onPress={scheduleNotificationHandler}
      />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
