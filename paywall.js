import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  Alert,
  Platform,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import RevenueCatService from '../utils/revenueCatService';
import Svg, { Path, Circle } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { ProfessionalColors } from '../constants/Colors';
import { 
  LightningIcon, 
  TrendingUpIcon, 
  TargetIcon, 
  CheckmarkIcon,
  ChartIcon,
  CameraIcon,
  BasketballIcon,
} from '../components/CustomIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ErrorBoundary from '../components/ErrorBoundary';
import mixpanelService from '../utils/mixpanelService';
import { useTutorial } from '../utils/TutorialContext';

const { width, height } = Dimensions.get('window');
const PHONE_WIDTH = width * 0.75;
const PHONE_HEIGHT = height * 0.62;

// Emerald color palette (matching app theme)
const PaywallColors = {
  background: '#000000',
  backgroundGradient: ['#000000', '#071a0f', '#000000'],
  primary: '#4ADE80',
  primaryDark: '#22C55E',
  text: '#FFFFFF',
  textSecondary: '#A7F3D0',
  textTertiary: '#6B7280',
};

// Enhanced colors matching the app
const EnhancedColors = {
  primaryEmerald: '#4ADE80',
  playerAnalysisGradient: ['#065F46', '#0F766E', '#4ADE80'],
  teamInsightsGradient: ['#064E3B', '#059669', '#4ADE80'],
  aiAnalysisGradient: ['#0F3D3E', '#2DD4BF', '#4ADE80', '#6EE7B7'],
  glassBackground: 'rgba(74, 222, 128, 0.12)',
  glassBorder: 'rgba(74, 222, 128, 0.25)',
  positive: '#4ADE80',
  negative: '#EF4444',
  neutral: '#FCD34D',
};

// Slide data for the carousel
const PAYWALL_SLIDES = [
  {
    id: 1,
    title: 'AI-Powered Chat',
    subtitle: 'Ask any betting question and get instant\nAI analysis with real-time data.',
    screenType: 'chat',
  },
  {
    id: 2,
    title: 'Smart Analysis',
    subtitle: 'Scan bet slips instantly and get\ndetailed prop analysis in seconds.',
    screenType: 'analysis',
  },
  {
    id: 3,
    title: 'Deep Insights',
    subtitle: 'See complete player insights with\ntrends, matchups, and predictions.',
    screenType: 'insights',
  },
];

// Subscription plans are now loaded dynamically from RevenueCat
// Using a helper to format the plan display data from RC packages
const getPlanDisplayData = (packages, planId) => {
  const pkg = planId === 'yearly' ? packages?.annual : packages?.monthly;
  if (!pkg) return null;

  return {
    id: planId,
    title: planId === 'yearly' ? 'Annual' : 'Monthly',
    price: pkg.product.priceString,
    period: planId === 'yearly' ? '/yr' : '/mo',
    popular: planId === 'yearly',
    package: pkg
  };
};

// ============ SVG ICONS FOR MOCKUPS ============

const ProfileIcon = ({ size = 14, color = '#A7F3D0' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const UsersIcon = ({ size = 14, color = '#A7F3D0' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75M9 11a4 4 0 100-8 4 4 0 000 8z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const PlusIcon = ({ size = 22, color = '#4ADE80' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 5v14M5 12h14"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const SendIcon = ({ size = 18, color = '#4ADE80' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const ChatIcon = ({ size = 14, color = '#A7F3D0' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const HelpIcon = ({ size = 14, color = '#A7F3D0' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />
    <Path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Circle cx="12" cy="17" r="1" fill={color} />
  </Svg>
);

const FootballIcon = ({ size = 14, color = '#A7F3D0' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2C7.58 2 4 5.58 4 10c0 4.42 3.58 8 8 8s8-3.58 8-8c0-4.42-3.58-8-8-8z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path d="M12 6v8M8 10h8" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

const BaseballIcon = ({ size = 14, color = '#A7F3D0' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />
    <Path d="M5 12c0 3 2.5 6 7 6s7-3 7-6" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

// Mini Circular Progress for analysis cards
const MiniCircularProgress = ({ percentage, size = 20, strokeWidth = 2, color = '#FFFFFF' }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: size * 0.3, fontWeight: '800', color: '#FFFFFF' }}>{percentage}%</Text>
      </View>
    </View>
  );
};

// Mini Trend Indicator
const MiniTrendIndicator = ({ trend, size = 8 }) => {
  const colors = { up: '#4ADE80', down: '#EF4444', neutral: '#FCD34D' };
  const paths = {
    up: "M7 14l5-5 5 5",
    down: "M17 10l-5 5-5-5",
    neutral: "M5 12h14",
  };

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d={paths[trend]} stroke={colors[trend]} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
};

// ============ CHAT SCREEN MOCKUP - EXACT REPLICA ============
const ChatScreenMockup = ({ isVisible = false }) => {
  // Cascade animation refs
  const headerFade = useRef(new Animated.Value(0)).current;
  const headerSlide = useRef(new Animated.Value(-15)).current;
  const sportSelectorFade = useRef(new Animated.Value(0)).current;
  const sportSelectorSlide = useRef(new Animated.Value(-10)).current;
  const cardsFade = useRef(new Animated.Value(0)).current;
  const cardsScale = useRef(new Animated.Value(0.9)).current;
  const welcomeFade = useRef(new Animated.Value(0)).current;
  const messageFade = useRef(new Animated.Value(0)).current;
  const messageSlide = useRef(new Animated.Value(15)).current;
  const aiFade = useRef(new Animated.Value(0)).current;
  const aiSlide = useRef(new Animated.Value(15)).current;
  const chartFade = useRef(new Animated.Value(0)).current;
  const chartScale = useRef(new Animated.Value(0.95)).current;
  const inputFade = useRef(new Animated.Value(0)).current;
  const inputSlide = useRef(new Animated.Value(10)).current;
  
  // AI Response line-by-line animations (7 lines: title, intro, 5 bullet points)
  const aiLine1Fade = useRef(new Animated.Value(0)).current;
  const aiLine2Fade = useRef(new Animated.Value(0)).current;
  const aiLine3Fade = useRef(new Animated.Value(0)).current;
  const aiLine4Fade = useRef(new Animated.Value(0)).current;
  const aiLine5Fade = useRef(new Animated.Value(0)).current;
  const aiLine6Fade = useRef(new Animated.Value(0)).current;
  const aiLine7Fade = useRef(new Animated.Value(0)).current;
  
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (isVisible && !hasAnimated.current) {
      hasAnimated.current = true;
      
      // Step 1: Header (0ms)
      Animated.parallel([
        Animated.timing(headerFade, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.spring(headerSlide, { toValue: 0, tension: 80, friction: 10, useNativeDriver: true }),
      ]).start();
      
      // Step 2: Sport Selector (150ms)
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(sportSelectorFade, { toValue: 1, duration: 350, useNativeDriver: true }),
          Animated.spring(sportSelectorSlide, { toValue: 0, tension: 80, friction: 10, useNativeDriver: true }),
        ]).start();
      }, 150);
      
      // Step 3: Analysis Cards (300ms)
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(cardsFade, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.spring(cardsScale, { toValue: 1, tension: 60, friction: 8, useNativeDriver: true }),
        ]).start();
      }, 300);
      
      // Step 4: Welcome text (450ms)
      setTimeout(() => {
        Animated.timing(welcomeFade, { toValue: 1, duration: 350, useNativeDriver: true }).start();
      }, 450);
      
      // Step 5: User message (550ms)
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(messageFade, { toValue: 1, duration: 350, useNativeDriver: true }),
          Animated.spring(messageSlide, { toValue: 0, tension: 80, friction: 10, useNativeDriver: true }),
        ]).start();
      }, 550);
      
      // Step 6: AI icon and bubble container (700ms)
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(aiFade, { toValue: 1, duration: 350, useNativeDriver: true }),
          Animated.spring(aiSlide, { toValue: 0, tension: 80, friction: 10, useNativeDriver: true }),
        ]).start();
      }, 700);
      
      // Step 6b: AI Response lines cascade (starting 800ms, 80ms between each)
      const lineAnims = [aiLine1Fade, aiLine2Fade, aiLine3Fade, aiLine4Fade, aiLine5Fade, aiLine6Fade, aiLine7Fade];
      lineAnims.forEach((anim, idx) => {
        setTimeout(() => {
          Animated.timing(anim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
        }, 800 + (idx * 80));
      });
      
      // Step 7: Chart (1400ms - after all lines)
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(chartFade, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.spring(chartScale, { toValue: 1, tension: 60, friction: 8, useNativeDriver: true }),
        ]).start();
      }, 1400);
      
      // Step 8: Input (1600ms)
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(inputFade, { toValue: 1, duration: 350, useNativeDriver: true }),
          Animated.spring(inputSlide, { toValue: 0, tension: 80, friction: 10, useNativeDriver: true }),
        ]).start();
      }, 1600);
    }
  }, [isVisible]);

  return (
  <View style={chatStyles.container}>
    {/* Header - Animated Cascade */}
    <Animated.View style={[
      chatStyles.headerContainer,
      { opacity: headerFade, transform: [{ translateY: headerSlide }] }
    ]}>
      {/* Decorative diagonal lines */}
      <View style={chatStyles.heroDecorativeLines}>
        <View style={[chatStyles.heroDiagonalLine, chatStyles.heroDiagonalLine1]} />
        <View style={[chatStyles.heroDiagonalLine, chatStyles.heroDiagonalLine2]} />
      </View>
      
      {/* Top Header Bar */}
      <View style={chatStyles.topHeaderBar}>
        {/* Profile Button - Left */}
        <View style={chatStyles.profileButton}>
          <ProfileIcon size={10} color="#A7F3D0" />
        </View>

        {/* Logo Center */}
        <View style={chatStyles.logoCenter}>
          <Image 
            source={require('../assets/images/propify-logo-original.png')} 
            style={chatStyles.logoImage}
            resizeMode="contain"
          />
          <Text style={chatStyles.logoText}>AI Chat</Text>
          <View style={chatStyles.statusDot} />
        </View>

        {/* Community Button - Right */}
        <View style={chatStyles.utilityIcons}>
          <View style={chatStyles.utilityButton}>
            <UsersIcon size={10} color="#A7F3D0" />
              </View>
              </View>
            </View>

      {/* Divider */}
      <View style={chatStyles.headerDivider} />

      {/* Sport Selector - Animated */}
      <Animated.View style={[
        chatStyles.sportSelectorScroll,
        { opacity: sportSelectorFade, transform: [{ translateY: sportSelectorSlide }] }
      ]}>
        <View style={[chatStyles.sportSelectorItem, chatStyles.sportSelectorItemActive]}>
          <Image 
            source={{ uri: 'https://pgtgwynrdccxmfxurcnz.supabase.co/storage/v1/object/public/leagues/4.png' }}
            style={chatStyles.sportLogoImage}
            resizeMode="contain"
          />
          <Text style={[chatStyles.sportSelectorText, chatStyles.sportSelectorTextActive]}>NBA</Text>
                        </View>
        <View style={chatStyles.sportSelectorItem}>
          <Image 
            source={{ uri: 'https://pgtgwynrdccxmfxurcnz.supabase.co/storage/v1/object/public/leagues/7.png' }}
            style={chatStyles.sportLogoImage}
            resizeMode="contain"
          />
          <Text style={chatStyles.sportSelectorText}>NFL</Text>
                      </View>
      </Animated.View>
    </Animated.View>

    {/* Chat Content Area */}
    <View style={chatStyles.chatArea}>
      {/* Mini Stacked Analysis Cards - Animated */}
      <Animated.View style={[
        chatStyles.analysisCardsContainer,
        { opacity: cardsFade, transform: [{ scale: cardsScale }] }
      ]}>
        <View style={chatStyles.analysisStackContainer}>
                        {/* Left Card - Player Analysis */}
          <View style={[chatStyles.analysisCard, chatStyles.leftAnalysisCard]}>
                          <LinearGradient
                            colors={EnhancedColors.playerAnalysisGradient}
              style={chatStyles.analysisCardContent}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                          >
              <View style={chatStyles.cardHeader}>
                <View style={chatStyles.cardIcon}>
                  <ProfileIcon size={8} color="#FFFFFF" />
                                </View>
                <Text style={chatStyles.cardTitle}>Player Analysis</Text>
                              </View>
              <Text style={chatStyles.cardSubtitle}>Recent Performance</Text>
              <View style={chatStyles.metricsContainer}>
                <View style={chatStyles.metricRow}>
                  <Text style={chatStyles.metricLabel}>Season:</Text>
                  <Text style={chatStyles.metricValue}>24.8 PPG</Text>
                  <MiniTrendIndicator trend="up" />
                                  </View>
                <View style={chatStyles.metricRow}>
                  <Text style={chatStyles.metricLabel}>L5 Avg:</Text>
                  <Text style={chatStyles.metricValue}>27.2</Text>
                  <MiniTrendIndicator trend="up" />
                                  </View>
                                </View>
              <View style={chatStyles.cardFooter}>
                <MiniCircularProgress percentage={82} size={18} strokeWidth={2} />
                <Text style={chatStyles.footerText}>Conf</Text>
                              </View>
                          </LinearGradient>
          </View>

                        {/* Right Card - Team Insights */}
          <View style={[chatStyles.analysisCard, chatStyles.rightAnalysisCard]}>
                          <LinearGradient
                            colors={EnhancedColors.teamInsightsGradient}
              style={chatStyles.analysisCardContent}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                          >
              <View style={chatStyles.cardHeader}>
                <View style={chatStyles.cardIcon}>
                  <UsersIcon size={8} color="#FFFFFF" />
                                </View>
                <Text style={chatStyles.cardTitle}>Team Insights</Text>
                              </View>
              <Text style={chatStyles.cardSubtitle}>Offense Rating</Text>
              <View style={chatStyles.metricsContainer}>
                <View style={chatStyles.metricRow}>
                  <Text style={chatStyles.metricLabel}>Rating:</Text>
                  <Text style={chatStyles.metricValue}>118.4</Text>
                  <MiniTrendIndicator trend="up" />
                                  </View>
                <View style={chatStyles.metricRow}>
                  <Text style={chatStyles.metricLabel}>Record:</Text>
                  <Text style={chatStyles.metricValue}>7-1</Text>
                  <MiniTrendIndicator trend="up" />
                                  </View>
                                </View>
              <View style={chatStyles.cardFooter}>
                <MiniCircularProgress percentage={87} size={18} strokeWidth={2} />
                <Text style={chatStyles.footerText}>Conf</Text>
                              </View>
                          </LinearGradient>
          </View>

                        {/* Main Card - AI Analysis */}
          <View style={[chatStyles.analysisCard, chatStyles.mainAnalysisCard]}>
                          <LinearGradient
                            colors={EnhancedColors.aiAnalysisGradient}
              style={chatStyles.mainCardContent}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                          >
              <View style={chatStyles.mainCardHeader}>
                <View style={chatStyles.mainCardIcon}>
                  <LightningIcon size={10} color="#FFFFFF" />
                              </View>
                <Text style={chatStyles.mainCardTitle}>AI Prop Scanner</Text>
                            </View>
              <Text style={chatStyles.mainCardDesc}>
                Smart bet detection and{'\n'}risk assessment
                            </Text>
              <View style={chatStyles.mainCardStats}>
                <View style={chatStyles.mainStatItem}>
                  <Text style={chatStyles.mainStatValue}>94%</Text>
                  <Text style={chatStyles.mainStatLabel}>Accuracy</Text>
                                </View>
                <View style={chatStyles.mainStatDivider} />
                <View style={chatStyles.mainStatItem}>
                  <Text style={chatStyles.mainStatValue}>2.3s</Text>
                  <Text style={chatStyles.mainStatLabel}>Analysis</Text>
                              </View>
                            </View>
                          </LinearGradient>
          </View>
                      </View>
      </Animated.View>

      {/* Welcome Text - Animated */}
      <Animated.Text style={[chatStyles.welcomeText, { opacity: welcomeFade }]}>
        Upload a bet slip or ask me anything{'\n'}about sports analytics
      </Animated.Text>

      {/* Sample User Message - Animated */}
      <Animated.View style={[
        chatStyles.userMessageContainer,
        { opacity: messageFade, transform: [{ translateY: messageSlide }] }
      ]}>
        <View style={chatStyles.userMessageBubble}>
          <View style={chatStyles.bubbleDecorativeLines}>
            <View style={[chatStyles.bubbleDiagonalLine, chatStyles.bubbleDiagonalLine1]} />
            <View style={[chatStyles.bubbleDiagonalLine, chatStyles.bubbleDiagonalLine2]} />
                      </View>
          <Text style={chatStyles.userMessageText}>Is LeBron over 25.5 pts a good bet?</Text>
                      </View>
      </Animated.View>

      {/* AI Response with Bullet Points and Chart - Animated */}
      <Animated.View style={[
        chatStyles.aiMessageContainer,
        { opacity: aiFade, transform: [{ translateY: aiSlide }] }
      ]}>
        <View style={chatStyles.aiIconContainer}>
          <LightningIcon size={10} color="#4ADE80" />
                      </View>
        <View style={chatStyles.aiResponseContainer}>
          {/* Main Response with Line-by-Line Cascade */}
          <View style={chatStyles.aiMessageBubble}>
            {/* Line 1: Title */}
            <Animated.Text style={[chatStyles.aiMessageText, chatStyles.aiBoldText, { opacity: aiLine1Fade, marginBottom: 4 }]}>
              Strong Play ✓
            </Animated.Text>
            
            {/* Line 2: Intro */}
            <Animated.Text style={[chatStyles.aiMessageText, { opacity: aiLine2Fade, marginBottom: 4 }]}>
              LeBron has hit this in <Text style={chatStyles.aiHighlightText}>8 of last 10</Text> games.
            </Animated.Text>
            
            {/* Line 3: Defense */}
            <Animated.Text style={[chatStyles.aiMessageText, chatStyles.aiBulletLine, { opacity: aiLine3Fade }]}>
              <Text style={chatStyles.bulletPoint}>•</Text> <Text style={chatStyles.bulletLabel}>Defense:</Text> OPP ranks <Text style={chatStyles.aiHighlightText}>#27th</Text> vs PTS
            </Animated.Text>
            
            {/* Line 4: Usage */}
            <Animated.Text style={[chatStyles.aiMessageText, chatStyles.aiBulletLine, { opacity: aiLine4Fade }]}>
              <Text style={chatStyles.bulletPoint}>•</Text> <Text style={chatStyles.bulletLabel}>Usage:</Text> <Text style={chatStyles.aiHighlightText}>31.2%</Text> (↑2.4%)
            </Animated.Text>
            
            {/* Line 5: Pace */}
            <Animated.Text style={[chatStyles.aiMessageText, chatStyles.aiBulletLine, { opacity: aiLine5Fade }]}>
              <Text style={chatStyles.bulletPoint}>•</Text> <Text style={chatStyles.bulletLabel}>Pace:</Text> <Text style={chatStyles.aiHighlightText}>104.8</Text> (Fast game)
            </Animated.Text>
            
            {/* Line 6: LAL Injuries */}
            <Animated.Text style={[chatStyles.aiMessageText, chatStyles.aiBulletLine, { opacity: aiLine6Fade }]}>
              <Text style={chatStyles.bulletPoint}>•</Text> <Text style={chatStyles.bulletLabel}>LAL Injuries:</Text> Reaves (GTD)
            </Animated.Text>
            
            {/* Line 7: OPP Injuries */}
            <Animated.Text style={[chatStyles.aiMessageText, chatStyles.aiBulletLine, { opacity: aiLine7Fade }]}>
              <Text style={chatStyles.bulletPoint}>•</Text> <Text style={chatStyles.bulletLabel}>OPP Injuries:</Text> <Text style={chatStyles.positiveText}>2 starters OUT</Text>
            </Animated.Text>
                      </View>
          
          {/* Mini Last 10 Games Chart - NBA Style - Animated */}
          <Animated.View style={[
            chatStyles.chartContainer,
            { opacity: chartFade, transform: [{ scale: chartScale }] }
          ]}>
            {/* Decorative diagonal stripes */}
            <View style={chatStyles.chartDecorativeLines}>
              <View style={[chatStyles.chartDiagonalLine, chatStyles.chartDiagonalLine1]} />
              <View style={[chatStyles.chartDiagonalLine, chatStyles.chartDiagonalLine2]} />
                </View>

            {/* Chart Header */}
            <View style={chatStyles.chartHeader}>
              <View style={chatStyles.chartTitleRow}>
                <Text style={chatStyles.chartPercentIcon}>%</Text>
                <Text style={chatStyles.chartTitle}>Statistics</Text>
              </View>
              <View style={chatStyles.chartToggle}>
                <Text style={chatStyles.chartToggleText}>Last 10</Text>
            </View>
            </View>
            
            {/* Stats Row */}
            <View style={chatStyles.chartStatsRow}>
              <View style={chatStyles.chartStatItem}>
                <Text style={chatStyles.chartStatLabel}>L5</Text>
                <Text style={[chatStyles.chartStatValue, { color: '#4ADE80' }]}>80%</Text>
              </View>
              <View style={chatStyles.chartStatSeparator} />
              <View style={chatStyles.chartStatItem}>
                <Text style={chatStyles.chartStatLabel}>L10</Text>
                <Text style={[chatStyles.chartStatValue, { color: '#4ADE80' }]}>80%</Text>
              </View>
              <View style={chatStyles.chartStatSeparator} />
              <View style={chatStyles.chartStatItem}>
                <Text style={chatStyles.chartStatLabel}>Line</Text>
                <Text style={[chatStyles.chartStatValue, { color: '#FFFFFF' }]}>25.5</Text>
              </View>
              </View>
              
            <View style={chatStyles.chartStatsBottomLine} />
                
            {/* Bars Area with Line */}
            <View style={chatStyles.chartBarsArea}>
              {[32, 28, 22, 31, 27, 24, 29, 26, 33, 30].map((pts, idx) => {
                const isOver = pts > 25.5;
                const barHeight = Math.max((pts / 35) * 28, 8);
                return (
                  <View key={idx} style={chatStyles.chartBarColumn}>
                    {/* Value above bar */}
                    <Text style={[chatStyles.chartBarValue, { color: isOver ? '#4ADE80' : '#EF4444' }]}>
                      {pts}
                    </Text>
                    {/* Gradient Bar */}
                          <LinearGradient
                      colors={isOver 
                        ? ['rgba(74, 222, 128, 0.2)', 'rgba(74, 222, 128, 0.5)', '#4ADE80']
                        : ['rgba(239, 68, 68, 0.2)', 'rgba(239, 68, 68, 0.5)', '#EF4444']
                      }
                      start={{ x: 0.5, y: 1 }}
                      end={{ x: 0.5, y: 0 }}
                      style={[chatStyles.chartGradientBar, { height: barHeight }]}
                    />
                        </View>
                );
              })}
              
              {/* Horizontal Line Indicator - GREEN like the real chart */}
              <View style={chatStyles.chartHorizontalLine}>
                <View style={chatStyles.chartLineLabel}>
                  <Text style={chatStyles.chartLineLabelText}>25.5</Text>
                      </View>
                        </View>
                          </View>
          </Animated.View>
                            </View>
      </Animated.View>
                      </View>

    {/* Input Area - Animated */}
    <Animated.View style={[
      chatStyles.inputContainer,
      { opacity: inputFade, transform: [{ translateY: inputSlide }] }
    ]}>
      {/* Plus Button */}
      <View style={chatStyles.plusButton}>
        <PlusIcon size={14} color="#4ADE80" />
              </View>

      {/* Text Input */}
      <View style={chatStyles.textInputWrapper}>
        <View style={chatStyles.inputDecorativeLines}>
          <View style={[chatStyles.inputDiagonalLine, chatStyles.inputDiagonalLine1]} />
          <View style={[chatStyles.inputDiagonalLine, chatStyles.inputDiagonalLine2]} />
                  </View>
        <Text style={chatStyles.inputPlaceholder}>Ask about props, matchups...</Text>
        <View style={chatStyles.sendButton}>
          <SendIcon size={10} color="#4ADE80" />
                    </View>
            </View>
    </Animated.View>
  </View>
  );
};

