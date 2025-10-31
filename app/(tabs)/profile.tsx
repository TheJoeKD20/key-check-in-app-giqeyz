
import { View, Text, StyleSheet, ScrollView, Platform } from "react-native";
import { IconSymbol } from "@/components/IconSymbol";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, commonStyles } from "@/styles/commonStyles";

export default function ProfileScreen() {
  return (
    <View style={[commonStyles.container]}>
      <ScrollView 
        contentContainerStyle={[
          styles.scrollContent,
          Platform.OS !== 'ios' && styles.scrollContentWithTabBar
        ]}
        showsVerticalScrollIndicator={false}
      >
        {Platform.OS !== 'ios' && (
          <Text style={[commonStyles.title, styles.headerTitle]}>Profile</Text>
        )}
        
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <IconSymbol name="person.fill" color={colors.card} size={48} />
          </View>
          <Text style={styles.profileName}>Key Manager</Text>
          <Text style={styles.profileRole}>Administrator</Text>
        </View>

        <View style={styles.infoSection}>
          <Text style={commonStyles.subtitle}>About</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <IconSymbol name="building.2.fill" color={colors.primary} size={20} />
              <Text style={styles.infoText}>Key Management System</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <IconSymbol name="info.circle.fill" color={colors.secondary} size={20} />
              <Text style={styles.infoText}>Version 1.0.0</Text>
            </View>
          </View>
        </View>

        <View style={styles.descriptionSection}>
          <Text style={commonStyles.subtitle}>System Information</Text>
          <View style={styles.descriptionCard}>
            <Text style={styles.descriptionText}>
              This application helps you manage client site keys efficiently. 
              You can check keys in and out, track who has them, and maintain 
              a complete inventory of all keys in the system.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
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
  profileHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)',
    elevation: 5,
  },
  profileName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  profileRole: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  infoSection: {
    marginBottom: 24,
  },
  infoCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  infoText: {
    fontSize: 16,
    color: colors.text,
    marginLeft: 12,
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  descriptionSection: {
    marginBottom: 24,
  },
  descriptionCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 20,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  descriptionText: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 24,
  },
});
