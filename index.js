// Import stylesheets
import "./style.css";
// Firebase App (the core Firebase SDK) is always required and must be listed first
import firebase from "firebase/app";

// Add the Firebase products that you want to use
import "firebase/auth";
import "firebase/firestore";

import * as firebaseui from "firebaseui";

// Document elements
const btnLogin = document.getElementById("btnLogin");
const userContainer = document.getElementById("user-container");
const menusContainer = document.getElementById("menus-container");

const form = document.getElementById("leave-message");
const input = document.getElementById("message");
const guestbook = document.getElementById("guestbook");
const numberAttending = document.getElementById("number-attending");
const rsvpYes = document.getElementById("rsvp-yes");
const rsvpNo = document.getElementById("rsvp-no");

var rsvpListener = null;
var latestActivitiesListener = null;

async function main() {
  // Add Firebase project configuration object here
  const firebaseConfig = {
    apiKey: "AIzaSyAYoBv6FJOO1kBkpabZjodZQJKacnWK11w",
    authDomain: "ppas-celex.firebaseapp.com",
    databaseURL: "https://ppas-celex.firebaseio.com",
    projectId: "ppas-celex",
    storageBucket: "ppas-celex.appspot.com",
    messagingSenderId: "673600008493",
    appId: "1:673600008493:web:beec28e4844969c3bfa3a4"
  };

  firebase.initializeApp(firebaseConfig);

  // FirebaseUI config
  const uiConfig = {
    credentialHelper: firebaseui.auth.CredentialHelper.NONE,
    signInOptions: [
      // Email / Password Provider.
      firebase.auth.EmailAuthProvider.PROVIDER_ID
    ],
    callbacks: {
      signInSuccessWithAuthResult: function(authResult, redirectUrl) {
        // Handle sign-in.
        // Return false to avoid redirect.
        return false;
      }
    }
  };

  const ui = new firebaseui.auth.AuthUI(firebase.auth());
  btnLogin.addEventListener("click", () => {
    if (firebase.auth().currentUser) {
      // User is signed in; allows user to sign out
      firebase.auth().signOut();
    } else {
      // No user is signed in; allows user to sign in
      ui.start("#firebaseui-auth-container", uiConfig);
    }
  });

  // Listen to the current Auth state
  firebase.auth().onAuthStateChanged(user => {
    if (user) {
      btnLogin.textContent = "Log Out";
      menusContainer.style.display = "block";
      ModeSelection();
    } else {
      btnLogin.textContent = "Log In";
      menusContainer.style.display = "none";
      // Unsubscribe
      //unsubscribeGuestbook();
    }
  });

  // Listen to the form submission
  /*
  form.addEventListener("submit", e => {
    // Prevent the default form redirect
    e.preventDefault();

    firebase
      .firestore()
      .collection("users")
      .add({
        text: input.value,
        timestamp: Date.now(),
        name: firebase.auth().currentUser.displayName,
        userId: firebase.auth().currentUser.uid
      });

    // clear message input field
    input.value = "";
    // Return false to avoid redirect
    return false;
  });
  */

  function ModeSelection() {
    var url = document.location.href;
    var mode = findGetParameter("mode");
    //console.log(url);
    //console.log(window.location.search.substr(1));
    //console.log();
    switch (mode) {
      case "user":
        UserList();
        break;
      case "latest":
        Latest();
        break;
      case "import":
        Import();
        break;
    }
    //UserList();
  }

  function findGetParameter(parameterName) {
    var result = null,
      tmp = [];
    location.search
      .substr(1)
      .split("&")
      .forEach(function(item) {
        tmp = item.split("=");
        if (tmp[0] === parameterName) result = decodeURIComponent(tmp[1]);
      });
    return result;
  }

  function UserList() {}

  function Latest() {
    var html_table = '* Only 50 Records <table width="100%" cellpadding="5" style="font-size:12px;" >';
    html_table += "<tr>";
    html_table += "  <td><b>Name</b></td>";
    html_table += "  <td><b>Card No.</b></td>";
    html_table += "  <td><b>Email</b></td>";
    html_table += "  <td><b>Gender</b></td>";
    html_table += "  <td><b>IC No.</b></td>";
    html_table += "  <td><b>Created</b></td>";
    html_table += "</tr>";

    latestActivitiesListener = firebase
      .firestore()
      .collection("users")
      .orderBy("dateCreated", "desc")
      .limit(50)
      .onSnapshot(snaps => {
        // Reset page
        latest.innerHTML = "";
        var trData = "";
        // Loop through documents in database
        snaps.forEach(doc => {
          trData +=
            "<tr><td>" +
            doc.data().name +
            "</td><td>" +
            doc.data().cardNo +
            "</td><td>" +
            doc.data().email +
            "</td><td>" +
            doc.data().gender +
            "</td><td>" +
            doc.data().icNo +
            "</td><td>" +
            doc.data().dateCreated.toDate().toDateString() +
            "</td></tr>";

          //const entry = document.createElement("tr");
          //entry.textContent = doc.data().cardNo + ": " + doc.data().name;
        });
        html_table += trData + "</table>";
        latest.innerHTML = html_table;
      });
  }

  function Import() {}

  function unsubscribeGuestbook() {
    if (latestActivitiesListener != null) {
      latestActivitiesListener();
      latestActivitiesListener = null;
    }
  }
}

main();
