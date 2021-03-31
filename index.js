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
const btnEdit = document.getElementById("btnEdit");
//const userContainer = document.getElementById("user-container");
const menusContainer = document.getElementById("menus-container");

const frmSearch = document.getElementById("frmSearch");
//const input = document.getElementById("message");
//const guestbook = document.getElementById("guestbook");
//const numberAttending = document.getElementById("number-attending");
//const rsvpYes = document.getElementById("rsvp-yes");
//const rsvpNo = document.getElementById("rsvp-no");
//var rsvpListener = null;

var latestActivitiesListener = null;

//var sortOrder = "desc";

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
      firebase.auth.EmailAuthProvider.PROVIDER_ID,
      firebase.auth.e
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

  btnFilter.addEventListener("click", e => {
    e.preventDefault();
    var mode = findGetParameter("mode");
    if (mode == "latest") {
      //Latest($("#search_keyword").val());
      Latest();
    }
    if (mode == "libcard") {
      //LibCard($("#search_keyword").val());
      LibCard();
    }
    return false;
  });

  btnOlder.addEventListener("click", e => {
    e.preventDefault();
    var mode = findGetParameter("mode");

    if (localStorage.getItem("sortOrder") === "desc") {
      localStorage.setItem("sortOrder", "asc");
    } else {
      localStorage.setItem("sortOrder", "desc");
    }

    if (mode == "latest") {
      dtExample();
      //Latest($("#search_keyword").val());
    }
    if (mode == "libcard") {
      LibCard($("#search_keyword").val());
    }
    return false;
  });

  frmSearch.addEventListener("submit", e => {
    /*var mode = findGetParameter("mode");
    e.preventDefault();
    if (mode == "latest") {
      Latest($("#search_keyword").val());
    }
    if (mode == "libcard") {
      LibCard($("#search_keyword").val());
    }
    return false;*/
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
      dataTable.style.display = "none";
      Search.style.display = "none";

      //master@celex.com.my
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
}

// function parts

function popUserEdit() {
  console.log("popUserEdit");
}

function ModeSelection() {
  var url = document.location.href;
  var mode = findGetParameter("mode");
  //console.log(url);
  //console.log(window.location.search.substr(1));
  //console.log();
  switch (mode) {
    case "latest":
      Latest();
      break;
    case "libcard":
      LibCard();
      break;
    case "import":
      Import();
      break;
    default:
      Welcome();
  }
  //UserList();
}

function Welcome() {
  WelcomeSec.style.display = "block";
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

function LibCard() {}

function Latest() {
  var arrData = new Array();
  var iLoop = 0;
  latestActivitiesListener = firebase
    .firestore()
    .collection("users")
    .orderBy("dateCreated", "desc")
    .onSnapshot(snaps => {
      snaps.forEach(doc => {
        arrData[iLoop] = new Array(
          fbDataCheck(doc.data().name),
          fbDataCheck(doc.data().cardNo),
          fbDataCheck(doc.data().email),
          fbDataCheck(doc.data().gender),
          fbDataCheck(doc.data().icNo),
          firebaseTime(doc.data().dateCreated)
        );
        iLoop++;
        //Search.style.display = "block";
      });

      $("#dtFirebase").DataTable({
        data: arrData,
        columns: [
          { title: "Name" },
          { title: "Card No." },
          { title: "Email" },
          { title: "Gender" },
          { title: "IC No." },
          { title: "Created" }
        ]
      });
    });

  console.log(arrData);
}
function fbDataCheck(node) {
  if (typeof node !== "undefined") {
    return node;
  } else {
    return "n/a";
  }
}

function firebaseTime(fbTime) {
  if (typeof fbTime !== "undefined") {
    var u = new Date(fbTime.seconds * 1000);
    return (
      u.getUTCFullYear() +
      "-" +
      ("0" + u.getUTCMonth()).slice(-2) +
      "-" +
      ("0" + u.getUTCDate()).slice(-2) +
      " " +
      ("0" + u.getUTCHours()).slice(-2) +
      ":" +
      ("0" + u.getUTCMinutes()).slice(-2) +
      ":" +
      ("0" + u.getUTCSeconds()).slice(-2)
    ); // + '.' + (u.getUTCMilliseconds() / 1000).toFixed(3).slice(2, 5)
  } else {
    return "";
  }
}

function Import() {}

main();