const chatStyles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: '#000000',
    overflow: 'hidden',
  },
  // Header
  headerContainer: {
    paddingTop: 0,
    paddingBottom: 2,
    backgroundColor: 'transparent',
    position: 'relative',
  },
  heroDecorativeLines: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
    overflow: 'hidden',
  },
  heroDiagonalLine: {
    position: 'absolute',
    width: 200,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#4ADE80',
  },
  heroDiagonalLine1: {
    top: -2,
    right: -80,
    transform: [{ rotate: '25deg' }],
    opacity: 0.25,
  },
  heroDiagonalLine2: {
    top: 6,
    right: -80,
    transform: [{ rotate: '25deg' }],
    opacity: 0.15,
  },
  topHeaderBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  profileButton: {
    width: 20,
    height: 20,
    borderRadius: 4,
    backgroundColor: 'rgba(6, 95, 70, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.3)',
  },
  logoCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    width: 14,
    height: 14,
    marginRight: 4,
  },
  logoText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.3,
    fontStyle: 'italic',
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#4ADE80',
    marginLeft: 4,
  },
  utilityIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  utilityButton: {
    width: 20,
    height: 20,
    borderRadius: 4,
    backgroundColor: 'rgba(6, 95, 70, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.3)',
  },
  headerDivider: {
    height: 1,
    backgroundColor: 'rgba(75, 85, 99, 0.4)',
    marginHorizontal: 8,
    marginTop: 2,
    marginBottom: 2,
  },
  sportSelectorScroll: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    gap: 3,
  },
  sportSelectorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
    backgroundColor: 'rgba(6, 95, 70, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.3)',
    gap: 3,
  },
  sportSelectorItemActive: {
    backgroundColor: '#4ADE80',
    borderColor: '#4ADE80',
    borderWidth: 1,
    shadowColor: '#4ADE80',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
  },
  sportLogoImage: {
    width: 12,
    height: 12,
  },
  sportSelectorText: {
    fontSize: 7,
    fontWeight: '700',
    color: '#A7F3D0',
    letterSpacing: 0.1,
  },
  sportSelectorTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  // Chat Area
  chatArea: {
    flex: 1,
    paddingHorizontal: 6,
    paddingTop: 6,
  },
  // Analysis Cards - Matching chat.js dimensions (scaled for phone mockup)
  analysisCardsContainer: {
    alignItems: 'center',
    marginTop: 3,
    marginBottom: 8,
    position: 'relative',
  },
  analysisStackContainer: {
    position: 'relative',
    width: '80%',
    height: 95,
    alignItems: 'center',
    justifyContent: 'center',
  },
  analysisCard: {
    position: 'absolute',
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  leftAnalysisCard: {
    width: '48%',
    height: '100%',
    transform: [{ rotate: '-10deg' }, { translateX: -16 }],
    zIndex: 1,
  },
  rightAnalysisCard: {
    width: '48%',
    height: '100%',
    transform: [{ rotate: '10deg' }, { translateX: 16 }],
    zIndex: 2,
  },
  mainAnalysisCard: {
    width: '48%',
    height: '100%',
    borderRadius: 16,
    zIndex: 3,
  },
  analysisCardContent: {
    flex: 1,
    padding: 6,
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.25)',
    borderRadius: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  cardIcon: {
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: 'rgba(74, 222, 128, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 3,
  },
  cardTitle: {
    fontSize: 6,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.1,
    flex: 1,
  },
  cardSubtitle: {
    fontSize: 5,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 3,
    fontWeight: '500',
  },
  metricsContainer: {
    marginTop: 1,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  metricLabel: {
    fontSize: 4,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.75)',
    letterSpacing: 0.1,
  },
  metricValue: {
    fontSize: 5,
    fontWeight: '700',
    color: '#FFFFFF',
    fontVariant: ['tabular-nums'],
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  footerText: {
    fontSize: 4,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 3,
    letterSpacing: 0.1,
  },
  // Main Card - Matching chat.js dimensions (scaled)
  mainCardContent: {
    flex: 1,
    padding: 7,
    justifyContent: 'space-between',
    borderRadius: 16,
  },
  mainCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  mainCardIcon: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: 'rgba(74, 222, 128, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
  },
  mainCardTitle: {
    fontSize: 7,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.1,
  },
  mainCardDesc: {
    fontSize: 5,
    color: 'rgba(255, 255, 255, 0.85)',
    lineHeight: 7,
    textAlign: 'center',
    marginVertical: 4,
    fontWeight: '500',
  },
  mainCardStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 5,
    padding: 5,
  },
  mainStatItem: {
    alignItems: 'center',
  },
  mainStatValue: {
    fontSize: 7,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.2,
    fontVariant: ['tabular-nums'],
  },
  mainStatLabel: {
    fontSize: 4,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 1,
    letterSpacing: 0.2,
  },
  mainStatDivider: {
    width: 1,
    height: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    marginHorizontal: 7,
  },
  // Welcome Text
  welcomeText: {
    fontSize: 8,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 5,
    marginBottom: 8,
    lineHeight: 11,
  },
  // User Message
  userMessageContainer: {
    alignItems: 'flex-end',
    marginBottom: 6,
  },
  userMessageBubble: {
    backgroundColor: 'rgba(4, 60, 45, 0.25)',
    borderRadius: 12,
    borderBottomRightRadius: 4,
    padding: 8,
    maxWidth: '80%',
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.5)',
    overflow: 'hidden',
    position: 'relative',
  },
  bubbleDecorativeLines: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
    overflow: 'hidden',
  },
  bubbleDiagonalLine: {
    position: 'absolute',
    width: 100,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#4ADE80',
  },
  bubbleDiagonalLine1: {
    top: 2,
    right: -30,
    transform: [{ rotate: '25deg' }],
    opacity: 0.35,
  },
  bubbleDiagonalLine2: {
    top: 8,
    right: -30,
    transform: [{ rotate: '25deg' }],
    opacity: 0.2,
  },
  userMessageText: {
    fontSize: 9,
    color: '#FFFFFF',
    lineHeight: 13,
    zIndex: 1,
  },
  // AI Message
  aiMessageContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  aiIconContainer: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(74, 222, 128, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  aiResponseContainer: {
    flex: 1,
    maxWidth: '90%',
  },
  aiMessageBubble: {
    backgroundColor: 'rgba(74, 222, 128, 0.15)',
    borderRadius: 12,
    borderBottomLeftRadius: 4,
    padding: 8,
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.4)',
    marginBottom: 4,
  },
  aiMessageText: {
    fontSize: 8,
    color: 'rgba(255, 255, 255, 0.95)',
    lineHeight: 12,
  },
  aiBulletLine: {
    marginTop: 2,
  },
  aiBoldText: {
    fontWeight: '700',
    color: '#4ADE80',
  },
  aiHighlightText: {
    fontWeight: '700',
    color: '#4ADE80',
  },
  bulletPoint: {
    color: '#4ADE80',
    fontWeight: '700',
  },
  bulletLabel: {
    color: '#A7F3D0',
    fontWeight: '600',
  },
  positiveText: {
    color: '#4ADE80',
    fontWeight: '600',
  },
  // Mini Chart - NBA Last 20 Style
  chartContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 8,
    padding: 6,
    borderWidth: 1.5,
    borderColor: '#4ADE80',
    overflow: 'hidden',
    position: 'relative',
  },
  // Chart Decorative Lines
  chartDecorativeLines: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
    overflow: 'hidden',
  },
  chartDiagonalLine: {
    position: 'absolute',
    width: 150,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#4ADE80',
  },
  chartDiagonalLine1: {
    top: -2,
    left: -30,
    transform: [{ rotate: '25deg' }],
    opacity: 0.25,
  },
  chartDiagonalLine2: {
    top: 6,
    left: -30,
    transform: [{ rotate: '25deg' }],
    opacity: 0.15,
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
    zIndex: 1,
  },
  chartTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chartPercentIcon: {
    fontSize: 10,
    fontWeight: '800',
    color: '#4ADE80',
    marginRight: 3,
    textShadowColor: 'rgba(74, 222, 128, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },
  chartTitle: {
    fontSize: 8,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  chartToggle: {
    backgroundColor: '#4ADE80',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  chartToggleText: {
    fontSize: 6,
    fontWeight: '700',
    color: '#000000',
  },
  // Stats Row
  chartStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 3,
    zIndex: 1,
  },
  chartStatItem: {
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  chartStatSeparator: {
    width: 1,
    height: 14,
    backgroundColor: 'rgba(74, 222, 128, 0.4)',
    borderRadius: 0.5,
  },
  chartStatLabel: {
    fontSize: 5,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  chartStatValue: {
    fontSize: 7,
    fontWeight: '800',
  },
  chartStatsBottomLine: {
    height: 1,
    backgroundColor: 'rgba(74, 222, 128, 0.3)',
    marginVertical: 3,
    zIndex: 1,
  },
  // Bars Area
  chartBarsArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    height: 40,
    position: 'relative',
    zIndex: 1,
    paddingTop: 10,
  },
  chartBarColumn: {
    alignItems: 'center',
    marginHorizontal: 1,
    width: 12,
  },
  chartBarValue: {
    fontSize: 5,
    fontWeight: '700',
    marginBottom: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  chartGradientBar: {
    width: 8,
    borderRadius: 2,
    shadowColor: '#4ADE80',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
  },
  // Horizontal Line - GREEN like the real chart
  chartHorizontalLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 20, // Positioned at 25.5 level
    height: 1.5,
    backgroundColor: '#4ADE80',
    zIndex: 10,
    shadowColor: '#4ADE80',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  chartLineLabel: {
    position: 'absolute',
    right: -2,
    top: -5,
    backgroundColor: '#4ADE80',
    paddingHorizontal: 3,
    paddingVertical: 1,
    borderRadius: 2,
    shadowColor: '#4ADE80',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
  },
  chartLineLabelText: {
    fontSize: 5,
    fontWeight: '800',
    color: '#000000',
  },
  // Input
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 6,
    backgroundColor: '#000000',
    gap: 6,
  },
  plusButton: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(4, 60, 45, 0.25)',
    borderWidth: 1,
    borderColor: '#4ADE80',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(4, 60, 45, 0.25)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#4ADE80',
    paddingLeft: 10,
    paddingRight: 4,
    height: 28,
    overflow: 'hidden',
    position: 'relative',
  },
  inputDecorativeLines: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
    overflow: 'hidden',
  },
  inputDiagonalLine: {
    position: 'absolute',
    width: 150,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#4ADE80',
  },
  inputDiagonalLine1: {
    top: 2,
    right: -50,
    transform: [{ rotate: '25deg' }],
    opacity: 0.35,
  },
  inputDiagonalLine2: {
    top: 10,
    right: -50,
    transform: [{ rotate: '25deg' }],
    opacity: 0.2,
  },
  inputPlaceholder: {
    flex: 1,
    fontSize: 8,
    color: 'rgba(255, 255, 255, 0.5)',
    zIndex: 1,
  },
  sendButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(74, 222, 128, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
});

