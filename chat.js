import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Animated,
  Keyboard,
  Modal,
  ScrollView,
  Image,
  Alert,
  Dimensions,
  LayoutAnimation,
  UIManager,
} from 'react-native';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { ProfessionalColors } from '../../constants/Colors';
import Svg, { Path, Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import teamColors from '../utils/teamColors';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { useFonts, BarlowCondensed_400Regular, BarlowCondensed_600SemiBold, BarlowCondensed_700Bold } from '@expo-google-fonts/barlow-condensed';
import ChatMatchupHistoryChart from '../../components/ChatMatchupHistoryChart';
import ChatEfficiencyChart from '../../components/ChatEfficiencyChart';
import ChatComboChart from '../../components/ChatComboChart';
import ChatTabbedChart from '../../components/ChatTabbedChart';
import ChatInjuryTable from '../../components/ChatInjuryTable';
import ChatPropsAveragesTable from '../../components/ChatPropsAveragesTable';
import ChatPropsInjuriesTable from '../../components/ChatPropsInjuriesTable';
// NFL Chart Components
import NFLRecentPerformanceChart from '../../components/NFLRecentPerformanceChart';
import NFLHomeAwayChart from '../../components/NFLHomeAwayChart';
import NFLTeamDefenseChart from '../../components/NFLTeamDefenseChart';
import NFLTeamOffenseChart from '../../components/NFLTeamOffenseChart';
import NFLTeamMatchupChart from '../../components/NFLTeamMatchupChart';
import NFLTeamTrendChart from '../../components/NFLTeamTrendChart';
import ReanimatedModule, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withRepeat,
  withSequence,
  withDelay,
  interpolate,
  Easing,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Enhanced Emerald Color Palette for Analysis Cards
const EnhancedColors = {
  primaryEmerald: '#4ADE80',
  playerAnalysisGradient: ['#065F46', '#0F766E', '#4ADE80'],
  teamInsightsGradient: ['#064E3B', '#059669', '#4ADE80'],
  aiAnalysisGradient: ['#0F3D3E', '#2DD4BF', '#4ADE80', '#6EE7B7'],
  glassBackground: 'rgba(74, 222, 128, 0.12)',
  glassBorder: 'rgba(74, 222, 128, 0.25)',
  glassAccent: 'rgba(74, 222, 128, 0.20)',
  deepEmerald: '#065F46',
  lightEmerald: '#6EE7B7',
  ultraLightEmerald: '#A7F3D0',
  textSecondary: '#A7F3D0',
  positive: '#4ADE80',
  negative: '#EF4444',
  neutral: '#FCD34D',
  shadowPrimary: 'rgba(74, 222, 128, 0.25)',
  shadowSecondary: 'rgba(74, 222, 128, 0.15)',
  shadowColored: 'rgba(74, 222, 128, 0.4)',
};

// Analysis Cards Data (Mini Version)
const MINI_ANALYSIS_CARDS = {
  playerAnalysis: {
    title: 'Player Analysis',
    subtitle: 'Recent Performance',
    metrics: [
      { label: 'Season', value: '24.8 PPG', trend: 'up' },
      { label: 'L5 Avg', value: '27.2', trend: 'up' },
    ],
    confidence: 82,
  },
  teamInsights: {
    title: 'Team Insights',
    subtitle: 'Offense Rating',
    metrics: [
      { label: 'Rating', value: '118.4', trend: 'up' },
      { label: 'Record', value: '7-1', trend: 'up' },
    ],
    confidence: 87,
  },
};

// Mini Circular Progress for cards
const MiniCircularProgress = ({ percentage, size = 24, strokeWidth = 2.5, color = '#FFFFFF' }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
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
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={[StyleSheet.absoluteFill, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{
          fontSize: size * 0.28,
          fontWeight: '800',
          color: '#FFFFFF',
          fontVariant: ['tabular-nums']
        }}>
          {percentage}%
        </Text>
      </View>
    </View>
  );
};

// Mini Trend Indicator
const MiniTrendIndicator = ({ trend, size = 10 }) => {
  const colors = {
    up: EnhancedColors.positive,
    down: EnhancedColors.negative,
    neutral: EnhancedColors.neutral,
  };

  const icons = {
    up: "M7 14l5-5 5 5",
    down: "M17 10l-5 5-5-5",
    neutral: "M5 12h14",
  };

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path 
        d={icons[trend]} 
        stroke={colors[trend]} 
        strokeWidth="2.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </Svg>
  );
};

// Typography weights for better hierarchy
const Typography = {
  ultraLight: '100',
  light: '300',
  regular: '400',
  medium: '500',
  semiBold: '600',
  bold: '700',
  extraBold: '800',
  black: '900',
};

// ============ MINI STACKED ANALYSIS CARDS COMPONENT ============
const MiniStackedAnalysisCards = () => {
  // Cascade entrance animations for analysis cards (using Reanimated)
  const leftCardFade = useSharedValue(0);
  const leftCardSlide = useSharedValue(-80);
  const leftCardRotate = useSharedValue(-20);
  const rightCardFade = useSharedValue(0);
  const rightCardSlide = useSharedValue(80);
  const rightCardRotate = useSharedValue(20);
  const mainCardFade = useSharedValue(0);
  const mainCardSlide = useSharedValue(-120);
  const mainCardScale = useSharedValue(0.7);
  
  // Card press scale animations
  const leftCardPressScale = useSharedValue(1);
  const rightCardPressScale = useSharedValue(1);
  const mainCardPressScale = useSharedValue(1);

  // Enhanced card interaction styles with cascade entrance
  const leftCardAnimatedStyle = useAnimatedStyle(() => ({
    opacity: leftCardFade.value,
    transform: [
      { rotate: `${-10 + leftCardRotate.value}deg` }, 
      { translateX: -35 + leftCardSlide.value },
      { scale: leftCardPressScale.value }
    ],
  }));

  const rightCardAnimatedStyle = useAnimatedStyle(() => ({
    opacity: rightCardFade.value,
    transform: [
      { rotate: `${10 + rightCardRotate.value}deg` }, 
      { translateX: 35 + rightCardSlide.value },
      { scale: rightCardPressScale.value }
    ],
  }));

  const mainCardAnimatedStyle = useAnimatedStyle(() => ({
    opacity: mainCardFade.value,
    transform: [
      { translateY: mainCardSlide.value },
      { scale: mainCardPressScale.value * mainCardScale.value }
    ],
  }));

  // Start cascade animations on mount
  useEffect(() => {
    // Left card cascades in first
    setTimeout(() => {
      leftCardFade.value = withTiming(1, { duration: 700, easing: Easing.out(Easing.cubic) });
      leftCardSlide.value = withSpring(0, { damping: 14, stiffness: 100 });
      leftCardRotate.value = withSpring(0, { damping: 18, stiffness: 90 });
    }, 300);
    
    // Right card follows with clear delay
    setTimeout(() => {
      rightCardFade.value = withTiming(1, { duration: 700, easing: Easing.out(Easing.cubic) });
      rightCardSlide.value = withSpring(0, { damping: 14, stiffness: 100 });
      rightCardRotate.value = withSpring(0, { damping: 18, stiffness: 90 });
    }, 650);
    
    // Main card enters dramatically last
    setTimeout(() => {
      mainCardFade.value = withTiming(1, { duration: 900, easing: Easing.out(Easing.cubic) });
      mainCardSlide.value = withSpring(0, { damping: 16, stiffness: 85 });
      mainCardScale.value = withSpring(1, { damping: 12, stiffness: 70 });
    }, 1050);
  }, []);

  // Card press handlers
  const handleCardPressIn = (cardType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const scale = cardType === 'left' ? leftCardPressScale : 
                  cardType === 'right' ? rightCardPressScale : mainCardPressScale;
    scale.value = withSpring(0.95, { damping: 15, stiffness: 200 });
  };

  const handleCardPressOut = (cardType) => {
    const scale = cardType === 'left' ? leftCardPressScale : 
                  cardType === 'right' ? rightCardPressScale : mainCardPressScale;
    scale.value = withSpring(1, { damping: 15, stiffness: 200 });
  };

  return (
    <View style={miniCardStyles.container}>
      <View style={miniCardStyles.stackContainer}>
        {/* Left tilted card - Player Analysis */}
        <ReanimatedModule.View style={[miniCardStyles.card, miniCardStyles.leftCard, leftCardAnimatedStyle]}>
          <TouchableOpacity
            onPressIn={() => handleCardPressIn('left')}
            onPressOut={() => handleCardPressOut('left')}
            activeOpacity={1}
            style={{ flex: 1 }}
          >
            <LinearGradient
              colors={EnhancedColors.playerAnalysisGradient}
              style={miniCardStyles.cardContent}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={miniCardStyles.cardHeader}>
                <View style={miniCardStyles.cardIcon}>
                  <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                    <Path
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      stroke="#FFFFFF"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </Svg>
                </View>
                <Text style={miniCardStyles.cardTitle} numberOfLines={1}>
                  {MINI_ANALYSIS_CARDS.playerAnalysis.title}
                </Text>
              </View>
              
              <Text style={miniCardStyles.cardSubtitle} numberOfLines={1}>
                {MINI_ANALYSIS_CARDS.playerAnalysis.subtitle}
              </Text>
              
              <View style={miniCardStyles.metricsContainer}>
                {MINI_ANALYSIS_CARDS.playerAnalysis.metrics.map((metric, index) => (
                  <View key={index} style={miniCardStyles.metricRow}>
                    <Text style={miniCardStyles.metricLabel}>{metric.label}:</Text>
                    <View style={miniCardStyles.metricValueRow}>
                      <Text style={miniCardStyles.metricValue}>{metric.value}</Text>
                      <MiniTrendIndicator trend={metric.trend} />
                    </View>
                  </View>
                ))}
              </View>
              
              <View style={miniCardStyles.cardFooter}>
                <MiniCircularProgress 
                  percentage={MINI_ANALYSIS_CARDS.playerAnalysis.confidence} 
                  size={22}
                  strokeWidth={2}
                />
                <Text style={miniCardStyles.footerText}>Confidence</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </ReanimatedModule.View>

        {/* Right tilted card - Team Insights */}
        <ReanimatedModule.View style={[miniCardStyles.card, miniCardStyles.rightCard, rightCardAnimatedStyle]}>
          <TouchableOpacity
            onPressIn={() => handleCardPressIn('right')}
            onPressOut={() => handleCardPressOut('right')}
            activeOpacity={1}
            style={{ flex: 1 }}
          >
            <LinearGradient
              colors={EnhancedColors.teamInsightsGradient}
              style={miniCardStyles.cardContent}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={miniCardStyles.cardHeader}>
                <View style={miniCardStyles.cardIcon}>
                  <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                    <Path
                      d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"
                      stroke="#FFFFFF"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </Svg>
                </View>
                <Text style={miniCardStyles.cardTitle} numberOfLines={1}>
                  {MINI_ANALYSIS_CARDS.teamInsights.title}
                </Text>
              </View>
              
              <Text style={miniCardStyles.cardSubtitle} numberOfLines={1}>
                {MINI_ANALYSIS_CARDS.teamInsights.subtitle}
              </Text>
              
              <View style={miniCardStyles.metricsContainer}>
                {MINI_ANALYSIS_CARDS.teamInsights.metrics.map((metric, index) => (
                  <View key={index} style={miniCardStyles.metricRow}>
                    <Text style={miniCardStyles.metricLabel}>{metric.label}:</Text>
                    <View style={miniCardStyles.metricValueRow}>
                      <Text style={miniCardStyles.metricValue}>{metric.value}</Text>
                      <MiniTrendIndicator trend={metric.trend} />
                    </View>
                  </View>
                ))}
              </View>
              
              <View style={miniCardStyles.cardFooter}>
                <MiniCircularProgress 
                  percentage={MINI_ANALYSIS_CARDS.teamInsights.confidence} 
                  size={22}
                  strokeWidth={2}
                />
                <Text style={miniCardStyles.footerText}>Confidence</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </ReanimatedModule.View>

        {/* Main center card - AI Analysis */}
        <ReanimatedModule.View style={[miniCardStyles.card, miniCardStyles.mainCard, mainCardAnimatedStyle]}>
          <TouchableOpacity
            onPressIn={() => handleCardPressIn('main')}
            onPressOut={() => handleCardPressOut('main')}
            activeOpacity={1}
            style={{ flex: 1 }}
          >
            <LinearGradient
              colors={EnhancedColors.aiAnalysisGradient}
              style={miniCardStyles.mainCardContent}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={miniCardStyles.mainCardHeader}>
                <View style={miniCardStyles.mainCardIcon}>
                  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                    <Path
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                      stroke="#FFFFFF"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </Svg>
                </View>
                <Text style={miniCardStyles.mainCardTitle}>AI Analysis</Text>
              </View>
              
              <Text style={miniCardStyles.mainCardDescription}>
                Smart bet detection powered by AI
              </Text>
              
              <View style={miniCardStyles.mainCardStats}>
                <View style={miniCardStyles.mainStatItem}>
                  <Text style={miniCardStyles.mainStatValue}>96.4%</Text>
                  <Text style={miniCardStyles.mainStatLabel}>Accuracy</Text>
                </View>
                <View style={miniCardStyles.mainStatDivider} />
                <View style={miniCardStyles.mainStatItem}>
                  <Text style={miniCardStyles.mainStatValue}>1.8s</Text>
                  <Text style={miniCardStyles.mainStatLabel}>Analysis</Text>
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </ReanimatedModule.View>
      </View>
    </View>
  );
};

// Mini Card Styles (Scaled down from Analysis Screen)
const miniCardStyles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 16,
    position: 'relative',
  },
  stackContainer: {
    position: 'relative',
    width: SCREEN_WIDTH * 0.80,
    height: 190,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    position: 'absolute',
    borderRadius: 14,
    overflow: 'hidden',
  },
  leftCard: {
    width: '48%',
    height: '100%',
    transform: [{ rotate: '-10deg' }, { translateX: -32 }],
    zIndex: 1,
  },
  rightCard: {
    width: '48%',
    height: '100%',
    transform: [{ rotate: '10deg' }, { translateX: 32 }],
    zIndex: 2,
  },
  mainCard: {
    width: '48%',
    height: '100%',
    borderRadius: 16,
    zIndex: 3,
  },
  cardContent: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: EnhancedColors.glassBorder,
  },
  mainCardContent: {
    flex: 1,
    padding: 14,
    justifyContent: 'space-between',
    borderRadius: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  cardIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: EnhancedColors.glassAccent,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  cardTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.2,
    flex: 1,
  },
  cardSubtitle: {
    fontSize: 9,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 6,
    fontWeight: '500',
  },
  metricsContainer: {
    marginTop: 2,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3,
  },
  metricLabel: {
    fontSize: 8,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.75)',
    letterSpacing: 0.2,
  },
  metricValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  metricValue: {
    fontSize: 9,
    fontWeight: '700',
    color: '#FFFFFF',
    fontVariant: ['tabular-nums'],
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  footerText: {
    fontSize: 8,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 6,
    letterSpacing: 0.2,
  },
  // Main card specific styles
  mainCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  mainCardIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: EnhancedColors.glassAccent,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  mainCardTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  mainCardDescription: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.85)',
    lineHeight: 14,
    textAlign: 'center',
    marginVertical: 8,
    fontWeight: '500',
  },
  mainCardStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 10,
    padding: 10,
  },
  mainStatItem: {
    alignItems: 'center',
  },
  mainStatValue: {
    fontSize: 13,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.3,
    fontVariant: ['tabular-nums'],
  },
  mainStatLabel: {
    fontSize: 8,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 1,
    letterSpacing: 0.4,
  },
  mainStatDivider: {
    width: 1,
    height: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    marginHorizontal: 14,
  },
});
// ============ END MINI STACKED ANALYSIS CARDS ============

// Team name to abbreviation mapping (for player_props which uses full names)
const teamNameToAbbr = {
  'Atlanta Hawks': 'ATL',
  'Boston Celtics': 'BOS',
  'Brooklyn Nets': 'BKN',
  'Charlotte Hornets': 'CHA',
  'Chicago Bulls': 'CHI',
  'Cleveland Cavaliers': 'CLE',
  'Dallas Mavericks': 'DAL',
  'Denver Nuggets': 'DEN',
  'Detroit Pistons': 'DET',
  'Golden State Warriors': 'GSW',
  'Houston Rockets': 'HOU',
  'Indiana Pacers': 'IND',
  'LA Clippers': 'LAC',
  'Los Angeles Clippers': 'LAC',
  'Los Angeles Lakers': 'LAL',
  'Memphis Grizzlies': 'MEM',
  'Miami Heat': 'MIA',
  'Milwaukee Bucks': 'MIL',
  'Minnesota Timberwolves': 'MIN',
  'New Orleans Pelicans': 'NOP',
  'New York Knicks': 'NYK',
  'Oklahoma City Thunder': 'OKC',
  'Orlando Magic': 'ORL',
  'Philadelphia 76ers': 'PHI',
  'Phoenix Suns': 'PHX',
  'Portland Trail Blazers': 'POR',
  'Sacramento Kings': 'SAC',
  'San Antonio Spurs': 'SAS',
  'Toronto Raptors': 'TOR',
  'Utah Jazz': 'UTA',
  'Washington Wizards': 'WAS',
};

