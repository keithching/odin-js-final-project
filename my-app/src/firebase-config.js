const config = {
    apiKey: "AIzaSyA6KiegCaYzg9CUnm_C__3wQY1_33oFznM",
    authDomain: "thegram-23b58.firebaseapp.com",
    projectId: "thegram-23b58",
    storageBucket: "thegram-23b58.appspot.com",
    messagingSenderId: "676630311709",
    appId: "1:676630311709:web:2e1db22862ca380ec1a7f4",
    measurementId: "G-RJFSZKPSSW"
};

export function getFirebaseConfig() {
    if (!config || !config.apiKey) {
        throw new Error('No Firebase configuration object provided.' + '\n' +
        'Add your web app\'s configuration object to firebase-config.js');
    } else {
        return config;
    }
}