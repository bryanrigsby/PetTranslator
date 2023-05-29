import React, { useEffect, useRef } from 'react';
import { View, Animated, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const PulsatingCircle = () => {
  const scaleValue = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulseAnimation = Animated.sequence([
      Animated.timing(scaleValue, {
        toValue: 1.2,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]);

    Animated.loop(pulseAnimation).start();

    return () => {
      scaleValue.stopAnimation();
    };
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Animated.View style={{transform: [{ scale: scaleValue }]}} >
        <LinearGradient
            colors={['blue', 'yellow']}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            style={{
                width: 200,
                height: 200,
                borderRadius: 100,
            }}
            >
                <Text style={{textAlign: 'center', paddingTop: 90, color: 'aliceblue', fontWeight: 'bold', fontSize: 20}}>Start Recording</Text>
            </LinearGradient>
      </Animated.View>
    </View>
  );
};

export default PulsatingCircle;
