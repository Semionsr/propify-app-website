import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Alert,
  ActivityIndicator,
  Image,
  Easing,
  InputAccessoryView,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import * as QueryParams from 'expo-auth-session/build/QueryParams';
import * as Linking from 'expo-linking';
import * as AppleAuthentication from 'expo-apple-authentication';
import { ProfessionalColors } from '../constants/Colors';
import { ConversionColors, ConversionTypography } from '../constants/OnboardingTheme';
import { LockIcon } from '../components/CustomIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ErrorBoundary from '../components/ErrorBoundary';
import RevenueCatService from '../utils/revenueCatService';
import mixpanelService from '../utils/mixpanelService';

const { width, height } = Dimensions.get('window');

// Floating stats data - same as welcome screen
const FLOATING_STATS = [
  { value: '1,400x', label: 'Faster' },
  { value: '8 Stats', label: 'Instant' },
  { value: '5 Sec', label: 'Analysis' },
  { value: '100%', label: 'Accuracy' },
  { value: '2 Hours', label: 'Saved' },
  { value: '15-2', label: 'Streak' },
  { value: '1st AI', label: 'Agent' },
  { value: '94.1%', label: 'Success' },
  { value: '5★', label: 'Rating' },
];

const FloatingStatItem = React.memo(({ stat, index }) => {
  const translateY = React.useRef(new Animated.Value(height + 100)).current;
  const translateX = React.useRef(new Animated.Value(Math.random() * width - width/2)).current;
  const opacity = React.useRef(new Animated.Value(0)).current;
  const animationsRef = React.useRef([]);

  React.useEffect(() => {
    // Random delay for each stat
    const delay = index * 600 + Math.random() * 3000;
    
    const timeoutId = setTimeout(() => {
      // Fade in with variation
      const fadeAnimation = Animated.timing(opacity, {
        toValue: 0.15 + Math.random() * 0.2,
        duration: 1000,
        useNativeDriver: true,
      });
      fadeAnimation.start();
      animationsRef.current.push(fadeAnimation);

      // Float upward with varying speeds
      const floatAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(translateY, {
            toValue: -height - 100,
            duration: 12000 + Math.random() * 8000,
            useNativeDriver: true,
            easing: Easing.linear,
          }),
          Animated.timing(translateY, {
            toValue: height + 100,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      );
      floatAnimation.start();
      animationsRef.current.push(floatAnimation);

      // Gentle side-to-side drift
      const driftAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(translateX, {
            toValue: Math.random() * 40 - 20,
            duration: 3000 + Math.random() * 2000,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.sin),
          }),
          Animated.timing(translateX, {
            toValue: Math.random() * -40 + 20,
            duration: 3000 + Math.random() * 2000,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.sin),
          }),
        ])
      );
      driftAnimation.start();
      animationsRef.current.push(driftAnimation);
    }, delay);

    // Cleanup function
    return () => {
      clearTimeout(timeoutId);
      animationsRef.current.forEach(anim => anim.stop());
      animationsRef.current = [];
    };
  }, []);

  const randomLeft = Math.random() * (width - 100);
  const randomSize = Math.random() * 0.5 + 0.8;

  return (
    <Animated.View
      style={[
        styles.floatingStatItem,
        {
          left: randomLeft,
          opacity,
          transform: [
            { translateY },
            { translateX },
            { scale: randomSize },
          ],
        },
      ]}
    >
      <Text style={styles.floatingStatValue}>{stat.value}</Text>
      <Text style={styles.floatingStatLabel}>{stat.label}</Text>
    </Animated.View>
  );
});

// Supabase configuration
const SUPABASE_URL = 'https://zzgrnxbayrueiyjztrmg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp6Z3JueGJheXJ1ZWl5anp0cm1nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1MjU5MjIsImV4cCI6MjA2NjEwMTkyMn0.V2iBCTzwfO7ldt3d5SM05Wea1cPub3AbH20p_j49178';
// Service key is intentionally not used in client-side auth flow
const SUPABASE_SERVICE_KEY = 'redacted_do_not_use_in_client';

// Initialize Supabase client
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Configure WebBrowser for OAuth
WebBrowser.maybeCompleteAuthSession();

