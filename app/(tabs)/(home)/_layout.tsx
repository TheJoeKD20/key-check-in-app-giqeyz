
import { Platform } from 'react-native';
import { Stack } from 'expo-router';

export default function HomeLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: Platform.OS === 'ios',
          title: 'Home'
        }}
      />
      <Stack.Screen
        name="check-out"
        options={{
          presentation: 'modal',
          title: 'Check Out Key',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="check-in"
        options={{
          presentation: 'modal',
          title: 'Check In Key',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="manage-keys"
        options={{
          presentation: 'modal',
          title: 'Manage Keys',
          headerShown: true,
        }}
      />
    </Stack>
  );
}
