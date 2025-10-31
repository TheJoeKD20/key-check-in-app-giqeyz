
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, Pressable, StyleSheet, Alert } from 'react-native';
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

export default function CheckInScreen() {
  const [keys, setKeys] = useState<Key[]>([]);
  const [selectedKey, setSelectedKey] = useState<string>('');
  const [returnedBy, setReturnedBy] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadKeys();
  }, []);

  const loadKeys = async () => {
    try {
      const storedKeys = await AsyncStorage.getItem('keys');
      if (storedKeys) {
        const parsedKeys = JSON.parse(storedKeys);
        const checkedOutKeys = parsedKeys.filter((k: Key) => k.isCheckedOut);
        setKeys(checkedOutKeys);
      }
    } catch (error) {
      console.log('Error loading keys:', error);
    }
  };

  const handleCheckIn = async () => {
    if (!selectedKey) {
      Alert.alert('Error', 'Please select a key to check in');
      return;
    }

    if (!returnedBy.trim()) {
      Alert.alert('Error', 'Please enter the name of the person returning the key');
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
              isCheckedOut: false,
              checkedOutBy: undefined,
              checkedOutAt: undefined,
            };
          }
          return key;
        });

        await AsyncStorage.setItem('keys', JSON.stringify(updatedKeys));
        
        Alert.alert(
          'Success',
          `Key returned by ${returnedBy.trim()}`,
          [
            {
              text: 'OK',
              onPress: () => router.back(),
            },
          ]
        );
      }
    } catch (error) {
      console.log('Error checking in key:', error);
      Alert.alert('Error', 'Failed to check in key. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <View style={commonStyles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <IconSymbol name="arrow.left.circle.fill" color={colors.secondary} size={48} />
          <Text style={styles.headerTitle}>Check In Key</Text>
          <Text style={styles.headerSubtitle}>
            Select a key and enter the person&apos;s name who is returning it
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={commonStyles.label}>Returned By *</Text>
          <TextInput
            style={commonStyles.input}
            placeholder="Enter name"
            placeholderTextColor={colors.textSecondary}
            value={returnedBy}
            onChangeText={setReturnedBy}
            autoCapitalize="words"
          />
        </View>

        <View style={styles.section}>
          <Text style={commonStyles.label}>Select Key *</Text>
          {keys.length === 0 ? (
            <View style={styles.emptyState}>
              <IconSymbol name="checkmark.circle" color={colors.textSecondary} size={48} />
              <Text style={styles.emptyText}>No keys checked out</Text>
              <Text style={styles.emptySubtext}>
                All keys are currently available
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
                      color={selectedKey === key.id ? colors.card : colors.secondary} 
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
                    <Text style={styles.keyDetail}>
                      Checked out by: {key.checkedOutBy}
                    </Text>
                    {key.checkedOutAt && (
                      <Text style={styles.keyDetail}>
                        Since: {formatDate(key.checkedOutAt)}
                      </Text>
                    )}
                  </View>
                </View>
                {selectedKey === key.id && (
                  <IconSymbol name="checkmark.circle.fill" color={colors.secondary} size={24} />
                )}
              </Pressable>
            ))
          )}
        </View>

        <View style={styles.buttonContainer}>
          <Pressable
            style={[
              buttonStyles.secondary,
              (!selectedKey || !returnedBy.trim() || loading) && styles.buttonDisabled,
            ]}
            onPress={handleCheckIn}
            disabled={!selectedKey || !returnedBy.trim() || loading}
          >
            <Text style={buttonStyles.text}>
              {loading ? 'Checking In...' : 'Check In Key'}
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
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  keyCardSelected: {
    borderColor: colors.secondary,
    backgroundColor: colors.secondary + '10',
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
    backgroundColor: colors.secondary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  keyIconSelected: {
    backgroundColor: colors.secondary,
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
    color: colors.secondary,
  },
  keyDetail: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: colors.card,
    borderRadius: 12,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
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