// ============ ANALYSIS SCREEN MOCKUP ============
const AnalysisScreenMockup = ({ isVisible = false }) => {
  // Cascade animation refs
  const headerFade = useRef(new Animated.Value(0)).current;
  const headerSlide = useRef(new Animated.Value(-15)).current;
  const quickChatFade = useRef(new Animated.Value(0)).current;
  const quickChatSlide = useRef(new Animated.Value(-10)).current;
  const section1Fade = useRef(new Animated.Value(0)).current;
  const section1Slide = useRef(new Animated.Value(15)).current;
  const section2Fade = useRef(new Animated.Value(0)).current;
  const section2Slide = useRef(new Animated.Value(15)).current;
  const section3Fade = useRef(new Animated.Value(0)).current;
  const section3Slide = useRef(new Animated.Value(15)).current;
  
  // Card cascade animations - slide from left
  const section1CardFades = useRef([...Array(5)].map(() => new Animated.Value(0))).current;
  const section1CardSlides = useRef([...Array(5)].map(() => new Animated.Value(-30))).current;
  const section2CardFades = useRef([...Array(5)].map(() => new Animated.Value(0))).current;
  const section2CardSlides = useRef([...Array(5)].map(() => new Animated.Value(-30))).current;
  const section3CardFades = useRef([...Array(5)].map(() => new Animated.Value(0))).current;
  const section3CardSlides = useRef([...Array(5)].map(() => new Animated.Value(-30))).current;
  
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (isVisible && !hasAnimated.current) {
      hasAnimated.current = true;
      
      // Step 1: Header (0ms)
      Animated.parallel([
        Animated.timing(headerFade, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.spring(headerSlide, { toValue: 0, tension: 80, friction: 10, useNativeDriver: true }),
      ]).start();
      
      // Step 2: Quick Chat (200ms)
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(quickChatFade, { toValue: 1, duration: 350, useNativeDriver: true }),
          Animated.spring(quickChatSlide, { toValue: 0, tension: 80, friction: 10, useNativeDriver: true }),
        ]).start();
      }, 200);
      
      // Step 3: Section 1 - Featured Props (400ms)
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(section1Fade, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.spring(section1Slide, { toValue: 0, tension: 60, friction: 8, useNativeDriver: true }),
        ]).start();
        
        // Cascade cards from left (staggered 120ms each, slower animation)
        section1CardFades.forEach((fade, idx) => {
          setTimeout(() => {
            Animated.parallel([
              Animated.timing(fade, { toValue: 1, duration: 400, useNativeDriver: true }),
              Animated.spring(section1CardSlides[idx], { toValue: 0, tension: 40, friction: 12, useNativeDriver: true }),
            ]).start();
          }, idx * 120);
        });
      }, 400);
      
      // Step 4: Section 2 - Defensive Mismatches (600ms)
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(section2Fade, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.spring(section2Slide, { toValue: 0, tension: 60, friction: 8, useNativeDriver: true }),
        ]).start();
        
        // Cascade cards from left (staggered 120ms each, slower animation)
        section2CardFades.forEach((fade, idx) => {
          setTimeout(() => {
            Animated.parallel([
              Animated.timing(fade, { toValue: 1, duration: 400, useNativeDriver: true }),
              Animated.spring(section2CardSlides[idx], { toValue: 0, tension: 40, friction: 12, useNativeDriver: true }),
            ]).start();
          }, idx * 120);
        });
      }, 600);
      
      // Step 5: Section 3 - Injury Opportunities (800ms)
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(section3Fade, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.spring(section3Slide, { toValue: 0, tension: 60, friction: 8, useNativeDriver: true }),
        ]).start();
        
        // Cascade cards from left (staggered 120ms each, slower animation)
        section3CardFades.forEach((fade, idx) => {
          setTimeout(() => {
            Animated.parallel([
              Animated.timing(fade, { toValue: 1, duration: 400, useNativeDriver: true }),
              Animated.spring(section3CardSlides[idx], { toValue: 0, tension: 40, friction: 12, useNativeDriver: true }),
            ]).start();
          }, idx * 120);
        });
      }, 800);
    }
  }, [isVisible]);

  // Sample prop data for the cards with real headshot URLs from Supabase NFL project
  const sampleProps = [
    { name: 'J. Burrow', team: 'CIN', opp: 'BAL', prop: 'PASS YDS', line: '275.5', signal: 'OVER', hitRate: 4, total: 5, headshot: 'https://kdhnyndibqvolnwjfgop.supabase.co/storage/v1/object/public/headshots/3915511.png' },
    { name: 'D. Henry', team: 'BAL', opp: 'CIN', prop: 'RUSH YDS', line: '95.5', signal: 'OVER', hitRate: 3, total: 5, headshot: 'https://kdhnyndibqvolnwjfgop.supabase.co/storage/v1/object/public/headshots/3043078.png' },
    { name: 'J. Chase', team: 'CIN', opp: 'BAL', prop: 'REC YDS', line: '82.5', signal: 'OVER', hitRate: 4, total: 5, headshot: 'https://kdhnyndibqvolnwjfgop.supabase.co/storage/v1/object/public/headshots/4362628.png' },
    { name: 'L. Jackson', team: 'BAL', opp: 'CIN', prop: 'PASS YDS', line: '225.5', signal: 'UNDER', hitRate: 3, total: 5, headshot: 'https://kdhnyndibqvolnwjfgop.supabase.co/storage/v1/object/public/headshots/3916387.png' },
    { name: 'T. Hill', team: 'MIA', opp: 'NE', prop: 'REC YDS', line: '78.5', signal: 'OVER', hitRate: 4, total: 5, headshot: 'https://kdhnyndibqvolnwjfgop.supabase.co/storage/v1/object/public/headshots/3116406.png' },
  ];

  // Sample defensive mismatches with real headshot URLs
  const sampleMismatches = [
    { name: 'J. Jefferson', team: 'MIN', opp: 'CHI', prop: 'REC YDS', line: '88.5', signal: 'OVER', defRank: '#28', headshot: 'https://kdhnyndibqvolnwjfgop.supabase.co/storage/v1/object/public/headshots/4262921.png' },
    { name: 'A. St. Brown', team: 'DET', opp: 'GB', prop: 'REC YDS', line: '75.5', signal: 'OVER', defRank: '#26', headshot: 'https://kdhnyndibqvolnwjfgop.supabase.co/storage/v1/object/public/headshots/4374302.png' },
    { name: 'C. Lamb', team: 'DAL', opp: 'NYG', prop: 'REC', line: '6.5', signal: 'OVER', defRank: '#30', headshot: 'https://kdhnyndibqvolnwjfgop.supabase.co/storage/v1/object/public/headshots/4241389.png' },
    { name: 'D. Adams', team: 'LAR', opp: 'DEN', prop: 'REC YDS', line: '72.5', signal: 'OVER', defRank: '#25', headshot: 'https://kdhnyndibqvolnwjfgop.supabase.co/storage/v1/object/public/headshots/16800.png' },
    { name: 'G. Wilson', team: 'NYJ', opp: 'BUF', prop: 'REC YDS', line: '65.5', signal: 'OVER', defRank: '#27', headshot: 'https://kdhnyndibqvolnwjfgop.supabase.co/storage/v1/object/public/headshots/4569618.png' },
  ];

  // Sample injury opportunities with real headshot URLs
  const sampleInjuries = [
    { name: 'T. Higgins', team: 'CIN', boost: '+18%', availability: 'OUT', injuredPlayer: 'J. Chase', headshot: 'https://kdhnyndibqvolnwjfgop.supabase.co/storage/v1/object/public/headshots/4239993.png' },
    { name: 'Z. Flowers', team: 'BAL', boost: '+12%', availability: 'GTD', injuredPlayer: 'R. Bateman', headshot: 'https://kdhnyndibqvolnwjfgop.supabase.co/storage/v1/object/public/headshots/4429615.png' },
    { name: 'D.J. Moore', team: 'CHI', boost: '+15%', availability: 'OUT', injuredPlayer: 'A. Thielen', headshot: 'https://kdhnyndibqvolnwjfgop.supabase.co/storage/v1/object/public/headshots/3915416.png' },
    { name: 'C. Godwin', team: 'TB', boost: '+14%', availability: 'OUT', injuredPlayer: 'M. Evans', headshot: 'https://kdhnyndibqvolnwjfgop.supabase.co/storage/v1/object/public/headshots/3116165.png' },
    { name: 'K. Allen', team: 'LAC', boost: '+11%', availability: 'GTD', injuredPlayer: 'D. Moore', headshot: 'https://kdhnyndibqvolnwjfgop.supabase.co/storage/v1/object/public/headshots/15818.png' },
  ];

  return (
    <View style={analysisStyles.container}>
      {/* Header - Animated */}
      <Animated.View style={[
        analysisStyles.header,
        { opacity: headerFade, transform: [{ translateY: headerSlide }] }
      ]}>
        <View style={analysisStyles.headerDecorativeLines}>
          <View style={[analysisStyles.headerDiagonalLine, analysisStyles.headerDiagonalLine1]} />
          <View style={[analysisStyles.headerDiagonalLine, analysisStyles.headerDiagonalLine2]} />
        </View>
        <View style={analysisStyles.topBar}>
          <View style={analysisStyles.profileBtn}>
            <ProfileIcon size={8} color="#A7F3D0" />
          </View>
          <View style={analysisStyles.logoContainer}>
            <Image source={require('../assets/images/propify-logo-original.png')} style={analysisStyles.logoImg} resizeMode="contain" />
            <Text style={analysisStyles.logoTxt}>Propify</Text>
          </View>
          <View style={analysisStyles.utilityIcons}>
            <View style={analysisStyles.utilBtn}>
              <ChatIcon size={7} color="#A7F3D0" />
            </View>
            <View style={analysisStyles.utilBtn}>
              <HelpIcon size={7} color="#A7F3D0" />
            </View>
          </View>
        </View>
        
        {/* Divider */}
        <View style={analysisStyles.divider} />
        
        {/* Sport Selector */}
        <View style={analysisStyles.sportSelector}>
          <View style={analysisStyles.sportItemActive}>
            <Image source={{ uri: 'https://pgtgwynrdccxmfxurcnz.supabase.co/storage/v1/object/public/leagues/7.png' }} style={analysisStyles.sportLogoImg} />
            <Text style={analysisStyles.sportTextActive}>NFL</Text>
          </View>
          <View style={analysisStyles.sportItem}>
            <Image source={{ uri: 'https://pgtgwynrdccxmfxurcnz.supabase.co/storage/v1/object/public/leagues/4.png' }} style={analysisStyles.sportLogoImg} />
            <Text style={analysisStyles.sportText}>NBA</Text>
          </View>
          <View style={analysisStyles.sportItem}>
            <FootballIcon size={7} color="#A7F3D0" />
            <Text style={analysisStyles.sportText}>CFB</Text>
          </View>
          <View style={analysisStyles.sportItem}>
            <Text style={analysisStyles.sportText}>NHL</Text>
          </View>
          <View style={analysisStyles.sportItem}>
            <BaseballIcon size={7} color="#A7F3D0" />
            <Text style={analysisStyles.sportText}>MLB</Text>
          </View>
        </View>
      </Animated.View>

      {/* Quick Chat Section - Animated */}
      <Animated.View style={[
        analysisStyles.quickChatSection,
        { opacity: quickChatFade, transform: [{ translateY: quickChatSlide }] }
      ]}>
        <View style={analysisStyles.quickChatCard}>
          <View style={analysisStyles.quickChatDecorLines}>
            <View style={[analysisStyles.quickChatDiagLine, analysisStyles.quickChatDiagLine1]} />
            <View style={[analysisStyles.quickChatDiagLine, analysisStyles.quickChatDiagLine2]} />
          </View>
          <View style={analysisStyles.quickChatHeader}>
            <View style={analysisStyles.quickChatIcon}>
              <Image source={require('../assets/images/propify-logo-original.png')} style={{ width: 10, height: 10 }} resizeMode="contain" />
            </View>
            <Text style={analysisStyles.quickChatTitle}>Quick Chat</Text>
          </View>
          <View style={analysisStyles.quickChatInputRow}>
            <Text style={analysisStyles.quickChatPlaceholder}>Ask about tonight's games...</Text>
            <View style={analysisStyles.quickChatSendBtn}>
              <SendIcon size={8} color="rgba(167, 243, 208, 0.5)" />
            </View>
          </View>
        </View>
      </Animated.View>

      {/* Featured Props Section - Animated */}
      <Animated.View style={[
        analysisStyles.section,
        { opacity: section1Fade, transform: [{ translateY: section1Slide }] }
      ]}>
        <View style={analysisStyles.sectionHeader}>
          <View style={analysisStyles.sectionTitleRow}>
            <Image source={require('../assets/images/propify-logo-original.png')} style={{ width: 8, height: 8 }} resizeMode="contain" />
            <Text style={analysisStyles.sectionTitle}>Featured Props of the Day</Text>
          </View>
          <View style={analysisStyles.seeAllBtn}>
            <Text style={analysisStyles.seeAllText}>See All</Text>
            <ChevronRightIcon size={6} color="#4ADE80" />
          </View>
        </View>
        <Text style={analysisStyles.sectionSubtitle}>Hot props from the Heat Map</Text>
        
        {/* Prop Cards */}
        <View style={analysisStyles.cardsRow}>
          {sampleProps.map((prop, idx) => (
            <Animated.View 
              key={idx} 
              style={[
                analysisStyles.propCard,
                { 
                  opacity: section1CardFades[idx], 
                  transform: [{ translateX: section1CardSlides[idx] }] 
                }
              ]}
            >
              {/* Card Decorative Lines */}
              <View style={analysisStyles.cardDecorLines}>
                <View style={[analysisStyles.cardDiagLine, analysisStyles.cardDiagLine1]} />
                <View style={[analysisStyles.cardDiagLine, analysisStyles.cardDiagLine2]} />
              </View>
              
              {/* Player Image Area */}
              <View style={analysisStyles.playerImgArea}>
                {prop.headshot ? (
                  <Image 
                    source={{ uri: prop.headshot }} 
                    style={analysisStyles.playerHeadshot} 
                    resizeMode="cover"
                  />
                ) : (
                  <View style={analysisStyles.playerPlaceholder}>
                    <Text style={analysisStyles.playerInitials}>{prop.name.split(' ').map(n => n[0]).join('')}</Text>
                  </View>
                )}
                <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)']} style={analysisStyles.imgGradient} />
                
                {/* Team Badge */}
                <View style={analysisStyles.teamBadge}>
                  <Text style={analysisStyles.teamBadgeText}>{prop.team} | {prop.opp}</Text>
                </View>
                
                {/* Signal Badge */}
                <View style={[analysisStyles.signalBadge, prop.signal === 'OVER' ? analysisStyles.signalOver : analysisStyles.signalUnder]}>
                  <Text style={analysisStyles.signalText}>{prop.signal}</Text>
                </View>
              </View>
              
              {/* Card Content */}
              <View style={analysisStyles.cardContent}>
                <Text style={analysisStyles.playerName}>{prop.name}</Text>
                <View style={analysisStyles.propTypeBadge}>
                  <Text style={analysisStyles.propTypeText}>{prop.prop}</Text>
                </View>
                <Text style={analysisStyles.lineValue}>{prop.line}</Text>
                
                {/* Progress Bars */}
                <View style={analysisStyles.progressBars}>
                  {[...Array(prop.total)].map((_, i) => (
                    <View key={i} style={[analysisStyles.progressBar, i < prop.hitRate ? analysisStyles.progressFilled : analysisStyles.progressEmpty]} />
                  ))}
                </View>
                <Text style={analysisStyles.hitRateText}>
                  <Text style={analysisStyles.hitRateLabel}>Base: </Text>
                  <Text style={analysisStyles.hitRateValue}>Hit in {prop.hitRate} of {prop.total}</Text>
                </Text>
              </View>
            </Animated.View>
          ))}
        </View>
      </Animated.View>

      {/* Defensive Mismatches Section - Animated */}
      <Animated.View style={[
        analysisStyles.section,
        { opacity: section2Fade, transform: [{ translateY: section2Slide }] }
      ]}>
        <View style={analysisStyles.sectionHeader}>
          <View style={analysisStyles.sectionTitleRow}>
            <Image source={require('../assets/images/propify-logo-original.png')} style={{ width: 8, height: 8 }} resizeMode="contain" />
            <Text style={analysisStyles.sectionTitle}>Defensive Mismatches</Text>
          </View>
          <View style={analysisStyles.seeAllBtn}>
            <Text style={analysisStyles.seeAllText}>See All</Text>
            <ChevronRightIcon size={6} color="#4ADE80" />
          </View>
        </View>
        <Text style={analysisStyles.sectionSubtitle}>Players facing weak defenses</Text>
        
        {/* Mismatch Cards */}
        <View style={analysisStyles.cardsRow}>
          {sampleMismatches.map((match, idx) => (
            <Animated.View 
              key={idx} 
              style={[
                analysisStyles.propCard,
                { 
                  opacity: section2CardFades[idx], 
                  transform: [{ translateX: section2CardSlides[idx] }] 
                }
              ]}
            >
              {/* Card Decorative Lines */}
              <View style={analysisStyles.cardDecorLines}>
                <View style={[analysisStyles.cardDiagLine, analysisStyles.cardDiagLine1]} />
                <View style={[analysisStyles.cardDiagLine, analysisStyles.cardDiagLine2]} />
              </View>
              
              {/* Player Image Area */}
              <View style={analysisStyles.playerImgArea}>
                {match.headshot ? (
                  <Image 
                    source={{ uri: match.headshot }} 
                    style={analysisStyles.playerHeadshot} 
                    resizeMode="cover"
                  />
                ) : (
                  <View style={analysisStyles.playerPlaceholder}>
                    <Text style={analysisStyles.playerInitials}>{match.name.split(' ').map(n => n[0]).join('')}</Text>
                  </View>
                )}
                <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)']} style={analysisStyles.imgGradient} />
                
                {/* Team Badge */}
                <View style={analysisStyles.teamBadge}>
                  <Text style={analysisStyles.teamBadgeText}>{match.team} | {match.opp}</Text>
                </View>
                
                {/* Defense Rank Badge */}
                <View style={analysisStyles.defRankBadge}>
                  <Text style={analysisStyles.defRankText}>{match.defRank}</Text>
                </View>
                
                {/* Signal Badge */}
                <View style={[analysisStyles.signalBadge, match.signal === 'OVER' ? analysisStyles.signalOver : analysisStyles.signalUnder]}>
                  <Text style={analysisStyles.signalText}>{match.signal}</Text>
                </View>
              </View>
              
              {/* Card Content */}
              <View style={analysisStyles.cardContent}>
                <Text style={analysisStyles.playerName}>{match.name}</Text>
                <View style={analysisStyles.propTypeBadge}>
                  <Text style={analysisStyles.propTypeText}>{match.prop}</Text>
                </View>
                <Text style={analysisStyles.lineValue}>{match.line}</Text>
              </View>
            </Animated.View>
          ))}
        </View>
      </Animated.View>

      {/* Injury Opportunities Section - Animated */}
      <Animated.View style={[
        analysisStyles.section,
        { opacity: section3Fade, transform: [{ translateY: section3Slide }] }
      ]}>
        <View style={analysisStyles.sectionHeader}>
          <View style={analysisStyles.sectionTitleRow}>
            <Image source={require('../assets/images/propify-logo-original.png')} style={{ width: 8, height: 8 }} resizeMode="contain" />
            <Text style={analysisStyles.sectionTitle}>Injury Opportunities</Text>
          </View>
          <View style={analysisStyles.seeAllBtn}>
            <Text style={analysisStyles.seeAllText}>See All</Text>
            <ChevronRightIcon size={6} color="#4ADE80" />
          </View>
        </View>
        <Text style={analysisStyles.sectionSubtitle}>Boosted props from teammate injuries</Text>
        
        {/* Injury Cards */}
        <View style={analysisStyles.cardsRow}>
          {sampleInjuries.map((inj, idx) => (
            <Animated.View 
              key={idx} 
              style={[
                analysisStyles.propCard,
                { 
                  opacity: section3CardFades[idx], 
                  transform: [{ translateX: section3CardSlides[idx] }] 
                }
              ]}
            >
              {/* Card Decorative Lines */}
              <View style={analysisStyles.cardDecorLines}>
                <View style={[analysisStyles.cardDiagLine, analysisStyles.cardDiagLine1]} />
                <View style={[analysisStyles.cardDiagLine, analysisStyles.cardDiagLine2]} />
              </View>
              
              {/* Player Image Area */}
              <View style={analysisStyles.playerImgArea}>
                {inj.headshot ? (
                  <Image 
                    source={{ uri: inj.headshot }} 
                    style={analysisStyles.playerHeadshot} 
                    resizeMode="cover"
                  />
                ) : (
                  <View style={analysisStyles.playerPlaceholder}>
                    <Text style={analysisStyles.playerInitials}>{inj.name.split(' ').map(n => n[0]).join('')}</Text>
                  </View>
                )}
                <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)']} style={analysisStyles.imgGradient} />
                
                {/* Team Badge */}
                <View style={analysisStyles.teamBadge}>
                  <Text style={analysisStyles.teamBadgeText}>{inj.team}</Text>
                </View>
                
                {/* Boost Badge */}
                <View style={analysisStyles.boostBadge}>
                  <Text style={analysisStyles.boostText}>{inj.boost}</Text>
                </View>
                
                {/* Signal Badge */}
                <View style={[analysisStyles.signalBadge, analysisStyles.signalOver]}>
                  <Text style={analysisStyles.signalText}>OVER</Text>
                </View>
              </View>
              
              {/* Card Content */}
              <View style={analysisStyles.cardContent}>
                <Text style={analysisStyles.playerName}>{inj.name}</Text>
                
                {/* Injury Badge */}
                <View style={[analysisStyles.injuryBadge, inj.availability === 'OUT' ? analysisStyles.injuryOut : analysisStyles.injuryGtd]}>
                  <Text style={analysisStyles.injuryBadgeText}>{inj.availability}</Text>
                </View>
                <Text style={analysisStyles.injuredPlayerText}>{inj.injuredPlayer}</Text>
              </View>
            </Animated.View>
          ))}
        </View>
      </Animated.View>
    </View>
  );
};

