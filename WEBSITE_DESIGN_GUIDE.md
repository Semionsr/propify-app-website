# Propify Website Design Guide

A comprehensive guide to recreate the Propify mobile app's sophisticated design system for web development.

## 🎨 Design Philosophy

Propify uses a **premium dark theme** with **emerald accents** and **glassmorphism effects** to create a sophisticated sports analytics interface. The design emphasizes:

- **Professional black backgrounds** with strategic emerald highlights
- **3D layered card layouts** with depth and floating effects
- **Animated infinity symbols** as subtle background elements
- **Glassmorphism** with blur effects and transparent overlays
- **Typography hierarchy** with precise font weights and spacing

---

## 🌈 Color System

### Primary Color Palette

```css
/* Core Colors */
--primary-black: #000000;        /* Main background */
--deep-black: #0a0a0a;          /* Card backgrounds */
--charcoal-black: #1a1a1a;      /* Secondary surfaces */
--pure-white: #ffffff;          /* Primary text */

/* Emerald Accent System */
--primary-emerald: #4ADE80;     /* Main accent color */
--deep-emerald: #065F46;        /* Dark emerald */
--light-emerald: #6EE7B7;       /* Light emerald */
--ultra-light-emerald: #A7F3D0; /* Secondary text */

/* Status Colors */
--positive: #4ADE80;            /* Success/positive */
--negative: #EF4444;            /* Error/negative */
--neutral: #FCD34D;             /* Warning/neutral */
--warning: #FB923C;             /* Alert/warning */
```

### Gradient Systems

```css
/* Premium Gradients */
.player-analysis-gradient {
  background: linear-gradient(135deg, #065F46, #0F766E, #4ADE80);
}

.team-insights-gradient {
  background: linear-gradient(135deg, #064E3B, #059669, #4ADE80);
}

.ai-analysis-gradient {
  background: linear-gradient(135deg, #0F3D3E, #2DD4BF, #4ADE80, #6EE7B7);
}

.upload-gradient {
  background: linear-gradient(135deg, #059669, #4ADE80, #6EE7B7);
}
```

### Glass Effects

```css
/* Glassmorphism System */
.glass-background {
  background: rgba(74, 222, 128, 0.12);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(74, 222, 128, 0.25);
}

.glass-accent {
  background: rgba(74, 222, 128, 0.20);
  backdrop-filter: blur(15px);
}

.glass-border {
  border: 1px solid rgba(74, 222, 128, 0.25);
}
```

---

## 📝 Typography System

### Font Weights

```css
/* Typography Hierarchy */
--font-ultra-light: 100;
--font-light: 300;
--font-regular: 400;
--font-medium: 500;
--font-semi-bold: 600;
--font-bold: 700;
--font-extra-bold: 800;
--font-black: 900;
```

### Font Sizes & Usage

```css
/* Brand & Headers */
.brand-name {
  font-size: 26px;
  font-weight: var(--font-black);
  color: var(--pure-white);
  letter-spacing: -0.8px;
  text-shadow: 0 2px 8px rgba(74, 222, 128, 0.5);
}

.brand-tagline {
  font-size: 15px;
  font-weight: var(--font-medium);
  color: var(--ultra-light-emerald);
  letter-spacing: 0.3px;
}

/* Section Headers */
.header-title {
  font-size: 22px;
  font-weight: var(--font-bold);
  color: var(--primary-emerald);
  letter-spacing: -0.3px;
  text-shadow: 0 1px 6px rgba(74, 222, 128, 0.4);
}

.header-subtitle {
  font-size: 17px;
  font-weight: var(--font-regular);
  color: var(--ultra-light-emerald);
  letter-spacing: 0.2px;
  line-height: 1.4;
}

/* Card Content */
.card-title {
  font-size: 15px;
  font-weight: var(--font-extra-bold);
  color: var(--pure-white);
  letter-spacing: -0.2px;
}

.card-description {
  font-size: 13px;
  font-weight: var(--font-medium);
  color: #E5E7EB;
  line-height: 1.4;
}

/* Player/Data Text */
.player-name {
  font-size: 16px;
  font-weight: var(--font-bold);
  color: var(--pure-white);
  letter-spacing: -0.2px;
}

.prop-line {
  font-size: 14px;
  font-weight: var(--font-semi-bold);
  color: var(--ultra-light-emerald);
}

.hit-rate-text {
  font-size: 16px;
  font-weight: var(--font-extra-bold);
  color: var(--primary-emerald);
  letter-spacing: -0.2px;
}
```

---

## 🎯 Layout Patterns

### 3D Stacked Cards System

The signature Propify design feature - layered cards with depth and rotation:

