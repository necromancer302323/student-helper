
import { Drawer } from "expo-router/drawer";
import { Ionicons } from "@expo/vector-icons";

const screenConfig = {
  index: {
    title: "Dashboard",
    icon: "grid-outline",
  },
  tasks: {
    title: "Task Manager",
    icon: "checkbox-outline",
  },
  exams: {
    title: "Exams & Deadlines",
    icon: "calendar-outline",
  },
  progress: {
    title: "Study Progress",
    icon: "stats-chart-outline",
  },
  focus: {
    title: "Focus Mode",
    icon: "timer-outline",
  },
} as const;

export default function NavigationLayout() {
  return (
    <Drawer
      screenOptions={({ route }) => {
        const config =
          screenConfig[route.name as keyof typeof screenConfig];

        const iconName = config?.icon ?? "apps-outline";

        return {
          title: config?.title ?? route.name,

          headerStyle: {
            backgroundColor: "#FFFFFF",
          },
          headerTintColor: "#172033",
          headerTitleStyle: {
            fontSize: 20,
            fontWeight: "800",
          },
          headerShadowVisible: false,

          drawerStyle: {
            backgroundColor: "#FFFFFF",
            width: 285,
          },
          drawerActiveTintColor: "#FFFFFF",
          drawerInactiveTintColor: "#64748B",
          drawerActiveBackgroundColor: "#4F46E5",
          drawerLabelStyle: {
            fontSize: 14,
            fontWeight: "600",
            marginLeft: 2,
          },
          drawerItemStyle: {
            borderRadius: 12,
            marginHorizontal: 10,
            marginVertical: 4,
          },

          drawerIcon: ({ color, size }) => (
            <Ionicons
              name={iconName as keyof typeof Ionicons.glyphMap}
              color={color}
              size={size}
            />
          ),

          sceneStyle: {
            backgroundColor: "#F5F7FB",
          },
        };
      }}
    >
      <Drawer.Screen name="index" />
      <Drawer.Screen name="tasks" />
      <Drawer.Screen name="exams" />
      <Drawer.Screen name="progress" />
      <Drawer.Screen name="focus" />
    </Drawer>
  );
}