// Small chevron icon for "See All" buttons
const ChevronRightIcon = ({ size = 12, color = '#4ADE80' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M9 18l6-6-6-6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const analysisStyles = StyleSheet.create({
  container: { 
    flex: 1, 
    width: '100%',
    backgroundColor: '#000',
    overflow: 'hidden',
  },
  // Header
  header: {
    paddingTop: 2,
    paddingBottom: 2,
    position: 'relative',
    overflow: 'hidden',
    width: '100%',
  },
  headerDecorativeLines: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
    overflow: 'hidden',
  },
  headerDiagonalLine: {
    position: 'absolute',
    width: 100,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#4ADE80',
  },
  headerDiagonalLine1: {
    top: -1,
    right: 0,
    transform: [{ rotate: '25deg' }],
    opacity: 0.25,
  },
  headerDiagonalLine2: {
    top: 4,
    right: 0,
    transform: [{ rotate: '25deg' }],
    opacity: 0.15,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  profileBtn: {
    width: 16,
    height: 16,
    borderRadius: 4,
    backgroundColor: 'rgba(6, 95, 70, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: 'rgba(74, 222, 128, 0.3)',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoImg: {
    width: 12,
    height: 12,
    marginRight: 3,
  },
  logoTxt: {
    fontSize: 10,
    fontWeight: '900',
    color: '#FFFFFF',
    fontStyle: 'italic',
  },
  utilityIcons: {
    flexDirection: 'row',
    gap: 2,
  },
  utilBtn: {
    width: 14,
    height: 14,
    borderRadius: 3,
    backgroundColor: 'rgba(6, 95, 70, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: 'rgba(74, 222, 128, 0.3)',
  },
  divider: {
    height: 0.5,
    backgroundColor: 'rgba(75, 85, 99, 0.4)',
    marginHorizontal: 6,
    marginTop: 2,
    marginBottom: 1,
  },
  sportSelector: {
    flexDirection: 'row',
    paddingHorizontal: 6,
    gap: 2,
    paddingTop: 1,
  },
  sportItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 3,
    paddingHorizontal: 2,
    borderRadius: 4,
    backgroundColor: 'rgba(6, 95, 70, 0.3)',
    borderWidth: 0.5,
    borderColor: 'rgba(74, 222, 128, 0.3)',
    gap: 2,
  },
  sportItemActive: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 3,
    paddingHorizontal: 2,
    borderRadius: 4,
    backgroundColor: '#4ADE80',
    borderWidth: 0.5,
    borderColor: '#4ADE80',
    gap: 2,
  },
  sportLogoImg: {
    width: 10,
    height: 10,
  },
  sportText: {
    fontSize: 6,
    fontWeight: '700',
    color: '#A7F3D0',
  },
  sportTextActive: {
    fontSize: 6,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  // Quick Chat Section
  quickChatSection: {
    paddingHorizontal: 6,
    marginTop: 4,
    marginBottom: 2,
  },
  quickChatCard: {
    backgroundColor: 'rgba(4, 60, 45, 0.25)',
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderWidth: 1,
    borderColor: '#4ADE80',
    position: 'relative',
    overflow: 'hidden',
  },
  quickChatDecorLines: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 30,
    zIndex: 0,
    overflow: 'hidden',
  },
  quickChatDiagLine: {
    position: 'absolute',
    width: 150,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#4ADE80',
  },
  quickChatDiagLine1: {
    top: 2,
    right: -50,
    transform: [{ rotate: '25deg' }],
    opacity: 0.35,
  },
  quickChatDiagLine2: {
    top: 8,
    right: -50,
    transform: [{ rotate: '25deg' }],
    opacity: 0.2,
  },
  quickChatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
    zIndex: 1,
  },
  quickChatIcon: {
    width: 14,
    height: 14,
    borderRadius: 4,
    backgroundColor: 'rgba(74, 222, 128, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
    borderWidth: 0.5,
    borderColor: 'rgba(74, 222, 128, 0.3)',
  },
  quickChatTitle: {
    fontSize: 7,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  quickChatInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(4, 60, 45, 0.25)',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#4ADE80',
    paddingHorizontal: 6,
    paddingVertical: 4,
    zIndex: 1,
  },
  quickChatPlaceholder: {
    flex: 1,
    fontSize: 6,
    color: 'rgba(167, 243, 208, 0.5)',
  },
  quickChatSendBtn: {
    width: 14,
    height: 14,
    borderRadius: 4,
    backgroundColor: 'rgba(74, 222, 128, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Sections
  section: {
    paddingHorizontal: 6,
    marginTop: 4,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 1,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  sectionTitle: {
    fontSize: 7,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  sectionSubtitle: {
    fontSize: 5,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 3,
  },
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 1,
  },
  seeAllText: {
    fontSize: 5,
    fontWeight: '600',
    color: '#4ADE80',
  },
  // Cards
  cardsRow: {
    flexDirection: 'row',
    gap: 3,
    paddingHorizontal: 4,
  },
  propCard: {
    flex: 1,
    minWidth: 48,
    backgroundColor: '#0a1a14',
    borderRadius: 6,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: 'rgba(74, 222, 128, 0.3)',
  },
  cardDecorLines: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 20,
    zIndex: 15,
    overflow: 'hidden',
    pointerEvents: 'none',
  },
  cardDiagLine: {
    position: 'absolute',
    width: 80,
    height: 2,
    borderRadius: 1,
    backgroundColor: '#4ADE80',
  },
  cardDiagLine1: {
    top: 0,
    right: -30,
    transform: [{ rotate: '25deg' }],
    opacity: 0.35,
  },
  cardDiagLine2: {
    top: 4,
    right: -30,
    transform: [{ rotate: '25deg' }],
    opacity: 0.2,
  },
  playerImgArea: {
    width: '100%',
    height: 30,
    position: 'relative',
    backgroundColor: '#0d2018',
    overflow: 'hidden',
  },
  playerHeadshot: {
    width: '100%',
    height: '100%',
    backgroundColor: '#0d2018',
  },
  playerPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(74, 222, 128, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playerInitials: {
    fontSize: 10,
    fontWeight: '800',
    color: 'rgba(74, 222, 128, 0.5)',
  },
  imgGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 12,
  },
  teamBadge: {
    position: 'absolute',
    top: 2,
    left: 2,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 3,
    paddingVertical: 1,
    borderRadius: 2,
  },
  teamBadgeText: {
    fontSize: 5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  boostBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: '#10B981',
    paddingHorizontal: 3,
    paddingVertical: 1,
    borderRadius: 2,
  },
  boostText: {
    fontSize: 5,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  defRankBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: '#4ADE80',
    paddingHorizontal: 3,
    paddingVertical: 1,
    borderRadius: 2,
  },
  defRankText: {
    fontSize: 5,
    fontWeight: '900',
    color: '#000000',
  },
  signalBadge: {
    position: 'absolute',
    bottom: 2,
    left: 2,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 2,
  },
  signalOver: {
    backgroundColor: 'rgba(74, 222, 128, 0.9)',
  },
  signalUnder: {
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
  },
  signalText: {
    fontSize: 5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  cardContent: {
    padding: 4,
    alignItems: 'center',
  },
  playerName: {
    fontSize: 6,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 1,
    textAlign: 'center',
  },
  propTypeBadge: {
    backgroundColor: 'rgba(74, 222, 128, 0.15)',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
    marginBottom: 1,
    borderWidth: 0.5,
    borderColor: 'rgba(74, 222, 128, 0.3)',
  },
  propTypeText: {
    fontSize: 5,
    fontWeight: '700',
    color: '#A7F3D0',
  },
  lineValue: {
    fontSize: 10,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  progressBars: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 1.5,
    marginBottom: 2,
    width: '100%',
  },
  progressBar: {
    flex: 1,
    height: 2,
    borderRadius: 1,
    maxWidth: 10,
  },
  progressFilled: {
    backgroundColor: '#4ADE80',
  },
  progressEmpty: {
    backgroundColor: 'rgba(74, 222, 128, 0.2)',
  },
  hitRateText: {
    fontSize: 5,
    textAlign: 'center',
  },
  hitRateLabel: {
    fontWeight: '700',
    color: '#4ADE80',
  },
  hitRateValue: {
    fontWeight: '500',
    color: '#A7F3D0',
  },
  // Injury Badge Styles
  injuryBadge: {
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
    marginBottom: 1,
    borderWidth: 0.5,
  },
  injuryOut: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderColor: '#EF4444',
  },
  injuryGtd: {
    backgroundColor: 'rgba(251, 146, 60, 0.2)',
    borderColor: '#FB923C',
  },
  injuryBadgeText: {
    fontSize: 5,
    fontWeight: '800',
    color: '#EF4444',
  },
  injuredPlayerText: {
    fontSize: 4,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
  },
});

