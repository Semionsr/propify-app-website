# Authentication & Onboarding Flow

## Overview

The Propify website now has a complete authentication and onboarding system that ensures non-logged-in users always see the onboarding experience before accessing the AI Chat.

## How It Works

### Flow for Non-Logged-In Users
1. User clicks "Try Today" or "AI Chat" → Redirects to `onboarding.html`
2. User completes onboarding → Redirects to `login.html?redirect=ai-chat.html`
3. After login → **Goes directly to AI Chat** (skips onboarding since already completed)

### Flow for Logged-In Users (First Time)
1. User clicks "Try Today" or "AI Chat" → Redirects to `onboarding.html`
2. User completes onboarding → **Goes directly to AI Chat**
3. Onboarding completion is saved

### Flow for Logged-In Users (Returning)
1. User clicks "Try Today" or "AI Chat" → **Goes directly to AI Chat**
2. Onboarding is skipped since already completed

### Sign-In Flow
When a user successfully signs in or signs up:
1. `PropifyAuth.setLoggedIn(true)` is called
2. System checks if onboarding was completed
3. If onboarding was completed → Redirect to **AI Chat**
4. If onboarding NOT completed → Redirect to **Onboarding**
5. After completing onboarding → Redirect to **AI Chat**

## Files Modified

### 1. `auth-helper.js` (NEW)
Central authentication helper that manages:
- Login state
- Onboarding completion
- Navigation routing
- Logout functionality

### 2. `onboarding.html`
- Checks if user is logged in on load
- Clears onboarding for non-logged-in users
- Routes to login or AI chat based on auth state
- Uses `auth-helper.js` for all auth operations

### 3. `ai-chat.html`
- Protected page that requires authentication
- Redirects non-logged-in users to onboarding
- Redirects logged-in users without onboarding to onboarding
- Uses `auth-helper.js` for auth checks

### 4. `login.html`
- Integrated with `auth-helper.js`
- Calls `PropifyAuth.setLoggedIn(true)` after successful authentication
- Uses `PropifyAuth.getDestination()` to determine redirect
- Supports email/password, Google OAuth, and Apple OAuth
- **Always redirects to AI Chat if onboarding is complete**
- **Redirects to onboarding if not yet completed**
- Updates all CTA buttons and AI Chat links
- Uses `auth-helper.js` to set correct destinations
- Dynamically updates links based on auth state

## LocalStorage Keys

The system uses these localStorage keys:

- `propify_user_logged_in`: `'true'` or `'false'` - User authentication state
- `propify_onboarding_completed`: `'true'` or removed - Onboarding completion
- `propify_onboarding_date`: ISO timestamp - When onboarding was completed
- `propify_selected_sports`: JSON array - Sports selected during onboarding

## Testing the Flow

### Test as Non-Logged-In User
1. Open browser DevTools → Console
2. Run: `localStorage.clear()`
3. Navigate to `propify.html`
4. Click "Try Today" → Should go to onboarding
5. Complete onboarding → Should go to login

### Test as Logged-In User (First Time)
1. Open browser DevTools → Console
2. Run:
   ```javascript
   localStorage.setItem('propify_user_logged_in', 'true');
   localStorage.removeItem('propify_onboarding_completed');
   ```
3. Navigate to `propify.html`
4. Click "Try Today" → Should go to onboarding
5. Complete onboarding → Should go to AI Chat

### Test as Logged-In User (Returning)
1. Open browser DevTools → Console
2. Run:
   ```javascript
   localStorage.setItem('propify_user_logged_in', 'true');
   localStorage.setItem('propify_onboarding_completed', 'true');
   ```
3. Navigate to `propify.html`
4. Click "Try Today" → Should go directly to AI Chat

### Test Direct AI Chat Access
1. Set up as non-logged-in (clear localStorage)
2. Navigate directly to `ai-chat.html`
3. Should be redirected to onboarding

## Integration with Login System

When you implement actual user authentication, update these points:

1. **After successful login**, call:
   ```javascript
   PropifyAuth.setLoggedIn(true);
   ```

2. **After logout**, call:
   ```javascript
   PropifyAuth.logout();
   ```

3. **Check if logged in**:
   ```javascript
   if (PropifyAuth.isLoggedIn()) {
       // User is logged in
   }
   ```

## API Reference - PropifyAuth

### Methods

#### `isLoggedIn()`
Returns `true` if user is logged in, `false` otherwise.

#### `hasCompletedOnboarding()`
Returns `true` if user has completed onboarding, `false` otherwise.

#### `setLoggedIn(loggedIn = true)`
Sets the user's login state. Clears onboarding if logging out.

#### `completeOnboarding()`
Marks onboarding as completed with timestamp.

#### `clearOnboarding()`
Removes onboarding completion status.

#### `getDestination()`
Returns the appropriate URL based on current auth/onboarding state.

#### `requireAuth()`
Call this on protected pages to enforce authentication.

#### `finishOnboarding()`
Completes onboarding and redirects appropriately.

#### `setupNavigation()`
Updates all links on page to use correct destinations.

#### `logout()`
Logs out user and clears all data.

## Notes

- The system ensures non-logged-in users ALWAYS see onboarding
- Onboarding completion is tied to login state
- All navigation dynamically updates based on auth state
- No manual link updates needed - all handled by `auth-helper.js`

