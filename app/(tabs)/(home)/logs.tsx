
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Platform } from 'react-native';
import { Stack } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, commonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';

interface LogEntry {
  id: string;
  keyName: string;
  action: 'checkout' | 'checkin';
  personName: string;
  timestamp: string;
}

export default function LogsScreen() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      const storedLogs = await AsyncStorage.getItem('checkoutLogs');
      if (storedLogs) {
        const parsedLogs = JSON.parse(storedLogs);
        // Sort by timestamp, most recent first
        parsedLogs.sort((a: LogEntry, b: LogEntry) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        setLogs(parsedLogs);
      }
    } catch (error) {
      console.log('Error loading logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const isToday = date.toDateString() === today.toDateString();
    const isYesterday = date.toDateString() === yesterday.toDateString();

    const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (isToday) {
      return `Today at ${timeStr}`;
    } else if (isYesterday) {
      return `Yesterday at ${timeStr}`;
    } else {
      return `${date.toLocaleDateString()} at ${timeStr}`;
    }
  };

  const getActionColor = (action: 'checkout' | 'checkin') => {
    return action === 'checkout' ? colors.primary : colors.secondary;
  };

  const getActionIcon = (action: 'checkout' | 'checkin') => {
    return action === 'checkout' ? 'arrow.right.circle.fill' : 'arrow.left.circle.fill';
  };

  const getActionText = (action: 'checkout' | 'checkin') => {
    return action === 'checkout' ? 'Checked Out' : 'Checked In';
  };

  return (
    <>
      {Platform.OS === 'ios' && (
        <Stack.Screen
          options={{
            title: "Activity Log",
            headerLargeTitle: true,
          }}
        />
      )}
      <View style={commonStyles.container}>
        <ScrollView 
          contentContainerStyle={[
            styles.scrollContent,
            Platform.OS !== 'ios' && styles.scrollContentWithTabBar
          ]}
          showsVerticalScrollIndicator={false}
        >
          {Platform.OS !== 'ios' && (
            <View style={styles.header}>
              <IconSymbol name="list.bullet.clipboard.fill" color={colors.accent} size={48} />
              <Text style={styles.headerTitle}>Activity Log</Text>
              <Text style={styles.headerSubtitle}>
                Complete history of all key checkouts and check-ins
              </Text>
            </View>
          )}

          {loading ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>Loading logs...</Text>
            </View>
          ) : logs.length === 0 ? (
            <View style={styles.emptyState}>
              <IconSymbol name="list.bullet.clipboard" color={colors.textSecondary} size={64} />
              <Text style={styles.emptyText}>No activity yet</Text>
              <Text style={styles.emptySubtext}>
                Key checkout and check-in activity will appear here
              </Text>
            </View>
          ) : (
            <View style={styles.logsContainer}>
              <Text style={styles.logCount}>{logs.length} {logs.length === 1 ? 'entry' : 'entries'}</Text>
              {logs.map((log, index) => (
                <View key={log.id} style={styles.logCard}>
                  <View style={[
                    styles.logIconContainer,
                    { backgroundColor: getActionColor(log.action) + '20' }
                  ]}>
                    <IconSymbol 
                      name={getActionIcon(log.action) as any} 
                      color={getActionColor(log.action)} 
                      size={24} 
                    />
                  </View>
                  <View style={styles.logContent}>
                    <View style={styles.logHeader}>
                      <Text style={styles.logKeyName}>{log.keyName}</Text>
                      <View style={[
                        styles.actionBadge,
                        { backgroundColor: getActionColor(log.action) }
                      ]}>
                        <Text style={styles.actionBadgeText}>
                          {getActionText(log.action)}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.logPerson}>
                      {log.action === 'checkout' ? 'Checked out by' : 'Returned by'}: {log.personName}
                    </Text>
                    <Text style={styles.logTimestamp}>
                      {formatDate(log.timestamp)}
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
  logsContainer: {
    marginTop: 8,
  },
  logCount: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  logCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    boxShadow: '0px 2px 8px rgba(37, 99, 235, 0.1)',
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  logIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  logContent: {
    flex: 1,
  },
  logHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  logKeyName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  actionBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  actionBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.card,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  logPerson: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 4,
  },
  logTimestamp: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  emptyState: {
    alignItems: 'center',
    padding: 60,
    backgroundColor: colors.card,
    borderRadius: 12,
    marginTop: 40,
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
});
