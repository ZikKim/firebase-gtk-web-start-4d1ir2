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

  /*btnEdit.addEventListener("click", () => {
    console.log("btnEdit");
  });*/

  frmSearch.addEventListener("submit", e => {
    var mode = findGetParameter("mode");
    e.preventDefault();
    if (mode == "latest") {
      Latest($("#search_keyword").val());
    }
    if (mode == "libcard") {
      LibCard($("#search_keyword").val());
    }
    return false;
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
  welcome.style.display = "block";
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

function LibCard(searchKeyword) {
  dataTable.innerHTML = "";
  var html_table =
    "<i>* Only the 50 latest registered records are shown.</i><br><br>";
  html_table += '<table width="100%" id="tbUsers">';
  html_table += "<tr>";
  html_table += "  <td><b>No.</b></td>";
  html_table += "  <td><b>Card No.</b></td>";
  html_table += "  <td><b>Email</b></td>";
  html_table += "</tr>";

  //.orderBy("dateCreated", "desc")
  //.limit(50)
  var key = searchKeyword + "";
  key = key.toLowerCase();
  if (key.length > 3 && key != "undefined") {
    latestActivitiesListener = firebase
      .firestore()
      .collection("libraryCards")
      .orderBy("no", "desc")
      .onSnapshot(snaps => {
        var trData = "";
        snaps.forEach(doc => {
          if (
            doc
              .data()
              .email.toLowerCase()
              .includes(key) ||
            doc
              .data()
              .cardNo.toLowerCase()
              .includes(key)
          ) {
            trData +=
              "<tr><td>" +
              doc.data().no +
              "</td><td>" +
              doc.data().cardNo +
              "</td><td>" +
              doc.data().email +
              "</td><td>" +
              " <label> <a href='#' onclick='popUserEdit(1);'>&#9998;</a></label>  <label><a href='#'>&#9003;</a></label> " +
              "</td></tr>";
          }
        });
        trData += '<tr><td align="center" colspan="3">End of Records</td></tr>';
        html_table += trData + "</table>";
        dataTable.innerHTML = html_table;
        usersearch.style.display = "block";
      });
  } else {
    latestActivitiesListener = firebase
      .firestore()
      .collection("libraryCards")
      .orderBy("no", "desc")
      .limit(50)
      .onSnapshot(snaps => {
        var trData = "";
        snaps.forEach(doc => {
          trData +=
            "<tr><td>" +
            doc.data().no +
            "</td><td>" +
            doc.data().cardNo +
            "</td><td>" +
            doc.data().email +
            "</td><td>" +
            " <label> <a href='javascript:popUserEdit(2);'>&#9998;</a></label>  <label><a href='#'>&#9003;</a></label> " +
            "</td></tr>";
        });
        trData += '<tr><td align="center" colspan="3">End of Records</td></tr>';
        html_table += trData + "</table>";
        dataTable.innerHTML = html_table;
        usersearch.style.display = "block";
      });
  }
}

function Latest(searchKeyword) {
  dataTable.innerHTML = "";
  var html_table =
    "<i>* Only the 50 latest registered records are shown.</i><br><br>";
  html_table += '<table width="100%" id="tbUsers">';
  html_table += "<tr>";
  html_table += "  <td><b>Name</b></td>";
  html_table += "  <td><b>Card No.</b></td>";
  html_table += "  <td><b>Email</b></td>";
  html_table += "  <td><b>Gender</b></td>";
  html_table += "  <td><b>IC No.</b></td>";
  html_table += "  <td><b>Created</b></td>";
  html_table += "  <td><b>Tools</b></td>";
  html_table += "</tr>";

  //.orderBy("dateCreated", "desc")
  //.limit(50)
  var key = searchKeyword + "";
  key = key.toLowerCase();
  if (key.length > 3 && key != "undefined") {
    latestActivitiesListener = firebase
      .firestore()
      .collection("users")
      .orderBy("dateCreated", "desc")
      .onSnapshot(snaps => {
        var trData = "";
        snaps.forEach(doc => {
          if (
            doc
              .data()
              .name.toLowerCase()
              .includes(key) ||
            doc
              .data()
              .email.toLowerCase()
              .includes(key) ||
            doc
              .data()
              .icNo.toLowerCase()
              .includes(key) ||
            doc
              .data()
              .cardNo.toLowerCase()
              .includes(key) ||
            doc
              .data()
              .dateCreated.toDate()
              .toDateString()
              .toLowerCase()
              .includes(key)
          ) {
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
              doc
                .data()
                .dateCreated.toDate()
                .toDateString() +
              "</td><td>" +
              " <label> <a href='#' onclick='popUserEdit(1);'>&#9998;</a></label>  <label><a href='#'>&#9003;</a></label> " +
              "</td></tr>";
          }
        });
        trData += '<tr><td align="center" colspan="6">End of Records</td></tr>';
        html_table += trData + "</table>";
        dataTable.innerHTML = html_table;
        usersearch.style.display = "block";
      });
  } else {
    latestActivitiesListener = firebase
      .firestore()
      .collection("users")
      .orderBy("dateCreated", "desc")
      .limit(50)
      .onSnapshot(snaps => {
        var trData = "";
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
            doc
              .data()
              .dateCreated.toDate()
              .toDateString() +
            "</td><td>" +
            " <label> <a href='javascript:popUserEdit(2);'>&#9998;</a></label>  <label><a href='#'>&#9003;</a></label> " +
            "</td></tr>";
        });
        trData += '<tr><td align="center" colspan="6">End of Records</td></tr>';
        html_table += trData + "</table>";
        dataTable.innerHTML = html_table;
        usersearch.style.display = "block";
      });
  }
}

function Import() {}

main();
