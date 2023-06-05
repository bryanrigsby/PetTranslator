import { useState, useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Button, StyleSheet, Text, View, Animated, Pressable } from 'react-native';
import { Audio } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import * as FileSystem from 'expo-file-system';
import { speechToText, speechAnaylsisAndTranslation } from './utils.js'





export default function App() {
  const [animalType, setAnimalType] = useState('dog')
  const [animalName, setAnimalName] = useState('Fido')
  const [recording, setRecording] = useState();
  const [listening, setListening] = useState(false);
  const [textFromSpeech, setTextFromSpeech] = useState('')
  const [analysis, setAnaylsis] = useState('')
  const [translation, setTranslation] = useState('')
  const [response, setResponse] = useState('')
  const [progress, setProgress] = useState('Waiting...')
  const [loading, setLoading] = useState(false)
  const [clicked, setClicked] = useState(false)
  const scaleValue = useRef(new Animated.Value(1)).current;

  const startPulse = () => {
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
  }

  const stopPulse = () => {
    scaleValue.stopAnimation();
  }

  const startRecording = async () => {
    try {
      setProgress('')
      setResponse('')
      console.log('Requesting permission...')
      setListening(true)
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      })

      setProgress('Start recording...')
      console.log('Start recording...')
      startPulse();
      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      setRecording(recording);
      console.log('Recording started')
      setProgress('Listening...')
    } catch (error) {
      setRecording(false)
      setListening(false)
      console.error('Failed to start recording', error)
      setProgress(`Sorry I missed that. Please try again.`)
    }
  }

  const stopRecording = async () => {
    try {
      console.log('Stopping recording...')
      setProgress('AI working...')
      setListening(false)
      setClicked(true)
      stopPulse();
      setRecording(undefined);
      setLoading(true)
      await recording.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false
      })
      const uri = recording.getURI();
      console.log('Recording stopped and stored at ', uri);

      const fileInfo = await FileSystem.getInfoAsync(uri)

      if(fileInfo.exists){
        magic(fileInfo)
      }
  
    } catch (error) {
      stopPulse();
      setRecording(false)
      setListening(false)
      setLoading(false)
      setClicked(false)
      console.error('Failed to stop recording', error)
      setProgress(`Sorry I missed that. Please try again.`)    }
  }

  const magic = async (fileInfo) => {
    try {
      //anaylsis
      console.log('Analysis beginning...')
      setProgress('Analysis and Translation beginning...')
      const analyzedSpeechResponseObj = await speechAnaylsisAndTranslation(animalType, fileInfo);
      console.log('analizedSpeechResponse', analyzedSpeechResponseObj)

      setResponse(`${animalName} is ${analyzedSpeechResponseObj.emotion}. '${analyzedSpeechResponseObj.translatedText}', ${animalName} says.`)

      let returnedBlob = textToSpeech(`${animalName} is ${analyzedSpeechResponseObj.emotion}. '${analyzedSpeechResponseObj.translatedText}', ${animalName} says.`)

      console.log('returnedBlob: ', returnedBlob)

      setLoading(false)
      setClicked(false)

    } catch (error) {
      console.error('Error in magic', error)
      setLoading(false)
      setClicked(false)
    }
  }

  const getButtonLabel = () => {
    if(loading){
      return 'Loading...'
    }
    else if(listening){
      return 'Stop'
    }
    else{
      return 'Start'
    }
  }
  
  return (
    <View style={styles.container}>
      <Pressable disabled={clicked} onPress={recording ? stopRecording : startRecording}>
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
                  <Text style={{textAlign: 'center', paddingTop: 90, color: 'aliceblue', fontWeight: 'bold', fontSize: 20}}>{getButtonLabel()}</Text>
              </LinearGradient>
        </Animated.View>
      </Pressable>
      <View>
        <Text style={{marginTop: 25}}>{progress}</Text>
        <Text style={{marginTop: 25}}>{response}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
