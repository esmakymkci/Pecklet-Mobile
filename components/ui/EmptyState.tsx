import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { COLORS, THEME } from '@/constants/colors';
import Button from './Button';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  style?: ViewStyle;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  actionLabel,
  onAction,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      {icon && (
        <View style={styles.iconContainer}>
          {icon}
        </View>
      )}
      
      <Text style={styles.title}>{title}</Text>
      
      {description && (
        <Text style={styles.description}>{description}</Text>
      )}
      
      {actionLabel && onAction && (
        <Button
          title={actionLabel}
          onPress={onAction}
          variant="primary"
          style={styles.button}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: THEME.spacing.xl,
  },
  iconContainer: {
    marginBottom: THEME.spacing.md,
    padding: THEME.spacing.md,
    backgroundColor: `${COLORS.primary}10`,
    borderRadius: THEME.borderRadius.full,
  },
  title: {
    fontSize: THEME.typography.fontSizes.lg,
    fontWeight: '600',
    color: COLORS.dark,
    textAlign: 'center',
    marginBottom: THEME.spacing.sm,
  },
  description: {
    fontSize: THEME.typography.fontSizes.md,
    color: COLORS.darkGray,
    textAlign: 'center',
    marginBottom: THEME.spacing.lg,
  },
  button: {
    marginTop: THEME.spacing.md,
  },
});

export default EmptyState;