import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import * as AuthSession from 'expo-auth-session';
import { useTheme } from '../theme/colors';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { AuthAPI } from '../lib/api';

WebBrowser.maybeCompleteAuthSession();

const LoginScreen = ({ navigation }: any) => {
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [googleRequest, googleResponse, googlePromptAsync] = Google.useIdTokenAuthRequest({
    clientId: '841705301007-bk1edu98tumanf3q6op8n3lrs6gbpaoq.apps.googleusercontent.com',
  });

  React.useEffect(() => {
    if (googleResponse?.type === 'success') {
      const { id_token } = googleResponse.params;
      handleGoogleLogin(id_token);
    }
  }, [googleResponse]);

  const handleGoogleLogin = async (idToken: string) => {
    setIsLoading(true);
    try {
      await AuthAPI.verifyGoogleToken(idToken);
      navigation.replace('Home');
    } catch (error: any) {
      Alert.alert('Google Login Error', error.response?.data?.message || error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGitHubLogin = async () => {
    const callbackUrl = AuthSession.makeRedirectUri();
    const authUrl = `https://auth.blazeneuro.com/api/auth/sign-in/social?provider=github&callbackURL=${encodeURIComponent(callbackUrl)}`;
    
    try {
      const result = await WebBrowser.openAuthSessionAsync(authUrl, callbackUrl);
      if (result.type === 'success') {
        const session = await AuthAPI.getSession();
        if (session.user) {
          navigation.replace('Home');
        }
      }
    } catch (error: any) {
      Alert.alert('GitHub Login Error', error.message);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      await AuthAPI.signIn(email, password);
      navigation.replace('Home');
    } catch (error: any) {
      Alert.alert('Login Error', error.response?.data?.message || 'Failed to log in. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.bottomCard, { backgroundColor: theme.card, borderTopColor: theme.border }]}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={[styles.drawerHandle, { backgroundColor: theme.border }]} />
          
          <Text style={[styles.title, { color: theme.foreground }]}>Login</Text>

          <Input
            label="Email"
            placeholder="name@example.com"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <View style={styles.passwordWrapper}>
            <Input
              label="Password"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              style={{ paddingRight: 50 }}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Text style={{ fontSize: 16, color: theme.muted_foreground }}>
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={[styles.forgotPasswordText, { color: theme.muted_foreground }]}>
              Forgot password?
            </Text>
          </TouchableOpacity>

          <Button
            title="Sign in"
            onPress={handleLogin}
            isLoading={isLoading}
            style={{ marginTop: 8 }}
          />

          <View style={styles.divider}>
            <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
            <Text style={[styles.dividerText, { color: theme.muted_foreground }]}>or</Text>
            <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
          </View>

          <Button
            title="Continue with Google"
            variant="outline"
            onPress={() => googlePromptAsync()}
            isLoading={isLoading && !!googleResponse}
            style={{ marginBottom: 12 }}
          />
          <Button
            title="Continue with GitHub"
            variant="outline"
            onPress={handleGitHubLogin}
          />

          <View style={styles.signupContainer}>
            <Text style={[styles.noAccountText, { color: theme.muted_foreground }]}>
              Don't have an account?{' '}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
              <Text style={[styles.signupText, { color: theme.foreground }]}>Sign up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  bottomCard: {
    flex: 1,
    marginTop: 80,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderTopWidth: 1,
  },
  scrollContent: {
    paddingHorizontal: 32,
    paddingTop: 16,
    paddingBottom: 32,
  },
  drawerHandle: {
    width: 40,
    height: 4,
    alignSelf: 'center',
    marginBottom: 16,
    borderRadius: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  passwordWrapper: {
    position: 'relative',
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
    top: 38,
    height: 48,
    justifyContent: 'center',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: 8,
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 12,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    paddingHorizontal: 12,
    fontSize: 12,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  noAccountText: {
    fontSize: 14,
  },
  signupText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default LoginScreen;
