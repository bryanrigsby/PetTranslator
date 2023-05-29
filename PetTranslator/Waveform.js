import WaveSurfer from 'wavesurfer.js';
import React, { useEffect, useRef } from 'react';
import { View } from 'react-native';


export default function Waveform({ audioUrl }){
    const waveformRef = useRef(null);
  
    useEffect(() => {
      // Create a new WaveSurfer instance
      const wavesurfer = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: 'violet',
        progressColor: 'purple',
        responsive: true,
      });
  
      // Load the audio file
      wavesurfer.load(audioUrl);
  
      return () => {
        // Clean up the WaveSurfer instance when the component unmounts
        wavesurfer.destroy();
      };
    }, [audioUrl]);
  
    return <View ref={waveformRef} style={{ flex: 1 }} />;
  };
  