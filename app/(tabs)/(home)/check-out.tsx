
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, Pressable, StyleSheet, Alert, Platform } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';

interface Key {
  id: string;
  name: string;
  location: string;
  isCheckedOut: boolean;
  checkedOutBy?: string;
  checkedOutAt?: string;
}

interface LogEntry {
  id: string;
  keyName: string;
  action: 'checkout' | 'checkin';
  personName: string;
  timestamp: string;
}

export default function CheckOutScreen() {
  const [keys, setKeys] = useState<Key[]>([]);
  const [selectedKey, setSelectedKey] = useState<string>('');
  const [personName, setPersonName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadKeys();
  }, []);

  const loadKeys = async () => {
    try {
      const storedKeys = await AsyncStorage.getItem('keys');
      if (storedKeys) {
        const parsedKeys = JSON.parse(storedKeys);
        const availableKeys = parsedKeys.filter((k: Key) => !k.isCheckedOut);
        setKeys(availableKeys);
      }
    } catch (error) {
      console.log('Error loading keys:', error);
    }
  };

  const addLogEntry = async (keyName: string, personName: string) => {
    try {
      const storedLogs = await AsyncStorage.getItem('checkoutLogs');
      const logs: LogEntry[] = storedLogs ? JSON.parse(storedLogs) : [];
      
      const newLog: LogEntry = {
        id: Date.now().toString(),
        keyName,
        action: 'checkout',
        personName,
        timestamp: new Date().toISOString(),
      };
      
      logs.push(newLog);
      await AsyncStorage.setItem('checkoutLogs', JSON.stringify(logs));
      console.log('Log entry added:', newLog);
    } catch (error) {
      console.log('Error adding log entry:', error);
    }
  };

  const handleCheckOut = async () => {
    if (!selectedKey) {
      Alert.alert('Error', 'Please select a key to check out');
      return;
    }

    if (!personName.trim()) {
      Alert.alert('Error', 'Please enter the name of the person checking out the key');
      return;
    }

    setLoading(true);

    try {
      const storedKeys = await AsyncStorage.getItem('keys');
      if (storedKeys) {
        const parsedKeys: Key[] = JSON.parse(storedKeys);
        const updatedKeys = parsedKeys.map(key => {
          if (key.id === selectedKey) {
            return {
              ...key,
              isCheckedOut: true,
              checkedOutBy: personName.trim(),
              checkedOutAt: new Date().toISOString(),
            };
          }
          return key;
        });

        await AsyncStorage.setItem('keys', JSON.stringify(updatedKeys));
        
        // Add log entry
        const selectedKeyObj = parsedKeys.find(k => k.id === selectedKey);
        if (selectedKeyObj) {
          await addLogEntry(selectedKeyObj.name, personName.trim());
        }
        
        Alert.alert(
          'Success',
          `Key checked out to ${personName.trim()}`,
          [
            {
              text: 'OK',
              onPress: () => {
                // Navigate to home screen and refresh
                router.replace('/');
              },
            },
          ]
        );
      }
    } catch (error) {
      console.log('Error checking out key:', error);
      Alert.alert('Error', 'Failed to check out key. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={commonStyles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <IconSymbol name="arrow.right.circle.fill" color={colors.primary} size={48} />
          <Text style={styles.headerTitle}>Check Out Key</Text>
          <Text style={styles.headerSubtitle}>
            Select a key and enter the person&apos;s name who is checking it out
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={commonStyles.label}>Person Name *</Text>
          <TextInput
            style={commonStyles.input}
            placeholder="Enter name"
            placeholderTextColor={colors.textSecondary}
            value={personName}
            onChangeText={setPersonName}
            autoCapitalize="words"
          />
        </View>

        <View style={styles.section}>
          <Text style={commonStyles.label}>Select Key *</Text>
          {keys.length === 0 ? (
            <View style={styles.emptyState}>
              <IconSymbol name="key.slash" color={colors.textSecondary} size={48} />
              <Text style={styles.emptyText}>No keys available</Text>
              <Text style={styles.emptySubtext}>
                All keys are currently checked out or no keys have been added yet
              </Text>
            </View>
          ) : (
            keys.map((key) => (
              <Pressable
                key={key.id}
                style={[
                  styles.keyCard,
                  selectedKey === key.id && styles.keyCardSelected,
                ]}
                onPress={() => setSelectedKey(key.id)}
              >
                <View style={styles.keyCardContent}>
                  <View style={[
                    styles.keyIcon,
                    selectedKey === key.id && styles.keyIconSelected,
                  ]}>
                    <IconSymbol 
                      name="key.fill" 
                      color={selectedKey === key.id ? colors.card : colors.primary} 
                      size={24} 
                    />
                  </View>
                  <View style={styles.keyInfo}>
                    <Text style={[
                      styles.keyName,
                      selectedKey === key.id && styles.keyNameSelected,
                    ]}>
                      {key.name}
                    </Text>
                    <Text style={styles.keyLocation}>
                      Location: {key.location}
                    </Text>
                  </View>
                </View>
                {selectedKey === key.id && (
                  <IconSymbol name="checkmark.circle.fill" color={colors.primary} size={24} />
                )}
              </Pressable>
            ))
          )}
        </View>

        <View style={styles.buttonContainer}>
          <Pressable
            style={[
              buttonStyles.primary,
              (!selectedKey || !personName.trim() || loading) && styles.buttonDisabled,
            ]}
            onPress={handleCheckOut}
            disabled={!selectedKey || !personName.trim() || loading}
          >
            <Text style={buttonStyles.text}>
              {loading ? 'Checking Out...' : 'Check Out Key'}
            </Text>
          </Pressable>

          <Pressable
            style={[buttonStyles.outline, styles.cancelButton]}
            onPress={() => router.back()}
          >
            <Text style={buttonStyles.outlineText}>Cancel</Text>
          </Pressable>
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
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  section: {
    marginBottom: 24,
  },
  keyCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: colors.border,
    boxShadow: '0px 2px 8px rgba(37, 99, 235, 0.1)',
    elevation: 3,
  },
  keyCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.lightBlue,
  },
  keyCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  keyIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.lightBlue,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  keyIconSelected: {
    backgroundColor: colors.primary,
  },
  keyInfo: {
    flex: 1,
  },
  keyName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  keyNameSelected: {
    color: colors.primary,
  },
  keyLocation: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: colors.card,
    borderRadius: 12,
    boxShadow: '0px 2px 8px rgba(37, 99, 235, 0.1)',
    elevation: 3,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  buttonContainer: {
    marginTop: 16,
  },
  cancelButton: {
    marginTop: 12,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});