// ============ INSIGHTS SCREEN MOCKUP - EXACT REPLICA OF NBA INSIGHTS ============
const InsightsScreenMockup = ({ isVisible = false }) => {
  // Cascade animation refs
  const heroFade = useRef(new Animated.Value(0)).current;
  const heroSlide = useRef(new Animated.Value(-20)).current;
  const chartFade = useRef(new Animated.Value(0)).current;
  const chartScale = useRef(new Animated.Value(0.95)).current;
  const card1Fade = useRef(new Animated.Value(0)).current;
  const card1Slide = useRef(new Animated.Value(15)).current;
  const card2Fade = useRef(new Animated.Value(0)).current;
  const card2Slide = useRef(new Animated.Value(15)).current;
  const card3Fade = useRef(new Animated.Value(0)).current;
  const card3Slide = useRef(new Animated.Value(15)).current;
  
  // Bar animations for chart
  const barScales = useRef([...Array(10)].map(() => new Animated.Value(0))).current;
  
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (isVisible && !hasAnimated.current) {
      hasAnimated.current = true;
      
      // Step 1: Hero header (0ms)
      Animated.parallel([
        Animated.timing(heroFade, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.spring(heroSlide, { toValue: 0, tension: 80, friction: 10, useNativeDriver: true }),
      ]).start();
      
      // Step 2: Chart section (250ms)
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(chartFade, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.spring(chartScale, { toValue: 1, tension: 60, friction: 8, useNativeDriver: true }),
        ]).start();
        
        // Animate bars one by one with staggered delay
        barScales.forEach((scale, index) => {
          setTimeout(() => {
            Animated.spring(scale, {
              toValue: 1,
              tension: 100,
              friction: 10,
              useNativeDriver: true,
            }).start();
          }, index * 50);
        });
      }, 250);
      
      // Step 3: Card 1 - Season vs Recent (500ms)
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(card1Fade, { toValue: 1, duration: 350, useNativeDriver: true }),
          Animated.spring(card1Slide, { toValue: 0, tension: 70, friction: 9, useNativeDriver: true }),
        ]).start();
      }, 500);
      
      // Step 4: Card 2 - Defense Rankings (650ms)
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(card2Fade, { toValue: 1, duration: 350, useNativeDriver: true }),
          Animated.spring(card2Slide, { toValue: 0, tension: 70, friction: 9, useNativeDriver: true }),
        ]).start();
      }, 650);
      
      // Step 5: Card 3 - Usage Trend (800ms)
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(card3Fade, { toValue: 1, duration: 350, useNativeDriver: true }),
          Animated.spring(card3Slide, { toValue: 0, tension: 70, friction: 9, useNativeDriver: true }),
        ]).start();
      }, 800);
    }
  }, [isVisible]);

  // Sample data matching real NBA insights screen
  const playerName = 'LeBron James';
  const opponent = 'GSW';
  const propLine = '25.5';
  const propType = 'POINTS';
  const betType = 'OVER';
  
  // Sample chart data - last 10 games
  const last10Games = [32, 28, 22, 31, 27, 24, 29, 26, 33, 30];
  const line = 25.5;
  
  return (
    <View style={insightsStyles.container}>
      {/* Hero Header - Animated */}
      <Animated.View style={[
        insightsStyles.heroHeader,
        { opacity: heroFade, transform: [{ translateY: heroSlide }] }
      ]}>
        {/* Background gradient layer */}
        <LinearGradient
          colors={['rgba(0,0,0,0)', 'rgba(85, 37, 130, 0.1)', 'rgba(0,0,0,0)']}
          style={insightsStyles.heroGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        
        {/* Decorative diagonal lines */}
        <View style={insightsStyles.heroDecorativeLines}>
          <View style={[insightsStyles.heroDiagonalLine, insightsStyles.heroDiagonalLine1]} />
          <View style={[insightsStyles.heroDiagonalLine, insightsStyles.heroDiagonalLine2]} />
        </View>
        
        {/* Three column layout */}
        <View style={insightsStyles.heroThreeColumnContainer}>
          {/* Left - Player with logo behind */}
          <View style={insightsStyles.heroPlayerWithLogo}>
            {/* Team Logo Behind */}
            <View style={insightsStyles.heroLogoBehind}>
              <Image 
                source={{ uri: 'https://pgtgwynrdccxmfxurcnz.supabase.co/storage/v1/object/public/nba-team-logos/lakers.png' }}
                style={insightsStyles.heroLogoBehindImage}
                resizeMode="contain"
              />
            </View>
            
            {/* Player Headshot */}
            <View style={insightsStyles.heroPlayerOnTop}>
              <Image 
                source={{ uri: 'https://cdn.nba.com/headshots/nba/latest/1040x760/2544.png' }}
                style={insightsStyles.heroPlayerImage}
                resizeMode="cover"
              />
            </View>
          </View>
          
          {/* Center - Name and matchup */}
          <View style={insightsStyles.heroCenterSection}>
            <Text style={insightsStyles.heroPlayerNameCentered}>{playerName}</Text>
            <Text style={insightsStyles.heroMatchupCentered}>vs {opponent}</Text>
          </View>
          
          {/* Right - Line, prop, type */}
          <View style={insightsStyles.heroRightStats}>
            <Text style={insightsStyles.heroLineRight}>{propLine}</Text>
            <Text style={insightsStyles.heroPropRight}>{propType}</Text>
            <View style={[insightsStyles.heroTypePill, { backgroundColor: betType === 'OVER' ? '#10B981' : '#EF4444' }]}>
              <Text style={insightsStyles.heroTypePillText}>{betType}</Text>
            </View>
          </View>
        </View>
      </Animated.View>
      
      {/* Last 20 Games Chart - Animated */}
      <Animated.View style={[
        insightsStyles.chartSection,
        { opacity: chartFade, transform: [{ scale: chartScale }] }
      ]}>
        {/* Chart Header with Toggle */}
        <View style={insightsStyles.chartHeader}>
          <View style={insightsStyles.chartTitleContainer}>
            <View style={insightsStyles.chartIconContainer}>
              <Text style={insightsStyles.chartPercentIcon}>%</Text>
            </View>
            <Text style={insightsStyles.chartTitle}>Statistics</Text>
          </View>
          
          {/* Toggle Buttons */}
          <View style={insightsStyles.chartToggleContainer}>
            <View style={insightsStyles.chartToggleButton}>
              <Text style={insightsStyles.chartToggleTextInactive}>L5</Text>
            </View>
            <View style={[insightsStyles.chartToggleButton, insightsStyles.chartToggleButtonActive]}>
              <Text style={insightsStyles.chartToggleTextActive}>L10</Text>
            </View>
          </View>
        </View>
        
        {/* Stats Row */}
        <View style={insightsStyles.statsRow}>
          <View style={insightsStyles.statItem}>
            <Text style={insightsStyles.statLabel}>L5</Text>
            <Text style={[insightsStyles.statValue, { color: '#4ADE80' }]}>80%</Text>
          </View>
          <View style={insightsStyles.statSeparator} />
          <View style={insightsStyles.statItem}>
            <Text style={insightsStyles.statLabel}>L10</Text>
            <Text style={[insightsStyles.statValue, { color: '#4ADE80' }]}>80%</Text>
          </View>
          <View style={insightsStyles.statSeparator} />
          <View style={insightsStyles.statItem}>
            <Text style={insightsStyles.statLabel}>Line</Text>
            <Text style={[insightsStyles.statValue, { color: '#FFFFFF' }]}>{propLine}</Text>
          </View>
        </View>
        
        {/* Divider */}
        <View style={insightsStyles.chartDivider} />
        
        {/* Bar Chart - With Staggered Bar Animations */}
        <View style={insightsStyles.barsContainer}>
          {last10Games.map((pts, idx) => {
            const isOver = pts > line;
            const barHeight = Math.max((pts / 40) * 32, 8);
            return (
              <Animated.View key={idx} style={[
                insightsStyles.barColumn,
                { transform: [{ scaleY: barScales[idx] }] }
              ]}>
                <Text style={[insightsStyles.barValue, { color: isOver ? '#4ADE80' : '#EF4444' }]}>
                  {pts}
                </Text>
                <LinearGradient
                  colors={isOver 
                    ? ['rgba(74, 222, 128, 0.2)', 'rgba(74, 222, 128, 0.5)', '#4ADE80']
                    : ['rgba(239, 68, 68, 0.2)', 'rgba(239, 68, 68, 0.5)', '#EF4444']
                  }
                  start={{ x: 0.5, y: 1 }}
                  end={{ x: 0.5, y: 0 }}
                  style={[insightsStyles.gradientBar, { height: barHeight }]}
                />
              </Animated.View>
            );
          })}
          
          {/* Horizontal Line Indicator */}
          <View style={insightsStyles.horizontalLine}>
            <View style={insightsStyles.lineLabel}>
              <Text style={insightsStyles.lineLabelText}>{propLine}</Text>
            </View>
          </View>
        </View>
      </Animated.View>
      
      {/* Insight Cards Scroll */}
      <View style={insightsStyles.insightsScroll}>
        {/* Pace Card - Animated */}
        <Animated.View style={[
          insightsStyles.insightCard,
          { opacity: card1Fade, transform: [{ translateY: card1Slide }] }
        ]}>
          <View style={insightsStyles.insightHeader}>
            <View style={insightsStyles.insightIconContainer}>
              <TrendingUpIcon size={10} color="#4ADE80" />
            </View>
            <Text style={insightsStyles.insightTitle}>Pace Factor</Text>
          </View>
          <View style={insightsStyles.seasonVsRecentContent}>
            <View style={insightsStyles.seasonColumn}>
              <Text style={insightsStyles.columnLabel}>TEAM</Text>
              <Text style={insightsStyles.columnValue}>104.2</Text>
            </View>
            <View style={insightsStyles.trendArrowContainer}>
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                <Path d="M7 14L12 9L17 14" stroke="#4ADE80" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
              <Text style={insightsStyles.trendLabel}>FAST</Text>
            </View>
            <View style={insightsStyles.recentColumn}>
              <Text style={insightsStyles.columnLabel}>OPP</Text>
              <Text style={insightsStyles.columnValue}>102.8</Text>
            </View>
          </View>
        </Animated.View>
        
        {/* Defense Rankings Card - Animated */}
        <Animated.View style={[
          insightsStyles.insightCard,
          { opacity: card2Fade, transform: [{ translateY: card2Slide }] }
        ]}>
          <View style={insightsStyles.insightHeader}>
            <View style={insightsStyles.insightIconContainer}>
              <ShieldIcon size={10} color="#4ADE80" />
            </View>
            <Text style={insightsStyles.insightTitle}>Defense Rankings</Text>
          </View>
          <View style={insightsStyles.defenseContent}>
            {/* Hero Grade */}
            <View style={insightsStyles.gradeContainer}>
              <Text style={insightsStyles.gradeText}>B+</Text>
            </View>
            <View style={insightsStyles.defenseSubtitle}>
              <Text style={insightsStyles.defenseSubtitleText}>vs POINTS • </Text>
              <View style={insightsStyles.rankBadge}>
                <Text style={insightsStyles.rankText}>#17</Text>
              </View>
              <Text style={insightsStyles.defenseSubtitleText}> in NBA</Text>
            </View>
            <Text style={insightsStyles.defenseContext}>GSW allows 114.2 PPG to guards</Text>
          </View>
        </Animated.View>
        
        {/* Usage Trend Card - Animated */}
        <Animated.View style={[
          insightsStyles.insightCard,
          { opacity: card3Fade, transform: [{ translateY: card3Slide }] }
        ]}>
          <View style={insightsStyles.insightHeader}>
            <View style={insightsStyles.insightIconContainer}>
              <LightningIcon size={10} color="#4ADE80" />
            </View>
            <Text style={insightsStyles.insightTitle}>Usage Trend</Text>
          </View>
          <View style={insightsStyles.usageContent}>
            <View style={insightsStyles.usageColumn}>
              <Text style={insightsStyles.columnLabel}>SEASON</Text>
              <Text style={insightsStyles.usageValue}>29.1%</Text>
            </View>
            <View style={insightsStyles.usageArrowContainer}>
              <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                <Path d="M12 19V5M5 12l7-7 7 7" stroke="#4ADE80" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </View>
            <View style={insightsStyles.usageColumn}>
              <Text style={insightsStyles.columnLabel}>LAST 3</Text>
              <Text style={insightsStyles.usageValue}>31.2%</Text>
            </View>
          </View>
          <Text style={insightsStyles.usageExplanation}>Usage ↑ - More touches and opportunities</Text>
        </Animated.View>
      </View>
    </View>
  );
};