// Icons
const ProfileIcon = ({ size = 24, color = '#FFFFFF' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M20.59 22C20.59 18.13 16.74 15 12 15C7.26003 15 3.41003 18.13 3.41003 22"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const SendIcon = ({ size = 24, color = '#FFFFFF' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M22 2L11 13M22 2L15 22L11 13M22 2L2 8L11 13"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const BasketballIcon = ({ size = 24, color = '#FFFFFF' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20ZM12 4V20M4 12H20M8 4C8 8 6 12 4 12M16 4C16 8 18 12 20 12M8 20C8 16 6 12 4 12M16 20C16 16 18 12 20 12"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </Svg>
);

const FootballIcon = ({ size = 24, color = '#FFFFFF' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20ZM8 12L10 10L12 12L14 10L16 12"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </Svg>
);

const RobotIcon = ({ size = 24, color = '#FFFFFF' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2V4M12 4C14.2091 4 16 5.79086 16 8V10H8V8C8 5.79086 9.79086 4 12 4ZM5 10H19C20.1046 10 21 10.8954 21 12V18C21 19.1046 20.1046 20 19 20H5C3.89543 20 3 19.1046 3 18V12C3 10.8954 3.89543 10 5 10ZM9 14H9.01M15 14H15.01"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Additional Icons for InsightCards
const ChartIcon = ({ size = 20, color = '#22C55E' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 3V21H21M7 16L12 11L16 15L21 10"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const LightningIcon = ({ size = 20, color = '#22C55E' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M13 2L3 14H12L11 22L21 10H12L13 2Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const ShieldIcon = ({ size = 20, color = '#22C55E' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const CalendarIcon = ({ size = 20, color = '#22C55E' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M19 4H5C3.89543 4 3 4.89543 3 6V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V6C21 4.89543 20.1046 4 19 4Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path d="M16 2V6M8 2V6M3 10H21" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const TrophyIcon = ({ size = 20, color = '#22C55E' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M6 9C6 10.5913 6.63214 12.1174 7.75736 13.2426C8.88258 14.3679 10.4087 15 12 15C13.5913 15 15.1174 14.3679 16.2426 13.2426C17.3679 12.1174 18 10.5913 18 9M6 9V3H18V9M6 9H3C3 10.0609 3.42143 11.0783 4.17157 11.8284C4.92172 12.5786 5.93913 13 7 13H6ZM18 9H21C21 10.0609 20.5786 11.0783 19.8284 11.8284C19.0783 12.5786 18.0609 13 17 13H18ZM9 21H15M12 15V21"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const TargetIcon = ({ size = 20, color = '#22C55E' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M12 18C15.3137 18 18 15.3137 18 12C18 8.68629 15.3137 6 12 6C8.68629 6 6 8.68629 6 12C6 15.3137 8.68629 18 12 18Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M12 14C13.1046 14 14 13.1046 14 12C14 10.8954 13.1046 10 12 10C10.8954 10 10 10.8954 10 12C10 13.1046 10.8954 14 12 14Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const TrendingUpIcon = ({ size = 20, color = '#22C55E' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M23 6L13.5 15.5L8.5 10.5L1 18M23 6H17M23 6V12"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const ChevronDownIcon = ({ size = 16, color = '#22C55E' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M6 9L12 15L18 9"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const PlusIcon = ({ size = 24, color = '#FFFFFF' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 5V19M5 12H19"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const GameIcon = ({ size = 24, color = '#FFFFFF' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M4 4H20C21.1046 4 22 4.89543 22 6V18C22 19.1046 21.1046 20 20 20H4C2.89543 20 2 19.1046 2 18V6C2 4.89543 2.89543 4 4 4Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M12 4V20M2 12H22"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const ScanIcon = ({ size = 24, color = '#FFFFFF' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 7V5C3 3.89543 3.89543 3 5 3H7M17 3H19C20.1046 3 21 3.89543 21 5V7M21 17V19C21 20.1046 20.1046 21 19 21H17M7 21H5C3.89543 21 3 20.1046 3 19V17"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M7 12H17"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const CloseIcon = ({ size = 24, color = '#FFFFFF' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M18 6L6 18M6 6L18 18"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const UsersIcon = ({ size = 24, color = '#FFFFFF' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Sport configurations with league logos from Supabase
const SPORTS_CONFIG = [
  { 
    id: 'NFL', 
    label: 'NFL', 
    icon: FootballIcon, 
    logoUrl: 'https://pgtgwynrdccxmfxurcnz.supabase.co/storage/v1/object/public/leagues/7.png',
    apiUrl: 'https://propify-nfl-agent.vercel.app/api/nfl-chat-v3',  // Vercel production endpoint
    streamUrl: 'https://propify-nfl-agent.vercel.app/api/nfl-chat-v3',  // SSE streaming (same endpoint now streams)
    healthUrl: null,  // Skip health check for Vercel (assumes always up)
    supportsStreaming: true  // ✅ Enabled! Text will stream word by word
  },
  { 
    id: 'NBA', 
    label: 'NBA', 
    icon: BasketballIcon, 
    logoUrl: 'https://pgtgwynrdccxmfxurcnz.supabase.co/storage/v1/object/public/leagues/4.png',
    apiUrl: 'https://propify-nfl-agent.vercel.app/api/nba-chat-v3',  // Vercel production endpoint
    streamUrl: 'https://propify-nfl-agent.vercel.app/api/nba-chat-v3',  // SSE streaming (same endpoint now streams)
    healthUrl: null,  // Skip health check for Vercel (assumes always up)
    supportsStreaming: true  // ✅ Enabled! Text will stream word by word
  },
];

// Helper function to parse AI response text
const parseStructuredText = (text) => {
  if (!text || typeof text !== 'string') {
    return text;
  }
  let cleanedText = text.replace(/\*\*(.*?)\*\*/g, '$1');
  return cleanedText;
};

// Format AI response text with bold indicators and names
const formatAIResponseText = (text, boldStyle, normalStyle) => {
  if (!text) return null;
  
  const lines = text.split('\n');
  
  return lines.map((line, lineIndex) => {
    const trimmedLine = line.trim();
    const isBullet = trimmedLine.startsWith('*') || trimmedLine.startsWith('-') || trimmedLine.startsWith('•');
    
    if (isBullet && trimmedLine.includes(':')) {
      const bulletChar = trimmedLine[0];
      const afterBullet = trimmedLine.substring(1).trim();
      const colonIndex = afterBullet.indexOf(':');
      
      if (colonIndex > 0) {
        const labelPart = afterBullet.substring(0, colonIndex);
        const restPart = afterBullet.substring(colonIndex);
        
        return (
          <Text key={lineIndex} style={normalStyle}>
            {'  •  '}
            <Text style={boldStyle}>{labelPart}</Text>
            {restPart}
            {lineIndex < lines.length - 1 ? '\n' : ''}
          </Text>
        );
      }
    }
    
    const namePattern = /\b([A-Z][a-z]+(?:\s+[A-Z][a-z']+){1,2})\b/g;
    const parts = [];
    let lastIndex = 0;
    let match;
    
    while ((match = namePattern.exec(line)) !== null) {
      if (match.index > lastIndex) {
        parts.push({ text: line.substring(lastIndex, match.index), bold: false });
      }
      parts.push({ text: match[1], bold: true });
      lastIndex = match.index + match[0].length;
    }
    
    if (lastIndex < line.length) {
      parts.push({ text: line.substring(lastIndex), bold: false });
    }
    
    if (parts.length === 0) {
      parts.push({ text: line, bold: false });
    }
    
    return (
      <Text key={lineIndex} style={normalStyle}>
        {parts.map((part, partIndex) => 
          part.bold ? (
            <Text key={partIndex} style={boldStyle}>{part.text}</Text>
          ) : (
            part.text
          )
        )}
        {lineIndex < lines.length - 1 ? '\n' : ''}
      </Text>
    );
  });
};

// Helper function to detect which table the data came from
const detectTableType = (data) => {
  if (!data) return 'unknown';
  if (data.stat_type || data.prop_id) return 'player_props';
  // NBA tables
  if (data.guard_points_rank !== undefined || data.pace_season !== undefined) return 'team_research';
  if (data.pts_season_avg !== undefined || data.pts_last10_array !== undefined) return 'player_research_new';
  // NFL tables - detect by NFL-specific fields
  if (data.pass_yards_season_avg !== undefined || data.rush_yards_season_avg !== undefined || 
      data.rec_yards_season_avg !== undefined || data.fg_made_season_avg !== undefined) return 'nfl_player_research';
  if (data.qb_pass_yds_allowed_pg_season !== undefined || data.rb_rush_yds_allowed_pg_season !== undefined ||
      data.points_allowed_pg_season !== undefined) return 'nfl_team_research';
  return 'unknown';
};

// Helper function to determine the primary stat type from query results
const detectStatType = (playerData) => {
  if (!playerData) return 'pts';
  if (playerData.stat_type) return playerData.stat_type;
  const statTypes = ['pts', 'reb', 'ast', 'fg3m', 'pra', 'pa', 'pr', 'ra', 'stl', 'blk'];
  for (const stat of statTypes) {
    const lineKey = `${stat}_current_line`;
    if (playerData[lineKey] !== null && playerData[lineKey] !== undefined) {
      return stat;
    }
  }
  return 'pts';
};

// Parse query results into structured insights based on table type
const parsePlayerInsights = (data) => {
  if (!data) return [];
  
  const tableType = detectTableType(data);
  const insights = [];
  
  // ========== PLAYER_RESEARCH_NEW TABLE ==========
  if (tableType === 'player_research_new') {
    const statType = detectStatType(data);
    const seasonAvg = data[`${statType}_season_avg`] || 0;
    const last5Avg = data[`${statType}_last5_avg`] || 0;
    const last10Avg = data[`${statType}_last10_avg`] || 0;
    const last2Avg = data[`${statType}_last2_avg`] || 0;
    
    // Insight 1: Season Average
    if (seasonAvg > 0) {
      insights.push({
        type: 'recent_performance',
        title: 'Season Average',
        statHighlight: `${seasonAvg.toFixed(1)} ${statType.toUpperCase()}`,
        context: `${data.games_played || 0} games played`,
        variant: 'neutral',
        IconComponent: ChartIcon,
      });
    }
    
    // Insight 2: Recent Performance
    if (last5Avg > 0) {
      const trend = last5Avg > seasonAvg ? 'improving' : last5Avg < seasonAvg ? 'declining' : 'stable';
      const trendText = last5Avg > seasonAvg 
        ? `Up ${(last5Avg - seasonAvg).toFixed(1)} from season avg`
        : last5Avg < seasonAvg
        ? `Down ${(seasonAvg - last5Avg).toFixed(1)} from season avg`
        : 'Consistent with season';
      
      insights.push({
        type: 'momentum',
        title: 'Last 5 Games',
        statHighlight: `${last5Avg.toFixed(1)} avg`,
        context: trendText,
        variant: trend === 'improving' ? 'positive' : trend === 'declining' ? 'negative' : 'neutral',
        IconComponent: TrendingUpIcon,
      });
    }
    
    // Insight 3: Immediate Momentum
    if (last2Avg > 0 && last5Avg > 0) {
      const momentum = last2Avg > last5Avg ? 'accelerating' : 'cooling';
      insights.push({
        type: 'hot_cold',
        title: 'Last 2 Games',
        statHighlight: `${last2Avg.toFixed(1)} avg`,
        context: momentum === 'accelerating' ? `Hot! Up ${(last2Avg - last5Avg).toFixed(1)}` : `Cooling - down ${(last5Avg - last2Avg).toFixed(1)}`,
        variant: momentum === 'accelerating' ? 'positive' : 'negative',
        IconComponent: LightningIcon,
      });
    }
    
    // Insight 4: Floor/Ceiling
    const floor = data[`${statType}_floor_last10`];
    const ceiling = data[`${statType}_ceiling_last10`];
    if (floor !== null && floor !== undefined && ceiling) {
      insights.push({
        type: 'consistency',
        title: 'Range (Last 10)',
        statHighlight: `${floor} - ${ceiling}`,
        context: `Floor: ${floor} | Ceiling: ${ceiling}`,
        variant: 'neutral',
        IconComponent: ChartIcon,
      });
    }
    
    // Insight 5: Home vs Away
    const homeAvg = data[`${statType}_home_season_avg`];
    const awayAvg = data[`${statType}_away_season_avg`];
    if (homeAvg && awayAvg) {
      const diff = homeAvg - awayAvg;
      insights.push({
        type: 'location',
        title: 'Home/Away Split',
        statHighlight: `${homeAvg.toFixed(1)} / ${awayAvg.toFixed(1)}`,
        context: diff > 0 ? `+${diff.toFixed(1)} better at home` : `+${Math.abs(diff).toFixed(1)} better away`,
        variant: Math.abs(diff) > 2 ? (diff > 0 ? 'positive' : 'negative') : 'neutral',
        IconComponent: CalendarIcon,
      });
    }
    
    // Insight 6: Rest Day Performance
    const rest0 = data[`${statType}_0_rest_avg`];
    const rest1 = data[`${statType}_1_rest_avg`];
    const rest2plus = data[`${statType}_2plus_rest_avg`];
    if (rest0 && rest1 && rest2plus) {
      const bestRest = rest2plus >= rest1 && rest2plus >= rest0 ? '2+ days' : rest1 >= rest0 ? '1 day' : 'B2B';
      insights.push({
        type: 'rest',
        title: 'Rest Day Impact',
        statHighlight: `Best: ${bestRest}`,
        context: `B2B: ${rest0?.toFixed(1)} | 1 day: ${rest1?.toFixed(1)} | 2+: ${rest2plus?.toFixed(1)}`,
        variant: 'neutral',
        IconComponent: CalendarIcon,
      });
    }
    
    // Insight 7: Vs Opponent History
    const vsOppAvg = data[`${statType}_vs_opp_avg`];
    const vsOppHistory = data[`${statType}_vs_opp_history_array`];
    if (vsOppAvg) {
      const gamesVsOpp = vsOppHistory?.length || data.vs_opp_games_count || 0;
      insights.push({
        type: 'matchup',
        title: 'Vs Opponent History',
        statHighlight: `${vsOppAvg.toFixed(1)} avg`,
        context: `${gamesVsOpp} career games vs this team`,
        variant: vsOppAvg > seasonAvg ? 'positive' : vsOppAvg < seasonAvg ? 'negative' : 'neutral',
        IconComponent: ShieldIcon,
      });
    }
  }
  
  // ========== PLAYER_PROPS TABLE ==========
  if (tableType === 'player_props') {
    const statType = data.stat_type || 'pts';
    const currentLine = data.current_line || 0;
    
    // Insight 1: Current Line
    if (currentLine > 0) {
      const lineMove = data.line_move_points || 0;
      insights.push({
        type: 'recent_performance',
        title: `${statType.toUpperCase()} Line`,
        statHighlight: `${currentLine.toFixed(1)}`,
        context: lineMove !== 0 ? `Moved ${lineMove > 0 ? '+' : ''}${lineMove.toFixed(1)} from open` : 'No movement',
        variant: 'neutral',
        IconComponent: TargetIcon,
      });
    }
    
    // Insight 2: Hit Rate
    const hitRateLast5 = data.hit_rate_over_last5 || 0;
    const hitRateLast10 = data.hit_rate_over_last10 || 0;
    if (hitRateLast10 > 0 || hitRateLast5 > 0) {
      const hitPct = Math.round((hitRateLast10 || hitRateLast5) * 100);
      insights.push({
        type: 'hit_rate',
        title: 'Hit Rate (Over)',
        statHighlight: `${hitPct}%`,
        context: `Last 5: ${Math.round(hitRateLast5 * 100)}% | Last 10: ${Math.round(hitRateLast10 * 100)}%`,
        variant: hitPct >= 70 ? 'positive' : hitPct <= 40 ? 'negative' : 'neutral',
        IconComponent: TargetIcon,
      });
    }
    
    // Insight 3: Recent Averages
    const last5Avg = data.last5_avg || 0;
    const seasonAvg = data.season_avg || 0;
    if (last5Avg > 0) {
      const aboveLine = last5Avg > currentLine;
      insights.push({
        type: 'momentum',
        title: 'Last 5 Average',
        statHighlight: `${last5Avg.toFixed(1)}`,
        context: aboveLine ? `+${(last5Avg - currentLine).toFixed(1)} above line` : `${(last5Avg - currentLine).toFixed(1)} below line`,
        variant: aboveLine ? 'positive' : 'negative',
        IconComponent: TrendingUpIcon,
      });
    }
    
    // Insight 4: Opponent Defense
    const oppDefGrade = data.opp_def_grade;
    const oppDefRank = data.opp_def_rank;
    if (oppDefGrade || oppDefRank) {
      const isFavorable = oppDefRank >= 20;
      insights.push({
        type: 'matchup',
        title: 'Matchup',
        statHighlight: oppDefGrade || `#${oppDefRank}`,
        context: `Opponent defense rank: #${oppDefRank || 'N/A'}`,
        variant: isFavorable ? 'positive' : oppDefRank <= 10 ? 'negative' : 'neutral',
        IconComponent: ShieldIcon,
      });
    }
    
    // Insight 5: Odds
    const oddsOver = data.odds_over;
    const oddsUnder = data.odds_under;
    if (oddsOver && oddsUnder) {
      insights.push({
        type: 'odds',
        title: 'Odds',
        statHighlight: `O: ${oddsOver > 0 ? '+' : ''}${oddsOver}`,
        context: `Under: ${oddsUnder > 0 ? '+' : ''}${oddsUnder}`,
        variant: 'neutral',
        IconComponent: ChartIcon,
      });
    }
    
    // Insight 6: Vs Opponent
    const vsOppAvg = data.vs_opp_season_avg;
    const vsOppHitRate = data.vs_opp_hit_rate;
    if (vsOppAvg) {
      insights.push({
        type: 'vs_opp',
        title: 'Vs This Opponent',
        statHighlight: `${vsOppAvg.toFixed(1)} avg`,
        context: vsOppHitRate ? `${Math.round(vsOppHitRate * 100)}% hit rate vs them` : `${data.vs_opp_games || 0} career games`,
        variant: vsOppAvg > currentLine ? 'positive' : 'negative',
        IconComponent: ShieldIcon,
      });
    }
  }
  
  // ========== TEAM_RESEARCH TABLE ==========
  if (tableType === 'team_research') {
    const teamName = data.team_full_name || data.team_abbreviation || 'Team';
    
    // Insight 1: Overall Defensive Rating
    const defRtg = data.def_rtg_season;
    const defRtgRank = data.def_rtg_rank;
    if (defRtg) {
      insights.push({
        type: 'recent_performance',
        title: 'Defensive Rating',
        statHighlight: `${defRtg.toFixed(1)}`,
        context: defRtgRank ? `Ranked #${defRtgRank} in NBA` : 'Season average',
        variant: defRtgRank <= 10 ? 'positive' : defRtgRank >= 20 ? 'negative' : 'neutral',
        IconComponent: ShieldIcon,
      });
    }
    
    // Insight 2: Pace
    const pace = data.pace_season;
    if (pace) {
      const paceTrend = data.pace_l5 > data.pace_season ? 'speeding up' : 'slowing down';
      insights.push({
        type: 'pace',
        title: 'Team Pace',
        statHighlight: `${pace.toFixed(1)}`,
        context: `Last 5: ${data.pace_l5?.toFixed(1) || 'N/A'} (${paceTrend})`,
        variant: pace > 100 ? 'positive' : 'neutral',
        IconComponent: LightningIcon,
      });
    }
    
    // Insight 3: Points Allowed to Guards
    const guardPtsRank = data.guard_points_rank;
    const guardPtsGrade = data.guard_points_grade;
    if (guardPtsRank) {
      insights.push({
        type: 'guard_defense',
        title: 'Vs Guards (PTS)',
        statHighlight: guardPtsGrade || `#${guardPtsRank}`,
        context: `Rank: #${guardPtsRank} | Recent: ${data.recent_guard_pts?.toFixed(1) || 'N/A'} allowed`,
        variant: guardPtsRank <= 10 ? 'positive' : guardPtsRank >= 20 ? 'negative' : 'neutral',
        IconComponent: ShieldIcon,
      });
    }
    
    // Insight 4: Points Allowed to Forwards
    const fwdPtsRank = data.forward_points_rank;
    const fwdPtsGrade = data.forward_points_grade;
    if (fwdPtsRank) {
      insights.push({
        type: 'forward_defense',
        title: 'Vs Forwards (PTS)',
        statHighlight: fwdPtsGrade || `#${fwdPtsRank}`,
        context: `Rank: #${fwdPtsRank} | Recent: ${data.recent_forward_pts?.toFixed(1) || 'N/A'} allowed`,
        variant: fwdPtsRank <= 10 ? 'positive' : fwdPtsRank >= 20 ? 'negative' : 'neutral',
        IconComponent: ShieldIcon,
      });
    }
    
    // Insight 5: Points Allowed to Centers
    const centerPtsRank = data.center_points_rank;
    const centerPtsGrade = data.center_points_grade;
    if (centerPtsRank) {
      insights.push({
        type: 'center_defense',
        title: 'Vs Centers (PTS)',
        statHighlight: centerPtsGrade || `#${centerPtsRank}`,
        context: `Rank: #${centerPtsRank} | Recent: ${data.recent_center_pts?.toFixed(1) || 'N/A'} allowed`,
        variant: centerPtsRank <= 10 ? 'positive' : centerPtsRank >= 20 ? 'negative' : 'neutral',
        IconComponent: ShieldIcon,
      });
    }
    
    // Insight 6: Injuries
    const starsOut = data.stars_out || 0;
    const startersOut = data.starters_out || 0;
    if (starsOut > 0 || startersOut > 0) {
      insights.push({
        type: 'injuries',
        title: 'Injury Report',
        statHighlight: `${starsOut} stars out`,
        context: `${startersOut} starters out | ${data.injuries_total_count || 0} total injuries`,
        variant: starsOut >= 2 ? 'negative' : starsOut === 0 ? 'positive' : 'neutral',
        IconComponent: CalendarIcon,
      });
    }
    
    // Insight 7: Weaknesses
    const weakest1 = data.weakest_recent_1st;
    const weakest2 = data.weakest_recent_2nd;
    if (weakest1) {
      insights.push({
        type: 'weakness',
        title: 'Defensive Weakness',
        statHighlight: weakest1,
        context: weakest2 ? `Also vulnerable: ${weakest2}` : 'Primary weakness',
        variant: 'positive', // Positive for bettors targeting this team
        IconComponent: TargetIcon,
      });
    }
  }
  
  return insights;
};

// Determine if message has valuable data to visualize
const hasVisualizableData = (queryResults) => {
  return queryResults && Array.isArray(queryResults) && queryResults.length > 0;
};

// Animated Typing Indicator Component - Just the 3 dots
const TypingIndicator = ({ sport = 'NFL' }) => {
  const dot1Opacity = useRef(new Animated.Value(0.3)).current;
  const dot2Opacity = useRef(new Animated.Value(0.3)).current;
  const dot3Opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animateDot = (dotOpacity, delay) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dotOpacity, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(dotOpacity, {
            toValue: 0.3,
            duration: 400,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    animateDot(dot1Opacity, 0);
    animateDot(dot2Opacity, 150);
    animateDot(dot3Opacity, 300);
  }, []);

  return (
    <View style={styles.typingDotsOnly}>
      <Animated.View style={[styles.typingDot, { opacity: dot1Opacity }]} />
      <Animated.View style={[styles.typingDot, { opacity: dot2Opacity }]} />
      <Animated.View style={[styles.typingDot, { opacity: dot3Opacity }]} />
    </View>
  );
};

// ==============================================
// OVERVIEW-STYLE STAT COMPONENTS (from search.js)
// ==============================================

// Color constants for stat indicators
const StatColors = {
  positive: '#4ADE80',
  negative: '#EF4444',
  neutral: '#6B7280',
  orange: '#FB923C',
  blue: '#3B82F6',
};

// Section Header Component
const SectionHeader = ({ title, subtitle }) => (
  <View style={overviewStatStyles.sectionHeader}>
    <Text style={overviewStatStyles.sectionTitle}>{title}</Text>
    {subtitle && <Text style={overviewStatStyles.sectionSubtitle}>{subtitle}</Text>}
    <View style={overviewStatStyles.sectionDivider} />
  </View>
);

// StatRow - Season vs Recent comparison with trend indicator
const StatRow = ({ label, seasonValue, recentValue, recentLabel = 'L5', isLowerBetter = false }) => {
  const season = parseFloat(seasonValue) || 0;
  const recent = parseFloat(recentValue) || 0;
  const diff = recent - season;
  const diffPercent = season !== 0 ? ((diff / season) * 100) : 0;
  
  const isSignificant = Math.abs(diffPercent) >= 3 || Math.abs(diff) >= 0.5;
  const isImproving = isLowerBetter ? (diff < 0) : (diff > 0);
  
  const getUnderlineColor = () => {
    if (!isSignificant) return StatColors.neutral;
    return isImproving ? StatColors.positive : StatColors.negative;
  };

  const formatValue = (val) => {
    if (val === null || val === undefined || isNaN(parseFloat(val))) return '--';
    return parseFloat(val).toFixed(1);
  };

  const formatDiff = (val) => {
    const sign = val > 0 ? '+' : '';
    return `${sign}${val.toFixed(1)}`;
  };

  if (seasonValue === null && recentValue === null) return null;

  return (
    <View style={overviewStatStyles.statRow}>
      <View style={overviewStatStyles.statSide}>
        <Text style={overviewStatStyles.statSideLabel}>Season</Text>
        <Text style={overviewStatStyles.statValue}>{formatValue(season)}</Text>
        <View style={[overviewStatStyles.statUnderline, { backgroundColor: StatColors.neutral }]} />
      </View>
      
      <View style={overviewStatStyles.statCenter}>
        <Text style={overviewStatStyles.statLabel}>{label}</Text>
        {isSignificant && (
          <View style={[overviewStatStyles.diffBadge, { backgroundColor: `${getUnderlineColor()}20` }]}>
            <Text style={[overviewStatStyles.diffText, { color: getUnderlineColor() }]}>
              {formatDiff(diff)}
            </Text>
          </View>
        )}
      </View>
      
      <View style={overviewStatStyles.statSide}>
        <Text style={overviewStatStyles.statSideLabel}>{recentLabel}</Text>
        <Text style={[overviewStatStyles.statValue, isSignificant && { color: getUnderlineColor() }]}>
          {formatValue(recent)}
        </Text>
        <View style={[overviewStatStyles.statUnderline, { backgroundColor: getUnderlineColor() }]} />
      </View>
    </View>
  );
};

// Simple Stat Row - just label and value
const SimpleStatRow = ({ label, value, suffix = '', isText = false }) => {
  const formatValue = (val) => {
    if (val === null || val === undefined) return '--';
    if (isText || (typeof val === 'string' && isNaN(parseFloat(val)))) {
      return String(val) + suffix;
    }
    const num = parseFloat(val);
    if (isNaN(num)) return '--';
    return num.toFixed(1) + suffix;
  };

  return (
    <View style={overviewStatStyles.simpleStatRow}>
      <Text style={overviewStatStyles.simpleStatLabel}>{label}</Text>
      <Text style={overviewStatStyles.simpleStatValue}>{formatValue(value)}</Text>
    </View>
  );
};

// Three Column Stat Row - for Rest Day splits (0, 1, 2+ days)
const ThreeColumnStatRow = ({ label, value0, value1, value2plus }) => {
  const formatValue = (val) => {
    if (val === null || val === undefined || isNaN(parseFloat(val))) return '--';
    return parseFloat(val).toFixed(1);
  };

  return (
    <View style={overviewStatStyles.threeColumnRow}>
      <View style={overviewStatStyles.threeColumnSide}>
        <Text style={overviewStatStyles.statSideLabel}>B2B</Text>
        <Text style={overviewStatStyles.statValue}>{formatValue(value0)}</Text>
        <View style={[overviewStatStyles.statUnderline, { backgroundColor: StatColors.neutral }]} />
      </View>
      
      <View style={overviewStatStyles.threeColumnCenter}>
        <Text style={overviewStatStyles.statLabel}>{label}</Text>
      </View>
      
      <View style={overviewStatStyles.threeColumnSide}>
        <Text style={overviewStatStyles.statSideLabel}>1 Day</Text>
        <Text style={overviewStatStyles.statValue}>{formatValue(value1)}</Text>
        <View style={[overviewStatStyles.statUnderline, { backgroundColor: StatColors.neutral }]} />
      </View>
      
      <View style={overviewStatStyles.threeColumnSide}>
        <Text style={overviewStatStyles.statSideLabel}>2+ Days</Text>
        <Text style={overviewStatStyles.statValue}>{formatValue(value2plus)}</Text>
        <View style={[overviewStatStyles.statUnderline, { backgroundColor: StatColors.positive }]} />
      </View>
    </View>
  );
};

// Home/Away Split Row
const HomeAwaySplitRow = ({ label, homeValue, awayValue }) => {
  const home = parseFloat(homeValue) || 0;
  const away = parseFloat(awayValue) || 0;
  const diff = home - away;
  
  const homeColor = diff > 0.5 ? StatColors.positive : (diff < -0.5 ? StatColors.negative : StatColors.neutral);
  const awayColor = diff < -0.5 ? StatColors.positive : (diff > 0.5 ? StatColors.negative : StatColors.neutral);

  const formatValue = (val) => {
    if (val === null || val === undefined || isNaN(parseFloat(val))) return '--';
    return parseFloat(val).toFixed(1);
  };

  return (
    <View style={overviewStatStyles.statRow}>
      <View style={overviewStatStyles.statSide}>
        <Text style={overviewStatStyles.statSideLabel}>Home</Text>
        <Text style={[overviewStatStyles.statValue, { color: homeColor === StatColors.neutral ? '#FFFFFF' : homeColor }]}>
          {formatValue(home)}
        </Text>
        <View style={[overviewStatStyles.statUnderline, { backgroundColor: homeColor }]} />
      </View>
      
      <View style={overviewStatStyles.statCenter}>
        <Text style={overviewStatStyles.statLabel}>{label}</Text>
      </View>
      
      <View style={overviewStatStyles.statSide}>
        <Text style={overviewStatStyles.statSideLabel}>Away</Text>
        <Text style={[overviewStatStyles.statValue, { color: awayColor === StatColors.neutral ? '#FFFFFF' : awayColor }]}>
          {formatValue(away)}
        </Text>
        <View style={[overviewStatStyles.statUnderline, { backgroundColor: awayColor }]} />
      </View>
    </View>
  );
};

// Floor/Ceiling Row
const FloorCeilingRow = ({ label, floorValue, ceilingValue }) => {
  const formatValue = (val) => {
    if (val === null || val === undefined || isNaN(parseInt(val))) return '--';
    return parseInt(val);
  };

  return (
    <View style={overviewStatStyles.statRow}>
      <View style={overviewStatStyles.statSide}>
        <Text style={overviewStatStyles.statSideLabel}>Floor</Text>
        <Text style={[overviewStatStyles.statValue, { color: StatColors.negative }]}>
          {formatValue(floorValue)}
        </Text>
        <View style={[overviewStatStyles.statUnderline, { backgroundColor: StatColors.negative }]} />
      </View>
      
      <View style={overviewStatStyles.statCenter}>
        <Text style={overviewStatStyles.statLabel}>{label}</Text>
      </View>
      
      <View style={overviewStatStyles.statSide}>
        <Text style={overviewStatStyles.statSideLabel}>Ceiling</Text>
        <Text style={[overviewStatStyles.statValue, { color: StatColors.positive }]}>
          {formatValue(ceilingValue)}
        </Text>
        <View style={[overviewStatStyles.statUnderline, { backgroundColor: StatColors.positive }]} />
      </View>
    </View>
  );
};

// Overview Stats Styles
const overviewStatStyles = StyleSheet.create({
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  threeColumnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  statSide: {
    flex: 1,
    alignItems: 'center',
  },
  threeColumnSide: {
    flex: 0.8,
    alignItems: 'center',
  },
  threeColumnCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statSideLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  statCenter: {
    flex: 1.2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
    letterSpacing: -0.2,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 4,
  },
  statUnderline: {
    height: 3,
    width: '85%',
    borderRadius: 2,
  },
  diffBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    alignItems: 'center',
  },
  diffText: {
    fontSize: 11,
    fontWeight: '700',
  },
  simpleStatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(74, 222, 128, 0.1)',
  },
  simpleStatLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#9CA3AF',
  },
  simpleStatValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#4ADE80',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  sectionSubtitle: {
    fontSize: 11,
    fontWeight: '500',
    color: '#6B7280',
    marginTop: 2,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: 'rgba(74, 222, 128, 0.3)',
    marginTop: 8,
  },
});

// Player Overview Stats Component - renders overview-style stats for player data
const PlayerOverviewStats = React.memo(({ playerData }) => {
  if (!playerData) return null;
  
  const player = playerData;
  
  return (
    <View style={{ paddingBottom: 8 }}>
      {/* Player Identity Section */}
      <SectionHeader title="Player Info" />
      <SimpleStatRow label="Position" value={player.position} isText={true} />
      <SimpleStatRow label="Functional Position" value={player.functional_position} isText={true} />
      <SimpleStatRow label="Starter" value={player.is_starter ? 'Yes' : 'No'} isText={true} />
      <SimpleStatRow label="Season" value={player.season} isText={true} />
      <SimpleStatRow label="Games Played" value={player.games_played} />
      
      {/* Role & Usage Section */}
      <SectionHeader title="Role & Usage" subtitle="Season averages" />
      <StatRow 
        label="Minutes" 
        seasonValue={player.minutes_season_avg} 
        recentValue={player.minutes_last5_avg}
        recentLabel="L5"
      />
      <SimpleStatRow label="Usage Rate" value={player.usage_rate_season ? (player.usage_rate_season * 100) : null} suffix="%" />
      
      {/* Headline Stats Section */}
      <SectionHeader title="Headline Stats" subtitle="Season averages" />
      <StatRow 
        label="Points" 
        seasonValue={player.pts_season_avg} 
        recentValue={player.pts_last5_avg}
        recentLabel="L5"
      />
      <StatRow 
        label="Rebounds" 
        seasonValue={player.reb_season_avg} 
        recentValue={player.reb_last5_avg}
        recentLabel="L5"
      />
      <StatRow 
        label="Assists" 
        seasonValue={player.ast_season_avg} 
        recentValue={player.ast_last5_avg}
        recentLabel="L5"
      />
      
      {/* Scoring Deep Dive */}
      <SectionHeader title="Scoring Trends" subtitle="Recent form" />
      <StatRow label="Season vs L2" seasonValue={player.pts_season_avg} recentValue={player.pts_last2_avg} recentLabel="L2" />
      <StatRow label="Season vs L10" seasonValue={player.pts_season_avg} recentValue={player.pts_last10_avg} recentLabel="L10" />
      <FloorCeilingRow label="PTS Range (L10)" floorValue={player.pts_floor_last10} ceilingValue={player.pts_ceiling_last10} />
      <HomeAwaySplitRow label="PTS Split" homeValue={player.pts_home_season_avg} awayValue={player.pts_away_season_avg} />
      <SimpleStatRow label="vs Opponent Avg" value={player.pts_vs_opp_avg} />
      
      {/* Rest Day Performance */}
      <SectionHeader title="Rest Day Impact" subtitle="Back-to-back vs rested" />
      <ThreeColumnStatRow label="PTS" value0={player.pts_0_rest_avg} value1={player.pts_1_rest_avg} value2plus={player.pts_2plus_rest_avg} />
      <ThreeColumnStatRow label="REB" value0={player.reb_0_rest_avg} value1={player.reb_1_rest_avg} value2plus={player.reb_2plus_rest_avg} />
      <ThreeColumnStatRow label="AST" value0={player.ast_0_rest_avg} value1={player.ast_1_rest_avg} value2plus={player.ast_2plus_rest_avg} />
      
      {/* Rebounds Section */}
      <SectionHeader title="Rebounds" subtitle="Season vs Recent" />
      <StatRow label="Season vs L2" seasonValue={player.reb_season_avg} recentValue={player.reb_last2_avg} recentLabel="L2" />
      <StatRow label="Season vs L10" seasonValue={player.reb_season_avg} recentValue={player.reb_last10_avg} recentLabel="L10" />
      <FloorCeilingRow label="REB Range (L10)" floorValue={player.reb_floor_last10} ceilingValue={player.reb_ceiling_last10} />
      <HomeAwaySplitRow label="REB Split" homeValue={player.reb_home_season_avg} awayValue={player.reb_away_season_avg} />
      <SimpleStatRow label="vs Opponent Avg" value={player.reb_vs_opp_avg} />
      
      {/* Assists Section */}
      <SectionHeader title="Assists" subtitle="Season vs Recent" />
      <StatRow label="Season vs L2" seasonValue={player.ast_season_avg} recentValue={player.ast_last2_avg} recentLabel="L2" />
      <StatRow label="Season vs L10" seasonValue={player.ast_season_avg} recentValue={player.ast_last10_avg} recentLabel="L10" />
      <FloorCeilingRow label="AST Range (L10)" floorValue={player.ast_floor_last10} ceilingValue={player.ast_ceiling_last10} />
      <HomeAwaySplitRow label="AST Split" homeValue={player.ast_home_season_avg} awayValue={player.ast_away_season_avg} />
      <SimpleStatRow label="vs Opponent Avg" value={player.ast_vs_opp_avg} />
      
      {/* Defense (Steals & Blocks) */}
      <SectionHeader title="Defense" subtitle="Steals & Blocks" />
      <StatRow label="Steals" seasonValue={player.stl_season_avg} recentValue={player.stl_last5_avg} recentLabel="L5" />
      <StatRow label="Blocks" seasonValue={player.blk_season_avg} recentValue={player.blk_last5_avg} recentLabel="L5" />
      
      {/* Combo Stats */}
      <SectionHeader title="Combo Stats" subtitle="Combined totals" />
      <StatRow label="PRA" seasonValue={player.pra_season_avg} recentValue={player.pra_last5_avg} recentLabel="L5" />
      <StatRow label="Points + Assists" seasonValue={player.pa_season_avg} recentValue={player.pa_last5_avg} recentLabel="L5" />
      <StatRow label="Points + Rebounds" seasonValue={player.pr_season_avg} recentValue={player.pr_last5_avg} recentLabel="L5" />
      <StatRow label="Rebounds + Assists" seasonValue={player.ra_season_avg} recentValue={player.ra_last5_avg} recentLabel="L5" />
      
      {/* Efficiency */}
      <SectionHeader title="Efficiency" subtitle="Shooting percentages" />
      <SimpleStatRow label="True Shooting %" value={player.ts_pct_season ? (player.ts_pct_season * 100) : null} suffix="%" />
      <SimpleStatRow label="Effective FG %" value={player.efg_pct_season ? (player.efg_pct_season * 100) : null} suffix="%" />
      <SimpleStatRow label="Field Goal %" value={player.fg_pct_season ? (player.fg_pct_season * 100) : null} suffix="%" />
      <SimpleStatRow label="3-Point %" value={player.fg3_pct_season ? (player.fg3_pct_season * 100) : null} suffix="%" />
      <SimpleStatRow label="Free Throw %" value={player.ft_pct_season ? (player.ft_pct_season * 100) : null} suffix="%" />
      
      {/* Three Pointers */}
      <SectionHeader title="Three Pointers" subtitle="Season vs Recent" />
      <StatRow label="3PM" seasonValue={player.fg3m_season_avg} recentValue={player.fg3m_last5_avg} recentLabel="L5" />
      <FloorCeilingRow label="3PM Range (L10)" floorValue={player.fg3m_floor_last10} ceilingValue={player.fg3m_ceiling_last10} />
      <HomeAwaySplitRow label="3PM Split" homeValue={player.fg3m_home_season_avg} awayValue={player.fg3m_away_season_avg} />
      
      {/* Next Opponent Section */}
      {player.next_opponent && (
        <>
          <SectionHeader title="Next Opponent" />
          <View style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
            <View style={{ 
              backgroundColor: 'rgba(74, 222, 128, 0.15)', 
              paddingVertical: 10, 
              paddingHorizontal: 16, 
              borderRadius: 8,
              borderWidth: 1,
              borderColor: 'rgba(74, 222, 128, 0.3)',
              alignItems: 'center',
            }}>
              <Text style={{ color: '#4ADE80', fontSize: 15, fontWeight: '700' }}>vs {player.next_opponent}</Text>
            </View>
          </View>
        </>
      )}
    </View>
  );
});

// ==============================================
// TEAM PROFILE COMPONENTS (from search.js)
// ==============================================

// Helper function to get grade color
const getGradeColor = (grade) => {
  if (!grade) return '#888';
  switch (grade) {
    case 'A+': case 'A': return '#4ADE80';
    case 'A-': case 'B+': return '#6EE7B7';
    case 'B': case 'B-': return '#FCD34D';
    case 'C+': case 'C': return '#FB923C';
    case 'C-': case 'D+': case 'D': return '#F87171';
    case 'D-': case 'F': return '#EF4444';
    default: return '#888';
  }
};

// Helper to format rank
const formatRank = (val) => val != null ? `#${val}` : '--';

// Team Defense Grade Row Component
const TeamDefenseGradeRow = ({ label, grade, rank, value, valueLabel }) => (
  <View style={teamDefenseStyles.row}>
    <Text style={teamDefenseStyles.label}>{label}</Text>
    <View style={teamDefenseStyles.gradeContainer}>
      <Text style={[teamDefenseStyles.grade, { color: getGradeColor(grade) }]}>{grade || '--'}</Text>
      <Text style={teamDefenseStyles.rank}>#{rank || '--'}</Text>
      {value !== undefined && (
        <Text style={teamDefenseStyles.value}>{Number(value)?.toFixed(1) || '--'} {valueLabel}</Text>
      )}
    </View>
  </View>
);

// Suppression Row Component
const SuppressionRow = ({ label, value, isPositiveGood = false }) => {
  const numValue = parseFloat(value) || 0;
  const isGood = isPositiveGood ? numValue > 0 : numValue < 0;
  const color = Math.abs(numValue) < 0.5 ? '#6B7280' : (isGood ? '#4ADE80' : '#EF4444');
  
  return (
    <View style={teamDefenseStyles.row}>
      <Text style={teamDefenseStyles.label}>{label}</Text>
      <Text style={[teamDefenseStyles.suppressionValue, { color }]}>
        {numValue > 0 ? '+' : ''}{numValue.toFixed(2)}
      </Text>
    </View>
  );
};

// Injury Player Row Component
const InjuryPlayerRow = ({ player, injury, position, status }) => {
  const isOut = status === 'Out';
  const statusColor = isOut ? '#EF4444' : '#FCD34D';
  
  return (
    <View style={teamDefenseStyles.injuryRowClean}>
      <View style={teamDefenseStyles.injuryLeftSide}>
        <View>
          <Text style={teamDefenseStyles.injuryPlayerNameClean}>{player}</Text>
          <Text style={teamDefenseStyles.injuryDescriptionClean}>{injury}</Text>
        </View>
      </View>
      <View style={teamDefenseStyles.injuryRightSide}>
        <Text style={[teamDefenseStyles.injuryPositionClean, { borderColor: statusColor }]}>{position}</Text>
        <Text style={[teamDefenseStyles.injuryStatusClean, { color: statusColor }]}>
          {isOut ? 'OUT' : 'DTD'}
        </Text>
      </View>
    </View>
  );
};

// Strength/Weakness Row Component
const StrengthWeaknessRow = ({ label, value, isStrong }) => (
  <View style={teamDefenseStyles.row}>
    <Text style={teamDefenseStyles.label}>{label}</Text>
    <View style={[teamDefenseStyles.strengthBadge, { backgroundColor: isStrong ? 'rgba(74, 222, 128, 0.15)' : 'rgba(239, 68, 68, 0.15)' }]}>
      <Text style={[teamDefenseStyles.strengthText, { color: isStrong ? '#4ADE80' : '#EF4444' }]}>
        {value || '--'}
      </Text>
    </View>
  </View>
);

// Team Defense Styles
const teamDefenseStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(74, 222, 128, 0.1)',
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    color: '#9CA3AF',
    flex: 1,
  },
  gradeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  grade: {
    fontSize: 18,
    fontWeight: '900',
    minWidth: 30,
    textAlign: 'center',
  },
  rank: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    minWidth: 30,
  },
  value: {
    fontSize: 11,
    fontWeight: '500',
    color: '#A7F3D0',
    minWidth: 80,
    textAlign: 'right',
  },
  suppressionValue: {
    fontSize: 15,
    fontWeight: '700',
  },
  strengthBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  strengthText: {
    fontSize: 12,
    fontWeight: '700',
  },
  injuryRowClean: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(74, 222, 128, 0.1)',
  },
  injuryLeftSide: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  injuryPlayerNameClean: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  injuryDescriptionClean: {
    fontSize: 12,
    fontWeight: '500',
    color: '#9CA3AF',
  },
  injuryRightSide: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  injuryPositionClean: {
    fontSize: 12,
    fontWeight: '600',
    color: '#A7F3D0',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  injuryStatusClean: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
    minWidth: 35,
    textAlign: 'right',
  },
  noInjuriesContainer: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  noInjuriesText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4ADE80',
  },
});

// Team Overview Stats Component - renders all team tabs as vertical collapsible sections
const TeamOverviewStats = React.memo(({ teamData }) => {
  if (!teamData) return null;
  
  const team = teamData;
  
  // Parse injuries_report for injury tab
  const injuryReport = team.injuries_report || [];
  const playersOut = injuryReport.filter(p => p.status === 'Out');
  const playersDTD = injuryReport.filter(p => p.status === 'Day-to-day');
  
  return (
    <View style={{ paddingBottom: 8 }}>
      {/* INJURIES TAB */}
      <CollapsibleDataSection title="Injuries" IconComponent={ShieldIcon} defaultExpanded={false}>
        <View style={{ paddingBottom: 8 }}>
          {/* Players OUT */}
          {playersOut.length > 0 && (
            <>
              <SectionHeader title="Players OUT" subtitle="Confirmed out" />
              {playersOut.map((player, idx) => (
                <InjuryPlayerRow 
                  key={`out-${idx}`}
                  player={player.player}
                  injury={player.injury}
                  position={player.position}
                  status="Out"
                />
              ))}
            </>
          )}
          
          {/* Day-to-Day */}
          {playersDTD.length > 0 && (
            <>
              <SectionHeader title="Day-to-Day" subtitle="Game-time decisions" />
              {playersDTD.map((player, idx) => (
                <InjuryPlayerRow 
                  key={`dtd-${idx}`}
                  player={player.player}
                  injury={player.injury}
                  position={player.position}
                  status="DTD"
                />
              ))}
            </>
          )}
          
          {/* No injuries message */}
          {injuryReport.length === 0 && (
            <View style={teamDefenseStyles.noInjuriesContainer}>
              <Text style={teamDefenseStyles.noInjuriesText}>✓ No players on injury report</Text>
            </View>
          )}
          
          {/* By Position */}
          <SectionHeader title="By Position" subtitle="Injuries by position group" />
          <SimpleStatRow label="Guards Out" value={team.injuries_guards_out ?? 0} />
          <SimpleStatRow label="Forwards Out" value={team.injuries_forwards_out ?? 0} />
          <SimpleStatRow label="Centers Out" value={team.injuries_centers_out ?? 0} />
          
          {/* Injury Summary */}
          <SectionHeader title="Injury Summary" subtitle="Current team injury status" />
          <SimpleStatRow label="Stars Out" value={team.stars_out ?? 0} />
          <SimpleStatRow label="Starters Out" value={team.starters_out ?? 0} />
          <SimpleStatRow label="Total on Injury Report" value={team.injuries_total_count ?? 0} />
          <SimpleStatRow label="Players OUT" value={team.injuries_out_count ?? 0} />
          <SimpleStatRow label="Players Day-to-Day" value={team.injuries_dtd_count ?? 0} />
        </View>
      </CollapsibleDataSection>

      {/* PACE TAB */}
      <CollapsibleDataSection title="Pace" IconComponent={LightningIcon} defaultExpanded={false}>
        <View style={{ paddingBottom: 8 }}>
          <SectionHeader title="Season Pace" subtitle="Possessions per 48 minutes" />
          <SimpleStatRow label="Season Average" value={team.pace_season} />
          <StatRow label="Season vs L3" seasonValue={team.pace_season} recentValue={team.pace_l3} recentLabel="L3" />
          <StatRow label="Season vs L5" seasonValue={team.pace_season} recentValue={team.pace_l5} recentLabel="L5" />
          <StatRow label="Season vs L10" seasonValue={team.pace_season} recentValue={team.pace_l10} recentLabel="L10" />
          
          <SectionHeader title="Home Pace" subtitle="Home game pace trends" />
          <SimpleStatRow label="Home Season" value={team.pace_home} />
          <StatRow label="Home vs L3" seasonValue={team.pace_home} recentValue={team.pace_home_l3} recentLabel="L3" />
          <StatRow label="Home vs L5" seasonValue={team.pace_home} recentValue={team.pace_home_l5} recentLabel="L5" />
          
          <SectionHeader title="Away Pace" subtitle="Road game pace trends" />
          <SimpleStatRow label="Away Season" value={team.pace_away} />
          <StatRow label="Away vs L3" seasonValue={team.pace_away} recentValue={team.pace_away_l3} recentLabel="L3" />
          <StatRow label="Away vs L5" seasonValue={team.pace_away} recentValue={team.pace_away_l5} recentLabel="L5" />
          
          <SectionHeader title="Home vs Away Split" />
          <HomeAwaySplitRow label="Pace Split" homeValue={team.pace_home} awayValue={team.pace_away} />
        </View>
      </CollapsibleDataSection>

      {/* GUARDS DEFENSE TAB */}
      <CollapsibleDataSection title="Guards Defense" IconComponent={ShieldIcon} defaultExpanded={false}>
        <View style={{ paddingBottom: 8 }}>
          <SectionHeader title="Points Defense" subtitle="vs Guards (PG/SG)" />
          <TeamDefenseGradeRow label="Points" grade={team.guard_points_grade} rank={team.guard_points_rank} value={team.guard_points_prevented} valueLabel="Prevented" />
          
          <SectionHeader title="Rebounds Defense" />
          <TeamDefenseGradeRow label="Rebounds" grade={team.guard_rebounds_grade} rank={team.guard_rebounds_rank} value={team.guard_rebounds_prevented} valueLabel="Prevented" />
          
          <SectionHeader title="Assists Defense" />
          <TeamDefenseGradeRow label="Assists" grade={team.guard_assists_grade} rank={team.guard_assists_rank} value={team.guard_assists_prevented} valueLabel="Prevented" />
          
          <SectionHeader title="Shooting Defense" />
          <TeamDefenseGradeRow label="3-Pointers" grade={team.guard_threes_grade} rank={team.guard_threes_rank} value={team.guard_threes_allowed} valueLabel="Allowed" />
          <TeamDefenseGradeRow label="Field Goals" grade={team.guard_field_goals_grade} rank={team.guard_field_goals_rank} value={team.guard_field_goals_allowed} valueLabel="Allowed" />
          <TeamDefenseGradeRow label="Free Throws" grade={team.guard_ftm_grade} rank={team.guard_ftm_rank} value={team.guard_ftm_prevented} valueLabel="Prevented" />
          
          <SectionHeader title="Volume Defense" />
          <TeamDefenseGradeRow label="FG Attempts" grade={team.guard_fga_grade} rank={team.guard_fga_rank} value={team.guard_fga_prevented} valueLabel="Prevented" />
          <TeamDefenseGradeRow label="3PT Attempts" grade={team.guard_fg3a_grade} rank={team.guard_fg3a_rank} value={team.guard_fg3a_prevented} valueLabel="Prevented" />
          
          <SectionHeader title="Other Stats" />
          <TeamDefenseGradeRow label="Steals Allowed" grade={team.guard_steals_grade} rank={team.guard_steals_rank} value={team.guard_steals_allowed} valueLabel="Allowed" />
          <TeamDefenseGradeRow label="Blocks Allowed" grade={team.guard_blocks_grade} rank={team.guard_blocks_rank} value={team.guard_blocks_allowed} valueLabel="Allowed" />
          <TeamDefenseGradeRow label="Turnovers Forced" grade={team.guard_turnovers_grade} rank={team.guard_turnovers_rank} value={team.guard_turnovers_forced} valueLabel="Forced" />
          
          <SectionHeader title="Combo Stats Defense" />
          <TeamDefenseGradeRow label="PRA" grade={team.guard_pra_grade} rank={team.guard_pra_rank} />
          <TeamDefenseGradeRow label="PR (Pts+Reb)" grade={team.guard_pr_grade} rank={team.guard_pr_rank} />
          <TeamDefenseGradeRow label="PA (Pts+Ast)" grade={team.guard_pa_grade} rank={team.guard_pa_rank} />
          <TeamDefenseGradeRow label="RA (Reb+Ast)" grade={team.guard_ra_grade} rank={team.guard_ra_rank} />
        </View>
      </CollapsibleDataSection>

      {/* FORWARDS DEFENSE TAB */}
      <CollapsibleDataSection title="Forwards Defense" IconComponent={ShieldIcon} defaultExpanded={false}>
        <View style={{ paddingBottom: 8 }}>
          <SectionHeader title="Points Defense" subtitle="vs Forwards (SF/PF)" />
          <TeamDefenseGradeRow label="Points" grade={team.forward_points_grade} rank={team.forward_points_rank} value={team.forward_points_prevented} valueLabel="Prevented" />
          
          <SectionHeader title="Rebounds Defense" />
          <TeamDefenseGradeRow label="Rebounds" grade={team.forward_rebounds_grade} rank={team.forward_rebounds_rank} value={team.forward_rebounds_prevented} valueLabel="Prevented" />
          
          <SectionHeader title="Assists Defense" />
          <TeamDefenseGradeRow label="Assists" grade={team.forward_assists_grade} rank={team.forward_assists_rank} value={team.forward_assists_prevented} valueLabel="Prevented" />
          
          <SectionHeader title="Shooting Defense" />
          <TeamDefenseGradeRow label="3-Pointers" grade={team.forward_threes_grade} rank={team.forward_threes_rank} value={team.forward_threes_allowed} valueLabel="Allowed" />
          <TeamDefenseGradeRow label="Field Goals" grade={team.forward_field_goals_grade} rank={team.forward_field_goals_rank} value={team.forward_field_goals_allowed} valueLabel="Allowed" />
          <TeamDefenseGradeRow label="Free Throws" grade={team.forward_ftm_grade} rank={team.forward_ftm_rank} value={team.forward_ftm_prevented} valueLabel="Prevented" />
          
          <SectionHeader title="Volume Defense" />
          <TeamDefenseGradeRow label="FG Attempts" grade={team.forward_fga_grade} rank={team.forward_fga_rank} value={team.forward_fga_prevented} valueLabel="Prevented" />
          <TeamDefenseGradeRow label="3PT Attempts" grade={team.forward_fg3a_grade} rank={team.forward_fg3a_rank} value={team.forward_fg3a_prevented} valueLabel="Prevented" />
          
          <SectionHeader title="Other Stats" />
          <TeamDefenseGradeRow label="Steals Allowed" grade={team.forward_steals_grade} rank={team.forward_steals_rank} value={team.forward_steals_allowed} valueLabel="Allowed" />
          <TeamDefenseGradeRow label="Blocks Allowed" grade={team.forward_blocks_grade} rank={team.forward_blocks_rank} value={team.forward_blocks_allowed} valueLabel="Allowed" />
          <TeamDefenseGradeRow label="Turnovers Forced" grade={team.forward_turnovers_grade} rank={team.forward_turnovers_rank} value={team.forward_turnovers_forced} valueLabel="Forced" />
          
          <SectionHeader title="Combo Stats Defense" />
          <TeamDefenseGradeRow label="PRA" grade={team.forward_pra_grade} rank={team.forward_pra_rank} />
          <TeamDefenseGradeRow label="PR (Pts+Reb)" grade={team.forward_pr_grade} rank={team.forward_pr_rank} />
          <TeamDefenseGradeRow label="PA (Pts+Ast)" grade={team.forward_pa_grade} rank={team.forward_pa_rank} />
          <TeamDefenseGradeRow label="RA (Reb+Ast)" grade={team.forward_ra_grade} rank={team.forward_ra_rank} />
        </View>
      </CollapsibleDataSection>

      {/* CENTERS DEFENSE TAB */}
      <CollapsibleDataSection title="Centers Defense" IconComponent={ShieldIcon} defaultExpanded={false}>
        <View style={{ paddingBottom: 8 }}>
          <SectionHeader title="Points Defense" subtitle="vs Centers (C)" />
          <TeamDefenseGradeRow label="Points" grade={team.center_points_grade} rank={team.center_points_rank} value={team.center_points_prevented} valueLabel="Prevented" />
          
          <SectionHeader title="Rebounds Defense" />
          <TeamDefenseGradeRow label="Rebounds" grade={team.center_rebounds_grade} rank={team.center_rebounds_rank} value={team.center_rebounds_prevented} valueLabel="Prevented" />
          
          <SectionHeader title="Assists Defense" />
          <TeamDefenseGradeRow label="Assists" grade={team.center_assists_grade} rank={team.center_assists_rank} value={team.center_assists_prevented} valueLabel="Prevented" />
          
          <SectionHeader title="Shooting Defense" />
          <TeamDefenseGradeRow label="3-Pointers" grade={team.center_threes_grade} rank={team.center_threes_rank} value={team.center_threes_allowed} valueLabel="Allowed" />
          <TeamDefenseGradeRow label="Field Goals" grade={team.center_field_goals_grade} rank={team.center_field_goals_rank} value={team.center_field_goals_allowed} valueLabel="Allowed" />
          <TeamDefenseGradeRow label="Free Throws" grade={team.center_ftm_grade} rank={team.center_ftm_rank} value={team.center_ftm_prevented} valueLabel="Prevented" />
          
          <SectionHeader title="Volume Defense" />
          <TeamDefenseGradeRow label="FG Attempts" grade={team.center_fga_grade} rank={team.center_fga_rank} value={team.center_fga_prevented} valueLabel="Prevented" />
          <TeamDefenseGradeRow label="3PT Attempts" grade={team.center_fg3a_grade} rank={team.center_fg3a_rank} value={team.center_fg3a_prevented} valueLabel="Prevented" />
          
          <SectionHeader title="Other Stats" />
          <TeamDefenseGradeRow label="Steals Allowed" grade={team.center_steals_grade} rank={team.center_steals_rank} value={team.center_steals_allowed} valueLabel="Allowed" />
          <TeamDefenseGradeRow label="Blocks Allowed" grade={team.center_blocks_grade} rank={team.center_blocks_rank} value={team.center_blocks_allowed} valueLabel="Allowed" />
          <TeamDefenseGradeRow label="Turnovers Forced" grade={team.center_turnovers_grade} rank={team.center_turnovers_rank} value={team.center_turnovers_forced} valueLabel="Forced" />
          
          <SectionHeader title="Combo Stats Defense" />
          <TeamDefenseGradeRow label="PRA" grade={team.center_pra_grade} rank={team.center_pra_rank} />
          <TeamDefenseGradeRow label="PR (Pts+Reb)" grade={team.center_pr_grade} rank={team.center_pr_rank} />
          <TeamDefenseGradeRow label="PA (Pts+Ast)" grade={team.center_pa_grade} rank={team.center_pa_rank} />
          <TeamDefenseGradeRow label="RA (Reb+Ast)" grade={team.center_ra_grade} rank={team.center_ra_rank} />
        </View>
      </CollapsibleDataSection>

      {/* DEF RATING TAB */}
      <CollapsibleDataSection title="Defensive Rating" IconComponent={ShieldIcon} defaultExpanded={false}>
        <View style={{ paddingBottom: 8 }}>
          <SectionHeader title="Defensive Rating" subtitle="Points allowed per 100 possessions" />
          <SimpleStatRow label="Season DEF RTG" value={team.def_rtg_season} />
          <SimpleStatRow label="DEF RTG Rank" value={formatRank(team.def_rtg_rank)} isText={true} />
          <StatRow label="Season vs L3" seasonValue={team.def_rtg_season} recentValue={team.def_rtg_l3} recentLabel="L3" isLowerBetter={true} />
          <StatRow label="Season vs L5" seasonValue={team.def_rtg_season} recentValue={team.def_rtg_l5} recentLabel="L5" isLowerBetter={true} />
          <StatRow label="Season vs L10" seasonValue={team.def_rtg_season} recentValue={team.def_rtg_l10} recentLabel="L10" isLowerBetter={true} />
          
          <SectionHeader title="Home Defensive Rating" />
          <SimpleStatRow label="Home Season" value={team.def_rtg_home} />
          <StatRow label="Home vs L3" seasonValue={team.def_rtg_home} recentValue={team.def_rtg_home_l3} recentLabel="L3" isLowerBetter={true} />
          <StatRow label="Home vs L5" seasonValue={team.def_rtg_home} recentValue={team.def_rtg_home_l5} recentLabel="L5" isLowerBetter={true} />
          
          <SectionHeader title="Away Defensive Rating" />
          <SimpleStatRow label="Away Season" value={team.def_rtg_away} />
          <StatRow label="Away vs L3" seasonValue={team.def_rtg_away} recentValue={team.def_rtg_away_l3} recentLabel="L3" isLowerBetter={true} />
          <StatRow label="Away vs L5" seasonValue={team.def_rtg_away} recentValue={team.def_rtg_away_l5} recentLabel="L5" isLowerBetter={true} />
          
          <SectionHeader title="Home vs Away Split" />
          <HomeAwaySplitRow label="DEF RTG Split" homeValue={team.def_rtg_home} awayValue={team.def_rtg_away} />
        </View>
      </CollapsibleDataSection>

      {/* PPG ALLOWED TAB */}
      <CollapsibleDataSection title="PPG Allowed" IconComponent={ChartIcon} defaultExpanded={false}>
        <View style={{ paddingBottom: 8 }}>
          <SectionHeader title="PPG Allowed" subtitle="Average points allowed per game" />
          <SimpleStatRow label="Season PPG Allowed" value={team.ppg_against_season} />
          <SimpleStatRow label="PPG Allowed Rank" value={formatRank(team.ppg_against_rank)} isText={true} />
          <StatRow label="Season vs L3" seasonValue={team.ppg_against_season} recentValue={team.ppg_against_l3} recentLabel="L3" isLowerBetter={true} />
          <StatRow label="Season vs L5" seasonValue={team.ppg_against_season} recentValue={team.ppg_against_l5} recentLabel="L5" isLowerBetter={true} />
          <StatRow label="Season vs L10" seasonValue={team.ppg_against_season} recentValue={team.ppg_against_l10} recentLabel="L10" isLowerBetter={true} />
          
          <SectionHeader title="Home PPG Allowed" />
          <SimpleStatRow label="Home Season" value={team.ppg_against_home} />
          <StatRow label="Home vs L3" seasonValue={team.ppg_against_home} recentValue={team.ppg_against_home_l3} recentLabel="L3" isLowerBetter={true} />
          <StatRow label="Home vs L5" seasonValue={team.ppg_against_home} recentValue={team.ppg_against_home_l5} recentLabel="L5" isLowerBetter={true} />
          
          <SectionHeader title="Away PPG Allowed" />
          <SimpleStatRow label="Away Season" value={team.ppg_against_away} />
          <StatRow label="Away vs L3" seasonValue={team.ppg_against_away} recentValue={team.ppg_against_away_l3} recentLabel="L3" isLowerBetter={true} />
          <StatRow label="Away vs L5" seasonValue={team.ppg_against_away} recentValue={team.ppg_against_away_l5} recentLabel="L5" isLowerBetter={true} />
          
          <SectionHeader title="Home vs Away Split" />
          <HomeAwaySplitRow label="PPG Allowed Split" homeValue={team.ppg_against_home} awayValue={team.ppg_against_away} />
        </View>
      </CollapsibleDataSection>

      {/* RECENT PERFORMANCE TAB */}
      <CollapsibleDataSection title="Recent Performance" IconComponent={TrendingUpIcon} defaultExpanded={false}>
        <View style={{ paddingBottom: 8 }}>
          <SectionHeader title="Recent vs Guards" subtitle="Stats allowed to opposing guards" />
          <SimpleStatRow label="Points" value={team.recent_guard_pts} />
          <SimpleStatRow label="Rebounds" value={team.recent_guard_reb} />
          <SimpleStatRow label="Assists" value={team.recent_guard_ast} />
          <SimpleStatRow label="Steals" value={team.recent_guard_stl} />
          <SimpleStatRow label="Blocks" value={team.recent_guard_blk} />
          <SimpleStatRow label="3PM" value={team.recent_guard_fg3m} />
          <SimpleStatRow label="PRA" value={team.recent_guard_pra} />
          
          <SectionHeader title="Recent vs Forwards" subtitle="Stats allowed to opposing forwards" />
          <SimpleStatRow label="Points" value={team.recent_forward_pts} />
          <SimpleStatRow label="Rebounds" value={team.recent_forward_reb} />
          <SimpleStatRow label="Assists" value={team.recent_forward_ast} />
          <SimpleStatRow label="Steals" value={team.recent_forward_stl} />
          <SimpleStatRow label="Blocks" value={team.recent_forward_blk} />
          <SimpleStatRow label="3PM" value={team.recent_forward_fg3m} />
          <SimpleStatRow label="PRA" value={team.recent_forward_pra} />
          
          <SectionHeader title="Recent vs Centers" subtitle="Stats allowed to opposing centers" />
          <SimpleStatRow label="Points" value={team.recent_center_pts} />
          <SimpleStatRow label="Rebounds" value={team.recent_center_reb} />
          <SimpleStatRow label="Assists" value={team.recent_center_ast} />
          <SimpleStatRow label="Steals" value={team.recent_center_stl} />
          <SimpleStatRow label="Blocks" value={team.recent_center_blk} />
          <SimpleStatRow label="3PM" value={team.recent_center_fg3m} />
          <SimpleStatRow label="PRA" value={team.recent_center_pra} />
        </View>
      </CollapsibleDataSection>

      {/* SUPPRESSION TAB */}
      <CollapsibleDataSection title="Suppression Metrics" IconComponent={ShieldIcon} defaultExpanded={false}>
        <View style={{ paddingBottom: 8 }}>
          <SectionHeader title="Points Suppression" subtitle="Negative = good defense (below expected)" />
          <SuppressionRow label="vs Guards" value={team.pts_recent_suppression_guards} />
          <SuppressionRow label="vs Forwards" value={team.pts_recent_suppression_forwards} />
          <SuppressionRow label="vs Centers" value={team.pts_recent_suppression_centers} />
          
          <SectionHeader title="Rebounds Suppression" />
          <SuppressionRow label="vs Guards" value={team.reb_recent_suppression_guards} />
          <SuppressionRow label="vs Forwards" value={team.reb_recent_suppression_forwards} />
          <SuppressionRow label="vs Centers" value={team.reb_recent_suppression_centers} />
          
          <SectionHeader title="Assists Suppression" />
          <SuppressionRow label="vs Guards" value={team.ast_recent_suppression_guards} />
          <SuppressionRow label="vs Forwards" value={team.ast_recent_suppression_forwards} />
          <SuppressionRow label="vs Centers" value={team.ast_recent_suppression_centers} />
          
          <SectionHeader title="3PM Suppression" />
          <SuppressionRow label="vs Guards" value={team.fg3m_recent_suppression_guards} />
          <SuppressionRow label="vs Forwards" value={team.fg3m_recent_suppression_forwards} />
          <SuppressionRow label="vs Centers" value={team.fg3m_recent_suppression_centers} />
          
          <SectionHeader title="Turnovers Forced" subtitle="Positive = forcing more turnovers" />
          <SuppressionRow label="vs Guards" value={team.tov_recent_suppression_guards} isPositiveGood={true} />
          <SuppressionRow label="vs Forwards" value={team.tov_recent_suppression_forwards} isPositiveGood={true} />
          <SuppressionRow label="vs Centers" value={team.tov_recent_suppression_centers} isPositiveGood={true} />
        </View>
      </CollapsibleDataSection>

      {/* ANALYSIS TAB */}
      <CollapsibleDataSection title="Analysis" IconComponent={TargetIcon} defaultExpanded={false}>
        <View style={{ paddingBottom: 8 }}>
          <SectionHeader title="Strongest Areas (Recent)" subtitle="Best defensive areas in recent games" />
          <StrengthWeaknessRow label="#1 Strongest" value={team.strongest_recent_1st} isStrong={true} />
          <StrengthWeaknessRow label="#2 Strongest" value={team.strongest_recent_2nd} isStrong={true} />
          <StrengthWeaknessRow label="#3 Strongest" value={team.strongest_recent_3rd} isStrong={true} />
          
          <SectionHeader title="Weakest Areas (Recent)" subtitle="Worst defensive areas in recent games" />
          <StrengthWeaknessRow label="#1 Weakest" value={team.weakest_recent_1st} isStrong={false} />
          <StrengthWeaknessRow label="#2 Weakest" value={team.weakest_recent_2nd} isStrong={false} />
          <StrengthWeaknessRow label="#3 Weakest" value={team.weakest_recent_3rd} isStrong={false} />
          
          <SectionHeader title="Strongest Areas (Season)" subtitle="Best defensive areas all season" />
          <StrengthWeaknessRow label="#1 Strongest" value={team.strongest_season_1st} isStrong={true} />
          <StrengthWeaknessRow label="#2 Strongest" value={team.strongest_season_2nd} isStrong={true} />
          <StrengthWeaknessRow label="#3 Strongest" value={team.strongest_season_3rd} isStrong={true} />
          
          <SectionHeader title="Weakest Areas (Season)" subtitle="Worst defensive areas all season" />
          <StrengthWeaknessRow label="#1 Weakest" value={team.weakest_season_1st} isStrong={false} />
          <StrengthWeaknessRow label="#2 Weakest" value={team.weakest_season_2nd} isStrong={false} />
          <StrengthWeaknessRow label="#3 Weakest" value={team.weakest_season_3rd} isStrong={false} />
          
          <SectionHeader title="Team Info" subtitle="Identification data" />
          <SimpleStatRow label="Team ID" value={team.team_id} isText={true} />
          <SimpleStatRow label="Season" value={team.season} isText={true} />
          <SimpleStatRow label="Last Updated" value={team.last_updated ? new Date(team.last_updated).toLocaleDateString() : '--'} isText={true} />
        </View>
      </CollapsibleDataSection>
    </View>
  );
});

// ==============================================
// NFL PLAYER OVERVIEW STATS COMPONENT
// ==============================================

// NFL Team Defense Rank Row - For NFL positional rankings with color coding
const NFLTeamDefenseRankRow = ({ label, rank, value, valueLabel, isLowerBetter = true }) => {
  const getRankColor = (r) => {
    if (!r) return '#888';
    if (r <= 8) return '#4ADE80'; // Top 8 = Good
    if (r <= 16) return '#FCD34D'; // Middle = Neutral
    if (r <= 24) return '#FB923C'; // Lower = Warning
    return '#EF4444'; // Bottom 8 = Bad (easy matchup for offense)
  };
  const color = isLowerBetter ? getRankColor(rank) : getRankColor(33 - rank);

  return (
    <View style={teamDefenseStyles.row}>
      <Text style={teamDefenseStyles.label}>{label}</Text>
      <View style={teamDefenseStyles.gradeContainer}>
        <Text style={[teamDefenseStyles.rank, { color }]}>{rank ? `#${rank}` : '--'}</Text>
        {value !== undefined && (
          <Text style={teamDefenseStyles.value}>{value != null ? Number(value).toFixed(1) : '--'} {valueLabel}</Text>
        )}
      </View>
    </View>
  );
};

// NFL Player Overview Stats Component - renders NFL player stats by position
// Matches the exact design of the NFL search screen player profile
const NFLPlayerOverviewStats = React.memo(({ playerData }) => {
  if (!playerData) return null;
  
  const player = playerData;
  const position = player.position || '';
  
  // Format value helper
  const formatVal = (val, decimals = 1) => {
    if (val === null || val === undefined) return '--';
    return Number(val).toFixed(decimals);
  };
  const formatPct = (val) => {
    if (val === null || val === undefined) return '--';
    return `${Number(val).toFixed(1)}%`;
  };
  
  // Calculate total TDs from available data (like search screen)
  const calcTotalTDs = () => {
    const pass = Number(player.pass_tds_total) || 0;
    const rush = Number(player.rush_tds_total) || 0;
    const rec = Number(player.rec_tds_total) || 0;
    const total = pass + rush + rec;
    return total > 0 ? total : player.total_tds_season;
  };
  const calcTotalTDsAvg = () => {
    const pass = Number(player.pass_tds_season_avg) || 0;
    const rush = Number(player.rush_tds_season_avg) || 0;
    const rec = Number(player.rec_tds_season_avg) || 0;
    const total = pass + rush + rec;
    return total > 0 ? total.toFixed(2) : player.total_tds_season_avg;
  };
  const calcGamesWithTD = () => {
    const pass = Number(player.games_with_pass_td) || 0;
    const rush = Number(player.games_with_rush_td) || 0;
    const rec = Number(player.games_with_rec_td) || 0;
    const max = Math.max(pass, rush, rec);
    return max > 0 ? max : player.games_with_td_season;
  };
  const calcAnytimeTDRate = () => {
    const tdRate = player.pass_td_rate_season || player.rush_td_rate_season || player.rec_td_rate_season;
    if (tdRate) {
      return `${(Number(tdRate) * 100).toFixed(1)}%`;
    }
    return player.anytime_td_rate_season ? formatPct(player.anytime_td_rate_season) : '--';
  };
  const calcRedZoneTouches = () => {
    if (player.red_zone_touches_per_game) return player.red_zone_touches_per_game;
    if (player.red_zone_touches_season && player.games_played) {
      return (Number(player.red_zone_touches_season) / Number(player.games_played)).toFixed(1);
    }
    return null;
  };
  
  return (
    <View style={{ paddingBottom: 8 }}>
      {/* ============================================ */}
      {/* OVERVIEW TAB - Player Identity & Season Avgs */}
      {/* ============================================ */}
      <CollapsibleDataSection title="Overview" IconComponent={ChartIcon} defaultExpanded={true}>
        <View style={{ paddingBottom: 8 }}>
          <SectionHeader title="Player Identity" subtitle={`${position} • ${player.team_abbreviation || ''}`} />
          <SimpleStatRow label="Team" value={player.team_abbreviation} isText={true} />
          <SimpleStatRow label="Position" value={position} isText={true} />
          <SimpleStatRow label="Injury Status" value={player.injury_status || 'Healthy'} isText={true} />
          
          <SectionHeader title="Season Averages" />
          {position === 'QB' && (
            <>
              <SimpleStatRow label="Pass Yards" value={player.pass_yards_season_avg} />
              <SimpleStatRow label="Pass TDs" value={player.pass_tds_season_avg} />
              <SimpleStatRow label="Completions" value={player.pass_completions_season_avg} />
              <SimpleStatRow label="Interceptions" value={player.interceptions_season_avg} />
            </>
          )}
          {(position === 'RB' || position === 'QB') && (
            <>
              <SimpleStatRow label="Rush Yards" value={player.rush_yards_season_avg} />
              <SimpleStatRow label="Rush TDs" value={player.rush_tds_season_avg} />
              <SimpleStatRow label="Carries" value={player.rush_attempts_season_avg} />
            </>
          )}
          {(position === 'WR' || position === 'TE' || position === 'RB') && (
            <>
              <SimpleStatRow label="Receptions" value={player.receptions_season_avg} />
              <SimpleStatRow label="Rec Yards" value={player.rec_yards_season_avg} />
              <SimpleStatRow label="Rec TDs" value={player.rec_tds_season_avg} />
              <SimpleStatRow label="Targets" value={player.targets_season_avg} />
            </>
          )}
          {position === 'K' && (
            <>
              <SimpleStatRow label="FG Made" value={player.fg_made_season_avg} />
              <SimpleStatRow label="FG Attempts" value={player.fg_attempts_season_avg} />
              <SimpleStatRow label="FG %" value={formatPct(player.fg_pct_season)} isText={true} />
              <SimpleStatRow label="Kicking Points" value={player.kicking_points_season_avg} />
            </>
          )}
          
          <SectionHeader title="Performance Summary" />
          <SimpleStatRow label="Games Played" value={player.games_played} />
          <SimpleStatRow label="Total TDs" value={calcTotalTDs() || '--'} />
        </View>
      </CollapsibleDataSection>
      
      {/* ============================================ */}
      {/* PASSING TAB - QB Only */}
      {/* ============================================ */}
      {position === 'QB' && (
        <CollapsibleDataSection title="Passing" IconComponent={ChartIcon} defaultExpanded={false}>
          <View style={{ paddingBottom: 8 }}>
            <SectionHeader title="Passing Yards" />
            <StatRow label="Pass Yards" seasonValue={player.pass_yards_season_avg} recentValue={player.pass_yards_last3_avg} recentLabel="L3" />
            <StatRow label="Pass Yards (L5)" seasonValue={player.pass_yards_season_avg} recentValue={player.pass_yards_last5_avg} recentLabel="L5" />
            <FloorCeilingRow label="Floor / Ceiling" floorValue={player.pass_yards_floor_last5} ceilingValue={player.pass_yards_ceiling_last5} />
            <HomeAwaySplitRow label="Home vs Away" homeValue={player.pass_yards_home_avg} awayValue={player.pass_yards_away_avg} />
            
            <SectionHeader title="Passing Touchdowns" />
            <StatRow label="Pass TDs" seasonValue={player.pass_tds_season_avg} recentValue={player.pass_tds_last3_avg} recentLabel="L3" />
            <StatRow label="Pass TDs (L5)" seasonValue={player.pass_tds_season_avg} recentValue={player.pass_tds_last5_avg} recentLabel="L5" />
            <FloorCeilingRow label="Floor / Ceiling" floorValue={player.pass_tds_floor_last5} ceilingValue={player.pass_tds_ceiling_last5} />
            <HomeAwaySplitRow label="Home vs Away" homeValue={player.pass_tds_home_avg} awayValue={player.pass_tds_away_avg} />
            
            <SectionHeader title="Completions & Attempts" />
            <StatRow label="Completions" seasonValue={player.pass_completions_season_avg} recentValue={player.pass_completions_last3_avg} recentLabel="L3" />
            <StatRow label="Attempts" seasonValue={player.pass_attempts_season_avg} recentValue={player.pass_attempts_last3_avg} recentLabel="L3" />
            <SimpleStatRow label="Comp %" value={formatPct(player.completion_pct_season)} isText={true} />
            <SimpleStatRow label="Yards/Attempt" value={player.yards_per_attempt_season} />
            
            <SectionHeader title="Interceptions" />
            <StatRow label="INTs" seasonValue={player.interceptions_season_avg} recentValue={player.interceptions_last3_avg} isLowerBetter={true} recentLabel="L3" />
            <HomeAwaySplitRow label="Home vs Away" homeValue={player.interceptions_home_avg} awayValue={player.interceptions_away_avg} />
          </View>
        </CollapsibleDataSection>
      )}
      
      {/* ============================================ */}
      {/* RUSHING TAB - QB, RB */}
      {/* ============================================ */}
      {(position === 'QB' || position === 'RB') && (
        <CollapsibleDataSection title="Rushing" IconComponent={TrendingUpIcon} defaultExpanded={position === 'RB'}>
          <View style={{ paddingBottom: 8 }}>
            <SectionHeader title="Rushing Yards" />
            <StatRow label="Rush Yards" seasonValue={player.rush_yards_season_avg} recentValue={player.rush_yards_last3_avg} recentLabel="L3" />
            <StatRow label="Rush Yards (L5)" seasonValue={player.rush_yards_season_avg} recentValue={player.rush_yards_last5_avg} recentLabel="L5" />
            <FloorCeilingRow label="Floor / Ceiling" floorValue={player.rush_yards_floor_last5} ceilingValue={player.rush_yards_ceiling_last5} />
            <HomeAwaySplitRow label="Home vs Away" homeValue={player.rush_yards_home_avg} awayValue={player.rush_yards_away_avg} />
            
            <SectionHeader title="Rushing Touchdowns" />
            <StatRow label="Rush TDs" seasonValue={player.rush_tds_season_avg} recentValue={player.rush_tds_last3_avg} recentLabel="L3" />
            <StatRow label="Rush TDs (L5)" seasonValue={player.rush_tds_season_avg} recentValue={player.rush_tds_last5_avg} recentLabel="L5" />
            <FloorCeilingRow label="Floor / Ceiling" floorValue={player.rush_tds_floor_last5} ceilingValue={player.rush_tds_ceiling_last5} />
            <HomeAwaySplitRow label="Home vs Away" homeValue={player.rush_tds_home_avg} awayValue={player.rush_tds_away_avg} />
            
            <SectionHeader title="Volume & Efficiency" />
            <StatRow label="Carries" seasonValue={player.rush_attempts_season_avg} recentValue={player.rush_attempts_last3_avg} recentLabel="L3" />
            <SimpleStatRow label="Yards/Carry" value={player.yards_per_carry_season} />
            <HomeAwaySplitRow label="Carries Split" homeValue={player.rush_attempts_home_avg} awayValue={player.rush_attempts_away_avg} />
          </View>
        </CollapsibleDataSection>
      )}
      
      {/* ============================================ */}
      {/* RECEIVING TAB - WR, TE, RB */}
      {/* ============================================ */}
      {(position === 'WR' || position === 'TE' || position === 'RB') && (
        <CollapsibleDataSection title="Receiving" IconComponent={TargetIcon} defaultExpanded={position !== 'RB'}>
          <View style={{ paddingBottom: 8 }}>
            <SectionHeader title="Receiving Yards" />
            <StatRow label="Rec Yards" seasonValue={player.rec_yards_season_avg} recentValue={player.rec_yards_last3_avg} recentLabel="L3" />
            <StatRow label="Rec Yards (L5)" seasonValue={player.rec_yards_season_avg} recentValue={player.rec_yards_last5_avg} recentLabel="L5" />
            <FloorCeilingRow label="Floor / Ceiling" floorValue={player.rec_yards_floor_last5} ceilingValue={player.rec_yards_ceiling_last5} />
            <HomeAwaySplitRow label="Home vs Away" homeValue={player.rec_yards_home_avg} awayValue={player.rec_yards_away_avg} />
            
            <SectionHeader title="Receiving Touchdowns" />
            <StatRow label="Rec TDs" seasonValue={player.rec_tds_season_avg} recentValue={player.rec_tds_last3_avg} recentLabel="L3" />
            <StatRow label="Rec TDs (L5)" seasonValue={player.rec_tds_season_avg} recentValue={player.rec_tds_last5_avg} recentLabel="L5" />
            <FloorCeilingRow label="Floor / Ceiling" floorValue={player.rec_tds_floor_last5} ceilingValue={player.rec_tds_ceiling_last5} />
            <HomeAwaySplitRow label="Home vs Away" homeValue={player.rec_tds_home_avg} awayValue={player.rec_tds_away_avg} />
            
            <SectionHeader title="Receptions & Targets" />
            <StatRow label="Receptions" seasonValue={player.receptions_season_avg} recentValue={player.receptions_last3_avg} recentLabel="L3" />
            <StatRow label="Targets" seasonValue={player.targets_season_avg} recentValue={player.targets_last3_avg} recentLabel="L3" />
            <SimpleStatRow label="Catch %" value={formatPct(player.catch_rate_season)} isText={true} />
            <SimpleStatRow label="Yards/Reception" value={player.yards_per_reception_season || player.yards_per_catch_season} />
            <HomeAwaySplitRow label="Targets Split" homeValue={player.targets_home_avg} awayValue={player.targets_away_avg} />
          </View>
        </CollapsibleDataSection>
      )}
      
      {/* ============================================ */}
      {/* KICKING TAB - K Only */}
      {/* ============================================ */}
      {position === 'K' && (
        <CollapsibleDataSection title="Kicking" IconComponent={TargetIcon} defaultExpanded={false}>
          <View style={{ paddingBottom: 8 }}>
            <SectionHeader title="Field Goals" />
            <StatRow label="FG Made" seasonValue={player.fg_made_season_avg} recentValue={player.fg_made_last3_avg} recentLabel="L3" />
            <SimpleStatRow label="FG Attempts/G" value={player.fg_attempts_season_avg} />
            <SimpleStatRow label="FG %" value={formatPct(player.fg_pct_season)} isText={true} />
            <FloorCeilingRow label="Floor / Ceiling" floorValue={player.fg_made_floor_last5} ceilingValue={player.fg_made_ceiling_last5} />
            <HomeAwaySplitRow label="Home vs Away" homeValue={player.fg_made_home_avg} awayValue={player.fg_made_away_avg} />
            
            <SectionHeader title="Kicking Points" />
            <StatRow label="Kicking Points" seasonValue={player.kicking_points_season_avg} recentValue={player.kicking_points_last3_avg} recentLabel="L3" />
            <FloorCeilingRow label="Floor / Ceiling" floorValue={player.kicking_points_floor_last5} ceilingValue={player.kicking_points_ceiling_last5} />
            <HomeAwaySplitRow label="Home vs Away" homeValue={player.kicking_points_home_avg} awayValue={player.kicking_points_away_avg} />
            
            <SectionHeader title="Long Distance" />
            <SimpleStatRow label="50+ Yard FGs" value={player.fg_made_50_plus} />
            <SimpleStatRow label="Long FG" value={player.longest_fg_season} />
            <SimpleStatRow label="50+ FG %" value={formatPct(player.fg_pct_50_plus)} isText={true} />
          </View>
        </CollapsibleDataSection>
      )}
      
      {/* ============================================ */}
      {/* FANTASY TAB - TD Production (All positions) */}
      {/* ============================================ */}
      <CollapsibleDataSection title="Fantasy" IconComponent={ChartIcon} defaultExpanded={false}>
        <View style={{ paddingBottom: 8 }}>
          <SectionHeader title="Touchdown Production" />
          <StatRow label="Total TDs/G" seasonValue={calcTotalTDsAvg()} recentValue={player.total_tds_last3_avg} recentLabel="L3" />
          <StatRow label="Total TDs (L5)" seasonValue={calcTotalTDsAvg()} recentValue={player.total_tds_last5_avg} recentLabel="L5" />
          <SimpleStatRow label="Games with TD" value={calcGamesWithTD()} />
          <SimpleStatRow label="Anytime TD Rate" value={calcAnytimeTDRate()} isText={true} />
          
          <SectionHeader title="Season Totals" />
          <SimpleStatRow label="Total TDs" value={calcTotalTDs()} />
          <SimpleStatRow label="Games Played" value={player.games_played} />
          <SimpleStatRow label="Red Zone Touches/G" value={calcRedZoneTouches()} />
        </View>
      </CollapsibleDataSection>
      
      {/* ============================================ */}
      {/* SPLITS TAB - Home vs Away (All positions) */}
      {/* ============================================ */}
      <CollapsibleDataSection title="Splits" IconComponent={CalendarIcon} defaultExpanded={false}>
        <View style={{ paddingBottom: 8 }}>
          <SectionHeader title="Home vs Away Performance" />
          {position === 'QB' && (
            <>
              <HomeAwaySplitRow label="Pass Yards" homeValue={player.pass_yards_home_avg} awayValue={player.pass_yards_away_avg} />
              <HomeAwaySplitRow label="Pass TDs" homeValue={player.pass_tds_home_avg} awayValue={player.pass_tds_away_avg} />
              <HomeAwaySplitRow label="Completions" homeValue={player.pass_completions_home_avg} awayValue={player.pass_completions_away_avg} />
            </>
          )}
          {(position === 'RB' || position === 'QB') && (
            <>
              <HomeAwaySplitRow label="Rush Yards" homeValue={player.rush_yards_home_avg} awayValue={player.rush_yards_away_avg} />
              <HomeAwaySplitRow label="Rush TDs" homeValue={player.rush_tds_home_avg} awayValue={player.rush_tds_away_avg} />
              <HomeAwaySplitRow label="Carries" homeValue={player.rush_attempts_home_avg} awayValue={player.rush_attempts_away_avg} />
            </>
          )}
          {(position === 'WR' || position === 'TE' || position === 'RB') && (
            <>
              <HomeAwaySplitRow label="Rec Yards" homeValue={player.rec_yards_home_avg} awayValue={player.rec_yards_away_avg} />
              <HomeAwaySplitRow label="Rec TDs" homeValue={player.rec_tds_home_avg} awayValue={player.rec_tds_away_avg} />
              <HomeAwaySplitRow label="Receptions" homeValue={player.receptions_home_avg} awayValue={player.receptions_away_avg} />
              <HomeAwaySplitRow label="Targets" homeValue={player.targets_home_avg} awayValue={player.targets_away_avg} />
            </>
          )}
          {position === 'K' && (
            <>
              <HomeAwaySplitRow label="FG Made" homeValue={player.fg_made_home_avg} awayValue={player.fg_made_away_avg} />
              <HomeAwaySplitRow label="Kicking Pts" homeValue={player.kicking_points_home_avg} awayValue={player.kicking_points_away_avg} />
            </>
          )}
          
          {/* TD Splits */}
          <SectionHeader title="TD Splits" />
          {position === 'QB' && (
            <>
              <HomeAwaySplitRow label="Pass TDs" homeValue={player.pass_tds_home_avg} awayValue={player.pass_tds_away_avg} />
              <HomeAwaySplitRow label="Rush TDs" homeValue={player.rush_tds_home_avg} awayValue={player.rush_tds_away_avg} />
            </>
          )}
          {position === 'RB' && (
            <>
              <HomeAwaySplitRow label="Rush TDs" homeValue={player.rush_tds_home_avg} awayValue={player.rush_tds_away_avg} />
              <HomeAwaySplitRow label="Rec TDs" homeValue={player.rec_tds_home_avg} awayValue={player.rec_tds_away_avg} />
            </>
          )}
          {(position === 'WR' || position === 'TE') && (
            <HomeAwaySplitRow label="Rec TDs" homeValue={player.rec_tds_home_avg} awayValue={player.rec_tds_away_avg} />
          )}
          {position === 'K' && (
            <HomeAwaySplitRow label="FG Made" homeValue={player.fg_made_home_avg} awayValue={player.fg_made_away_avg} />
          )}
        </View>
      </CollapsibleDataSection>
    </View>
  );
});

// ==============================================
// NFL TEAM OVERVIEW STATS COMPONENT
// ==============================================

// NFL Team Overview Stats Component - renders NFL team defense stats
const NFLTeamOverviewStats = React.memo(({ teamData }) => {
  if (!teamData) return null;
  
  const team = teamData;
  
  return (
    <View style={{ paddingBottom: 8 }}>
      {/* TEAM OVERVIEW */}
      <CollapsibleDataSection title="Team Overview" IconComponent={ChartIcon} defaultExpanded={true}>
        <View style={{ paddingBottom: 8 }}>
          <SectionHeader title="Team Identity" />
          <SimpleStatRow label="Conference" value={team.conference} isText={true} />
          <SimpleStatRow label="Division" value={team.division} isText={true} />
          <SimpleStatRow label="Games Played" value={team.games_played} />
          
          <SectionHeader title="Points Scored (Offense)" />
          <NFLTeamDefenseRankRow label="Points/Game" rank={team.points_scored_pg_season_rank} value={team.points_scored_pg_season} valueLabel="PTS" isLowerBetter={false} />
          <StatRow label="Points (L3 Trend)" seasonValue={team.points_scored_pg_season} recentValue={team.points_scored_pg_l3} isLowerBetter={false} />
          
          <SectionHeader title="Points Allowed (Defense)" />
          <NFLTeamDefenseRankRow label="Points Allowed/Game" rank={team.points_allowed_pg_season_rank} value={team.points_allowed_pg_season} valueLabel="PTS" />
          <StatRow label="Pts Allowed (L3)" seasonValue={team.points_allowed_pg_season} recentValue={team.points_allowed_pg_l3} isLowerBetter={true} />
        </View>
      </CollapsibleDataSection>
      
      {/* VS QB - Pass Defense */}
      <CollapsibleDataSection title="vs QB (Pass Defense)" IconComponent={ShieldIcon} defaultExpanded={false}>
        <View style={{ paddingBottom: 8 }}>
          <SectionHeader title="Pass Defense Rankings" subtitle="Season" />
          <NFLTeamDefenseRankRow label="Pass Yards Allowed" rank={team.qb_pass_yds_allowed_pg_season_rank} value={team.qb_pass_yds_allowed_pg_season} valueLabel="YDS/G" />
          <NFLTeamDefenseRankRow label="Pass TDs Allowed" rank={team.qb_pass_tds_allowed_pg_season_rank} value={team.qb_pass_tds_allowed_pg_season} valueLabel="TDs/G" />
          <NFLTeamDefenseRankRow label="Pass Attempts Allowed" rank={team.qb_pass_att_allowed_pg_season_rank} value={team.qb_pass_att_allowed_pg_season} valueLabel="ATT/G" />
          <NFLTeamDefenseRankRow label="Completions Allowed" rank={team.qb_pass_cmp_allowed_pg_season_rank} value={team.qb_pass_cmp_allowed_pg_season} valueLabel="CMP/G" />
          <NFLTeamDefenseRankRow label="INTs Forced" rank={team.qb_ints_forced_pg_season_rank} value={team.qb_ints_forced_pg_season} valueLabel="INT/G" isLowerBetter={false} />
          
          <SectionHeader title="QB Rush Defense" />
          <NFLTeamDefenseRankRow label="QB Rush Yards" rank={team.qb_rush_yds_allowed_pg_season_rank} value={team.qb_rush_yds_allowed_pg_season} valueLabel="YDS/G" />
          <NFLTeamDefenseRankRow label="QB Rush TDs" rank={team.qb_rush_tds_allowed_pg_season_rank} value={team.qb_rush_tds_allowed_pg_season} valueLabel="TDs/G" />
          
          <SectionHeader title="L3 Trends" subtitle="Season vs Recent" />
          <StatRow label="Pass Yds Allowed" seasonValue={team.qb_pass_yds_allowed_pg_season} recentValue={team.qb_pass_yds_allowed_pg_l3} isLowerBetter={true} />
          <StatRow label="Pass TDs Allowed" seasonValue={team.qb_pass_tds_allowed_pg_season} recentValue={team.qb_pass_tds_allowed_pg_l3} isLowerBetter={true} />
          <StatRow label="INTs Forced" seasonValue={team.qb_ints_forced_pg_season} recentValue={team.qb_ints_forced_pg_l3} isLowerBetter={false} />
        </View>
      </CollapsibleDataSection>
      
      {/* VS RB - Rush Defense */}
      <CollapsibleDataSection title="vs RB (Rush Defense)" IconComponent={TrendingUpIcon} defaultExpanded={false}>
        <View style={{ paddingBottom: 8 }}>
          <SectionHeader title="Rush Defense Rankings" subtitle="Season" />
          <NFLTeamDefenseRankRow label="Rush Yards Allowed" rank={team.rb_rush_yds_allowed_pg_season_rank} value={team.rb_rush_yds_allowed_pg_season} valueLabel="YDS/G" />
          <NFLTeamDefenseRankRow label="Rush TDs Allowed" rank={team.rb_rush_tds_allowed_pg_season_rank} value={team.rb_rush_tds_allowed_pg_season} valueLabel="TDs/G" />
          <NFLTeamDefenseRankRow label="Carries Allowed" rank={team.rb_rush_att_allowed_pg_season_rank} value={team.rb_rush_att_allowed_pg_season} valueLabel="ATT/G" />
          <NFLTeamDefenseRankRow label="Yards/Carry Allowed" rank={team.rb_ypc_allowed_season_rank} value={team.rb_ypc_allowed_season} valueLabel="Y/C" />
          
          <SectionHeader title="RB Receiving Defense" />
          <NFLTeamDefenseRankRow label="RB Rec Yards" rank={team.rb_rec_yds_allowed_pg_season_rank} value={team.rb_rec_yds_allowed_pg_season} valueLabel="YDS/G" />
          <NFLTeamDefenseRankRow label="RB Receptions" rank={team.rb_rec_allowed_pg_season_rank} value={team.rb_rec_allowed_pg_season} valueLabel="REC/G" />
          <NFLTeamDefenseRankRow label="RB Rec TDs" rank={team.rb_rec_tds_allowed_pg_season_rank} value={team.rb_rec_tds_allowed_pg_season} valueLabel="TDs/G" />
          
          <SectionHeader title="L3 Trends" subtitle="Season vs Recent" />
          <StatRow label="Rush Yds Allowed" seasonValue={team.rb_rush_yds_allowed_pg_season} recentValue={team.rb_rush_yds_allowed_pg_l3} isLowerBetter={true} />
          <StatRow label="Rush TDs Allowed" seasonValue={team.rb_rush_tds_allowed_pg_season} recentValue={team.rb_rush_tds_allowed_pg_l3} isLowerBetter={true} />
        </View>
      </CollapsibleDataSection>
      
      {/* VS WR - WR Defense */}
      <CollapsibleDataSection title="vs WR (Receiving Defense)" IconComponent={TargetIcon} defaultExpanded={false}>
        <View style={{ paddingBottom: 8 }}>
          <SectionHeader title="WR Defense Rankings" subtitle="Season" />
          <NFLTeamDefenseRankRow label="WR Rec Yards" rank={team.wr_rec_yds_allowed_pg_season_rank} value={team.wr_rec_yds_allowed_pg_season} valueLabel="YDS/G" />
          <NFLTeamDefenseRankRow label="WR Receptions" rank={team.wr_rec_allowed_pg_season_rank} value={team.wr_rec_allowed_pg_season} valueLabel="REC/G" />
          <NFLTeamDefenseRankRow label="WR Targets" rank={team.wr_tgt_allowed_pg_season_rank} value={team.wr_tgt_allowed_pg_season} valueLabel="TGT/G" />
          <NFLTeamDefenseRankRow label="WR Rec TDs" rank={team.wr_rec_tds_allowed_pg_season_rank} value={team.wr_rec_tds_allowed_pg_season} valueLabel="TDs/G" />
          
          <SectionHeader title="L3 Trends" subtitle="Season vs Recent" />
          <StatRow label="WR Rec Yds" seasonValue={team.wr_rec_yds_allowed_pg_season} recentValue={team.wr_rec_yds_allowed_pg_l3} isLowerBetter={true} />
          <StatRow label="WR Rec TDs" seasonValue={team.wr_rec_tds_allowed_pg_season} recentValue={team.wr_rec_tds_allowed_pg_l3} isLowerBetter={true} />
        </View>
      </CollapsibleDataSection>
      
      {/* VS TE - TE Defense */}
      <CollapsibleDataSection title="vs TE (TE Defense)" IconComponent={TargetIcon} defaultExpanded={false}>
        <View style={{ paddingBottom: 8 }}>
          <SectionHeader title="TE Defense Rankings" subtitle="Season" />
          <NFLTeamDefenseRankRow label="TE Rec Yards" rank={team.te_rec_yds_allowed_pg_season_rank} value={team.te_rec_yds_allowed_pg_season} valueLabel="YDS/G" />
          <NFLTeamDefenseRankRow label="TE Receptions" rank={team.te_rec_allowed_pg_season_rank} value={team.te_rec_allowed_pg_season} valueLabel="REC/G" />
          <NFLTeamDefenseRankRow label="TE Targets" rank={team.te_tgt_allowed_pg_season_rank} value={team.te_tgt_allowed_pg_season} valueLabel="TGT/G" />
          <NFLTeamDefenseRankRow label="TE Rec TDs" rank={team.te_rec_tds_allowed_pg_season_rank} value={team.te_rec_tds_allowed_pg_season} valueLabel="TDs/G" />
          
          <SectionHeader title="L3 Trends" subtitle="Season vs Recent" />
          <StatRow label="TE Rec Yds" seasonValue={team.te_rec_yds_allowed_pg_season} recentValue={team.te_rec_yds_allowed_pg_l3} isLowerBetter={true} />
          <StatRow label="TE Rec TDs" seasonValue={team.te_rec_tds_allowed_pg_season} recentValue={team.te_rec_tds_allowed_pg_l3} isLowerBetter={true} />
        </View>
      </CollapsibleDataSection>
      
      {/* VS K - Kicker Defense */}
      <CollapsibleDataSection title="vs K (Kicker Allowed)" IconComponent={TargetIcon} defaultExpanded={false}>
        <View style={{ paddingBottom: 8 }}>
          <SectionHeader title="Kicker Defense Rankings" subtitle="Season" />
          <NFLTeamDefenseRankRow label="FG Made Allowed" rank={team.k_fg_made_allowed_pg_season_rank} value={team.k_fg_made_allowed_pg_season} valueLabel="FG/G" />
          <NFLTeamDefenseRankRow label="FG Attempts Allowed" rank={team.k_fg_att_allowed_pg_season_rank} value={team.k_fg_att_allowed_pg_season} valueLabel="ATT/G" />
          <NFLTeamDefenseRankRow label="Kicking Pts Allowed" rank={team.k_kicking_pts_allowed_pg_season_rank} value={team.k_kicking_pts_allowed_pg_season} valueLabel="PTS/G" />
          
          <SectionHeader title="L3 Trends" subtitle="Season vs Recent" />
          <StatRow label="FG Made Allowed" seasonValue={team.k_fg_made_allowed_pg_season} recentValue={team.k_fg_made_allowed_pg_l3} isLowerBetter={true} />
          <StatRow label="Kicking Pts Allowed" seasonValue={team.k_kicking_pts_allowed_pg_season} recentValue={team.k_kicking_pts_allowed_pg_l3} isLowerBetter={true} />
        </View>
      </CollapsibleDataSection>
      
      {/* Overall Defense */}
      <CollapsibleDataSection title="Overall Defense" IconComponent={ShieldIcon} defaultExpanded={false}>
        <View style={{ paddingBottom: 8 }}>
          <SectionHeader title="Total Defense" />
          <NFLTeamDefenseRankRow label="Total Yards Allowed" rank={team.total_yards_allowed_pg_season_rank} value={team.total_yards_allowed_pg_season} valueLabel="YDS/G" />
          <NFLTeamDefenseRankRow label="Sacks/Game" rank={team.sacks_pg_season_rank} value={team.sacks_pg_season} valueLabel="" isLowerBetter={false} />
          <NFLTeamDefenseRankRow label="INTs Forced/Game" rank={team.ints_forced_pg_season_rank} value={team.ints_forced_pg_season} valueLabel="" isLowerBetter={false} />
          <NFLTeamDefenseRankRow label="Fumbles Forced/Game" rank={team.fumbles_forced_pg_season_rank} value={team.fumbles_forced_pg_season} valueLabel="" isLowerBetter={false} />
          <NFLTeamDefenseRankRow label="Turnovers/Game" rank={team.turnovers_pg_season_rank} value={team.turnovers_pg_season} valueLabel="" />
        </View>
      </CollapsibleDataSection>
      
      {/* Offense */}
      <CollapsibleDataSection title="Offense" IconComponent={TrendingUpIcon} defaultExpanded={false}>
        <View style={{ paddingBottom: 8 }}>
          <SectionHeader title="Offensive Production" />
          <NFLTeamDefenseRankRow label="Points/Game" rank={team.points_scored_pg_season_rank} value={team.points_scored_pg_season} valueLabel="PTS" isLowerBetter={false} />
          <NFLTeamDefenseRankRow label="Total Yards/Game" rank={team.total_yards_pg_season_rank} value={team.total_yards_pg_season} valueLabel="YDS" isLowerBetter={false} />
          <NFLTeamDefenseRankRow label="Pass Yards/Game" rank={team.pass_yards_pg_season_rank} value={team.pass_yards_pg_season} valueLabel="YDS" isLowerBetter={false} />
          <NFLTeamDefenseRankRow label="Rush Yards/Game" rank={team.rush_yards_pg_season_rank} value={team.rush_yards_pg_season} valueLabel="YDS" isLowerBetter={false} />
          
          <SectionHeader title="L3 Trends" subtitle="Season vs Recent" />
          <StatRow label="Points" seasonValue={team.points_scored_pg_season} recentValue={team.points_scored_pg_l3} isLowerBetter={false} />
          <StatRow label="Total Yards" seasonValue={team.total_yards_pg_season} recentValue={team.total_yards_pg_l3} isLowerBetter={false} />
        </View>
      </CollapsibleDataSection>
    </View>
  );
});

// ChatInsightCard Component
const ChatInsightCard = React.memo(({ title, statHighlight, context, variant = 'neutral', IconComponent = ChartIcon }) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'positive':
        return {
          backgroundColor: 'rgba(16, 185, 129, 0.15)',
          borderColor: 'rgba(16, 185, 129, 0.4)',
          iconColor: '#10B981',
          highlightColor: '#10B981',
        };
      case 'negative':
        return {
          backgroundColor: 'rgba(239, 68, 68, 0.15)',
          borderColor: 'rgba(239, 68, 68, 0.4)',
          iconColor: '#EF4444',
          highlightColor: '#EF4444',
        };
      case 'neutral':
      default:
        return {
          backgroundColor: 'rgba(74, 222, 128, 0.15)',
          borderColor: 'rgba(74, 222, 128, 0.3)',
          iconColor: '#4ADE80',
          highlightColor: '#4ADE80',
        };
    }
  };

  const variantStyles = getVariantStyles();

  return (
    <View
      style={[
        styles.insightCard,
        {
          backgroundColor: variantStyles.backgroundColor,
          borderColor: variantStyles.borderColor,
        },
      ]}
    >
      <View style={styles.insightCardHeader}>
        <View style={styles.insightIconWrapper}>
          <IconComponent size={16} color={variantStyles.iconColor} />
        </View>
        <Text style={styles.insightCardTitle}>{title}</Text>
      </View>
      <Text style={[styles.insightCardHighlight, { color: variantStyles.highlightColor }]}>
        {statHighlight}
      </Text>
      {context && (
        <Text style={styles.insightCardContext}>{context}</Text>
      )}
    </View>
  );
});

// CollapsibleDataSection Component
const CollapsibleDataSection = ({ title, IconComponent = ChartIcon, children, defaultExpanded = true }) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const animatedRotation = useRef(new Animated.Value(defaultExpanded ? 1 : 0)).current;

  const toggleExpand = () => {
    // Animate layout change smoothly
    LayoutAnimation.configureNext({
      duration: 250,
      create: { type: LayoutAnimation.Types.easeInEaseOut, property: LayoutAnimation.Properties.opacity },
      update: { type: LayoutAnimation.Types.easeInEaseOut },
      delete: { type: LayoutAnimation.Types.easeInEaseOut, property: LayoutAnimation.Properties.opacity },
    });
    
    const toValue = isExpanded ? 0 : 1;
    setIsExpanded(!isExpanded);
    Animated.timing(animatedRotation, {
      toValue,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const arrowRotation = animatedRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  return (
    <View style={styles.collapsibleSection}>
      {/* Decorative diagonal stripes */}
      <View style={styles.sectionDecorativeLines}>
        <View style={[styles.sectionDiagonalLine, styles.sectionDiagonalLine1]} />
        <View style={[styles.sectionDiagonalLine, styles.sectionDiagonalLine2]} />
      </View>
      <TouchableOpacity 
        onPress={toggleExpand} 
        style={styles.collapsibleSectionHeader}
        activeOpacity={0.7}
      >
        <View style={styles.collapsibleSectionHeaderLeft}>
          <Text style={styles.collapsibleSectionTitle}>{title}</Text>
        </View>
        <Animated.View style={{ transform: [{ rotate: arrowRotation }] }}>
          <ChevronDownIcon size={16} color="#4ADE80" />
        </Animated.View>
      </TouchableOpacity>
      {isExpanded && (
        <View style={styles.collapsibleSectionContent}>
          {children}
        </View>
      )}
    </View>
  );
};

// Helper to capitalize names
const capitalizeName = (name) => {
  if (!name || typeof name !== 'string') return name;
  return name
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// PlayerStatCard Component - Adapts to different table types
const PlayerStatCard = React.memo(({ playerData, statType = 'pts' }) => {
  const tableType = detectTableType(playerData);
  const teamAbbr = playerData?.team_abbreviation || teamNameToAbbr[playerData?.team_name];
  const currentTeam = teamColors[teamAbbr] || {};
  const primaryColor = currentTeam.primary || '#4ADE80';
  const secondaryColor = currentTeam.secondary || '#FFFFFF';

  let playerName, subtitle, stat1Label, stat1Value, stat2Label, stat2Value, stat3Label, stat3Value, stat4Label, stat4Value;
  
  if (tableType === 'player_props') {
    playerName = capitalizeName(playerData?.player_name || 'Unknown');
    const propType = playerData?.stat_type?.toUpperCase() || 'PTS';
    subtitle = `${teamAbbr} | ${propType}`;
    stat1Label = 'Line';
    stat1Value = playerData?.current_line?.toFixed(1) || '0';
    stat2Label = 'Last 5';
    stat2Value = playerData?.last5_avg?.toFixed(1) || '0';
    stat3Label = 'Hit %';
    stat3Value = `${Math.round((playerData?.hit_rate_over_last5 || 0) * 100)}%`;
    stat4Label = 'Def';
    stat4Value = playerData?.opp_def_grade || `#${playerData?.opp_def_rank || 'N/A'}`;
  } else if (tableType === 'player_research_new') {
    playerName = capitalizeName(playerData?.player_name || 'Unknown');
    subtitle = `${teamAbbr} | ${playerData?.position || 'N/A'}`;
    stat1Label = 'Season';
    stat1Value = playerData[`${statType}_season_avg`]?.toFixed(1) || '0';
    stat2Label = 'Last 5';
    stat2Value = playerData[`${statType}_last5_avg`]?.toFixed(1) || '0';
    stat3Label = 'Floor';
    stat3Value = playerData[`${statType}_floor_last10`] || '0';
    stat4Label = 'Ceiling';
    stat4Value = playerData[`${statType}_ceiling_last10`] || '0';
  } else if (tableType === 'team_research') {
    playerName = playerData?.team_full_name || teamAbbr || 'Unknown Team';
    subtitle = `${playerData?.conference || ''} | ${playerData?.division || ''}`;
    stat1Label = 'Def Rtg';
    stat1Value = playerData?.def_rtg_season?.toFixed(1) || 'N/A';
    stat2Label = 'Pace';
    stat2Value = playerData?.pace_season?.toFixed(1) || 'N/A';
    stat3Label = 'vs G';
    stat3Value = playerData?.guard_points_grade || `#${playerData?.guard_points_rank || 'N/A'}`;
    stat4Label = 'vs F';
    stat4Value = playerData?.forward_points_grade || `#${playerData?.forward_points_rank || 'N/A'}`;
  } else {
    playerName = capitalizeName(playerData?.player_name || 'Unknown');
    subtitle = teamAbbr || 'N/A';
    stat1Label = 'Season';
    stat1Value = playerData[`${statType}_season_avg`]?.toFixed(1) || '0';
    stat2Label = 'Last 5';
    stat2Value = playerData[`${statType}_last5_avg`]?.toFixed(1) || '0';
    stat3Label = 'L10';
    stat3Value = playerData[`${statType}_last10_avg`]?.toFixed(1) || '0';
    stat4Label = 'Games';
    stat4Value = playerData?.games_played || '0';
  }

  const getStat2Color = () => {
    if (tableType === 'player_props') {
      const line = playerData?.current_line || 0;
      const last5 = playerData?.last5_avg || 0;
      return last5 > line ? '#10B981' : '#EF4444';
    }
    const season = playerData[`${statType}_season_avg`] || 0;
    const last5 = playerData[`${statType}_last5_avg`] || 0;
    return last5 > season ? '#10B981' : last5 < season ? '#EF4444' : '#4ADE80';
  };

  const getStat3Color = () => {
    if (tableType === 'player_props') {
      const hitRate = Math.round((playerData?.hit_rate_over_last5 || 0) * 100);
      return hitRate >= 70 ? '#10B981' : hitRate <= 40 ? '#EF4444' : '#4ADE80';
    }
    return '#4ADE80';
  };

  return (
    <View style={playerStatCardStyles.playerStatCard}>
      <View style={playerStatCardStyles.playerStatCardContainer}>
        <View style={playerStatCardStyles.playerStatCardHeader}>
          <View style={playerStatCardStyles.playerStatCardNameSection}>
            <Text style={playerStatCardStyles.playerStatCardName} numberOfLines={1}>
              {playerName}
            </Text>
            <Text style={playerStatCardStyles.playerStatCardTeam}>
              {subtitle}
            </Text>
          </View>
          <View style={[playerStatCardStyles.playerStatCardBadge, { backgroundColor: primaryColor, borderColor: secondaryColor }]}>
            <Text style={[playerStatCardStyles.playerStatCardBadgeText, { color: secondaryColor }]}>
              {teamAbbr || '?'}
            </Text>
          </View>
        </View>
        <View style={playerStatCardStyles.playerStatCardStatsRow}>
          <View style={playerStatCardStyles.playerStatCardStat}>
            <Text style={playerStatCardStyles.playerStatCardStatLabel}>{stat1Label}</Text>
            <Text style={[playerStatCardStyles.playerStatCardStatValue, { color: '#4ADE80' }]}>{stat1Value}</Text>
          </View>
          <View style={playerStatCardStyles.playerStatCardDivider} />
          <View style={playerStatCardStyles.playerStatCardStat}>
            <Text style={playerStatCardStyles.playerStatCardStatLabel}>{stat2Label}</Text>
            <Text style={[playerStatCardStyles.playerStatCardStatValue, { color: getStat2Color() }]}>{stat2Value}</Text>
          </View>
          <View style={playerStatCardStyles.playerStatCardDivider} />
          <View style={playerStatCardStyles.playerStatCardStat}>
            <Text style={playerStatCardStyles.playerStatCardStatLabel}>{stat3Label}</Text>
            <Text style={[playerStatCardStyles.playerStatCardStatValue, { color: getStat3Color() }]}>{stat3Value}</Text>
          </View>
          <View style={playerStatCardStyles.playerStatCardDivider} />
          <View style={playerStatCardStyles.playerStatCardStat}>
            <Text style={playerStatCardStyles.playerStatCardStatLabel}>{stat4Label}</Text>
            <Text style={[playerStatCardStyles.playerStatCardStatValue, { color: '#4ADE80' }]}>{stat4Value}</Text>
          </View>
        </View>
      </View>
    </View>
  );
});

// PlayerStatCard Styles
const playerStatCardStyles = StyleSheet.create({
  playerStatCard: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  playerStatCardContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.4)',
    padding: 16,
  },
  playerStatCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  playerStatCardNameSection: {
    flex: 1,
    marginRight: 12,
  },
  playerStatCardName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  playerStatCardTeam: {
    fontSize: 13,
    fontWeight: '600',
    color: '#9CA3AF',
    letterSpacing: 0.3,
  },
  playerStatCardBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playerStatCardBadgeText: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  playerStatCardStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.2)',
  },
  playerStatCardStat: {
    flex: 1,
    alignItems: 'center',
  },
  playerStatCardStatLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#9CA3AF',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  playerStatCardStatValue: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  playerStatCardDivider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(74, 222, 128, 0.3)',
    marginHorizontal: 8,
  },
});

// ChatDataTable Component - Display multiple results in a modal popup
const ChatDataTable = React.memo(({ queryResults, statType = 'pts' }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  if (!queryResults || queryResults.length === 0) {
    return null;
  }

  const tableType = detectTableType(queryResults[0]);
  const getLabel = () => {
    switch (tableType) {
      case 'player_props':
        return { singular: 'Prop', plural: 'Props', icon: TargetIcon };
      case 'team_research':
        return { singular: 'Team', plural: 'Teams', icon: ShieldIcon };
      default:
        return { singular: 'Player', plural: 'Players', icon: ChartIcon };
    }
  };
  
  const label = getLabel();
  const IconComp = label.icon;
  const displayText = queryResults.length === 1 ? label.singular : label.plural;

  return (
    <>
      <TouchableOpacity 
        style={chatDataTableStyles.chatDataTableTrigger}
        onPress={() => setIsModalVisible(true)}
        activeOpacity={0.7}
      >
        <View style={chatDataTableStyles.chatDataTableHeader}>
          <IconComp size={16} color="#4ADE80" />
          <Text style={chatDataTableStyles.chatDataTableTitle}>
            {queryResults.length} {displayText} Found
          </Text>
        </View>
        <Text style={chatDataTableStyles.chatDataTableSubtext}>Tap to view all {displayText.toLowerCase()}</Text>
      </TouchableOpacity>

      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <SafeAreaView style={chatDataTableStyles.modalContainer}>
          <StatusBar barStyle="light-content" backgroundColor="#000000" />
          
          <View style={chatDataTableStyles.modalHeader}>
            <View style={chatDataTableStyles.modalHeaderContent}>
              <IconComp size={20} color="#4ADE80" />
              <Text style={chatDataTableStyles.modalTitle}>
                {queryResults.length} {displayText} Found
              </Text>
            </View>
            <TouchableOpacity 
              onPress={() => setIsModalVisible(false)}
              style={chatDataTableStyles.modalCloseButton}
            >
              <Text style={chatDataTableStyles.modalCloseText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={chatDataTableStyles.modalScrollView}
            contentContainerStyle={chatDataTableStyles.modalScrollContent}
          >
            {queryResults.map((data, index) => (
              <PlayerStatCard 
                key={`result-${index}`} 
                playerData={data} 
                statType={statType}
              />
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </>
  );
});

// ChatDataTable Styles
const chatDataTableStyles = StyleSheet.create({
  chatDataTableTrigger: {
    marginTop: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.4)',
    overflow: 'hidden',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  chatDataTableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  chatDataTableTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4ADE80',
    marginLeft: 8,
    letterSpacing: 0.3,
  },
  chatDataTableSubtext: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 4,
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(74, 222, 128, 0.3)',
    backgroundColor: 'rgba(6, 95, 70, 0.15)',
  },
  modalHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    marginLeft: 10,
    letterSpacing: 0.3,
  },
  modalCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
  modalCloseText: {
    fontSize: 20,
    color: '#EF4444',
    fontWeight: '600',
  },
  modalScrollView: {
    flex: 1,
  },
  modalScrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
});

export default function ChatScreen() {
  // Get route params for sport selection from other screens
  const params = useLocalSearchParams();
  const initialSport = params.sport && ['NFL', 'NBA'].includes(params.sport.toUpperCase()) 
    ? params.sport.toUpperCase() 
    : 'NFL';
  const initialMessage = params.initialMessage || '';
  const messageTimestamp = params.messageTimestamp || '';
  
  // Load Barlow Condensed font
  const [fontsLoaded] = useFonts({
    BarlowCondensed_400Regular,
    BarlowCondensed_600SemiBold,
    BarlowCondensed_700Bold,
  });

  // Sport selection state - initialized from params if provided
  const [selectedSport, setSelectedSport] = useState(initialSport);
  const currentSportConfig = SPORTS_CONFIG.find(s => s.id === selectedSport) || SPORTS_CONFIG[0];

  const [messages, setMessages] = useState([
    {
      id: '1',
      text: "Hey! I'm your AI sports assistant. Select a sport above and ask me anything about players, stats, teams, or matchups!",
      sender: 'ai',
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [serverStatus, setServerStatus] = useState('checking');
  const [showScanModal, setShowScanModal] = useState(false);
  const [lastProcessedTimestamp, setLastProcessedTimestamp] = useState('');
  const flatListRef = useRef(null);

  // Animation values
  const headerFade = useRef(new Animated.Value(0)).current;
  const headerSlide = useRef(new Animated.Value(-20)).current;

  // ========== SCAN HANDLERS ==========
  
  // Handle plus button press - show scan options for both NFL and NBA
  const handlePlusPress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    if (selectedSport === 'NFL' || selectedSport === 'NBA') {
      // Show modal with Game Scan and Prop Scan options
      setShowScanModal(true);
    }
  };

  // NFL Game Scan Handler
  const handleNFLGameScan = async () => {
    setShowScanModal(false);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    try {
      console.log('🏈 Chat - NFL Game Scan - Launching image picker...');
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedImageUri = result.assets[0].uri;
        console.log('🏈 Chat - NFL Game Scan - Selected image URI:', selectedImageUri);
        
        const encodedImageUri = encodeURIComponent(selectedImageUri);
        const queryString = `?imageUri=${encodedImageUri}&timestamp=${Date.now()}&betType=game`;
        
        router.push(`/nflgamescanningscreen${queryString}`);
      }
    } catch (error) {
      console.error('🏈 Chat - NFL Game Scan - Error:', error);
      Alert.alert('Error', 'Failed to upload game bet image. Please try again.');
    }
  };

  // NFL Prop Scan Handler
  const handleNFLPropScan = async () => {
    setShowScanModal(false);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedImageUri = result.assets[0].uri;
        console.log('🏈 Chat - NFL Prop Scan - Selected image URI:', selectedImageUri);
        
        const encodedImageUri = encodeURIComponent(selectedImageUri);
        const queryString = `?imageUri=${encodedImageUri}&timestamp=${Date.now()}`;
        
        router.push(`/nflscanningscreen${queryString}`);
      }
    } catch (error) {
      console.error('🏈 Chat - NFL Prop Scan - Error:', error);
      Alert.alert('Error', 'Failed to upload prop bet image. Please try again.');
    }
  };

  // NBA Game Scan Handler
  const handleNBAGameScan = async () => {
    setShowScanModal(false);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    try {
      console.log('🏀 Chat - NBA Game Scan - Launching image picker...');
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedImageUri = result.assets[0].uri;
        console.log('🏀 Chat - NBA Game Scan - Selected image URI:', selectedImageUri);
        
        const encodedImageUri = encodeURIComponent(selectedImageUri);
        const queryString = `?imageUri=${encodedImageUri}&timestamp=${Date.now()}&betType=game`;
        
        router.push(`/nbagamescanningscreen${queryString}`);
      }
    } catch (error) {
      console.error('🏀 Chat - NBA Game Scan - Error:', error);
      Alert.alert('Error', 'Failed to upload game bet image. Please try again.');
    }
  };

  // NBA Prop Scan Handler
  const handleNBAPropScan = async () => {
    setShowScanModal(false);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedImageUri = result.assets[0].uri;
        console.log('🏀 Chat - NBA Prop Scan - Selected image URI:', selectedImageUri);
        
        const encodedImageUri = encodeURIComponent(selectedImageUri);
        const queryString = `?imageUri=${encodedImageUri}&timestamp=${Date.now()}`;
        
        router.push(`/nbascanningscreen${queryString}`);
      }
    } catch (error) {
      console.error('🏀 Chat - NBA Prop Scan - Error:', error);
      Alert.alert('Error', 'Failed to upload prop bet image. Please try again.');
    }
  };

  // Check server health when sport changes
  useEffect(() => {
    const checkServerHealth = async () => {
      // For Vercel deployment (healthUrl is null), assume always connected
      if (!currentSportConfig.healthUrl) {
        setServerStatus('connected');
        return;
      }
      
      setServerStatus('checking');
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        
        const response = await fetch(currentSportConfig.healthUrl, {
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          setServerStatus('connected');
        } else {
          setServerStatus('error');
        }
      } catch (error) {
        setServerStatus('disconnected');
      }
    };

    checkServerHealth();
  }, [selectedSport]);

  // Start entrance animations
  useEffect(() => {
    Animated.timing(headerFade, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    Animated.timing(headerSlide, {
      toValue: 0,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  // Reset messages when sport changes
  useEffect(() => {
    setMessages([
      {
        id: '1',
        text: `Hey! I'm your ${selectedSport} AI assistant. Ask me anything about ${selectedSport} players, stats, teams, or matchups!`,
        sender: 'ai',
        timestamp: new Date(),
      },
    ]);
  }, [selectedSport]);

  // Send message function that can accept optional message parameter
  const handleSend = async (messageOverride = null) => {
    const messageToSend = messageOverride || inputText;
    if (!messageToSend.trim()) return;

    Keyboard.dismiss();

    const userMessage = {
      id: Date.now().toString(),
      text: messageToSend.trim(),
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => {
      const newMessages = [...prev, userMessage];
      // Scroll to show user's message at top of screen after adding
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({
          index: newMessages.length - 1,
          animated: true,
          viewPosition: 0, // 0 = top of visible area
        });
      }, 100);
      return newMessages;
    });
    if (!messageOverride) {
      setInputText('');
    }
    setIsLoading(true);

    // Check if this sport supports streaming (NBA only for now)
    // Note: React Native doesn't support ReadableStream, so we use XMLHttpRequest for SSE
    if (currentSportConfig.supportsStreaming && currentSportConfig.streamUrl) {
      // ========== STREAMING MODE (NBA) with smooth character animation ==========
      const aiMessageId = (Date.now() + 1).toString();
      
      // Use an object to store mutable state - ensures closures always see latest values
      const streamState = {
        fullReceivedText: '',
        displayedText: '',
        queryResults: null,
        sseBuffer: '',
        animationInterval: null,
        isComplete: false,
        doneEventReceived: false,
      };
      
      // Character animation speed (ms per character) - lower = faster
      const CHAR_DELAY = 2; // Fast typing animation
      
      // Add placeholder AI message that will be updated as characters animate
      setMessages((prev) => [...prev, {
        id: aiMessageId,
        text: '',
        sender: 'ai',
        timestamp: new Date(),
        isStreaming: true,
      }]);

      // Finalize the message with all data including queryResults
      const finalizeMessage = () => {
        if (streamState.animationInterval) {
          clearInterval(streamState.animationInterval);
          streamState.animationInterval = null;
        }
        
        const parsedText = parseStructuredText(streamState.fullReceivedText);
        console.log('📊 Finalizing message with queryResults:', streamState.queryResults ? `${streamState.queryResults.length} items` : 'none');
        
        setMessages((prev) => prev.map((msg) => 
          msg.id === aiMessageId 
            ? { 
                ...msg, 
                text: parsedText,
                queryResults: streamState.queryResults,
                isStreaming: false,
              }
            : msg
        ));
        setIsLoading(false);
      };

      // Start the character-by-character animation loop
      const startAnimation = () => {
        if (streamState.animationInterval) return; // Already running
        
        streamState.animationInterval = setInterval(() => {
          if (streamState.displayedText.length < streamState.fullReceivedText.length) {
            // Reveal next character(s) - reveal 8 chars at a time for faster feel
            const charsToAdd = Math.min(8, streamState.fullReceivedText.length - streamState.displayedText.length);
            streamState.displayedText = streamState.fullReceivedText.slice(0, streamState.displayedText.length + charsToAdd);
            const parsedText = parseStructuredText(streamState.displayedText);
            
            setMessages((prev) => prev.map((msg) => 
              msg.id === aiMessageId 
                ? { ...msg, text: parsedText }
                : msg
            ));
            
            // Scroll down smoothly as content loads (throttled)
          } else if (streamState.doneEventReceived && streamState.displayedText.length >= streamState.fullReceivedText.length) {
            // Animation complete AND done event received - finalize with queryResults
            finalizeMessage();
          }
        }, CHAR_DELAY);
      };

      const xhr = new XMLHttpRequest();
      
      xhr.onprogress = () => {
        // Get new data since last check
        const newData = xhr.responseText.slice(streamState.sseBuffer.length);
        streamState.sseBuffer = xhr.responseText;
        
        // Parse SSE events from new data
        const lines = newData.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.text !== undefined) {
                // Chunk received - add to full text buffer
                streamState.fullReceivedText += data.text;
                // Start animation if not running
                startAnimation();
              } else if (data.fullText !== undefined) {
                // Done event - set final text and queryResults
                streamState.fullReceivedText = data.fullText;
                streamState.queryResults = data.queryResults || null;
                streamState.isComplete = true;
                streamState.doneEventReceived = true;
                console.log('📊 Done event received, queryResults:', streamState.queryResults ? `${streamState.queryResults.length} items` : 'none');
                // Ensure animation is running to finish displaying
                startAnimation();
              } else if (data.message !== undefined && data.stage !== undefined) {
                console.log(`📊 Stream status: ${data.stage} - ${data.message}`);
              }
            } catch (parseError) {
              // Non-critical parse error, continue
            }
          }
        }
      };
      
      xhr.onload = () => {
        console.log('📊 XHR onload triggered');
        streamState.isComplete = true;
        
        // ALWAYS parse the FULL response to find the done event (not just remaining data)
        // This ensures we catch it even if onprogress missed it
        const fullResponse = xhr.responseText;
        const allLines = fullResponse.split('\n');
        
        for (const line of allLines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.fullText !== undefined && !streamState.doneEventReceived) {
                streamState.fullReceivedText = data.fullText;
                streamState.queryResults = data.queryResults || null;
                streamState.doneEventReceived = true;
                console.log('📊 [onload] Found done event, queryResults:', streamState.queryResults ? `${streamState.queryResults.length} items` : 'none');
              }
            } catch (e) {
              // JSON parse error - might be incomplete, that's ok
            }
          }
        }
        
        // If no animation running and we have text, start it
        if (!streamState.animationInterval && streamState.fullReceivedText.length > 0) {
          startAnimation();
        } else if (streamState.fullReceivedText.length === 0) {
          // No text received at all
          setMessages((prev) => prev.map((msg) => 
            msg.id === aiMessageId 
              ? { ...msg, text: 'No response received.', isStreaming: false }
              : msg
          ));
          setIsLoading(false);
          return;
        }
        
        // If done event received and text is already fully displayed, finalize now
        if (streamState.doneEventReceived && 
            streamState.displayedText.length >= streamState.fullReceivedText.length) {
          finalizeMessage();
        }
      };
      
      xhr.onerror = () => {
        console.error('Streaming XHR error');
        if (streamState.animationInterval) {
          clearInterval(streamState.animationInterval);
          streamState.animationInterval = null;
        }
        const errorText = `🔌 Network error connecting to ${selectedSport} server.\n\n📋 Please check:\n• Your internet connection\n• Try again in a moment\n\nIf the problem persists, the server may be temporarily unavailable.`;
        
        setMessages((prev) => {
          const filtered = prev.filter(msg => msg.id !== aiMessageId);
          return [...filtered, {
            id: (Date.now() + 1).toString(),
            text: errorText,
            sender: 'ai',
            timestamp: new Date(),
            isError: true,
          }];
        });
        setIsLoading(false);
      };
      
      xhr.ontimeout = () => {
        console.error('Streaming timeout');
        if (streamState.animationInterval) {
          clearInterval(streamState.animationInterval);
          streamState.animationInterval = null;
        }
        setMessages((prev) => prev.map((msg) => 
          msg.id === aiMessageId 
            ? { ...msg, text: streamState.fullReceivedText || '⏱️ Request timed out.', isStreaming: false }
            : msg
        ));
        setIsLoading(false);
      };
      
      xhr.open('POST', currentSportConfig.streamUrl);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.setRequestHeader('Accept', 'text/event-stream');
      xhr.timeout = 60000; // 60 second timeout
      
      xhr.send(JSON.stringify({
        question: userMessage.text,
        conversationHistory: messages.slice(-5).map((m) => ({
          role: m.sender === 'user' ? 'user' : 'assistant',
          content: m.text,
        })),
      }));
      
    } else {
      // ========== NON-STREAMING MODE (NFL) ==========
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);

        const response = await fetch(currentSportConfig.apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
          },
          cache: 'no-store',
          body: JSON.stringify({
            question: userMessage.text,
            conversationHistory: messages.slice(-5).map((m) => ({
              role: m.sender === 'user' ? 'user' : 'assistant',
              content: m.text,
            })),
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to get response');
        }

        let cleanAnswer = '';
        let queryResults = null;
        
        if (typeof data === 'string') {
          try {
            const parsed = JSON.parse(data);
            cleanAnswer = parsed.answer || data;
            queryResults = parsed.queryResults || null;
          } catch {
            cleanAnswer = data;
          }
        } else if (data.answer) {
          cleanAnswer = data.answer;
          
          // Handle V3 MCP format - extract data from toolResults
          if (data.queryResults) {
            queryResults = data.queryResults;
          } else if (data.toolResults && Array.isArray(data.toolResults)) {
            // Extract actual data from MCP toolResults format
            const extractedData = [];
            for (const toolResult of data.toolResults) {
              if (toolResult.result?.data && Array.isArray(toolResult.result.data)) {
                extractedData.push(...toolResult.result.data);
              }
            }
            queryResults = extractedData.length > 0 ? extractedData : null;
          }
        } else {
          cleanAnswer = 'No response received';
        }

        const parsedAnswer = parseStructuredText(cleanAnswer);

        const aiMessage = {
          id: (Date.now() + 1).toString(),
          text: parsedAnswer,
          sender: 'ai',
          timestamp: new Date(),
          queryResults: queryResults,
          sqlQuery: data.sqlQuery || null,
        };

        setMessages((prev) => [...prev, aiMessage]);

        // Don't auto-scroll - let user read the response where they are

      } catch (error) {
        console.error('Error sending message:', error);
        
        let errorText = '';
        if (error.name === 'AbortError') {
          errorText = '⏱️ Request timed out. The server might be processing or unreachable.';
        } else if (error.message === 'Network request failed') {
          errorText = `🔌 Cannot connect to ${selectedSport} server.\n\n📋 Troubleshooting:\n\n1️⃣ Start the server:\n   cd api\n   npm run ${selectedSport.toLowerCase()}-chat\n\n2️⃣ Check server is running\n\n3️⃣ Make sure both devices are on the same WiFi network`;
        } else {
          errorText = `❌ Error: ${error.message}\n\nMake sure the ${selectedSport} chat server is running.`;
        }
        
        const errorMessage = {
          id: (Date.now() + 1).toString(),
          text: errorText,
          sender: 'ai',
          timestamp: new Date(),
          isError: true,
        };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Handle initial message from Quick Chat on analysis screen
  useEffect(() => {
    // Only process if there's a message with a new timestamp and server is ready
    if (initialMessage && messageTimestamp && messageTimestamp !== lastProcessedTimestamp && serverStatus !== 'checking') {
      setLastProcessedTimestamp(messageTimestamp);
      // Small delay to ensure UI is ready
      setTimeout(() => {
        handleSend(initialMessage);
      }, 600);
    }
  }, [initialMessage, messageTimestamp, lastProcessedTimestamp, serverStatus]);

  const renderMessage = ({ item }) => {
    const isAI = item.sender === 'ai';
    const hasData = isAI && hasVisualizableData(item.queryResults);

    if (!hasData) {
      if (!isAI) {
        return (
          <View style={[styles.messageContainer, styles.userMessageContainer]}>
            <View style={[styles.messageBubble, styles.userMessageBubble]}>
              {/* Decorative diagonal stripes */}
              <View style={styles.bubbleDecorativeLines}>
                <View style={[styles.bubbleDiagonalLine, styles.bubbleDiagonalLine1]} />
                <View style={[styles.bubbleDiagonalLine, styles.bubbleDiagonalLine2]} />
              </View>
              <Text style={[styles.messageText, styles.userMessageText]}>
                {item.text}
              </Text>
              <Text style={styles.timestamp}>
                {item.timestamp.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </View>
          </View>
        );
      }
      
      return (
        <View style={[styles.messageContainer, styles.aiMessageContainer]}>
          <View style={styles.aiTextContainer}>
            {item.isError ? (
              <Text style={[styles.aiPlainText, styles.errorMessageText]}>
                {item.text}
              </Text>
            ) : (
              <Text style={styles.aiPlainText}>
                {formatAIResponseText(item.text, styles.aiBoldText, styles.aiPlainText)}
              </Text>
            )}
          </View>
        </View>
      );
    }

    // Data-rich message with visualizations
    const primaryData = item.queryResults[0];
    const tableType = detectTableType(primaryData);
    const insights = parsePlayerInsights(primaryData);
    const isSingleResult = item.queryResults.length === 1;

    // Dynamic section configuration based on table type
    const getSections = () => {
      if (tableType === 'player_props') {
        return [
          { title: 'Betting Lines', icon: TargetIcon, types: ['recent_performance', 'hit_rate', 'odds'] },
          { title: 'Performance', icon: TrendingUpIcon, types: ['momentum', 'hot_cold'] },
          { title: 'Matchup', icon: ShieldIcon, types: ['matchup', 'vs_opp'] },
        ];
      } else if (tableType === 'team_research') {
        return [
          { title: 'Team Overview', icon: ChartIcon, types: ['recent_performance', 'pace'] },
          { title: 'Position Defense', icon: ShieldIcon, types: ['guard_defense', 'forward_defense', 'center_defense'] },
          { title: 'Targeting', icon: TargetIcon, types: ['injuries', 'weakness'] },
        ];
      } else {
        // player_research_new
        return [
          { title: 'Performance', icon: ChartIcon, types: ['recent_performance', 'momentum', 'hot_cold'] },
          { title: 'Trends & Splits', icon: CalendarIcon, types: ['consistency', 'location', 'rest'] },
          { title: 'Matchup', icon: ShieldIcon, types: ['matchup'] },
        ];
      }
    };

    const sections = getSections();

    return (
      <View style={[styles.messageContainer, styles.aiMessageContainer]}>
        <View style={styles.dataRichMessageContainer}>
          {/* AI Text Answer */}
          <View style={styles.aiTextContainer}>
            <Text style={styles.aiPlainText}>
              {formatAIResponseText(item.text, styles.aiBoldText, styles.aiPlainText)}
            </Text>
          </View>

          {/* Performance Section - Overview Style for player_research_new */}
          {isSingleResult && tableType === 'player_research_new' && (
            <View style={styles.insightsContainer}>
              <CollapsibleDataSection 
                title="Performance" 
                IconComponent={ChartIcon}
                defaultExpanded={false}
              >
                <PlayerOverviewStats playerData={primaryData} />
              </CollapsibleDataSection>
            </View>
          )}

          {/* Team Overview Section - All team tabs as vertical collapsible sections for team_research */}
          {isSingleResult && tableType === 'team_research' && (
            <View style={styles.insightsContainer}>
              <TeamOverviewStats teamData={primaryData} />
            </View>
          )}

          {/* ======== NFL DATA VISUALIZATIONS ======== */}
          
          {/* NFL Player Performance Section - Position-specific stats with collapsible sections */}
          {isSingleResult && tableType === 'nfl_player_research' && (
            <View style={styles.insightsContainer}>
              <NFLPlayerOverviewStats playerData={primaryData} />
            </View>
          )}

          {/* NFL Team Defense Section - All position defense tabs as vertical collapsible sections */}
          {isSingleResult && tableType === 'nfl_team_research' && (
            <View style={styles.insightsContainer}>
              <NFLTeamOverviewStats teamData={primaryData} />
            </View>
          )}

          {/* NFL Performance Charts - for nfl_player_research */}
          {isSingleResult && tableType === 'nfl_player_research' && (
            <CollapsibleDataSection 
              title="Performance Charts" 
              IconComponent={ChartIcon}
              defaultExpanded={false}
            >
              <View style={styles.chartsContainer}>
                <NFLRecentPerformanceChart player={primaryData} />
              </View>
            </CollapsibleDataSection>
          )}

          {/* NFL Home/Away Charts - for nfl_player_research */}
          {isSingleResult && tableType === 'nfl_player_research' && (
            <CollapsibleDataSection 
              title="Home/Away Splits" 
              IconComponent={CalendarIcon}
              defaultExpanded={false}
            >
              <View style={styles.chartsContainer}>
                <NFLHomeAwayChart player={primaryData} />
              </View>
            </CollapsibleDataSection>
          )}

          {/* NFL Team Charts - for nfl_team_research */}
          {isSingleResult && tableType === 'nfl_team_research' && (
            <CollapsibleDataSection 
              title="Team Defense Charts" 
              IconComponent={ChartIcon}
              defaultExpanded={false}
            >
              <View style={styles.chartsContainer}>
                <NFLTeamDefenseChart team={primaryData} />
              </View>
            </CollapsibleDataSection>
          )}

          {/* NFL Team Offense Charts - for nfl_team_research */}
          {isSingleResult && tableType === 'nfl_team_research' && (
            <CollapsibleDataSection 
              title="Team Offense Charts" 
              IconComponent={TrendingUpIcon}
              defaultExpanded={false}
            >
              <View style={styles.chartsContainer}>
                <NFLTeamOffenseChart team={primaryData} />
              </View>
            </CollapsibleDataSection>
          )}

          {/* ======== END NFL DATA VISUALIZATIONS ======== */}

          {/* Data Visualizations - Sectioned InsightCards (for player_props only) */}
          {isSingleResult && insights.length > 0 && tableType === 'player_props' && (
            <View style={styles.insightsContainer}>
              {sections.map((section, sectionIdx) => {
                const sectionInsights = insights.filter(i => section.types.includes(i.type));
                if (sectionInsights.length === 0) return null;
                
                return (
                  <CollapsibleDataSection 
                    key={`section-${sectionIdx}`}
                    title={section.title} 
                    IconComponent={section.icon}
                    defaultExpanded={false}
                  >
                    {sectionInsights.map((insight, idx) => (
                      <ChatInsightCard
                        key={`insight-${sectionIdx}-${idx}`}
                        title={insight.title}
                        statHighlight={insight.statHighlight}
                        context={insight.context}
                        variant={insight.variant}
                        IconComponent={insight.IconComponent}
                      />
                    ))}
                  </CollapsibleDataSection>
                );
              })}
            </View>
          )}

          {/* Performance Charts - for player_research_new (Tabbed) */}
          {isSingleResult && tableType === 'player_research_new' && (
            <CollapsibleDataSection 
              title="Charts" 
              IconComponent={ChartIcon}
              defaultExpanded={false}
            >
              <View style={styles.chartsContainer}>
                <ChatTabbedChart
                  playerData={primaryData}
                  chartType="basic"
                  title="Recent Performance"
                />
              </View>
            </CollapsibleDataSection>
          )}

          {/* Efficiency Charts - for player_research_new (Tabbed) */}
          {isSingleResult && tableType === 'player_research_new' && (
            <CollapsibleDataSection 
              title="Efficiency" 
              IconComponent={ChartIcon}
              defaultExpanded={false}
            >
              <View style={styles.chartsContainer}>
                <ChatTabbedChart
                  playerData={primaryData}
                  chartType="efficiency"
                  title="Shooting Efficiency"
                />
              </View>
            </CollapsibleDataSection>
          )}

          {/* Combo Stats Charts - for player_research_new (Tabbed) */}
          {isSingleResult && tableType === 'player_research_new' && (
            <CollapsibleDataSection 
              title="Combos" 
              IconComponent={ChartIcon}
              defaultExpanded={false}
            >
              <View style={styles.chartsContainer}>
                <ChatTabbedChart
                  playerData={primaryData}
                  chartType="combo"
                  title="Combo Stats"
                />
              </View>
            </CollapsibleDataSection>
          )}

          {/* Averages Tables - for player_props (one per unique player) */}
          {tableType === 'player_props' && primaryData?.season_avg != null && (() => {
            const uniquePlayers = {};
            (item.queryResults || [primaryData]).forEach(row => {
              if (row?.player_name && !uniquePlayers[row.player_name]) {
                uniquePlayers[row.player_name] = row;
              }
            });
            const playerList = Object.values(uniquePlayers);
            
            return (
              <CollapsibleDataSection 
                title={`Averages${playerList.length > 1 ? ` (${playerList.length} Players)` : ''}`}
                IconComponent={ChartIcon}
                defaultExpanded={false}
              >
                <View style={styles.chartsContainer}>
                  {playerList.map((playerProp, idx) => (
                    <ChatPropsAveragesTable
                      key={`${playerProp.player_name}-${idx}`}
                      propData={playerProp}
                      statType={playerProp?.stat_type || playerProp?.market_type}
                      playerName={playerProp.player_name}
                    />
                  ))}
                </View>
              </CollapsibleDataSection>
            );
          })()}

          {/* Injuries Table - for player_props (one per unique player) */}
          {tableType === 'player_props' && (() => {
            const uniquePlayers = {};
            (item.queryResults || [primaryData]).forEach(row => {
              if (row?.player_name && !uniquePlayers[row.player_name]) {
                uniquePlayers[row.player_name] = row;
              }
            });
            const playerList = Object.values(uniquePlayers);
            
            const hasAnyInjuryData = playerList.some(p => 
              p.player_status || p.teammate_stars_out > 0 || p.teammates_out || 
              p.opp_stars_out > 0 || p.opponents_out || p.injury_boost_score
            );
            
            if (!hasAnyInjuryData) return null;
            
            return (
              <CollapsibleDataSection 
                title={`Injuries${playerList.length > 1 ? ` (${playerList.length} Players)` : ''}`}
                IconComponent={ChartIcon}
                defaultExpanded={false}
              >
                <View style={styles.chartsContainer}>
                  {playerList.map((playerProp, idx) => (
                    <ChatPropsInjuriesTable
                      key={`injuries-${playerProp.player_name}-${idx}`}
                      propData={playerProp}
                      playerName={playerProp.player_name}
                    />
                  ))}
                </View>
              </CollapsibleDataSection>
            );
          })()}

          {/* Multi-result display - ChatDataTable */}
          {!isSingleResult && (
            <ChatDataTable 
              queryResults={item.queryResults}
              statType={detectStatType(primaryData)}
            />
          )}
        </View>
      </View>
    );
  };

  const SportIcon = currentSportConfig.icon;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      <View style={styles.blackBackground}>
        {/* Header - Analysis Screen Style */}
        <Animated.View
          style={[
            styles.headerContainer,
            {
              opacity: headerFade,
              transform: [{ translateY: headerSlide }],
            },
          ]}
        >
          {/* Decorative diagonal lines - behind content */}
          <View style={styles.heroDecorativeLines}>
            <View style={[styles.heroDiagonalLine, styles.heroDiagonalLine1]} />
            <View style={[styles.heroDiagonalLine, styles.heroDiagonalLine2]} />
          </View>
          
          {/* Top Header Bar */}
          <View style={styles.topHeaderBar}>
            {/* Profile Button - Left */}
            <TouchableOpacity 
              style={styles.profileButton}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push('/(tabs)/settings');
              }}
              activeOpacity={0.7}
            >
              <ProfileIcon size={14} color="#A7F3D0" />
            </TouchableOpacity>

            {/* Logo Center */}
            <View style={styles.logoCenter}>
              <Image 
                source={require('../../assets/images/propify-logo-original.png')} 
                style={styles.logoImage}
                resizeMode="contain"
              />
              <Text style={styles.logoText}>AI Chat</Text>
              {serverStatus === 'connected' && (
                <View style={styles.statusDot} />
              )}
            </View>

            {/* Community Button - Right */}
            <View style={styles.utilityIcons}>
              <TouchableOpacity 
                style={styles.utilityButton}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push('/(tabs)/community');
                }}
                activeOpacity={0.7}
              >
                <UsersIcon size={14} color="#A7F3D0" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Divider Line */}
          <View style={styles.headerDivider} />

          {/* Sport Selector */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.sportSelectorScroll}
            contentContainerStyle={styles.sportSelectorContent}
          >
            {SPORTS_CONFIG.map((sport) => {
              const isSelected = selectedSport === sport.id;
              
              return (
                <TouchableOpacity
                  key={sport.id}
                  style={[
                    styles.sportSelectorItem,
                    isSelected && styles.sportSelectorItemActive
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setSelectedSport(sport.id);
                  }}
                  activeOpacity={0.7}
                >
                  <Image 
                    source={{ uri: sport.logoUrl }}
                    style={styles.sportLogoImage}
                    resizeMode="contain"
                  />
                  <Text style={[
                    styles.sportSelectorText,
                    isSelected && styles.sportSelectorTextActive
                  ]}>
                    {sport.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </Animated.View>

        {/* Chat Messages */}
        <KeyboardAvoidingView
          style={styles.chatContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 45 : 0}
        >
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.messagesList}
            ListHeaderComponent={
              <View style={styles.welcomeCardsContainer}>
                <MiniStackedAnalysisCards />
                <Text style={styles.welcomeCardsSubtitle}>
                  Upload a bet slip or ask me anything about sports analytics
                </Text>
              </View>
            }
            ListFooterComponent={isLoading ? <TypingIndicator sport={selectedSport} /> : null}
            onScrollToIndexFailed={(info) => {
              // Fallback: wait and retry scroll
              setTimeout(() => {
                flatListRef.current?.scrollToIndex({
                  index: info.index,
                  animated: true,
                  viewPosition: 0,
                });
              }, 200);
            }}
          />

          {/* Input Area - ChatGPT Style */}
          <View style={styles.inputContainer}>
            {/* Plus Button for Scan */}
            <TouchableOpacity
              style={styles.plusButton}
              onPress={handlePlusPress}
              activeOpacity={0.7}
            >
              <PlusIcon size={22} color="#4ADE80" />
            </TouchableOpacity>

            {/* Text Input with Send Button Inside */}
            <View style={styles.textInputWrapper}>
              {/* Decorative diagonal stripes */}
              <View style={styles.inputDecorativeLines}>
                <View style={[styles.inputDiagonalLine, styles.inputDiagonalLine1]} />
                <View style={[styles.inputDiagonalLine, styles.inputDiagonalLine2]} />
              </View>
              <TextInput
                style={styles.textInput}
                placeholder="Ask about props, matchups, or lines"
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
                value={inputText}
                onChangeText={setInputText}
                onSubmitEditing={() => handleSend()}
                multiline
                maxLength={500}
              />
              
              {/* Send Button - Inside Input */}
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  (inputText.trim() && !isLoading) && styles.sendButtonActive,
                ]}
                onPress={() => handleSend()}
                disabled={!inputText.trim() || isLoading}
                activeOpacity={0.7}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#000000" />
                ) : (
                  <SendIcon size={18} color={inputText.trim() ? '#000000' : '#4ADE80'} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Scan Type Modal - Works for NFL and NBA */}
          <Modal
            visible={showScanModal}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setShowScanModal(false)}
          >
            <TouchableOpacity 
              style={styles.scanModalOverlay}
              activeOpacity={1}
              onPress={() => setShowScanModal(false)}
            >
              <View style={styles.scanModalContainer}>
                {/* Decorative diagonal stripes */}
                <View style={styles.modalDecorativeLines}>
                  <View style={[styles.modalDiagonalLine, styles.modalDiagonalLine1]} />
                  <View style={[styles.modalDiagonalLine, styles.modalDiagonalLine2]} />
                </View>
                <View style={styles.scanModalHeader}>
                  <Text style={styles.scanModalTitle}>Select Scan Type</Text>
                  <TouchableOpacity 
                    onPress={() => setShowScanModal(false)}
                    style={styles.scanModalCloseButton}
                  >
                    <CloseIcon size={20} color="#9CA3AF" />
                  </TouchableOpacity>
                </View>
                
                <View style={styles.scanModalOptions}>
                  {/* Game Scan Option */}
                  <TouchableOpacity 
                    style={styles.scanModalOption}
                    onPress={selectedSport === 'NBA' ? handleNBAGameScan : handleNFLGameScan}
                    activeOpacity={0.7}
                  >
                    <LinearGradient
                      colors={['#065F46', '#059669']}
                      style={styles.scanModalOptionGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <View style={styles.scanModalOptionIcon}>
                        <GameIcon size={28} color="#FFFFFF" />
                      </View>
                      <Text style={styles.scanModalOptionTitle}>Game Scan</Text>
                      <Text style={styles.scanModalOptionDesc}>Analyze game bets & spreads</Text>
                    </LinearGradient>
                  </TouchableOpacity>

                  {/* Prop Scan Option */}
                  <TouchableOpacity 
                    style={styles.scanModalOption}
                    onPress={selectedSport === 'NBA' ? handleNBAPropScan : handleNFLPropScan}
                    activeOpacity={0.7}
                  >
                    <LinearGradient
                      colors={['#0F766E', '#4ADE80']}
                      style={styles.scanModalOptionGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <View style={styles.scanModalOptionIcon}>
                        <ScanIcon size={28} color="#FFFFFF" />
                      </View>
                      <Text style={styles.scanModalOptionTitle}>Prop Scan</Text>
                      <Text style={styles.scanModalOptionDesc}>Analyze player prop bets</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          </Modal>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ProfessionalColors.background,
  },
  blackBackground: {
    flex: 1,
    backgroundColor: '#000000',
  },
  
  // Header Styles - Analysis Screen Style
  headerContainer: {
    paddingTop: 0,
    paddingBottom: 4,
    backgroundColor: 'transparent',
    position: 'relative',
  },
  
  // Decorative diagonal lines
  heroDecorativeLines: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
    overflow: 'hidden',
    pointerEvents: 'none',
  },
  heroDiagonalLine: {
    position: 'absolute',
    width: 500,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4ADE80',
  },
  heroDiagonalLine1: {
    top: -5,
    right: -200,
    transform: [{ rotate: '25deg' }],
    opacity: 0.25,
  },
  heroDiagonalLine2: {
    top: 12,
    right: -200,
    transform: [{ rotate: '25deg' }],
    opacity: 0.15,
  },
  topHeaderBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  headerDivider: {
    height: 1,
    backgroundColor: 'rgba(75, 85, 99, 0.4)',
    marginHorizontal: 10,
    marginTop: 4,
    marginBottom: 2,
  },
  profileButton: {
    width: 30,
    height: 30,
    borderRadius: 6,
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
    width: 22,
    height: 22,
    marginRight: 5,
  },
  logoText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    fontStyle: 'italic',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4ADE80',
    marginLeft: 8,
    shadowColor: '#4ADE80',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 6,
  },
  utilityIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  utilityButton: {
    width: 30,
    height: 30,
    borderRadius: 6,
    backgroundColor: 'rgba(6, 95, 70, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.3)',
  },
  
  // Sport Selector
  sportSelectorScroll: {
    marginTop: 1,
  },
  sportSelectorContent: {
    paddingHorizontal: 0,
    gap: 5,
  },
  sportSelectorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
    backgroundColor: 'rgba(6, 95, 70, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.3)',
    gap: 5,
  },
  sportSelectorItemActive: {
    backgroundColor: '#4ADE80',
    borderColor: '#4ADE80',
    borderWidth: 1.5,
    shadowColor: '#4ADE80',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },
  sportLogoImage: {
    width: 20,
    height: 20,
  },
  sportSelectorText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#A7F3D0',
    letterSpacing: 0.2,
  },
  sportSelectorTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  // Chat Styles
  chatContainer: {
    flex: 1,
  },
  messagesList: {
    paddingHorizontal: 8,
    paddingTop: 20,
    paddingVertical: 16,
    paddingBottom: Platform.OS === 'ios' ? 180 : 160,
  },
  messageContainer: {
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  aiMessageContainer: {
    justifyContent: 'flex-start',
    paddingRight: 0,
  },
  userMessageContainer: {
    justifyContent: 'flex-end',
    flexDirection: 'row-reverse',
  },
  aiIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(74, 222, 128, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: '#4ADE80',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 3,
  },
  messageBubble: {
    maxWidth: '88%',
    padding: 16,
    borderRadius: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  aiMessageBubble: {
    backgroundColor: 'rgba(74, 222, 128, 0.15)',
    borderWidth: 2,
    borderColor: 'rgba(74, 222, 128, 0.4)',
    borderBottomLeftRadius: 6,
  },
  aiTextContainer: {
    flex: 1,
    paddingVertical: 4,
    width: '100%',
  },
  aiPlainText: {
    fontSize: 18,
    lineHeight: 28,
    letterSpacing: 0.4,
    color: 'rgba(255, 255, 255, 0.95)',
    fontFamily: 'BarlowCondensed_400Regular',
  },
  aiBoldText: {
    fontSize: 18,
    lineHeight: 28,
    letterSpacing: 0.4,
    color: '#4ADE80',
    fontFamily: 'BarlowCondensed_700Bold',
  },
  userMessageBubble: {
    backgroundColor: 'rgba(4, 60, 45, 0.25)',
    borderWidth: 1.5,
    borderColor: 'rgba(74, 222, 128, 0.5)',
    borderBottomRightRadius: 6,
    overflow: 'hidden',
    shadowColor: '#4ADE80',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  // Decorative diagonal stripes for user bubble
  bubbleDecorativeLines: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 50,
    zIndex: 0,
    overflow: 'hidden',
    pointerEvents: 'none',
  },
  bubbleDiagonalLine: {
    position: 'absolute',
    width: 200,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4ADE80',
  },
  bubbleDiagonalLine1: {
    top: 4,
    right: -60,
    transform: [{ rotate: '25deg' }],
    opacity: 0.35,
  },
  bubbleDiagonalLine2: {
    top: 16,
    right: -60,
    transform: [{ rotate: '25deg' }],
    opacity: 0.2,
  },
  messageText: {
    fontSize: 18,
    lineHeight: 28,
    letterSpacing: 0.4,
    fontFamily: 'BarlowCondensed_400Regular',
  },
  aiMessageText: {
    color: '#FFFFFF',
  },
  userMessageText: {
    color: '#FFFFFF',
  },
  errorMessageText: {
    color: '#EF4444',
  },
  timestamp: {
    fontSize: 12,
    color: '#666666',
    marginTop: 6,
    alignSelf: 'flex-end',
  },
  
  // Typing Indicator
  typingIndicatorContainer: {
    marginBottom: 16,
    marginHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
  typingBubble: {
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  typingDotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4ADE80',
    shadowColor: '#4ADE80',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  typingDotsOnly: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 6,
    marginLeft: 16,
    marginBottom: 60,
    marginTop: 8,
  },
  
  // Input - ChatGPT Style with Green Outline
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#000000',
    marginBottom: Platform.OS === 'ios' ? 42 : 28,
    gap: 10,
  },
  plusButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(4, 60, 45, 0.25)',
    borderWidth: 1.5,
    borderColor: '#4ADE80',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4ADE80',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  textInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(4, 60, 45, 0.25)',
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#4ADE80',
    paddingLeft: 16,
    paddingRight: 6,
    minHeight: 48,
    overflow: 'hidden',
    shadowColor: '#4ADE80',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  // Decorative diagonal stripes for text input
  inputDecorativeLines: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
    overflow: 'hidden',
    pointerEvents: 'none',
  },
  inputDiagonalLine: {
    position: 'absolute',
    width: 300,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4ADE80',
  },
  inputDiagonalLine1: {
    top: 4,
    right: -100,
    transform: [{ rotate: '25deg' }],
    opacity: 0.35,
  },
  inputDiagonalLine2: {
    top: 16,
    right: -100,
    transform: [{ rotate: '25deg' }],
    opacity: 0.2,
  },
  textInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    paddingVertical: 12,
    maxHeight: 120,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#000000',
    borderWidth: 1.5,
    borderColor: '#4ADE80',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonActive: {
    backgroundColor: '#4ADE80',
    borderColor: '#4ADE80',
  },
  
  // Scan Modal Styles
  scanModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  scanModalContainer: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: 'rgba(4, 60, 45, 0.25)',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(74, 222, 128, 0.5)',
    overflow: 'hidden',
    shadowColor: '#4ADE80',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 20,
  },
  // Decorative diagonal stripes for modal
  modalDecorativeLines: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 60,
    zIndex: 0,
    overflow: 'hidden',
    pointerEvents: 'none',
  },
  modalDiagonalLine: {
    position: 'absolute',
    width: 300,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4ADE80',
  },
  modalDiagonalLine1: {
    top: 4,
    right: -80,
    transform: [{ rotate: '25deg' }],
    opacity: 0.35,
  },
  modalDiagonalLine2: {
    top: 20,
    right: -80,
    transform: [{ rotate: '25deg' }],
    opacity: 0.2,
  },
  scanModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(74, 222, 128, 0.3)',
    backgroundColor: 'rgba(4, 60, 45, 0.3)',
    zIndex: 1,
  },
  scanModalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  scanModalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanModalOptions: {
    padding: 16,
    gap: 12,
    backgroundColor: 'rgba(4, 60, 45, 0.15)',
    zIndex: 1,
  },
  scanModalOption: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  scanModalOptionGradient: {
    padding: 20,
    alignItems: 'center',
    borderRadius: 16,
  },
  scanModalOptionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  scanModalOptionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  scanModalOptionDesc: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  
  // Data-rich message styles
  dataRichMessageContainer: {
    flex: 1,
    width: '100%',
  },
  insightsContainer: {
    marginTop: 12,
    gap: 10,
  },
  chartsContainer: {
    marginTop: 12,
    gap: 8,
  },
  
  // InsightCard styles
  insightCard: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  insightCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  insightIconWrapper: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  insightCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  insightCardHighlight: {
    fontSize: 26,
    fontWeight: '900',
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  insightCardContext: {
    fontSize: 15,
    color: '#CCCCCC',
    lineHeight: 21,
    letterSpacing: 0.2,
  },
  
  // CollapsibleDataSection styles
  collapsibleSection: {
    backgroundColor: 'rgba(4, 60, 45, 0.25)',
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: 'rgba(74, 222, 128, 0.5)',
    overflow: 'hidden',
    marginBottom: 8,
    shadowColor: '#4ADE80',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  collapsibleSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(4, 60, 45, 0.3)',
    zIndex: 1,
  },
  collapsibleSectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  collapsibleSectionIconWrapper: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(74, 222, 128, 0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  collapsibleSectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  collapsibleSectionContent: {
    padding: 12,
    backgroundColor: 'rgba(10, 10, 10, 0.9)',
    zIndex: 1,
  },
  // Decorative diagonal stripes for collapsible sections
  sectionDecorativeLines: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 45,
    zIndex: 0,
    overflow: 'hidden',
    pointerEvents: 'none',
  },
  sectionDiagonalLine: {
    position: 'absolute',
    width: 250,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4ADE80',
  },
  sectionDiagonalLine1: {
    top: 3,
    right: -70,
    transform: [{ rotate: '25deg' }],
    opacity: 0.35,
  },
  sectionDiagonalLine2: {
    top: 15,
    right: -70,
    transform: [{ rotate: '25deg' }],
    opacity: 0.2,
  },
  
  // Welcome Cards Container (for mini stacked analysis cards)
  welcomeCardsContainer: {
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 16,
  },
  welcomeCardsSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    marginTop: 12,
    paddingHorizontal: 32,
    letterSpacing: 0.2,
    lineHeight: 20,
    fontWeight: '500',
  },
});


