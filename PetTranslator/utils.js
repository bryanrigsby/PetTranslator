import { HfInference } from "@huggingface/inference";
import {happyDogPhrases, happyCatPhrases, angryDogPhrases, angryCatPhrases, neutralDogPhrases, neutralCatPhrases, sadDogPhrases, sadCatPhrases} from './phrases'

const hf = new HfInference('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');


//models

export const speechAnaylsisAndTranslation = async(animalType, fileInfo) => {
  try {
    let speechAnaylsis = await hf.audioClassification({
      model: "superb/hubert-large-superb-er",
      data: fileInfo
    })
    console.log('speechAnaylsis', speechAnaylsis)
    let highestScore = speechAnaylsis.reduce((prev, current) => {
      return prev.score > current.score ? prev : current;
    } )
    console.log('Highest Score: ', highestScore.label)


    let translatedText = await translation(animalType, highestScore.label)

    console.log('translatedText', translatedText)

    return {translatedText: translatedText, emotion: getEmotion(highestScore.label)};
  } catch (error) {
    console.error('Failed to analyize speech', error)
    return null
  }
}

export const textToSpeech = async(phrase) => {
  try {
    let blob = await hf.textToSpeech({
      model: 'espnet/kan-bayashi_ljspeech_vits',
      inputs: phrase
    })
    console.log('blob', blob)

    return blob

  } catch (error) {
    console.error('Failed to convert text to speech', error)
    return null
  }
}

//helpers

const getEmotion = (emo) => {
  console.log(emo)
  let text = '';
  switch (emo) {
    case 'ang':
      text = 'angry'
      break;
    case 'neu':
      text = 'meh'
      break;
    case 'hap':
      text = 'happy'
      break;
    case 'sad':
      text = 'Sad'
      break;
    default:
      text = 'Happy'
      break;
  }
  return text;
}

const getRandom = (multiplier) => {
  return Math.floor(Math.random() * multiplier)
}

const translation = async(animalType, emotion) => {
  console.log('animalType', animalType)
  console.log('emotion', emotion)
  console.log('angryDogPhrases.length', angryDogPhrases.length)
  console.log('happyDogPhrases.length', happyDogPhrases.length)
  console.log('neutralDogPhrases.length', neutralDogPhrases.length)
  console.log('sadDogPhrases.length', sadDogPhrases.length)
  console.log('angryCatPhrases.length', angryCatPhrases.length)
  console.log('happyCatPhrases.length', happyCatPhrases.length)
  console.log('neutralCatPhrases.length', neutralCatPhrases.length)
  console.log('sadCatPhrases.length', sadCatPhrases.length)
  try {
    let returnText = ''
    if(animalType === 'dog'){
      switch (emotion) {
        case 'hap':
          returnText = happyDogPhrases[getRandom(100)]
          break;
        case 'neu':
          returnText = neutralDogPhrases[getRandom(100)]
          break;
        case 'sad':
          returnText = sadDogPhrases[getRandom(100)]
          break;
        case 'ang':
          returnText = angryDogPhrases[getRandom(100)]
          break;
        default:
          returnText = happyDogPhrases[getRandom(100)]
          break;
      }
    }
    else if(animalType === 'cat'){
      switch (emotion) {
        case 'hap':
          returnText = happyCatPhrases[getRandom(100)]
          break;
        case 'neu':
          returnText = neutralCatPhrases[getRandom(100)]
          break;
        case 'sad':
          returnText = sadCatPhrases[getRandom(100)]
          break;
        case 'ang':
          returnText = angryCatPhrases[getRandom(100)]
          break;
        default:
          returnText = happyCatPhrases[getRandom(100)]
          break;
      }
    }
    console.log('returnText', returnText)
    return returnText
  } catch (error) {
    console.error('Failed to translate', error)
    return null
  }
}