```css
/* Container Setup */
.analysis-cards-container {
  position: relative;
  width: 85%;
  height: 280px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
}

/* Glow Effects (Background) */
.left-card-glow {
  position: absolute;
  width: 65%;
  height: 280px;
  border-radius: 30px;
  background: rgba(74, 222, 128, 0.15);
  transform: rotate(-12deg) translateX(-50px) translateY(-5px);
  z-index: -1;
  box-shadow: 0 0 60px rgba(74, 222, 128, 1);
}

.right-card-glow {
  position: absolute;
  width: 65%;
  height: 280px;
  border-radius: 30px;
  background: rgba(74, 222, 128, 0.12);
  transform: rotate(12deg) translateX(50px) translateY(-5px);
  z-index: -1;
  box-shadow: 0 0 60px rgba(74, 222, 128, 1);
}

.main-card-glow {
  position: absolute;
  width: 65%;
  height: 280px;
  border-radius: 35px;
  background: rgba(74, 222, 128, 0.2);
  z-index: -1;
  box-shadow: 0 0 80px rgba(74, 222, 128, 1);
}

/* Actual Cards */
.analysis-card {
  position: absolute;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 8px 16px rgba(74, 222, 128, 0.3);
}

.left-analysis-card {
  width: 65%;
  height: 100%;
  transform: rotate(-12deg) translateX(-50px);
  z-index: 1;
}

.right-analysis-card {
  width: 65%;
  height: 100%;
  transform: rotate(12deg) translateX(50px);
  z-index: 2;
}

.main-analysis-card {
  width: 65%;
  height: 100%;
  border-radius: 24px;
  z-index: 3;
  box-shadow: 0 12px 20px rgba(74, 222, 128, 0.5);
}
```

### Card Content Structure

```css
.analysis-card-content {
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  border: 1px solid rgba(74, 222, 128, 0.3);
  box-shadow: 0 0 15px rgba(74, 222, 128, 0.6);
}

.glass-overlay {
  background: transparent;
  backdrop-filter: blur(20px);
  border-radius: 16px;
  border: 1px solid rgba(74, 222, 128, 0.25);
  padding: 16px;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.analysis-card-header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.analysis-icon {
  width: 32px;
  height: 32px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 10px;
  background: rgba(74, 222, 128, 0.20);
  box-shadow: 0 2px 6px rgba(74, 222, 128, 0.4);
}
```

---

## ♾️ Infinity Symbol Background

A key design element - animated infinity symbol as subtle background:

```css
/* Infinity Container */
.infinity-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 0;
  opacity: 0.3;
}

.infinity-symbol {
  position: absolute;
}
```

```javascript
// SVG Path for Infinity Symbol
function createInfinityPath(width, height) {
  const centerX = width / 2;
  const centerY = height / 2;
  const scaleX = Math.min(width, height) * 1.4;
  const scaleY = height * 0.9;
  
  return `
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
}
```

---

## 🗂️ Heatmap Design Patterns

### Day Tabs Container

```css
.day-tabs-container {
  display: flex;
  margin-bottom: 20px;
  margin: 0 8px 20px 8px;
  background: rgba(6, 95, 70, 0.1);
  border-radius: 24px;
  padding: 4px;
  border: 2px solid rgba(74, 222, 128, 0.4);
  box-shadow: 0 4px 16px rgba(74, 222, 128, 0.3);
}

.day-tab {
  flex: 1;
  padding: 12px 20px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.day-tab.active {
  background: var(--primary-emerald);
  box-shadow: 0 4px 12px rgba(74, 222, 128, 0.6);
}

.day-tab-text {
  font-size: 14px;
  font-weight: var(--font-semi-bold);
  color: var(--pure-white);
}
```

### Prop Cards (Heatmap Items)

```css
.prop-card {
  background: rgba(6, 95, 70, 0.1);
  border-radius: 24px;
  padding: 16px;
  display: flex;
  align-items: center;
  border: 2px solid rgba(74, 222, 128, 0.4);
  margin-bottom: 8px;
  box-shadow: 0 0 50px rgba(74, 222, 128, 1);
  transition: all 0.3s ease;
}

.prop-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 60px rgba(74, 222, 128, 1.2);
}

.prop-icon-container {
  margin-right: 12px;
}

.football-icon {
  width: 40px;
  height: 40px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(74, 222, 128, 0.5);
  /* Background and border colors set dynamically based on team colors */
}

.prop-main-content {
  flex: 1;
  margin-right: 12px;
}

.prop-right-side {
  display: flex;
  align-items: center;
  justify-content: center;
}
```

---

## 🎭 Animation Patterns

### Entrance Animations

```css
/* Fade In with Scale */
@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* Cascade Card Entrance */
@keyframes cascadeLeft {
  from {
    opacity: 0;
    transform: rotate(-12deg) translateX(-100px) scale(0.8);
  }
  to {
    opacity: 1;
    transform: rotate(-12deg) translateX(-50px) scale(1);
  }
}

@keyframes cascadeRight {
  from {
    opacity: 0;
    transform: rotate(12deg) translateX(100px) scale(0.8);
  }
  to {
    opacity: 1;
    transform: rotate(12deg) translateX(50px) scale(1);
  }
}

