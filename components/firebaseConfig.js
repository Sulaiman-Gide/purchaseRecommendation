import firebase from 'firebase/compat/app'
import 'firebase/compat/auth'
import 'firebase/compat/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyDArGqd816TdmAvD_URI5sRlyoxzX2jX_c',
  authDomain: 'ecommerce-3db1d.firebaseapp.com',
  projectId: 'ecommerce-3db1d',
  storageBucket: 'ecommerce-3db1d.firebasestorage.app',
  messagingSenderId: '1022886310759',
  appId: '1:1022886310759:web:0058568e0d17c6f65db5c2',
  measurementId: 'G-B9L7T760Q9',
}

// Initialize Firebase only once
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig)
}

// Export Firebase services
const auth = firebase.auth()
const firestore = firebase.firestore()

export { firebase, auth, firestore }
