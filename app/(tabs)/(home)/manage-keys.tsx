
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

export default function ManageKeysScreen() {
  const [keys, setKeys] = useState<Key[]>([]);
  const [keyName, setKeyName] = useState('');
  const [keyLocation, setKeyLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    loadKeys();
  }, []);

  const loadKeys = async () => {
    try {
      const storedKeys = await AsyncStorage.getItem('keys');
      if (storedKeys) {
        setKeys(JSON.parse(storedKeys));
      }
    } catch (error) {
      console.log('Error loading keys:', error);
    }
  };

  const handleAddKey = async () => {
    if (!keyName.trim()) {
      Alert.alert('Error', 'Please enter a key name');
      return;
    }

    if (!keyLocation.trim()) {
      Alert.alert('Error', 'Please enter a key location');
      return;
    }

    setLoading(true);

    try {
      const newKey: Key = {
        id: Date.now().toString(),
        name: keyName.trim(),
        location: keyLocation.trim(),
        isCheckedOut: false,
      };

      const updatedKeys = [...keys, newKey];
      await AsyncStorage.setItem('keys', JSON.stringify(updatedKeys));
      
      setKeys(updatedKeys);
      setKeyName('');
      setKeyLocation('');
      setShowAddForm(false);
      
      Alert.alert('Success', 'Key added successfully');
    } catch (error) {
      console.log('Error adding key:', error);
      Alert.alert('Error', 'Failed to add key. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteKey = async (keyId: string, keyName: string) => {
    Alert.alert(
      'Delete Key',
      `Are you sure you want to delete "${keyName}"?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedKeys = keys.filter(k => k.id !== keyId);
              await AsyncStorage.setItem('keys', JSON.stringify(updatedKeys));
              setKeys(updatedKeys);
              Alert.alert('Success', 'Key deleted successfully');
            } catch (error) {
              console.log('Error deleting key:', error);
              Alert.alert('Error', 'Failed to delete key. Please try again.');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={commonStyles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <IconSymbol name="key.fill" color={colors.accent} size={48} />
          <Text style={styles.headerTitle}>Manage Keys</Text>
          <Text style={styles.headerSubtitle}>
            Add new keys or remove existing ones from the system
          </Text>
        </View>

        {!showAddForm ? (
          <Pressable
            style={[buttonStyles.primary, styles.addButton]}
            onPress={() => setShowAddForm(true)}
          >
            <IconSymbol name="plus.circle.fill" color={colors.card} size={20} />
            <Text style={[buttonStyles.text, styles.addButtonText]}>Add New Key</Text>
          </Pressable>
        ) : (
          <View style={styles.addForm}>
            <Text style={styles.formTitle}>Add New Key</Text>
            
            <View style={styles.formSection}>
              <Text style={commonStyles.label}>Key Name *</Text>
              <TextInput
                style={commonStyles.input}
                placeholder="e.g., Main Office Key"
                placeholderTextColor={colors.textSecondary}
                value={keyName}
                onChangeText={setKeyName}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.formSection}>
              <Text style={commonStyles.label}>Location *</Text>
              <TextInput
                style={commonStyles.input}
                placeholder="e.g., Building A, Floor 2"
                placeholderTextColor={colors.textSecondary}
                value={keyLocation}
                onChangeText={setKeyLocation}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.formButtons}>
              <Pressable
                style={[buttonStyles.primary, styles.formButton]}
                onPress={handleAddKey}
                disabled={loading}
              >
                <Text style={buttonStyles.text}>
                  {loading ? 'Adding...' : 'Add Key'}
                </Text>
              </Pressable>

              <Pressable
                style={[buttonStyles.outline, styles.formButton]}
                onPress={() => {
                  setShowAddForm(false);
                  setKeyName('');
                  setKeyLocation('');
                }}
              >
                <Text style={buttonStyles.outlineText}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        )}

        <View style={styles.keysSection}>
          <Text style={commonStyles.subtitle}>All Keys ({keys.length})</Text>
          
          {keys.length === 0 ? (
            <View style={styles.emptyState}>
              <IconSymbol name="key.slash" color={colors.textSecondary} size={48} />
              <Text style={styles.emptyText}>No keys added yet</Text>
              <Text style={styles.emptySubtext}>
                Add your first key to get started
              </Text>
            </View>
          ) : (
            keys.map((key) => (
              <View key={key.id} style={styles.keyCard}>
                <View style={styles.keyCardContent}>
                  <View style={[
                    styles.keyIcon,
                    { backgroundColor: key.isCheckedOut ? colors.error + '20' : colors.success + '20' }
                  ]}>
                    <IconSymbol 
                      name={key.isCheckedOut ? "lock.fill" : "lock.open.fill"} 
                      color={key.isCheckedOut ? colors.error : colors.success} 
                      size={24} 
                    />
                  </View>
                  <View style={styles.keyInfo}>
                    <Text style={styles.keyName}>{key.name}</Text>
                    <Text style={styles.keyLocation}>Location: {key.location}</Text>
                    {key.isCheckedOut && (
                      <View style={styles.checkedOutBadge}>
                        <Text style={styles.checkedOutText}>
                          Checked out by {key.checkedOutBy}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
                <Pressable
                  style={styles.deleteButton}
                  onPress={() => handleDeleteKey(key.id, key.name)}
                  disabled={key.isCheckedOut}
                >
                  <IconSymbol 
                    name="trash.fill" 
                    color={key.isCheckedOut ? colors.textSecondary : colors.error} 
                    size={20} 
                  />
                </Pressable>
              </View>
            ))
          )}
        </View>

        <Pressable
          style={[buttonStyles.outline, styles.closeButton]}
          onPress={() => router.back()}
        >
          <Text style={buttonStyles.outlineText}>Close</Text>
        </Pressable>
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
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
  },
  addButtonText: {
    marginLeft: 8,
  },
  addForm: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 20,
  },
  formSection: {
    marginBottom: 16,
  },
  formButtons: {
    marginTop: 8,
  },
  formButton: {
    marginBottom: 12,
  },
  keysSection: {
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
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
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
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
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
  keyLocation: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  checkedOutBadge: {
    marginTop: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: colors.error + '20',
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  checkedOutText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.error,
  },
  deleteButton: {
    padding: 8,
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
  closeButton: {
    marginTop: 16,
  },
});