@keyframes cascadeMain {
  from {
    opacity: 0;
    transform: translateY(50px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Apply Animations */
.left-analysis-card {
  animation: cascadeLeft 0.8s ease-out 0.2s both;
}

.right-analysis-card {
  animation: cascadeRight 0.8s ease-out 0.4s both;
}

.main-analysis-card {
  animation: cascadeMain 0.8s ease-out 0.6s both;
}
```

### Hover Effects

```css
.interactive-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.interactive-card:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 20px 40px rgba(74, 222, 128, 0.4);
}

.glow-on-hover:hover {
  box-shadow: 
    0 0 20px rgba(74, 222, 128, 0.6),
    0 0 40px rgba(74, 222, 128, 0.4),
    0 0 80px rgba(74, 222, 128, 0.2);
}
```

---

## 📱 Responsive Considerations

### Mobile-First Approach

```css
/* Base Mobile Styles */
.container {
  padding: 16px;
  max-width: 100%;
}

.analysis-cards-container {
  width: 95%;
  height: 240px;
}

/* Tablet */
@media (min-width: 768px) {
  .container {
    padding: 24px;
    max-width: 768px;
    margin: 0 auto;
  }
  
  .analysis-cards-container {
    width: 85%;
    height: 280px;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .container {
    padding: 32px;
    max-width: 1200px;
  }
  
  .analysis-cards-container {
    width: 75%;
    height: 320px;
  }
}

/* Large Desktop */
@media (min-width: 1440px) {
  .container {
    max-width: 1400px;
  }
  
  .analysis-cards-container {
    width: 65%;
    height: 360px;
  }
}
```

---

## 🔧 Implementation Tips

### CSS Custom Properties Setup

```css
:root {
  /* Colors */
  --primary-black: #000000;
  --deep-black: #0a0a0a;
  --charcoal-black: #1a1a1a;
  --pure-white: #ffffff;
  --primary-emerald: #4ADE80;
  --deep-emerald: #065F46;
  --light-emerald: #6EE7B7;
  --ultra-light-emerald: #A7F3D0;
  
  /* Typography */
  --font-ultra-light: 100;
  --font-light: 300;
  --font-regular: 400;
  --font-medium: 500;
  --font-semi-bold: 600;
  --font-bold: 700;
  --font-extra-bold: 800;
  --font-black: 900;
  
  /* Shadows */
  --shadow-emerald-light: 0 4px 16px rgba(74, 222, 128, 0.25);
  --shadow-emerald-medium: 0 8px 24px rgba(74, 222, 128, 0.35);
  --shadow-emerald-heavy: 0 12px 32px rgba(74, 222, 128, 0.45);
  
  /* Glass Effects */
  --glass-bg: rgba(74, 222, 128, 0.12);
  --glass-border: rgba(74, 222, 128, 0.25);
  --glass-accent: rgba(74, 222, 128, 0.20);
}
```

### JavaScript Animation Helpers

```javascript
// Intersection Observer for scroll animations
const observeElements = () => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-in');
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.animate-on-scroll').forEach(el => {
    observer.observe(el);
  });
};

// Staggered animation helper
const staggerAnimation = (elements, delay = 100) => {
  elements.forEach((el, index) => {
    setTimeout(() => {
      el.classList.add('animate-in');
    }, index * delay);
  });
};

// Glow effect on mouse move
const addGlowEffect = (element) => {
  element.addEventListener('mousemove', (e) => {
    const rect = element.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    element.style.setProperty('--mouse-x', `${x}px`);
    element.style.setProperty('--mouse-y', `${y}px`);
  });
};
```

---

## 🎨 Brand Elements

### Logo Styling

```css
.brand-logo-container {
  margin-right: 16px;
}

.brand-logo {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--deep-emerald), var(--primary-emerald));
  box-shadow: 0 6px 12px rgba(74, 222, 128, 0.4);
}
```

### Accent Lines and Dots

```css
.header-accent {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 20px 0;
}

.accent-line {
  flex: 1;
  height: 1px;
  background: rgba(255, 255, 255, 0.2);
}

.accent-dot {
  width: 8px;
  height: 8px;
  border-radius: 4px;
  background: var(--pure-white);
  margin: 0 20px;
  box-shadow: 0 2px 4px rgba(255, 255, 255, 0.6);
}
```

---

## 📋 Component Checklist

When implementing the Propify design system, ensure you include:

- [ ] **Dark theme foundation** with proper contrast ratios
- [ ] **Emerald accent system** with consistent color usage
- [ ] **3D stacked cards** with proper depth and shadows
- [ ] **Glassmorphism effects** with backdrop-filter support
- [ ] **Typography hierarchy** with precise font weights
- [ ] **Infinity symbol backgrounds** for visual interest
- [ ] **Smooth animations** with proper easing curves
- [ ] **Responsive breakpoints** for all screen sizes
- [ ] **Hover states** with glow effects
- [ ] **Loading states** with emerald-themed spinners

---

## 🚀 Getting Started

1. **Set up CSS custom properties** with the Propify color system
2. **Implement the base typography** with proper font weights
3. **Create the 3D card system** starting with simple layouts
4. **Add glassmorphism effects** with backdrop-filter
5. **Implement the infinity symbol** as a background element
6. **Add animations** with CSS transitions and keyframes
7. **Test responsiveness** across all device sizes
8. **Fine-tune shadows and glows** for the premium feel

This design system captures the essence of Propify's sophisticated, sports-focused interface while maintaining the premium dark aesthetic with strategic emerald accents that make the app distinctive and professional.
