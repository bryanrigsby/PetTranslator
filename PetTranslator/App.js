import { useState, useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Button, StyleSheet, Text, View, Animated, Pressable } from 'react-native';
import { Audio } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { HfInference } from "@huggingface/inference";
import * as FileSystem from 'expo-file-system';

const hf = new HfInference('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');

const model = "facebook/wav2vec2-large-960h-lv60-self";

export default function App() {
  const [recording, setRecording] = useState();
  const [textFromSpeech, setTextFromSpeech] = useState('')
  const [loading, setLoading] = useState(false)
  const [clicked, setClicked] = useState(false)
  const [status, setStatus] = useState({
    recording: false,
    convertingSpeechToText: false,
    analyzingText: false,

  })
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
      console.log('Requesting permission...')
      setStatus({...status, recording: true})
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      })

      console.log('Start recording...')
      startPulse();
      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      setRecording(recording);
      console.log('Recording started')
    } catch (error) {
      setStatus({...status, recording: false})
      console.error('Failed to start recording', error)
    }
  }

  const stopRecording = async () => {
    try {
      console.log('Stopping recording...')
      setStatus({...status, recording: false, convertingSpeechToText: true})
      setClicked(true)
      // stopPulse();
      setRecording(undefined);
      await recording.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false
      })
      const uri = recording.getURI();
      console.log('Recording stopped and stored at ', uri);
  
      speechToText(uri)
    } catch (error) {
      setStatus({...status, recording: false})
      console.error('Failed to stop recording', error)
    }
  }

  const speechToText = async (uri) => {
    try {
      console.log('Speech to text conversion beginning...')
      const fileInfo = await FileSystem.getInfoAsync(uri)
      if(fileInfo.exists){
        let result = await hf.automaticSpeechRecognition({
          model: model,
          data: fileInfo
        })
  
        console.log('result', result)
        setTextFromSpeech(result.text)
        setStatus({...status, convertingSpeechToText: false, analyzingText: true})
        
        
      }
    } catch (error) {
      console.error('Failed to convert speech to text', error)
      setStatus({...status, convertingSpeechToText: false})
    }
  }

  const analyzingText = () => {
    console.log('Text anaylsis beginning...')
  }

  const getButtonText = () => {
    console.log(status)
    let text = '';
    switch (true) {
      case status.recording:
        text = 'Stop Recording'
        break;
      case status.convertingSpeechToText:
        text = 'Converting Speech to Text'
        break;
      case status.analyzingText:
        text = 'Analyzing Text'
        break;
    
      default:
        text = 'Start Recording'
        break;
    }

    return text;
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
                  <Text style={{textAlign: 'center', paddingTop: 90, color: 'aliceblue', fontWeight: 'bold', fontSize: 20}}>{getButtonText()}</Text>
              </LinearGradient>
        </Animated.View>
      </Pressable>
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
