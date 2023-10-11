import { useState, useEffect } from 'react';
import { Text, View, TextInput, ImageBackground, SafeAreaView  } from 'react-native';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import {speechAnaylsisAndTranslation, timeout } from './utils.js'
import * as Speech from 'expo-speech';
import { RadioButton, Button } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';

let background = require("./assets/background.png")

export default function App() {
  const [animalType, setAnimalType] = useState('dog')
  const [animalName, setAnimalName] = useState('')
  const [recording, setRecording] = useState();
  const [listening, setListening] = useState(false);
  const [progress, setProgress] = useState('Waiting...')
  const [loading, setLoading] = useState(false)
  const [clicked, setClicked] = useState(false)

  useEffect(() => {
    getPermission()
  }, [])

  const getPermission = async () => {
    await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      })
  }

  const startRecording = async () => {
    try {
      if(!animalName || animalName.trim().length === 0){
        setProgress('Please input animal name')
        return
      }
      if(!animalType){
        setProgress('Please select animal type')
      }

      setProgress('')
      setListening(true)
      setLoading(true)
      setClicked(true)
      

      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      setRecording(recording);
      setProgress('Listening...')
      await timeout(3000)
      setLoading(false)
      setClicked(false)
    } catch (error) {
      setRecording(false)
      setListening(false)
      setProgress(`Sorry I missed that. Please try again.`)
    }
  }

  const stopRecording = async () => {
    try {
      setProgress('AI working...')
      setLoading(true)
      setListening(false)
      setClicked(true)
      setRecording(undefined);
      await recording.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false
      })
      const uri = recording.getURI();
      const fileInfo = await FileSystem.getInfoAsync(uri)

      if(fileInfo.exists){
        magic(fileInfo)
      }
  
    } catch (error) {
      setRecording(false)
      setListening(false)
      setLoading(false)
      setClicked(false)
      setProgress(`Sorry I missed that. Please try again.`)    }
  }

  const magic = async (fileInfo) => {
    try {
      setProgress('Analysis and Translation beginning...')
      await timeout(3000)
      const analyzedSpeechResponseObj = await speechAnaylsisAndTranslation(animalType, fileInfo);

      setProgress(`${animalName} is feeling ${analyzedSpeechResponseObj.emotion} and says, "${analyzedSpeechResponseObj.translatedText}"`)

      let text = `${animalName} is feeling ${analyzedSpeechResponseObj.emotion} and says, "${analyzedSpeechResponseObj.translatedText}"`;

      Speech.speak(text);

      let isSpeaking = await Speech.isSpeakingAsync();

      while(isSpeaking){
        await timeout(100);
        isSpeaking = await Speech.isSpeakingAsync();
      }

      setLoading(false)
      setClicked(false)

    } catch (error) {
      console.error('Error in magic', error)
      setLoading(false)
      setClicked(false)
    }
  }
  
  
  return (
    <ImageBackground source={background} resizeMode='stretch' style={{width: '100%', height: '100%'}}>
      <StatusBar style="auto" />
      <SafeAreaView style={{flex: 1, justifyContent: 'space-between'}}>
        <View style={{flex: 1, alignItems: 'center'}}>
            <Text style={{color: 'aliceblue', fontSize: 60, paddingTop: 20}}>Pet, Speak!</Text>
        </View>
      <View style={{flex: 1}}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <View style={{flex: 2, marginLeft: 20}}>
            <Text style={{fontWeight: 'bold', color: 'aliceblue', fontSize: 20}}>Pet's name:</Text>
          </View>
          <View style={{flex: 4, width: '40%'}}>
            <TextInput 
              color="#64ABD7"
              autoCorrect={false}
              maxLength={20}
              style={{height: 45, textAlign: 'center', marginHorizontal: 10, borderRadius: 5, backgroundColor: 'lightgrey', fontSize: 20, fontWeight: 'bold'}}
              onChangeText={setAnimalName}
            />
          </View>
        </View>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <View style={{flex: 2, marginLeft: 20}}>
              <Text style={{fontWeight: 'bold', color: 'aliceblue', fontSize: 20}}>Species:</Text>
          </View>
          <View style={{flex: 4, width: '40%'}}>
            <RadioButton.Group
              onValueChange={value => setAnimalType(value)}
              value={animalType}
            >
              <View style={{flexDirection: 'row'}}>
                <RadioButton.Item
                  label='Dog' 
                  value='dog'
                  mode='android'
                  position='leading'
                  labelStyle={{fontWeight: 'bold', color: 'aliceblue', fontSize: 20}}
                  color={'aliceblue'}
                  uncheckedColor='aliceblue'
                />          
                <RadioButton.Item
                  label='Cat'
                  value='cat'
                  mode='android'
                  position='leading'
                  labelStyle={{fontWeight: 'bold', color: 'aliceblue', fontSize: 20}}
                  color='aliceblue'
                  uncheckedColor='aliceblue'
                />
              </View>
            </RadioButton.Group>
          </View>
        </View>
      </View>
      <View style={{flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 10}}>
        <Text style={{color: 'aliceblue', fontWeight: 'bold', fontSize: 20, textAlign: 'center'}}>{progress}</Text>
      </View>
      <View style={{flex: 2, paddingHorizontal: 10, paddingTop: 30}}>
        <Button 
        mode='outlined' 
        textColor='aliceblue'
        style={{borderColor: 'aliceblue'}}
        contentStyle={{padding: 10, height: 60}}
        labelStyle={{fontSize: 20, color: 'aliceblue', fontWeight: 'bold'}}
        loading={loading}
        onPress={recording ? stopRecording : startRecording} 
        disabled={clicked}
        >
          {loading ? '' : listening ? "Stop Recording" : "Start Recording"}
        </Button>
      </View>
      </SafeAreaView>
    </ImageBackground>
  );
}
