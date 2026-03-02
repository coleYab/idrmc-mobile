import {
  NavigationContainer,
  useNavigationContainerRef,
} from '@react-navigation/native';
import React, {useCallback, useEffect, useRef} from 'react';
import 'react-native-gesture-handler';
import Auth from './src/navigation/Auth';
import useAuthCheck from './src/hooks/useAuthCheck';
import SplashScreen from 'react-native-splash-screen';
import {AuthCheckingUi} from './src/components';

const App = () => {
  const navigationRef = useNavigationContainerRef();
  const routeNameRef = useRef();
  const authChecked = useAuthCheck();

  const handleStateChange = useCallback(async () => {
    const previousRouteName = routeNameRef.current;
    const currentRouteName = navigationRef?.getCurrentRoute()?.name;

    // if DEV show navigation screens
    if (__DEV__) {
      console.info(
        '[navigation]',
        `${previousRouteName} -> ${currentRouteName}`,
      );
    }

    if (previousRouteName !== currentRouteName) {
      routeNameRef.current = currentRouteName;
    }
  }, [routeNameRef, navigationRef]);

  const handleReady = useCallback(() => {
    routeNameRef.current = navigationRef?.getCurrentRoute()?.name;
  }, [routeNameRef, navigationRef]);

  useEffect(() => {
    SplashScreen.hide();
  }, []);

  // return authChecked ? (
  return authChecked ? (
    <NavigationContainer
      ref={navigationRef}
      onReady={handleReady}
      onStateChange={handleStateChange}>
      {/* App stacks / screens */}
      <Auth />
    </NavigationContainer>
  ) : (
    <AuthCheckingUi />
  );
};

export default App;
