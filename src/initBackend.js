import firebase from 'firebase/app'

export const initBackend = {
    apiKey: "AIzaSyAQxgmnlFCbh-ZIj7WX2xxBWcx_D7GMm_s",
    authDomain: "fisiovue.firebaseapp.com",
    projectId: "fisiovue",
    storageBucket: "fisiovue.appspot.com",
    messagingSenderId: "810955913333",
    appId: "1:810955913333:web:f26877ffd6b20961f8a03c",
    measurementId: "G-F3CMGKWF79"
};
firebase.initializeApp(initBackend);