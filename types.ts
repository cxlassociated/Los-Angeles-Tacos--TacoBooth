export enum AppStep {
  START = 'START',
  CAMERA = 'CAMERA',
  PREVIEW = 'PREVIEW',
  PROCESSING = 'PROCESSING',
  RESULT = 'RESULT',
  FORM = 'FORM',
  FINISH = 'FINISH'
}

export interface UserData {
  instagram: string;
  email: string;
}

export interface PhotoData {
  original: string; // base64
  processed: string; // base64
}