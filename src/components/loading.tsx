import React from 'react';
import { StyleSheet } from 'react-native';
import Animated, { FadeOut } from 'react-native-reanimated';

import LottieView from 'lottie-react-native';
import Cubes from '@lottie/cubes.json';

interface loadingProps {
  fadeOutDuration?: number;
}

export default function loading(props: loadingProps): JSX.Element {
  const { fadeOutDuration = 1000 } = props;
  const animationRef = React.useRef<LottieView>(null);

  React.useEffect(() => {
    animationRef.current?.play();
    return;
  }, []);
  return (
    <Animated.View
      style={styles.full}
      exiting={FadeOut.duration(fadeOutDuration)}>
      <LottieView source={Cubes} ref={animationRef} style={styles.loading} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  full: {
    display: 'flex',
    justifyContent: 'center',
    height: '100%',
    width: '100%',
    alignItems: 'center',
  },
  loading: {
    width: 200,
    height: 200,
    backgroundColor: 'transparent',
  },
});
