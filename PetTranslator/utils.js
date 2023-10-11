import {happyDogPhrases, happyCatPhrases, angryDogPhrases, angryCatPhrases, neutralDogPhrases, neutralCatPhrases, sadDogPhrases, sadCatPhrases, emotions} from './phrases'


export const speechAnaylsisAndTranslation = async(animalType, fileInfo) => {
  try {
    let emotion = emotions[getRandom(3)]
    let translatedText = await translation(animalType, emotion)
    return {translatedText: translatedText, emotion: getEmotion(emotion)};
  } catch (error) {
    return null
  }
}

//helpers

const getEmotion = (emo) => {
  let text = '';
  switch (emo) {
    case 'ang':
      text = 'angry'
      break;
    case 'neu':
      text = 'relaxed'
      break;
    case 'hap':
      text = 'happy'
      break;
    case 'sad':
      text = 'sad'
      break;
    default:
      text = 'happy'
      break;
  }
  return text;
}

const getRandom = (multiplier) => {
  return Math.floor(Math.random() * multiplier)
}

const translation = async(animalType, emotion) => {
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
    return returnText
  } catch (error) {
    return null
  }
}

export const timeout = (delay) => {
  return new Promise( res => setTimeout(res, delay) );
}