// Shield Icon for Insights
const ShieldIcon = ({ size = 18, color = '#4ADE80' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const insightsStyles = StyleSheet.create({
  container: { 
    flex: 1, 
    width: '100%',
    backgroundColor: '#000', 
    overflow: 'hidden',
  },
  // Hero Header - Matching nbainsightsscreen.js exactly
  heroHeader: {
    paddingTop: 4,
    paddingBottom: 6,
    paddingHorizontal: 6,
    position: 'relative',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(74, 222, 128, 0.2)',
  },
  heroGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  heroDecorativeLines: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
    overflow: 'hidden',
  },
  heroDiagonalLine: {
    position: 'absolute',
    width: 150,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#4ADE80',
  },
  heroDiagonalLine1: {
    top: -1,
    right: -40,
    transform: [{ rotate: '25deg' }],
    opacity: 0.25,
  },
  heroDiagonalLine2: {
    top: 5,
    right: -40,
    transform: [{ rotate: '25deg' }],
    opacity: 0.15,
  },
  heroThreeColumnContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 1,
  },
  // Left - Player with logo
  heroPlayerWithLogo: {
    position: 'relative',
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroLogoBehind: {
    position: 'absolute',
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.35,
    zIndex: 1,
    right: -4,
    bottom: 0,
  },
  heroLogoBehindImage: {
    width: 30,
    height: 30,
  },
  heroPlayerOnTop: {
    width: 38,
    height: 38,
    borderRadius: 8,
    overflow: 'hidden',
    zIndex: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
  },
  heroPlayerImage: {
    width: '100%',
    height: '100%',
  },
  // Center - Name and matchup
  heroCenterSection: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  heroPlayerNameCentered: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.2,
    textAlign: 'center',
  },
  heroMatchupCentered: {
    fontSize: 6,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
    letterSpacing: 0.2,
    textAlign: 'center',
    marginTop: 1,
  },
  // Right - Line and type
  heroRightStats: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingRight: 2,
  },
  heroLineRight: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -1,
    lineHeight: 20,
    textAlign: 'right',
  },
  heroPropRight: {
    fontSize: 5,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.6)',
    letterSpacing: 0.8,
    textAlign: 'right',
    marginTop: -1,
    marginBottom: 2,
  },
  heroTypePill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
  },
  heroTypePillText: {
    fontSize: 6,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  // Chart Section
  chartSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginHorizontal: 6,
    marginTop: 4,
    borderRadius: 8,
    padding: 6,
    borderWidth: 1.5,
    borderColor: '#4ADE80',
    overflow: 'hidden',
    position: 'relative',
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  chartTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chartIconContainer: {
    marginRight: 3,
  },
  chartPercentIcon: {
    fontSize: 10,
    fontWeight: '800',
    color: '#4ADE80',
    textShadowColor: 'rgba(74, 222, 128, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },
  chartTitle: {
    fontSize: 8,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  chartToggleContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    padding: 1,
  },
  chartToggleButton: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
    minWidth: 22,
    alignItems: 'center',
  },
  chartToggleButtonActive: {
    backgroundColor: '#4ADE80',
  },
  chartToggleTextInactive: {
    fontSize: 6,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  chartToggleTextActive: {
    fontSize: 6,
    fontWeight: '700',
    color: '#000000',
  },
  // Stats Row
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 3,
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  statSeparator: {
    width: 1,
    height: 14,
    backgroundColor: 'rgba(74, 222, 128, 0.4)',
    borderRadius: 0.5,
  },
  statLabel: {
    fontSize: 5,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  statValue: {
    fontSize: 8,
    fontWeight: '800',
  },
  chartDivider: {
    height: 1,
    backgroundColor: 'rgba(74, 222, 128, 0.3)',
    marginVertical: 3,
  },
  // Bar Chart
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    height: 45,
    position: 'relative',
    paddingTop: 10,
  },
  barColumn: {
    alignItems: 'center',
    marginHorizontal: 1,
    width: 14,
  },
  barValue: {
    fontSize: 5,
    fontWeight: '700',
    marginBottom: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  gradientBar: {
    width: 10,
    borderRadius: 2,
    shadowColor: '#4ADE80',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
  },
  // Line Indicator
  horizontalLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 22,
    height: 1.5,
    backgroundColor: '#4ADE80',
    zIndex: 10,
    shadowColor: '#4ADE80',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  lineLabel: {
    position: 'absolute',
    right: -2,
    top: -5,
    backgroundColor: '#4ADE80',
    paddingHorizontal: 3,
    paddingVertical: 1,
    borderRadius: 2,
    shadowColor: '#4ADE80',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
  },
  lineLabelText: {
    fontSize: 5,
    fontWeight: '800',
    color: '#000000',
  },
  // Insights Scroll Section
  insightsScroll: {
    paddingHorizontal: 6,
    paddingTop: 4,
    flex: 1,
  },
  // Insight Cards - Matching nbainsightsscreen.js exactly
  insightCard: {
    padding: 6,
    marginBottom: 4,
    borderRadius: 8,
    borderWidth: 1.5,
    backgroundColor: 'rgba(74, 222, 128, 0.08)',
    borderColor: '#4ADE80',
    shadowColor: 'rgba(74, 222, 128, 0.3)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  insightIconContainer: {
    marginRight: 4,
    padding: 3,
    borderRadius: 4,
    backgroundColor: 'rgba(74, 222, 128, 0.15)',
  },
  insightTitle: {
    fontSize: 7,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
    letterSpacing: -0.1,
  },
  // Season vs Recent Form
  seasonVsRecentContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  seasonColumn: {
    flex: 1,
    alignItems: 'center',
  },
  recentColumn: {
    flex: 1,
    alignItems: 'center',
  },
  columnLabel: {
    fontSize: 5,
    fontWeight: '700',
    color: '#4ADE80',
    letterSpacing: 0.3,
    marginBottom: 2,
  },
  columnValue: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  trendArrowContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  trendLabel: {
    fontSize: 7,
    fontWeight: '900',
    color: '#4ADE80',
    marginTop: 1,
  },
  // Defense Rankings
  defenseContent: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  gradeContainer: {
    backgroundColor: 'rgba(74, 222, 128, 0.2)',
    borderWidth: 2,
    borderColor: '#4ADE80',
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 10,
    marginBottom: 4,
    shadowColor: '#4ADE80',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  gradeText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#4ADE80',
    letterSpacing: 0.5,
  },
  defenseSubtitle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  defenseSubtitleText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 5,
    fontWeight: '600',
  },
  rankBadge: {
    backgroundColor: 'rgba(74, 222, 128, 0.2)',
    borderWidth: 1,
    borderColor: '#4ADE80',
    borderRadius: 3,
    paddingVertical: 1,
    paddingHorizontal: 3,
  },
  rankText: {
    color: '#4ADE80',
    fontSize: 6,
    fontWeight: '900',
  },
  defenseContext: {
    fontSize: 6,
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: '500',
    textAlign: 'center',
  },
  // Usage Trend
  usageContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  usageColumn: {
    flex: 1,
    alignItems: 'center',
  },
  usageValue: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  usageArrowContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  usageExplanation: {
    fontSize: 5,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    fontWeight: '500',
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: 'rgba(74, 222, 128, 0.2)',
  },
});

