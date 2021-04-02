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

//var sortOrder = "desc";
var tbFirebaseRowIndex = -1;
var tableFirebase;
var NextLibCardNo = 0;

function main() {
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

  //Event Handelers for UserModal Windows ===============================>
  btnUserDelete.addEventListener("click", e => {
    e.preventDefault();
    if (confirm("Are you sure proceed to DELETE ? ")) {
      //alert($('#UserModalDocId').val());
      firebase
        .firestore()
        .collection("users")
        .doc($("#UserModalDocId").val())
        .delete()
        .then(() => {
          // deleted
          tableFirebase
            .row(".selected")
            .remove()
            .draw(false);
          $("#UserModal").modal("toggle");
          console.log("Document successfully deleted!");
        })
        .catch(error => {
          alert("Error removing document: ", error);
          console.error("Error removing document: ", error);
        });
    }
    return false;
  });

  btnLibUntag.addEventListener("click", e => {
    e.preventDefault();
    if (confirm("Are you sure proceed to Untag ? ")) {

      firebase.firestore().collection("libraryCards").doc($("#LibModalDocId").val()).get().then(doc => {
          if (doc.exists) {
            //console.log("Document data:", doc.data());
            //unTag exist card usage mage
            if (!doc.data().untag) {
              firebase.firestore().collection("libraryCards").doc($("#LibModalDocId").val()).update({
                  untag: true
                });
              console.log("untaged:  " +doc.data().no +" " +doc.data().cardNo +" " +doc.data().email);

              //Release library card is ready!
              firebase.firestore().collection("libraryCards").doc().set({
                "cardNo": doc.data().cardNo,
                "email": "",
                "no": NextLibCardNo
              }).then(() => {
                console.log("Added & Rebuild LibCard successfully written!");
              })
              .catch((error) => {
                console.error("Error Rebuild libraryCards: ", error);
              });

            } else {
              console.log("already untaged document");
            }
          } else {
            // doc.data() will be undefined in this case
            console.log("No such document!");
          }
        })
        .catch(error => {
          console.log("Error getting document:", error);
          return false;
        });

      /*
        .set([
          untag => true
        ]).then(() => {          
          $("#UserModal").modal("toggle");
          console.log("Document successfully unTag!");
        })
        .catch(error => {
          alert("Error removing document: ", error);
          console.error("Error untagging document: ", error);
        });*/
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
      //Search.style.display = "none";

      //master@celex.com.my
      // Unsubscribe
      //unsubscribeGuestbook();
    }
  });
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
      Users();
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

function LibCard() {
  var arrData = new Array();
  var iLoop = 0;
  firebase
    .firestore()
    .collection("libraryCards")
    .orderBy("no", "desc")
    .limit(10)
    .onSnapshot(snaps => {
      snaps.forEach(doc => {
        if (NextLibCardNo == 0) {
          NextLibCardNo = doc.data().no+1;
          console.log("MaxCardNo.:" + NextLibCardNo);
        }
        arrData[iLoop] = new Array(
          doc.id,
          fbDataCheck(doc.data().no),
          fbDataCheck(doc.data().cardNo),
          fbDataCheck(doc.data().email),
          fbDataCheck(doc.data().untag)
        );
        iLoop++;
        //Search.style.display = "block";
      });

      tableFirebase = $("#dtFirebase").DataTable({
        data: arrData,
        columns: [
          { title: "Doc Id" },
          { title: "No." },
          { title: "Card No." },
          { title: "Email" },
          { title: "Untag" }
        ],
        order: [[1, "desc"]],
        pageLength: 50
      });

      $("#dtFirebase tbody").on("click", "tr", function() {
        var data = tableFirebase.row(this).data();
        var tr = $(this).closest("tr");

        if ($(this).hasClass("selected")) {
          $(this).removeClass("selected");
        } else {
          tableFirebase.$("tr.selected").removeClass("selected");
          $(this).addClass("selected");
          if(data[3]=='') {
            alert('No user tagged on this Library Card');
          } else {
            if(data[4]){
              alert('This Library Card record is revoked');
            } else {
              tbFirebaseRowIndex = tr.index();
              $("#LibModal").modal("show");
              $("#LibModalDocId").val(data[0]);
              $("#LibModalCardNo").html(data[2]);
              $("#LibModalEmail").html(data[3]);
            }          
          }          
        }
        //alert( 'You clicked on '+data[0]+'\'s row' );
      });

      $("#dtFirebase tr").css("cursor", "pointer");
    });
}

function Users() {
  var arrData = new Array();
  var iLoop = 0;
  var tmpObj;
  firebase
    .firestore()
    .collection("users")
    .orderBy("dateCreated", "desc")
    .limit(10)
    .onSnapshot(snaps => {
      snaps.forEach(doc => {
        arrData[iLoop] = new Array(
          doc.id,
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

      tableFirebase = $("#dtFirebase").DataTable({
        data: arrData,
        columns: [
          { title: "Doc Id" },
          { title: "Name" },
          { title: "Card No." },
          { title: "Email" },
          { title: "Gender" },
          { title: "IC No." },
          { title: "Created" }
        ],
        order: [[6, "desc"]],
        pageLength: 50,
        columnDefs: [
          {
            targets: [0],
            visible: false,
            searchable: false
          }
        ]
      });

      $("#dtFirebase tbody").on("click", "tr", function() {
        var data = tableFirebase.row(this).data();
        var tr = $(this).closest("tr");

        if ($(this).hasClass("selected")) {
          $(this).removeClass("selected");
        } else {
          tableFirebase.$("tr.selected").removeClass("selected");
          $(this).addClass("selected");

          tbFirebaseRowIndex = tr.index();
          $("#UserModal").modal("show");
          $("#UserModalDocId").val(data[0]);
          $("#UserModalName").html(data[1]);
          $("#UserModalCardNo").html(data[2]);
          $("#UserModalEmail").html(data[3]);
        }

        //alert( 'You clicked on '+data[0]+'\'s row' );
      });

      $("#dtFirebase tr").css("cursor", "pointer");
    });
}

function fbDataCheck(node) {
  if (typeof node !== "undefined") {
    return node;
  } else {
    return "";
  }
}

function firebaseTime(fbTime) {
  if (typeof fbTime !== "undefined") {
    var d = new Date(fbTime.seconds * 1000), // Convert the passed timestamp to milliseconds
      yyyy = d.getFullYear(),
      mm = ("0" + (d.getMonth() + 1)).slice(-2), // Months are zero based. Add leading 0.
      dd = ("0" + d.getDate()).slice(-2), // Add leading 0.
      hh = d.getHours(),
      h = hh,
      min = ("0" + d.getMinutes()).slice(-2), // Add leading 0.
      ampm = "AM",
      time;

    if (hh > 12) {
      h = hh - 12;
      ampm = "PM";
    } else if (hh === 12) {
      h = 12;
      ampm = "PM";
    } else if (hh == 0) {
      h = 12;
    }

    // ie: 2014-03-24, 3:00 PM
    time = yyyy + "-" + mm + "-" + dd + ", " + h + ":" + min + " " + ampm;
    return time;
  } else {
    return "";
  }
}

function Import() {}

main();