const LoginScreen = () => {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  // Empty input accessory view to hide keyboard toolbar
  const inputAccessoryViewID = 'hideKeyboardToolbar';

  // Enhanced cascade animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  
  // Individual element animations for cascade
  const iconAnimation = useRef(new Animated.Value(0)).current;
  const iconSlide = useRef(new Animated.Value(-30)).current;
  const iconScale = useRef(new Animated.Value(0.3)).current;
  const titleAnimation = useRef(new Animated.Value(0)).current;
  const titleSlide = useRef(new Animated.Value(-25)).current;
  const subtitleAnimation = useRef(new Animated.Value(0)).current;
  const subtitleSlide = useRef(new Animated.Value(-20)).current;
  const descriptionAnimation = useRef(new Animated.Value(0)).current;
  const descriptionSlide = useRef(new Animated.Value(-15)).current;
  const formAnimation = useRef(new Animated.Value(0)).current;
  const formSlide = useRef(new Animated.Value(40)).current;
  const formScale = useRef(new Animated.Value(0.95)).current;
  const authButtonAnimation = useRef(new Animated.Value(0)).current;
  const authButtonSlide = useRef(new Animated.Value(30)).current;
  const authButtonScale = useRef(new Animated.Value(0.9)).current;
  const securityAnimation = useRef(new Animated.Value(0)).current;
  const securitySlide = useRef(new Animated.Value(20)).current;
  const toggleAnimation = useRef(new Animated.Value(0)).current;
  const toggleSlide = useRef(new Animated.Value(25)).current;

  
  // Enhanced emerald glow effects
  const brandGlow = useRef(new Animated.Value(0.6)).current;
  const formGlow = useRef(new Animated.Value(0)).current;
  const ctaGlow = useRef(new Animated.Value(0.5)).current;
  
  // Infinity symbol animation
  const infinityOpacity = useRef(new Animated.Value(0)).current;
  const infinityScale = useRef(new Animated.Value(0.8)).current;

  // Input focus animations
  const emailFocus = useRef(new Animated.Value(0)).current;
  const passwordFocus = useRef(new Animated.Value(0)).current;
  const firstNameFocus = useRef(new Animated.Value(0)).current;
  const lastNameFocus = useRef(new Animated.Value(0)).current;
  const phoneNumberFocus = useRef(new Animated.Value(0)).current;

  // Glow animations
  const appTitleGlow = useRef(new Animated.Value(0)).current;
  const subtitleGlow = useRef(new Animated.Value(0)).current;
  const descriptionGlow = useRef(new Animated.Value(0)).current;
  const authButtonGlow = useRef(new Animated.Value(0)).current;
  const securityTextGlow = useRef(new Animated.Value(0)).current;
  const toggleTextGlow = useRef(new Animated.Value(0)).current;


  useEffect(() => {
    startAnimations();
  }, []);

  // Handle deep linking for OAuth redirects
  useEffect(() => {
    const handleDeepLink = async (url) => {
      if (url && url.includes('/auth/callback')) {
        console.log('Deep link received:', url);
        await createSessionFromUrl(url);
      }
    };

    // Handle linking into app from OAuth redirect
    const getInitialURL = async () => {
      const initialUrl = await Linking.getInitialURL();
      if (initialUrl) {
        handleDeepLink(initialUrl);
      }
    };

    // Listen for incoming links
    const subscription = Linking.addEventListener('url', (event) => {
      handleDeepLink(event.url);
    });

    getInitialURL();

    return () => {
      subscription?.remove();
    };
  }, []);

  const startAnimations = async () => {
    // Light haptic on screen load
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Infinity symbol animation - starts early (exactly like onboarding-loading)
    Animated.timing(infinityOpacity, {
      toValue: 0.15,
      duration: 2000,
      useNativeDriver: true,
    }).start();
    
    Animated.timing(infinityScale, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: true,
    }).start();

    // Main container fade in
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    // Fluid entrance animations - staggered cascade (exactly like onboarding-loading)
    // 1. Icon/Logo appears first (200ms delay)
    setTimeout(async () => {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      Animated.parallel([
        Animated.timing(iconAnimation, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(iconSlide, {
          toValue: 0,
          duration: 800,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.sequence([
          // Spring overshoot effect
          Animated.spring(iconScale, {
            toValue: 1.2,
            tension: 120,
            friction: 2.5,
            velocity: 10,
            useNativeDriver: true,
          }),
          Animated.spring(iconScale, {
            toValue: 1,
            tension: 60,
            friction: 5,
            velocity: -2,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    }, 200);

    // 2. App title appears (600ms delay)
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(titleAnimation, {
          toValue: 1,
          duration: 600,
          useNativeDriver: false,
        }),
        Animated.timing(titleSlide, {
          toValue: 0,
          duration: 600,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        }),
        Animated.timing(appTitleGlow, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
      ]).start();
    }, 600);

    // 3. Subtitle appears (900ms delay)
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(subtitleAnimation, {
          toValue: 1,
          duration: 600,
          useNativeDriver: false,
        }),
        Animated.timing(subtitleSlide, {
          toValue: 0,
          duration: 600,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        }),
        Animated.timing(subtitleGlow, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: false,
        }),
      ]).start();
    }, 900);

    // 4. Description appears (1200ms delay)
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(descriptionAnimation, {
          toValue: 1,
          duration: 600,
          useNativeDriver: false,
        }),
        Animated.timing(descriptionSlide, {
          toValue: 0,
          duration: 600,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        }),
        Animated.timing(descriptionGlow, {
          toValue: 1,
          duration: 1400,
          useNativeDriver: false,
        }),
      ]).start();
    }, 1200);

    // 5. Form container appears (1500ms delay)
    setTimeout(async () => {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      Animated.parallel([
        Animated.timing(formAnimation, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(formSlide, {
          toValue: 0,
          duration: 800,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(formScale, {
          toValue: 1,
          duration: 800,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    }, 1500);

    // 6. Auth button appears (1800ms delay)
    setTimeout(async () => {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      Animated.parallel([
        Animated.timing(authButtonAnimation, {
          toValue: 1,
          duration: 600,
          useNativeDriver: false,
        }),
        Animated.timing(authButtonSlide, {
          toValue: 0,
          duration: 600,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        }),
        Animated.timing(authButtonScale, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        }),
        Animated.timing(authButtonGlow, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
      ]).start();
    }, 1800);

    // 7. Security badge appears (2100ms delay)
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(securityAnimation, {
          toValue: 1,
          duration: 500,
          useNativeDriver: false,
        }),
        Animated.timing(securitySlide, {
          toValue: 0,
          duration: 500,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        }),
        Animated.timing(securityTextGlow, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: false,
        }),
      ]).start();
    }, 2100);

    // 8. Toggle button appears (2400ms delay)
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(toggleAnimation, {
          toValue: 1,
          duration: 500,
          useNativeDriver: false,
        }),
        Animated.timing(toggleSlide, {
          toValue: 0,
          duration: 500,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        }),
        Animated.timing(toggleTextGlow, {
          toValue: 1,
          duration: 1400,
          useNativeDriver: false,
        }),
      ]).start();
    }, 2400);



    // Enhanced emerald glow effects (after main cascade)
    setTimeout(() => {
      const startEmeraldGlow = () => {
        Animated.sequence([
          Animated.timing(brandGlow, { toValue: 1, duration: 2000, useNativeDriver: true }),
          Animated.timing(brandGlow, { toValue: 0.6, duration: 2000, useNativeDriver: true })
        ]).start(() => {
          setTimeout(startEmeraldGlow, 1000);
        });
      };
      startEmeraldGlow();
      
      // Form glow effect
      Animated.timing(formGlow, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }).start();
      
      // CTA glow effect
      const ctaGlowAnimation = () => {
        Animated.sequence([
          Animated.timing(ctaGlow, { toValue: 1, duration: 1500, useNativeDriver: true }),
          Animated.timing(ctaGlow, { toValue: 0.5, duration: 1500, useNativeDriver: true })
        ]).start(() => {
          setTimeout(ctaGlowAnimation, 2000);
        });
      };
      ctaGlowAnimation();
    }, 3200);
  };

  const animateInputFocus = (animValue, focused) => {
    Animated.timing(animValue, {
      toValue: focused ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  // Password verification is handled on the server via bcrypt in verify_user_credentials

  const generateSessionToken = () => {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15) + 
           Date.now().toString(36);
  };

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (!isLogin && (!firstName || !lastName)) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      if (isLogin) {
        // Login logic using server-side credential verification
        const verifyResponse = await fetch(`${SUPABASE_URL}/rest/v1/rpc/verify_user_credentials`, {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            p_email: email,
            p_password: password,
          }),
        });

        if (!verifyResponse.ok) {
          Alert.alert('Error', 'Invalid email or password');
          setLoading(false);
          return;
        }

        const verifyResult = await verifyResponse.json();
        if (!verifyResult?.success || !verifyResult?.user_id) {
          Alert.alert('Error', verifyResult?.message || 'Invalid email or password');
          setLoading(false);
          return;
        }

        const userId = verifyResult.user_id;

        // Create session
        const sessionToken = generateSessionToken();
        const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

        const sessionResponse = await fetch(`${SUPABASE_URL}/rest/v1/rpc/create_user_session`, {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            p_user_id: userId,
            p_session_token: sessionToken,
            p_expires_at: expiresAt.toISOString(),
            p_device_info: { platform: Platform.OS },
          }),
        });

        if (sessionResponse.ok) {
          // Store session locally
          await AsyncStorage.setItem('userSession', JSON.stringify({
            token: sessionToken,
            userId,
            email,
            firstName: '',
            lastName: '',
            expiresAt: expiresAt.toISOString(),
            isOAuth: false,
          }));

          // Mark onboarding as completed for authenticated users
          await AsyncStorage.setItem('hasCompletedOnboarding', 'true');

          // Identify user to RevenueCat
          try {
            await RevenueCatService.logIn(userId);
            await RevenueCatService.setEmail(email);
            if (firstName || lastName) {
              await RevenueCatService.setDisplayName(`${firstName} ${lastName}`.trim());
            }
            console.log('✅ Email login: User identified and attributes synced to RevenueCat');
          } catch (error) {
            console.error('⚠️ Failed to identify user to RevenueCat:', error);
          }

          // Identify user to Mixpanel and track login
          mixpanelService.identifyUser(userId, {
            email: email,
            login_method: 'email',
            platform: Platform.OS,
          });
          mixpanelService.trackLogin('email');

          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          const isProActive = await RevenueCatService.isProActive();
          if (isProActive) {
            router.replace('/(tabs)/analysis');
          } else {
            router.replace('/paywall');
          }
        } else {
          throw new Error('Failed to create session');
        }

      } else {
        // Signup logic
        // Get creator referral code from AsyncStorage if it exists
        const creatorCode = await AsyncStorage.getItem('creatorReferralCode');
        
        const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/create_user_account_with_creator_code`, {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email_input: email,
            password_input: password,
            first_name_input: firstName,
            last_name_input: lastName,
            creator_code_input: creatorCode,
          }),
        });

        if (response.ok) {
          const result = await response.json();
          const userId = result.user_id || result;
          
          // Clear creator code from AsyncStorage since it's now saved to user profile
          if (creatorCode) {
            await AsyncStorage.removeItem('creatorReferralCode');
            console.log(`✅ Creator code "${creatorCode}" saved to user profile`);
          }
          
          // Create session for new user
          const sessionToken = generateSessionToken();
          const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

          const sessionResponse = await fetch(`${SUPABASE_URL}/rest/v1/rpc/create_user_session`, {
            method: 'POST',
            headers: {
              'apikey': SUPABASE_ANON_KEY,
              'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              p_user_id: userId,
              p_session_token: sessionToken,
              p_expires_at: expiresAt.toISOString(),
              p_device_info: { platform: Platform.OS },
            }),
          });

          if (sessionResponse.ok) {
            await AsyncStorage.setItem('userSession', JSON.stringify({
              token: sessionToken,
              userId: userId,
              email: email,
              firstName: firstName,
              lastName: lastName,
              expiresAt: expiresAt.toISOString(),
              isOAuth: false, // Flag for custom auth
            }));

            // Mark onboarding as completed for authenticated users
            await AsyncStorage.setItem('hasCompletedOnboarding', 'true');

            // CRITICAL: Log user into RevenueCat so packages can load
            try {
              await RevenueCatService.logIn(userId);
              await RevenueCatService.setEmail(email);
              if (firstName || lastName) {
                await RevenueCatService.setDisplayName(`${firstName} ${lastName}`.trim());
              }
              console.log('✅ Email signup: User identified and attributes synced to RevenueCat');
            } catch (error) {
              console.error('⚠️ Failed to identify user to RevenueCat:', error);
              // Continue anyway - user can still access free features
            }

            // Identify user to Mixpanel and track signup
            mixpanelService.identifyUser(userId, {
              email: email,
              first_name: firstName,
              last_name: lastName,
              signup_method: 'email',
              signup_date: new Date().toISOString(),
              platform: Platform.OS,
              has_creator_code: !!creatorCode,
            });
            mixpanelService.trackSignUp('email', {
              has_creator_code: !!creatorCode,
            });

            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            
            // Check if user has an active subscription with RevenueCat
            const isProActive = await RevenueCatService.isProActive();
            if (isProActive) {
              router.replace('/(tabs)/analysis');
            } else {
              router.replace('/paywall');
            }
          } else {
            throw new Error('Failed to create session');
          }
        } else {
          const error = await response.json();
          if (error.message?.includes('duplicate key')) {
            Alert.alert('Error', 'An account with this email already exists');
          } else {
            throw new Error('Failed to create account');
          }
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      
      // Track error
      mixpanelService.trackError(
        isLogin ? 'login_failed' : 'signup_failed',
        error.message || 'Unknown error',
        { method: 'email' }
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleAuthMode = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsLogin(!isLogin);
    setEmail('');
    setPassword('');
    setFirstName('');
    setLastName('');
    setPhoneNumber('');
  };

  const createSessionFromUrl = async (url) => {
    try {
      console.log('Processing OAuth redirect URL:', url);
      
      const { params, errorCode } = QueryParams.getQueryParams(url);
      
      if (errorCode) {
        console.error('OAuth error:', errorCode);
        throw new Error(errorCode);
      }
      
      const { access_token, refresh_token } = params;
      
      if (!access_token) {
        console.log('No access token found in URL');
        return;
      }
      
      console.log('Creating Supabase session with tokens');
      
      const { data, error } = await supabase.auth.setSession({
        access_token,
        refresh_token,
      });
      
      if (error) {
        console.error('Session creation error:', error);
        throw error;
      }
      
      console.log('✅ Google OAuth session created successfully');
      
      // Store session locally (similar to regular login)
      // IMPORTANT: Use 30-day expiry instead of JWT expiry to prevent premature logout
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
      await AsyncStorage.setItem('userSession', JSON.stringify({
        token: access_token,
        refreshToken: refresh_token, // Store refresh token for future use
        userId: data.session.user.id,
        email: data.session.user.email,
        firstName: data.session.user.user_metadata?.full_name?.split(' ')[0] || '',
        lastName: data.session.user.user_metadata?.full_name?.split(' ')[1] || '',
        expiresAt: expiresAt.toISOString(),
        isOAuth: true, // Flag to identify OAuth sessions
      }));

      // Mark onboarding as completed for authenticated users
      await AsyncStorage.setItem('hasCompletedOnboarding', 'true');

      // CRITICAL: Log OAuth user into RevenueCat
      try {
        await RevenueCatService.logIn(data.session.user.id);
        if (data.session.user.email) {
          await RevenueCatService.setEmail(data.session.user.email);
        }
        const fullName = data.session.user.user_metadata?.full_name || data.session.user.user_metadata?.name;
        if (fullName) {
          await RevenueCatService.setDisplayName(fullName);
        }
        console.log('✅ OAuth login: User identified and attributes synced to RevenueCat');
      } catch (error) {
        console.error('⚠️ Failed to identify OAuth user to RevenueCat:', error);
        // Continue anyway - user can still access free features
      }

      // Identify user to Mixpanel and track OAuth login
      const oauthProvider = data.session.user.app_metadata?.provider || 'oauth';
      mixpanelService.identifyUser(data.session.user.id, {
        email: data.session.user.email,
        login_method: oauthProvider,
        platform: Platform.OS,
        oauth_provider: oauthProvider,
      });
      mixpanelService.trackLogin(oauthProvider);

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // Check if user has an active subscription with RevenueCat
      const isProActive = await RevenueCatService.isProActive();
      if (isProActive) {
        console.log('💎 OAuth user with active subscription - going to analysis screen');
        router.replace('/(tabs)/analysis');
      } else {
        console.log('🔒 OAuth user without subscription - going to paywall');
        router.replace('/paywall');
      }
      
      return data.session;
    } catch (error) {
      console.error('Session creation error:', error);
      Alert.alert('Authentication Error', 'Failed to complete Google sign-in. Please try again.');
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Create redirect URI for your app
      const redirectTo = AuthSession.makeRedirectUri({
        scheme: 'propify',
        path: '/auth/callback',
      });

      console.log('Redirect URI:', redirectTo);

      // Sign in with Google using Supabase with skipBrowserRedirect
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          skipBrowserRedirect: true,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        console.error('Google Sign-In error:', error);
        Alert.alert('Error', 'Failed to sign in with Google. Please try again.');
        return;
      }

      console.log('Opening Google OAuth session');

      // Manually open the auth session
      const res = await WebBrowser.openAuthSessionAsync(
        data?.url ?? '',
        redirectTo
      );

      if (res.type === 'success') {
        console.log('OAuth redirect successful, creating session');
        const { url } = res;
        await createSessionFromUrl(url);
      } else {
        console.log('OAuth cancelled or failed:', res.type);
        if (res.type === 'cancel') {
          // User cancelled, no error needed
        } else {
          Alert.alert('Error', 'Google sign-in was cancelled or failed.');
        }
      }

    } catch (error) {
      console.error('Google Sign-In error:', error);
      Alert.alert('Error', 'Something went wrong with Google Sign-In. Please try again.');
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    try {
      setLoading(true);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Check if Apple Authentication is available
      const isAvailable = await AppleAuthentication.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert('Error', 'Apple Sign-In is not available on this device.');
        return;
      }

      // Create redirect URI for your app
      const redirectTo = AuthSession.makeRedirectUri({
        scheme: 'propify',
        path: '/auth/callback',
      });

      console.log('Apple Redirect URI:', redirectTo);

      // Sign in with Apple using Supabase with skipBrowserRedirect
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: {
          redirectTo,
          skipBrowserRedirect: true,
          queryParams: {
            response_mode: 'form_post',
          },
        },
      });

      if (error) {
        console.error('Apple Sign-In error:', error);
        Alert.alert('Error', 'Failed to sign in with Apple. Please try again.');
        return;
      }

      console.log('Opening Apple OAuth session');

      // Manually open the auth session
      const res = await WebBrowser.openAuthSessionAsync(
        data?.url ?? '',
        redirectTo
      );

      if (res.type === 'success') {
        console.log('Apple OAuth redirect successful, creating session');
        const { url } = res;
        await createSessionFromUrl(url);
      } else {
        console.log('Apple OAuth cancelled or failed:', res.type);
        if (res.type === 'cancel') {
          // User cancelled, no error needed
        } else {
          Alert.alert('Error', 'Apple sign-in was cancelled or failed.');
        }
      }

    } catch (error) {
      console.error('Apple Sign-In error:', error);
      Alert.alert('Error', 'Something went wrong with Apple Sign-In. Please try again.');
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  };

  // Create infinity symbol path to match onboarding screens
  const createInfinityPath = () => {
    const centerX = width / 2;
    const centerY = height / 2;
    const scaleX = Math.min(width, height) * 1.2;
    const scaleY = height * 0.8;
    
    const path = `
      M ${centerX} ${centerY - scaleY * 0.5}
      C ${centerX - scaleX * 0.3} ${centerY - scaleY * 0.5}, 
        ${centerX - scaleX * 0.3} ${centerY - scaleY * 0.2}, 
        ${centerX} ${centerY}
      C ${centerX + scaleX * 0.3} ${centerY + scaleY * 0.2}, 
        ${centerX + scaleX * 0.3} ${centerY + scaleY * 0.5}, 
        ${centerX} ${centerY + scaleY * 0.5}
      C ${centerX - scaleX * 0.3} ${centerY + scaleY * 0.5}, 
        ${centerX - scaleX * 0.3} ${centerY + scaleY * 0.2}, 
        ${centerX} ${centerY}
      C ${centerX + scaleX * 0.3} ${centerY - scaleY * 0.2}, 
        ${centerX + scaleX * 0.3} ${centerY - scaleY * 0.5}, 
        ${centerX} ${centerY - scaleY * 0.5}
      Z
    `;
    
    return path;
  };

  const infinityPath = createInfinityPath();

  return (
    <ErrorBoundary>
      <StatusBar style="light" hidden={true} />
      <View style={[
        styles.container,
        {
          marginTop: -insets.top,
          marginBottom: -insets.bottom,
          height: height + insets.top + insets.bottom,
        }
      ]}>
        <LinearGradient
          colors={[ProfessionalColors.background, '#0a0a0a', ProfessionalColors.background]}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* Floating Stats Background */}
          <View style={styles.floatingStatsContainer}>
            {FLOATING_STATS.map((stat, index) => (
              <FloatingStatItem key={index} stat={stat} index={index} />
            ))}
          </View>
          
          {/* Infinity Symbol Background */}
          <Animated.View
            style={[
              styles.infinityContainer,
              {
                opacity: infinityOpacity,
                transform: [{ scale: infinityScale }],
              },
            ]}
          >
            <Svg width={width} height={height} style={styles.infinitySymbol}>
              <Path
                d={infinityPath}
                stroke={`${ConversionColors.primaryEmerald}20`}
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </Animated.View>

        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? undefined : 'height'}
          keyboardVerticalOffset={0}
          style={[
            styles.keyboardContainer,
            { paddingTop: insets.top + 20 }
          ]}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            bounces={false}
            scrollEnabled={false}
          >
            <Animated.View
              style={[
                styles.content,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.logoTitleRow}>
                <Animated.View 
                  style={[
                    styles.iconContainer,
                    {
                      opacity: iconAnimation,
                      transform: [
                        { translateY: iconSlide },
                        { scale: iconScale }
                      ]
                    }
                  ]}
                >
                  <Image 
                    source={require('../assets/images/welcome-logo.png')} 
                    style={styles.welcomeLogo} 
                    resizeMode="contain" 
                  />
                </Animated.View>
                <Animated.Text 
                  style={[
                    styles.appTitle,
                    {
                      opacity: titleAnimation,
                      transform: [{ translateY: titleSlide }],
                      textShadowRadius: appTitleGlow.interpolate({
                        inputRange: [0, 1],
                        outputRange: [8, 20],
                      }),
                      textShadowColor: 'rgba(255, 255, 255, 0.6)',
                      textShadowOffset: { width: 0, height: 0 },
                    }
                  ]}
                >
                  Propify
                </Animated.Text>
              </View>
              <Animated.Text 
                style={[
                  styles.subtitle,
                  {
                    opacity: subtitleAnimation,
                    transform: [{ translateY: subtitleSlide }],
                    textShadowRadius: subtitleGlow.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 15],
                    }),
                    textShadowColor: 'rgba(255, 255, 255, 0.5)',
                    textShadowOffset: { width: 0, height: 0 },
                  }
                ]}
              >
                {isLogin ? 'Welcome Back to AI Innovation' : 'Try out the ChatGPT for Sports Betting'}
              </Animated.Text>
              <Animated.Text 
                style={[
                  styles.description,
                  {
                    opacity: descriptionAnimation,
                    transform: [{ translateY: descriptionSlide }],
                    textShadowRadius: descriptionGlow.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 10],
                    }),
                    textShadowColor: 'rgba(255, 255, 255, 0.3)',
                    textShadowOffset: { width: 0, height: 0 },
                  }
                ]}
              >
                {isLogin 
                  ? 'Access your personalized AI betting intelligence'
                  : 'Experience the world\'s first AI research agent'
                }
              </Animated.Text>
            </View>

            {/* Form */}
            <Animated.View 
              style={[
                styles.formContainer, 
                { 
                  opacity: formAnimation,
                  transform: [
                    { translateY: formSlide },
                    { scale: formScale }
                  ]
                }
              ]}
            >
              <BlurView intensity={15} tint="dark" style={styles.formBlur}>
                <LinearGradient
                  colors={[ConversionColors.glassBackground, ConversionColors.glassAccent]}
                  style={styles.formGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  {!isLogin && (
                    <>
                      <View style={styles.nameContainer}>
                        <Animated.View
                          style={[
                            styles.inputContainer,
                            styles.halfInput,
                            {
                              borderColor: firstNameFocus.interpolate({
                                inputRange: [0, 1],
                                outputRange: [ConversionColors.glassBorder, ConversionColors.cta],
                              }),
                            },
                          ]}
                        >
                          <TextInput
                            style={styles.input}
                            placeholder="First Name"
                            placeholderTextColor={ConversionColors.textMuted}
                            value={firstName}
                            onChangeText={setFirstName}
                            onFocus={() => animateInputFocus(firstNameFocus, true)}
                            onBlur={() => animateInputFocus(firstNameFocus, false)}
                            autoCapitalize="words"
                            inputAccessoryViewID={inputAccessoryViewID}
                          />
                        </Animated.View>

                        <Animated.View
                          style={[
                            styles.inputContainer,
                            styles.halfInput,
                            {
                              borderColor: lastNameFocus.interpolate({
                                inputRange: [0, 1],
                                outputRange: [ConversionColors.glassBorder, ConversionColors.cta],
                              }),
                            },
                          ]}
                        >
                          <TextInput
                            style={styles.input}
                            placeholder="Last Name"
                            placeholderTextColor={ConversionColors.textMuted}
                            value={lastName}
                            onChangeText={setLastName}
                            onFocus={() => animateInputFocus(lastNameFocus, true)}
                            onBlur={() => animateInputFocus(lastNameFocus, false)}
                            autoCapitalize="words"
                            inputAccessoryViewID={inputAccessoryViewID}
                          />
                        </Animated.View>
                      </View>

                      <Animated.View
                        style={[
                          styles.inputContainer,
                          {
                            borderColor: phoneNumberFocus.interpolate({
                              inputRange: [0, 1],
                              outputRange: [ConversionColors.glassBorder, ConversionColors.cta],
                            }),
                          },
                        ]}
                      >
                        <TextInput
                          style={styles.input}
                          placeholder="Phone Number"
                          placeholderTextColor={ConversionColors.textMuted}
                          value={phoneNumber}
                          onChangeText={setPhoneNumber}
                          onFocus={() => animateInputFocus(phoneNumberFocus, true)}
                          onBlur={() => animateInputFocus(phoneNumberFocus, false)}
                          keyboardType="phone-pad"
                          autoCapitalize="none"
                          autoCorrect={false}
                          inputAccessoryViewID={inputAccessoryViewID}
                        />
                      </Animated.View>
                    </>
                  )}

                  <Animated.View
                    style={[
                      styles.inputContainer,
                      {
                        borderColor: emailFocus.interpolate({
                          inputRange: [0, 1],
                          outputRange: [ConversionColors.glassBorder, ConversionColors.cta],
                        }),
                      },
                    ]}
                  >
                    <TextInput
                      style={styles.input}
                      placeholder="Email Address"
                      placeholderTextColor={ConversionColors.textMuted}
                      value={email}
                      onChangeText={setEmail}
                      onFocus={() => animateInputFocus(emailFocus, true)}
                      onBlur={() => animateInputFocus(emailFocus, false)}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      inputAccessoryViewID={inputAccessoryViewID}
                    />
                  </Animated.View>

                  <Animated.View
                    style={[
                      styles.inputContainer,
                      {
                        borderColor: passwordFocus.interpolate({
                          inputRange: [0, 1],
                          outputRange: [ConversionColors.glassBorder, ConversionColors.cta],
                        }),
                      },
                    ]}
                  >
                    <TextInput
                      style={styles.input}
                      placeholder="Password"
                      placeholderTextColor={ConversionColors.textMuted}
                      value={password}
                      onChangeText={setPassword}
                      onFocus={() => animateInputFocus(passwordFocus, true)}
                      onBlur={() => animateInputFocus(passwordFocus, false)}
                      secureTextEntry
                      autoCapitalize="none"
                      autoCorrect={false}
                      inputAccessoryViewID={inputAccessoryViewID}
                    />
                  </Animated.View>

                  {/* Auth Button */}
                  <Animated.View
                    style={{
                      opacity: authButtonAnimation,
                      transform: [
                        { translateY: authButtonSlide },
                        { scale: authButtonScale }
                      ]
                    }}
                  >
                    <TouchableOpacity
                      style={[styles.authButton, loading && styles.authButtonDisabled]}
                      onPress={handleAuth}
                      disabled={loading}
                    >
                      <LinearGradient
                        colors={ConversionColors.primaryGradient}
                        style={styles.authButtonGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                      >
                      {loading ? (
                        <ActivityIndicator color="white" size="small" />
                      ) : (
                        <View style={styles.authButtonContent}>
                          <LockIcon size={20} color="#FFFFFF" />
                          <Animated.Text 
                            style={[
                              styles.authButtonText,
                              {
                                textShadowRadius: authButtonGlow.interpolate({
                                  inputRange: [0, 1],
                                  outputRange: [0, 12],
                                }),
                                textShadowColor: 'rgba(255, 255, 255, 0.6)',
                                textShadowOffset: { width: 0, height: 0 },
                              }
                            ]}
                          >
                            {isLogin ? 'Start Winning Today' : 'Join AI Revolution'}
                          </Animated.Text>
                        </View>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                  </Animated.View>

                  {/* Security Badge */}
                  <Animated.View
                    style={{
                      opacity: securityAnimation,
                      transform: [{ translateY: securitySlide }]
                    }}
                  >
                    <View style={styles.securityBadge}>
                    <LockIcon size={16} color={ConversionColors.textMuted} />
                    <Animated.Text 
                      style={[
                        styles.securityText,
                        {
                          textShadowRadius: securityTextGlow.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, 6],
                          }),
                          textShadowColor: 'rgba(255, 255, 255, 0.2)',
                          textShadowOffset: { width: 0, height: 0 },
                        }
                      ]}
                    >
                      Secure • Encrypted • Private
                    </Animated.Text>
                  </View>
                  </Animated.View>

                  {/* Toggle Auth Mode */}
                  <Animated.View
                    style={{
                      opacity: toggleAnimation,
                      transform: [{ translateY: toggleSlide }]
                    }}
                  >
                    <TouchableOpacity style={styles.toggleButton} onPress={toggleAuthMode}>
                      <Animated.Text 
                        style={[
                          styles.toggleText,
                          {
                            textShadowRadius: toggleTextGlow.interpolate({
                              inputRange: [0, 1],
                              outputRange: [0, 8],
                            }),
                            textShadowColor: 'rgba(255, 255, 255, 0.3)',
                            textShadowOffset: { width: 0, height: 0 },
                          }
                        ]}
                      >
                        {isLogin ? "New to AI betting? " : "Already revolutionizing bets? "}
                        <Animated.Text 
                          style={[
                            styles.toggleTextBold,
                            {
                              textShadowRadius: toggleTextGlow.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0, 10],
                              }),
                              textShadowColor: 'rgba(255, 107, 53, 0.4)',
                              textShadowOffset: { width: 0, height: 0 },
                            }
                          ]}
                        >
                          {isLogin ? 'Create Account' : 'Sign In'}
                        </Animated.Text>
                      </Animated.Text>
                    </TouchableOpacity>
                  </Animated.View>
                </LinearGradient>
              </BlurView>

              {/* Google Sign-In Button */}
              <Animated.View
                style={{
                  opacity: securityAnimation,
                  transform: [{ translateY: securitySlide }],
                  marginTop: 12,
                }}
              >
                <TouchableOpacity
                  style={styles.googleButton}
                  onPress={handleGoogleSignIn}
                  disabled={loading}
                >
                  <LinearGradient
                    colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
                    style={styles.googleButtonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <View style={styles.googleButtonContent}>
                      <Svg width={20} height={20} viewBox="0 0 24 24">
                        <Path
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          fill="#4285F4"
                        />
                        <Path
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          fill="#34A853"
                        />
                        <Path
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          fill="#FBBC05"
                        />
                        <Path
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          fill="#EA4335"
                        />
                      </Svg>
                      <Text style={styles.googleButtonText}>Continue with Google</Text>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>

              {/* Apple Sign-In Button - iOS Only */}
              {Platform.OS === 'ios' && (
                <Animated.View
                  style={{
                    opacity: securityAnimation,
                    transform: [{ translateY: securitySlide }],
                    marginTop: 8,
                  }}
                >
                  <TouchableOpacity
                    style={styles.appleButton}
                    onPress={handleAppleSignIn}
                    disabled={loading}
                  >
                    <LinearGradient
                      colors={['rgba(0, 0, 0, 0.9)', 'rgba(0, 0, 0, 0.8)']}
                      style={styles.appleButtonGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    >
                      <View style={styles.appleButtonContent}>
                        <Svg width={20} height={20} viewBox="0 0 24 24">
                          <Path
                            d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"
                            fill="#FFFFFF"
                          />
                        </Svg>
                        <Text style={styles.appleButtonText}>Continue with Apple</Text>
                      </View>
                    </LinearGradient>
                  </TouchableOpacity>
                </Animated.View>
              )}


            </Animated.View>
          </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
              </LinearGradient>
      </View>

      {/* Empty InputAccessoryView to hide keyboard toolbar */}
      {Platform.OS === 'ios' && (
        <InputAccessoryView nativeID={inputAccessoryViewID}>
          <View style={{ height: 0 }} />
        </InputAccessoryView>
      )}
    </ErrorBoundary>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ProfessionalColors.background,
  },
  gradient: {
    flex: 1,
  },
  infinityContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 0,
  },
  infinitySymbol: {
    position: 'absolute',
  },
  keyboardContainer: {
    flex: 1,
    zIndex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    minHeight: height * 0.8, // Ensure minimum height for proper scrolling
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'flex-start',
    paddingTop: height * 0.005, // Start much higher on screen
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
  },
  logoTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    marginRight: 12,
    shadowColor: ConversionColors.shadowEmerald,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 30,
    elevation: 20,
  },
  welcomeLogo: {
    width: 56,
    height: 56,
  },
  appTitle: {
    fontSize: ConversionTypography.headline,
    fontWeight: ConversionTypography.extraBold,
    color: ConversionColors.textPrimary,
    letterSpacing: -1,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: ConversionTypography.title,
    fontWeight: ConversionTypography.bold,
    color: ConversionColors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  description: {
    fontSize: ConversionTypography.body,
    color: ConversionColors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    opacity: 0.9,
  },
  formContainer: {
    width: '100%',
  },
  formBlur: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: ConversionColors.glassBorder,
  },
  formGradient: {
    padding: 18,
  },
  nameContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  inputContainer: {
    backgroundColor: ConversionColors.glassAccent,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: ConversionColors.glassBorder,
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
    shadowColor: ConversionColors.shadowColored,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  halfInput: {
    width: '48%',
  },
  input: {
    fontSize: ConversionTypography.body,
    color: ConversionColors.textPrimary,
    paddingVertical: 12,
    fontWeight: ConversionTypography.medium,
  },
  authButton: {
    marginTop: 6,
    marginBottom: 12,
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: ConversionColors.shadowEmerald,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 25,
    elevation: 18,
  },
  authButtonDisabled: {
    opacity: 0.7,
  },
  authButtonGradient: {
    paddingVertical: 18,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  authButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  authButtonText: {
    fontSize: ConversionTypography.ctaLarge,
    fontWeight: ConversionTypography.extraBold,
    color: ConversionColors.textPrimary,
    letterSpacing: 0.5,
    marginLeft: 8,
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  securityText: {
    color: ConversionColors.textMuted,
    fontSize: ConversionTypography.caption,
    marginLeft: 6,
    opacity: 0.8,
  },
  googleButton: {
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: 'rgba(74, 222, 128, 0.3)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  googleButtonGradient: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  googleButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleButtonText: {
    fontSize: ConversionTypography.body,
    fontWeight: ConversionTypography.semiBold,
    color: ConversionColors.textPrimary,
    marginLeft: 12,
    letterSpacing: 0.3,
  },
  appleButton: {
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: 'rgba(0, 0, 0, 0.5)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  appleButtonGradient: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  appleButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  appleButtonText: {
    fontSize: ConversionTypography.body,
    fontWeight: ConversionTypography.semiBold,
    color: '#FFFFFF',
    marginLeft: 12,
    letterSpacing: 0.3,
  },
  toggleButton: {
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  toggleText: {
    fontSize: ConversionTypography.body,
    color: ConversionColors.textSecondary,
    textAlign: 'center',
  },
  toggleTextBold: {
    fontWeight: ConversionTypography.bold,
    color: ConversionColors.cta,
  },

  
  // Floating Stats
  floatingStatsContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    zIndex: 1,
  },
  floatingStatItem: {
    position: 'absolute',
    alignItems: 'center',
    padding: 10,
    backgroundColor: 'rgba(74, 222, 128, 0.03)',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.08)',
    backdropFilter: 'blur(4px)',
  },
  floatingStatValue: {
    fontSize: 18,
    fontWeight: '600',
    color: 'rgba(74, 222, 128, 0.7)',
    textShadowColor: 'rgba(74, 222, 128, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  floatingStatLabel: {
    fontSize: 10,
    fontWeight: '400',
    color: 'rgba(167, 243, 208, 0.4)',
    marginTop: 2,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});

export default LoginScreen; 