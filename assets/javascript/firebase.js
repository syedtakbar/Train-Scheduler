var app_firebase = {};

(function () {

    const firebaseConfig = {
        apiKey: "AIzaSyAtGRaXqzlGQhR-SQw8FFBRlyraGYPuw5Q",
        authDomain: "boot-camp-class-1565196541655.firebaseapp.com",
        databaseURL: "https://boot-camp-class-1565196541655.firebaseio.com",
        projectId: "boot-camp-class-1565196541655",
        storageBucket: "boot-camp-class-1565196541655.appspot.com",
        messagingSenderId: "843917005805",
        appId: "1:843917005805:web:eb908bc66090f6e5"
      };
      // Initialize Firebase
      firebase.initializeApp(firebaseConfig);

      app_firebase = firebase;

})();