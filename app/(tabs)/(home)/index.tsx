
import React, { useState, useEffect } from "react";
import { Stack, Link } from "expo-router";
import { ScrollView, Pressable, StyleSheet, View, Text, Platform } from "react-native";
import { IconSymbol } from "@/components/IconSymbol";
import { colors, commonStyles } from "@/styles/commonStyles";
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Key {
  id: string;
  name: string;
  location: string;
  isCheckedOut: boolean;
  checkedOutBy?: string;
  checkedOutAt?: string;
}

export default function HomeScreen() {
  const [keys, setKeys] = useState<Key[]>([]);
  const [checkedOutCount, setCheckedOutCount] = useState(0);

  useEffect(() => {
    loadKeys();
  }, []);

  const loadKeys = async () => {
    try {
      const storedKeys = await AsyncStorage.getItem('keys');
      if (storedKeys) {
        const parsedKeys = JSON.parse(storedKeys);
        setKeys(parsedKeys);
        const checkedOut = parsedKeys.filter((k: Key) => k.isCheckedOut).length;
        setCheckedOutCount(checkedOut);
      }
    } catch (error) {
      console.log('Error loading keys:', error);
    }
  };

  const menuItems = [
    {
      title: "Check Out Key",
      description: "Sign out a key to a person",
      route: "/check-out",
      icon: "arrow.right.circle.fill",
      color: colors.primary,
    },
    {
      title: "Check In Key",
      description: "Return a key to inventory",
      route: "/check-in",
      icon: "arrow.left.circle.fill",
      color: colors.secondary,
    },
    {
      title: "Manage Keys",
      description: "Add or remove keys from system",
      route: "/manage-keys",
      icon: "key.fill",
      color: colors.accent,
    }
  ];

  const renderMenuItem = (item: typeof menuItems[0]) => (
    <Link key={item.route} href={item.route as any} asChild>
      <Pressable style={styles.menuCard}>
        <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
          <IconSymbol name={item.icon as any} color={colors.card} size={28} />
        </View>
        <View style={styles.menuContent}>
          <Text style={styles.menuTitle}>{item.title}</Text>
          <Text style={styles.menuDescription}>{item.description}</Text>
        </View>
        <IconSymbol name="chevron.right" color={colors.textSecondary} size={20} />
      </Pressable>
    </Link>
  );

  return (
    <>
      {Platform.OS === 'ios' && (
        <Stack.Screen
          options={{
            title: "Key Management",
            headerLargeTitle: true,
          }}
        />
      )}
      <View style={[commonStyles.container]}>
        <ScrollView 
          contentContainerStyle={[
            styles.scrollContent,
            Platform.OS !== 'ios' && styles.scrollContentWithTabBar
          ]}
          showsVerticalScrollIndicator={false}
        >
          {Platform.OS !== 'ios' && (
            <Text style={[commonStyles.title, styles.headerTitle]}>Key Management</Text>
          )}
          
          <View style={styles.statsContainer}>
            <View style={[styles.statCard, { backgroundColor: colors.primary }]}>
              <Text style={styles.statNumber}>{keys.length}</Text>
              <Text style={styles.statLabel}>Total Keys</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: colors.secondary }]}>
              <Text style={styles.statNumber}>{checkedOutCount}</Text>
              <Text style={styles.statLabel}>Checked Out</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: colors.accent }]}>
              <Text style={styles.statNumber}>{keys.length - checkedOutCount}</Text>
              <Text style={styles.statLabel}>Available</Text>
            </View>
          </View>

          <View style={styles.menuSection}>
            {menuItems.map(renderMenuItem)}
          </View>

          {keys.length > 0 && (
            <View style={styles.recentSection}>
              <Text style={commonStyles.subtitle}>Recent Activity</Text>
              {keys.slice(0, 3).map((key) => (
                <View key={key.id} style={styles.activityCard}>
                  <View style={styles.activityIcon}>
                    <IconSymbol 
                      name={key.isCheckedOut ? "lock.fill" : "lock.open.fill"} 
                      color={key.isCheckedOut ? colors.error : colors.success} 
                      size={20} 
                    />
                  </View>
                  <View style={styles.activityContent}>
                    <Text style={styles.activityTitle}>{key.name}</Text>
                    <Text style={styles.activitySubtitle}>
                      {key.isCheckedOut 
                        ? `Checked out by ${key.checkedOutBy}` 
                        : `Available at ${key.location}`}
                    </Text>
                  </View>
                  <View style={[
                    styles.statusBadge, 
                    { backgroundColor: key.isCheckedOut ? colors.error : colors.success }
                  ]}>
                    <Text style={styles.statusText}>
                      {key.isCheckedOut ? 'Out' : 'In'}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  scrollContentWithTabBar: {
    paddingBottom: 120,
  },
  headerTitle: {
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.card,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.card,
    textAlign: 'center',
  },
  menuSection: {
    marginBottom: 24,
  },
  menuCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  menuDescription: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  recentSection: {
    marginBottom: 24,
  },
  activityCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  activitySubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.card,
  },
});