// ============ MAIN PAYWALL SCREEN ============
const PaywallScreen = () => {
  const insets = useSafeAreaInsets();
  const { startTutorial } = useTutorial();
  const [selectedPlan, setSelectedPlan] = useState('yearly');
  const [isLoading, setIsLoading] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [packages, setPackages] = useState({ monthly: null, annual: null });
  const [visitedSlides, setVisitedSlides] = useState({ 0: false, 1: false, 2: false });
  
  const phoneScrollRef = useRef(null);
  const autoScrollTimer = useRef(null);
  const currentSlideRef = useRef(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const phoneScale = useRef(new Animated.Value(0.9)).current;
  const phoneOpacity = useRef(new Animated.Value(0)).current;
  
  // ============ HEADER CASCADE ANIMATIONS ============
  const logoFade = useRef(new Animated.Value(0)).current;
  const logoSlide = useRef(new Animated.Value(-30)).current;
  const titleFade = useRef(new Animated.Value(0)).current;
  const titleSlide = useRef(new Animated.Value(-25)).current;
  const subtitleFade = useRef(new Animated.Value(0)).current;
  const subtitleSlide = useRef(new Animated.Value(-20)).current;
  
  // ============ BOTTOM SECTION CASCADE ANIMATIONS ============
  const plansFade = useRef(new Animated.Value(0)).current;
  const plansSlideX = useRef(new Animated.Value(-80)).current;  // Slide from left (longer distance)
  const plansSlideY = useRef(new Animated.Value(-15)).current;  // Then down
  const planText1Fade = useRef(new Animated.Value(0)).current;
  const planText1SlideX = useRef(new Animated.Value(-50)).current;
  const planText2Fade = useRef(new Animated.Value(0)).current;
  const planText2SlideX = useRef(new Animated.Value(-50)).current;
  const planText3Fade = useRef(new Animated.Value(0)).current;
  const planText3SlideX = useRef(new Animated.Value(-40)).current;
  const noPaymentFade = useRef(new Animated.Value(0)).current;
  const noPaymentSlideX = useRef(new Animated.Value(-70)).current;
  const noPaymentSlideY = useRef(new Animated.Value(-10)).current;
  const ctaFade = useRef(new Animated.Value(0)).current;
  const ctaSlideX = useRef(new Animated.Value(-90)).current;
  const ctaSlideY = useRef(new Animated.Value(-15)).current;
  const ctaScale = useRef(new Animated.Value(0.92)).current;
  const trialTermsFade = useRef(new Animated.Value(0)).current;
  const trialTermsSlideX = useRef(new Animated.Value(-70)).current;
  const trialTermsSlideY = useRef(new Animated.Value(-10)).current;
  const footerFade = useRef(new Animated.Value(0)).current;
  const footerSlideX = useRef(new Animated.Value(-60)).current;
  const footerSlideY = useRef(new Animated.Value(-10)).current;

  useEffect(() => {
    const trackPaywallView = async () => {
      const source = await AsyncStorage.getItem('paywallSource') || 'unknown';
      mixpanelService.trackPaywallViewed(source);
      mixpanelService.trackScreenView('Paywall');
    };
    trackPaywallView();
    
    // ============ CASCADING HEADER ENTRANCE ============
    // Step 1: Logo entrance (200ms delay)
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(logoFade, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(logoSlide, {
          toValue: 0,
          tension: 80,
          friction: 10,
          useNativeDriver: true,
        }),
      ]).start();
    }, 200);

    // Step 2: Title entrance (500ms delay)
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(titleFade, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(titleSlide, {
          toValue: 0,
          tension: 80,
          friction: 10,
          useNativeDriver: true,
        }),
      ]).start();
    }, 500);

    // Step 3: Subtitle entrance (800ms delay)
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(subtitleFade, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(subtitleSlide, {
          toValue: 0,
          tension: 80,
          friction: 10,
          useNativeDriver: true,
        }),
      ]).start();
    }, 800);

    // Phone entrance animation (delayed to come after header)
    setTimeout(() => {
      Animated.parallel([
        Animated.spring(phoneScale, {
          toValue: 1,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(phoneOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start();
      
      // Mark first slide as visited after phone appears
      setTimeout(() => {
        setVisitedSlides(prev => ({ ...prev, 0: true }));
      }, 300);
    }, 1100);
    
    // ============ BOTTOM SECTION CASCADE ============
    // Step 4: Plans selector cards (1300ms) - Slide from left then down (slower)
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(plansFade, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(plansSlideX, {
          toValue: 0,
          tension: 35,
          friction: 12,
          useNativeDriver: true,
        }),
        Animated.spring(plansSlideY, {
          toValue: 0,
          tension: 35,
          friction: 12,
          useNativeDriver: true,
        }),
      ]).start();
    }, 1300);
    
    // Step 4b: Plan titles cascade (1500ms) - Slide from left (slower)
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(planText1Fade, {
          toValue: 1,
          duration: 450,
          useNativeDriver: true,
        }),
        Animated.spring(planText1SlideX, {
          toValue: 0,
          tension: 40,
          friction: 12,
          useNativeDriver: true,
        }),
      ]).start();
    }, 1500);
    
    // Step 4c: Plan prices cascade (1650ms) - Slide from left (slower)
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(planText2Fade, {
          toValue: 1,
          duration: 450,
          useNativeDriver: true,
        }),
        Animated.spring(planText2SlideX, {
          toValue: 0,
          tension: 40,
          friction: 12,
          useNativeDriver: true,
        }),
      ]).start();
    }, 1650);
    
    // Step 4d: Selection circles cascade (1800ms) - Slide from left (slower)
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(planText3Fade, {
          toValue: 1,
          duration: 450,
          useNativeDriver: true,
        }),
        Animated.spring(planText3SlideX, {
          toValue: 0,
          tension: 40,
          friction: 12,
          useNativeDriver: true,
        }),
      ]).start();
    }, 1800);
    
    // Step 5: "No payment" text (1950ms) - Slide from left then down (slower)
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(noPaymentFade, {
          toValue: 1,
          duration: 550,
          useNativeDriver: true,
        }),
        Animated.spring(noPaymentSlideX, {
          toValue: 0,
          tension: 35,
          friction: 12,
          useNativeDriver: true,
        }),
        Animated.spring(noPaymentSlideY, {
          toValue: 0,
          tension: 35,
          friction: 12,
          useNativeDriver: true,
        }),
      ]).start();
    }, 1950);
    
    // Step 6: CTA button (2150ms) - Slide from left then down with scale (slower)
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(ctaFade, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(ctaSlideX, {
          toValue: 0,
          tension: 30,
          friction: 12,
          useNativeDriver: true,
        }),
        Animated.spring(ctaSlideY, {
          toValue: 0,
          tension: 30,
          friction: 12,
          useNativeDriver: true,
        }),
        Animated.spring(ctaScale, {
          toValue: 1,
          tension: 50,
          friction: 10,
          useNativeDriver: true,
        }),
      ]).start();
    }, 2150);
    
    // Step 7: Trial terms text (2400ms) - Slide from left then down (slower)
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(trialTermsFade, {
          toValue: 1,
          duration: 550,
          useNativeDriver: true,
        }),
        Animated.spring(trialTermsSlideX, {
          toValue: 0,
          tension: 35,
          friction: 12,
          useNativeDriver: true,
        }),
        Animated.spring(trialTermsSlideY, {
          toValue: 0,
          tension: 35,
          friction: 12,
          useNativeDriver: true,
        }),
      ]).start();
    }, 2400);
    
    // Step 8: Footer links (2650ms) - Slide from left then down (slower)
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(footerFade, {
          toValue: 1,
          duration: 550,
          useNativeDriver: true,
        }),
        Animated.spring(footerSlideX, {
          toValue: 0,
          tension: 35,
          friction: 12,
          useNativeDriver: true,
        }),
        Animated.spring(footerSlideY, {
          toValue: 0,
          tension: 35,
          friction: 12,
          useNativeDriver: true,
        }),
      ]).start();
    }, 2650);
    
    // General fade (keep for any remaining elements)
    setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }, 1300);
    
    loadPackages();
    startAutoScroll();

    return () => {
      if (autoScrollTimer.current) {
        clearInterval(autoScrollTimer.current);
      }
    };
  }, []);

  const loadPackages = async () => {
    try {
      const rcPackages = await RevenueCatService.getPackages();
      setPackages(rcPackages);
    } catch (error) {
      console.error('Failed to load packages:', error);
    }
  };

  const startAutoScroll = () => {
    autoScrollTimer.current = setInterval(() => {
      // Calculate next slide using the ref to avoid stale closure issues
      const nextSlide = (currentSlideRef.current + 1) % PAYWALL_SLIDES.length;
      
      // We only trigger the scroll here. handleScroll will update the state 
      // as the animation progresses, ensuring no conflicting state updates.
      phoneScrollRef.current?.scrollTo({
        x: nextSlide * (PHONE_WIDTH - 4),
        animated: true,
      });
    }, 4000);
  };

  const handleScroll = (event) => {
    const x = event.nativeEvent.contentOffset.x;
    const slideIndex = Math.round(x / (PHONE_WIDTH - 4));
    
    // Check if the slide has actually changed
    if (slideIndex !== currentSlideRef.current && slideIndex >= 0 && slideIndex < PAYWALL_SLIDES.length) {
      // Update both ref and state
      currentSlideRef.current = slideIndex;
      setCurrentSlide(slideIndex);
      
      // Mark slide as visited for cascade animations (with small delay for scroll to settle)
      if (!visitedSlides[slideIndex]) {
        setTimeout(() => {
          setVisitedSlides(prev => ({ ...prev, [slideIndex]: true }));
        }, 150);
      }
      
      // Restart the auto-scroll timer to give the user time on the manual slide
      if (autoScrollTimer.current) {
        clearInterval(autoScrollTimer.current);
        startAutoScroll();
      }
    }
  };

  const handleSubscribe = async () => {
    const purchaseStartTime = Date.now();
    
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setIsLoading(true);

      const packageToPurchase = selectedPlan === 'yearly' ? packages?.annual : packages?.monthly;
      
      if (!packageToPurchase) {
        Alert.alert('Error', 'This plan is currently unavailable. Please try again in a moment.');
        setIsLoading(false);
        return;
      }

      const productId = packageToPurchase.product.identifier;
      const price = packageToPurchase.product.priceString;
      mixpanelService.trackSubscriptionStarted(productId, price);
      
      const creatorCode = await AsyncStorage.getItem('creatorReferralCode');
      if (creatorCode) {
        await RevenueCatService.setCreatorCode(creatorCode);
      }

      const customerInfo = await RevenueCatService.purchasePackage(packageToPurchase);
      
      if (customerInfo?.entitlements?.active?.pro) {
        const duration = Date.now() - purchaseStartTime;
        mixpanelService.trackSubscriptionCompleted(productId, price, Math.floor(duration / 1000));
        router.replace('/(tabs)/analysis');
        // Start tutorial after navigation completes
        setTimeout(() => {
          startTutorial();
        }, 800);
      } else {
        Alert.alert(
          'Subscription Issue', 
          'Your purchase was processed but we\'re having trouble activating it. Please try restoring purchases or contact support.'
        );
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Subscription error:', error);
      
      if (error.userCancelled || error.code === 'PURCHASE_CANCELLED_ERROR') {
        mixpanelService.track('Subscription Cancelled', { plan: selectedPlan, reason: 'user_cancelled' });
        setIsLoading(false);
        router.push('/onboarding-spin-wheel');
        return;
      }
      
      mixpanelService.trackError('subscription_failed', error.message || 'Unknown error', { plan: selectedPlan });
      Alert.alert('Purchase Failed', 'We couldn\'t complete your purchase. Please try again.');
      setIsLoading(false);
    }
  };

  const handleRestore = async () => {
    try {
      setIsLoading(true);
      const customerInfo = await RevenueCatService.restorePurchases();
      
      if (customerInfo.entitlements.active.pro) {
        router.replace('/(tabs)/analysis');
      } else {
        Alert.alert('No Purchases Found', 'No active subscriptions were found to restore.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to restore purchases. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRedeemOfferCode = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      if (Platform.OS !== 'ios') {
        Alert.alert('Not available', 'Offer code redemption is only available on iOS.');
        return;
      }

      const unsubscribe = await RevenueCatService.addCustomerInfoUpdateListener((customerInfo) => {
        if (customerInfo?.entitlements?.active?.pro) {
          if (typeof unsubscribe === 'function') unsubscribe();
          router.replace('/(tabs)/analysis');
        }
      });

      const customerInfo = await RevenueCatService.presentOfferCodeRedemptionSheet();
      if (customerInfo?.entitlements?.active?.pro) {
        if (typeof unsubscribe === 'function') unsubscribe();
        router.replace('/(tabs)/analysis');
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to redeem offer code. Please try again.');
    }
  };

  const renderPhoneScreen = (screenType, slideIndex) => {
    const isVisited = visitedSlides[slideIndex];
    switch (screenType) {
      case 'chat':
        return <ChatScreenMockup isVisible={isVisited} />;
      case 'analysis':
        return <AnalysisScreenMockup isVisible={isVisited} />;
      case 'insights':
        return <InsightsScreenMockup isVisible={isVisited} />;
      default:
        return <ChatScreenMockup isVisible={isVisited} />;
    }
  };

  const currentSlideData = PAYWALL_SLIDES[currentSlide];

  return (
    <ErrorBoundary>
      <View style={styles.container}>
        <StatusBar style="light" />
        
        {/* Background */}
        <LinearGradient
          colors={PaywallColors.backgroundGradient}
          style={styles.background}
        />

        <View style={[styles.content, { paddingTop: insets.top + 3 }]}>
          {/* Header with Logo - Cascading Animation */}
          <Animated.View style={[
            styles.header, 
            { 
              opacity: logoFade,
              transform: [{ translateY: logoSlide }]
            }
          ]}>
            <View style={styles.logoContainer}>
              <Image 
                source={require('../assets/images/propify-logo-original.png')} 
                style={styles.paywallLogoImage}
                resizeMode="contain"
              />
              <Text style={styles.logoText}>Propify</Text>
            </View>
          </Animated.View>

          {/* Progress Indicator - 3 Lines showing current slide */}
          <View style={styles.progressContainer}>
            {PAYWALL_SLIDES.map((_, index) => (
              <View 
                key={index} 
                style={[
                  styles.progressBarSimple,
                  index <= currentSlide && styles.progressBarSimpleActive
                ]} 
              />
            ))}
          </View>

          {/* Title - Cascading Animation */}
          <Animated.View style={[
            styles.titleContainer, 
            { 
              opacity: titleFade,
              transform: [{ translateY: titleSlide }]
            }
          ]}>
            <Text style={styles.mainTitle}>{currentSlideData.title}</Text>
          </Animated.View>
          
          {/* Subtitle - Cascading Animation */}
          <Animated.View style={[
            styles.subtitleContainer,
            {
              opacity: subtitleFade,
              transform: [{ translateY: subtitleSlide }]
            }
          ]}>
            <Text style={styles.mainSubtitle}>{currentSlideData.subtitle}</Text>
          </Animated.View>

          {/* Phone Mockup - Enhanced Realistic Design */}
          <Animated.View 
            style={[
              styles.phoneContainer,
              {
                opacity: phoneOpacity,
                transform: [{ scale: phoneScale }],
              },
            ]}
          >
            {/* Outer Shadow Layer for floating effect */}
            <View style={styles.phoneShadowLayer}>
              {/* Phone Outer Bezel - gives 3D depth */}
              <View style={styles.phoneOuterBezel}>
                {/* Phone Frame - main body */}
                <View style={styles.phoneFrame}>
                  {/* Inner bezel highlight */}
                  <View style={styles.phoneInnerBezel}>
                    {/* Screen Area */}
                    <View style={styles.phoneScreen}>
                      {/* Status Bar with Dynamic Island */}
                      <View style={styles.phoneStatusBar}>
                        <Text style={styles.statusBarTime}>9:41</Text>
                        {/* Dynamic Island */}
                        <View style={styles.dynamicIsland} />
                        <View style={styles.statusBarIcons}>
                          {/* Signal Bars */}
                          <View style={styles.signalBars}>
                            <View style={[styles.signalBar, { height: 4 }]} />
                            <View style={[styles.signalBar, { height: 6 }]} />
                            <View style={[styles.signalBar, { height: 8 }]} />
                            <View style={[styles.signalBar, { height: 10 }]} />
                          </View>
                          {/* Battery Icon */}
                          <View style={styles.batteryContainer}>
                            <View style={styles.batteryBody}>
                              <View style={styles.batteryFill} />
                            </View>
                            <View style={styles.batteryTip} />
                          </View>
                        </View>
                      </View>
                      
                      {/* Phone Screen Content */}
                      <Animated.ScrollView
                        ref={phoneScrollRef}
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        onScroll={handleScroll}
                        scrollEventThrottle={16}
                        style={styles.phoneScreenScroll}
                      >
                        {PAYWALL_SLIDES.map((slide, index) => (
                          <View key={slide.id} style={styles.phoneScreenWrapper}>
                            {renderPhoneScreen(slide.screenType, index)}
                          </View>
                        ))}
                      </Animated.ScrollView>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </Animated.View>
        </View>

        {/* Bottom Overlay - Plans & CTA */}
        <View style={styles.bottomOverlay}>
          {/* Gradient fade at top */}
          <LinearGradient
            colors={['transparent', '#000000']}
            style={styles.bottomOverlayGradient}
          />
          {/* Black background content */}
          <View style={[styles.bottomOverlayContent, { paddingBottom: insets.bottom + 10 }]}>
            {/* Subscription Plans Container - Animated slide from left then down */}
            <Animated.View style={[
              styles.plansContainer,
              { opacity: plansFade, transform: [{ translateX: plansSlideX }, { translateY: plansSlideY }] }
            ]}>
              <View style={styles.plansRow}>
                {['monthly', 'yearly'].map((planId) => {
                  const plan = getPlanDisplayData(packages, planId);
                  if (!plan) return null; // Only render if the package loaded successfully
                  
                  const isSelected = selectedPlan === plan.id;
                  
                  return (
                    <TouchableOpacity
                      key={plan.id}
                      style={[
                        styles.planCard,
                        isSelected && styles.planCardSelected,
                      ]}
                      onPress={() => {
                        setSelectedPlan(plan.id);
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        mixpanelService.track('Subscription Plan Selected', { plan: plan.id, price: plan.price });
                      }}
                    >
                      {plan.popular && (
                        <Animated.View style={[
                          styles.limitedOfferBadge, 
                          { opacity: planText1Fade, transform: [{ translateX: planText1SlideX }] }
                        ]}>
                          <Text style={styles.limitedOfferText}>LIMITED OFFER</Text>
                        </Animated.View>
                      )}
                      
                      {/* Plan Title - Slides from left */}
                      <Animated.Text style={[
                        styles.planTitle, 
                        isSelected && styles.planTitleSelected,
                        { opacity: planText1Fade, transform: [{ translateX: planText1SlideX }] }
                      ]}>
                        {plan.title}
                      </Animated.Text>
                      
                      {/* Plan Price Row - Slides from left */}
                      <Animated.View style={[
                        styles.planPriceRow, 
                        { opacity: planText2Fade, transform: [{ translateX: planText2SlideX }] }
                      ]}>
                        <Text style={[styles.planPrice, isSelected && styles.planPriceSelected]}>{plan.price}</Text>
                        <Text style={styles.planPeriod}>{plan.period}</Text>
                      </Animated.View>
                      
                      {/* Selection Circle - Slides from left */}
                      <Animated.View style={[
                        styles.selectionCircle, 
                        isSelected && styles.selectionCircleSelected,
                        { opacity: planText3Fade, transform: [{ translateX: planText3SlideX }] }
                      ]}>
                        {isSelected && <CheckmarkIcon size={12} color="#000" />}
                      </Animated.View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </Animated.View>

            {/* No Payment Text - Slides from left then down */}
            <Animated.Text style={[
              styles.noPaymentText, 
              { opacity: noPaymentFade, transform: [{ translateX: noPaymentSlideX }, { translateY: noPaymentSlideY }] }
            ]}>
              NO PAYMENT DUE NOW - CANCEL ANYTIME
            </Animated.Text>
            
            {/* CTA Button - Slides from left then down with scale */}
            <Animated.View style={[
              { opacity: ctaFade, transform: [{ translateX: ctaSlideX }, { translateY: ctaSlideY }, { scale: ctaScale }] }
            ]}>
              <TouchableOpacity
                style={styles.ctaButton}
                onPress={handleSubscribe}
                disabled={isLoading}
              >
                <LinearGradient
                  colors={['#059669', '#4ADE80', '#6EE7B7']}
                  style={styles.ctaGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.ctaText}>
                    {isLoading ? 'Processing...' : (packages?.annual?.product?.introPrice ? 'Start my 3-day free trial' : 'Subscribe Now')}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>

            {/* Trial Terms - Slides from left then down */}
            <Animated.Text style={[
              styles.trialTerms, 
              { opacity: trialTermsFade, transform: [{ translateX: trialTermsSlideX }, { translateY: trialTermsSlideY }] }
            ]}>
              {(() => {
                const currentPlan = getPlanDisplayData(packages, selectedPlan);
                if (!currentPlan) return 'Loading plan details...';
                
                const hasTrial = currentPlan.package?.product?.introPrice;
                if (hasTrial) {
                  return `3 days free, then ${currentPlan.price}${selectedPlan === 'yearly' ? '/year' : '/month'}\nTrial applicable for first time subscribers only`;
                }
                return `Join Propify Pro for ${currentPlan.price}${selectedPlan === 'yearly' ? '/year' : '/month'}`;
              })()}
            </Animated.Text>

            {/* Footer Links - Slides from left then down */}
            <Animated.View style={{ 
              opacity: footerFade, 
              transform: [{ translateX: footerSlideX }, { translateY: footerSlideY }] 
            }}>
              {/* Secondary Actions */}
              <View style={styles.secondaryActions}>
                <TouchableOpacity onPress={handleRestore} style={styles.secondaryButton}>
                  <Text style={styles.secondaryButtonText}>Restore Purchases</Text>
                </TouchableOpacity>
                
                {Platform.OS === 'ios' && (
                  <TouchableOpacity onPress={handleRedeemOfferCode} style={styles.secondaryButton}>
                    <Text style={styles.secondaryButtonText}>Redeem Code</Text>
                  </TouchableOpacity>
                )}
              </View>
            </Animated.View>
          </View>
        </View>
      </View>
    </ErrorBoundary>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  content: {
    flex: 1,
  },
  
  // Header
  header: {
    alignItems: 'center',
    marginBottom: 10,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  paywallLogoImage: {
    width: 28,
    height: 28,
  },
  logoText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    fontStyle: 'italic',
  },

  // Progress Indicator
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12,
    paddingHorizontal: 50,
  },
  progressBarSimple: {
    flex: 1,
    height: 3,
    backgroundColor: 'rgba(74, 222, 128, 0.2)',
    borderRadius: 2,
  },
  progressBarSimpleActive: {
    backgroundColor: '#4ADE80',
    shadowColor: '#4ADE80',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },

  // Title
  titleContainer: {
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 6,
  },
  subtitleContainer: {
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 12,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  mainSubtitle: {
    fontSize: 11,
    color: '#A7F3D0',
    textAlign: 'center',
    lineHeight: 15,
  },

  // Phone - Enhanced Realistic Design
  phoneContainer: {
    alignItems: 'center',
    flex: 1,
  },
  // Large soft shadow for floating effect
  phoneShadowLayer: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.5,
    shadowRadius: 40,
    elevation: 25,
  },
  // Outer bezel - gives 3D metallic edge look
  phoneOuterBezel: {
    width: PHONE_WIDTH + 6,
    height: PHONE_HEIGHT + 6,
    borderRadius: 44,
    backgroundColor: '#2a2a2a',
    padding: 3,
    // Gradient-like effect with border
    borderWidth: 0.5,
    borderColor: '#404040',
    // Subtle outer glow
    shadowColor: '#4ADE80',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
  },
  // Main phone frame body
  phoneFrame: {
    width: PHONE_WIDTH,
    height: PHONE_HEIGHT,
    borderRadius: 40,
    backgroundColor: '#1a1a1a',
    overflow: 'hidden',
    // Inner edge highlight
    borderWidth: 0.5,
    borderColor: '#333333',
  },
  // Inner bezel - creates depth
  phoneInnerBezel: {
    flex: 1,
    margin: 1,
    borderRadius: 38,
    backgroundColor: '#0a0a0a',
    overflow: 'hidden',
    // Subtle inner shadow effect
    borderWidth: 0.5,
    borderColor: '#1a1a1a',
  },
  // Screen area
  phoneScreen: {
    flex: 1,
    backgroundColor: '#000000',
    borderRadius: 36,
    overflow: 'hidden',
  },
  phoneStatusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
    backgroundColor: '#000',
  },
  statusBarTime: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
    width: 40,
    marginLeft: 4,
  },
  // Dynamic Island
  dynamicIsland: {
    width: 80,
    height: 22,
    backgroundColor: '#000000',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#1a1a1a',
    // Subtle shine effect
    shadowColor: '#333',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
  },
  statusBarIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 5,
    width: 50,
  },
  // Signal Bars
  signalBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 1,
    height: 10,
  },
  signalBar: {
    width: 2.5,
    backgroundColor: '#FFFFFF',
    borderRadius: 1,
  },
  // Battery Icon
  batteryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  batteryBody: {
    width: 16,
    height: 8,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: '#FFFFFF',
    padding: 1,
    justifyContent: 'center',
  },
  batteryFill: {
    flex: 1,
    backgroundColor: '#4ADE80',
    borderRadius: 1,
    width: '80%',
  },
  batteryTip: {
    width: 1.5,
    height: 4,
    backgroundColor: '#FFFFFF',
    borderTopRightRadius: 1,
    borderBottomRightRadius: 1,
    marginLeft: 0.5,
  },
  phoneScreenScroll: {
    flex: 1,
  },
  phoneScreenWrapper: {
    width: PHONE_WIDTH - 4,
  },

  // Bottom Overlay
  bottomOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  bottomOverlayGradient: {
    height: 40,
  },
  bottomOverlayContent: {
    backgroundColor: '#000000',
    paddingHorizontal: 16,
  },

  // Plans
  plansContainer: {
    paddingTop: 8,
  },
  plansRow: {
    flexDirection: 'row',
    gap: 10,
  },
  planCard: {
    flex: 1,
    backgroundColor: 'rgba(5, 46, 22, 0.6)',
    borderRadius: 14,
    padding: 14,
    borderWidth: 2,
    borderColor: 'rgba(74, 222, 128, 0.3)',
    position: 'relative',
  },
  planCardSelected: {
    borderColor: '#4ADE80',
    backgroundColor: 'rgba(74, 222, 128, 0.1)',
  },
  limitedOfferBadge: {
    position: 'absolute',
    top: -10,
    right: 10,
    backgroundColor: '#4ADE80',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  limitedOfferText: {
    fontSize: 8,
    fontWeight: '700',
    color: '#000000',
    letterSpacing: 0.5,
  },
  planTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#A7F3D0',
    marginBottom: 2,
  },
  planTitleSelected: {
    color: '#FFFFFF',
  },
  planPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
  },
  planPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#A7F3D0',
  },
  planPriceSelected: {
    color: '#4ADE80',
  },
  planPeriod: {
    fontSize: 12,
    color: '#6B7280',
  },
  selectionCircle: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'rgba(74, 222, 128, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectionCircleSelected: {
    borderColor: '#4ADE80',
    backgroundColor: '#4ADE80',
  },

  // CTA
  noPaymentText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#6B7280',
    letterSpacing: 0.5,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 8,
  },
  ctaButton: {
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 8,
  },
  ctaGradient: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000000',
  },
  trialTerms: {
    fontSize: 11,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: 8,
  },
  secondaryActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
  secondaryButton: {
    paddingVertical: 4,
  },
  secondaryButtonText: {
    fontSize: 11,
    color: '#6B7280',
    textDecorationLine: 'underline',
  },
});

export default PaywallScreen;
