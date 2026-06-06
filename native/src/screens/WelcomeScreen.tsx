import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing, SafeAreaView, TouchableOpacity } from 'react-native';
import { useTheme } from '../theme/colors';
import { Button } from '../components/ui/Button';

const WelcomeScreen = ({ navigation }: any) => {
  const theme = useTheme();
  const animatedValue1 = useRef(new Animated.Value(0)).current;
  const animatedValue2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    animateCircle1();
    animateCircle2();
  }, []);

  const animateCircle1 = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue1, {
          toValue: 1,
          duration: 8000,
          easing: Easing.linear,
          useNativeDriver: false,
        }),
        Animated.timing(animatedValue1, {
          toValue: 0,
          duration: 8000,
          easing: Easing.linear,
          useNativeDriver: false,
        }),
      ])
    ).start();
  };

  const animateCircle2 = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue2, {
          toValue: 1,
          duration: 10000,
          easing: Easing.linear,
          useNativeDriver: false,
        }),
        Animated.timing(animatedValue2, {
          toValue: 0,
          duration: 10000,
          easing: Easing.linear,
          useNativeDriver: false,
        }),
      ])
    ).start();
  };

  const circle1Style: any = {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 150,
    height: 150,
    backgroundColor: theme.primary,
    opacity: 0.08,
    borderRadius: 75,
    transform: [
      {
        translateY: animatedValue1.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 80],
        }),
      },
    ],
  };

  const circle2Style: any = {
    position: 'absolute',
    left: -60,
    top: '50%',
    width: 120,
    height: 120,
    backgroundColor: theme.primary,
    opacity: 0.06,
    borderRadius: 60,
    transform: [
      {
        translateX: animatedValue2.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 40],
        }),
      },
    ],
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Animated.View style={circle1Style} />
      <Animated.View style={circle2Style} />

      <View style={styles.welcomeSection}>
        <Text style={[styles.welcomeLabel, { color: theme.muted_foreground }]}>Welcome to</Text>
        <Text style={[styles.appName, { color: theme.foreground }]}>BlazeNeuro</Text>
        <Text style={[styles.description, { color: theme.muted_foreground }]}>
          Your intelligent workspace for{"\n"}learning and growth
        </Text>
      </View>

      <View style={[styles.bottomCard, { backgroundColor: theme.card, borderTopColor: theme.border }]}>
        <View style={[styles.drawerHandle, { backgroundColor: theme.border }]} />
        
        <Button
          title="Log in"
          onPress={() => navigation.navigate('Login')}
          style={{ marginBottom: 12 }}
        />
        
        <Button
          title="Create account"
          variant="outline"
          onPress={() => navigation.navigate('Signup')}
        />
        
        <Text style={[styles.termsText, { color: theme.muted_foreground }]}>
          By continuing, you agree to our Terms of Service{"\n"}and Privacy Policy
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  welcomeSection: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
    marginBottom: 150,
  },
  welcomeLabel: {
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: 0.02,
  },
  appName: {
    fontSize: 40,
    fontWeight: 'bold',
    marginTop: 4,
    letterSpacing: -0.02,
  },
  description: {
    fontSize: 16,
    marginTop: 8,
    lineHeight: 20,
  },
  bottomCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 32,
    paddingTop: 16,
    paddingBottom: 32,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderTopWidth: 1,
  },
  drawerHandle: {
    width: 40,
    height: 4,
    alignSelf: 'center',
    marginBottom: 32,
    borderRadius: 2,
  },
  termsText: {
    textAlign: 'center',
    fontSize: 12,
    marginTop: 24,
  },
});

export default WelcomeScreen;
