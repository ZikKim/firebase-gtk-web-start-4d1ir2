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
var nextLibCardNo = 0;

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
      dataTable.style.display = "none";
      //Search.style.display = "none";

      //master@celex.com.my
      // Unsubscribe
      //unsubscribeGuestbook();
    }
  });

  var fbRef = firebase.firestore().collection("libraryCards");
  var fbDoc = await fbRef.orderBy("no", "desc").limit(1).get();
  fbDoc.forEach(doc => {
    nextLibCardNo = doc.data().no + 1;
  });

  console.log("The next Lib cards number is : " + nextLibCardNo);

  //Event Handelers for UserModal Windows ===============================>
  btnUserDelete.addEventListener("click", e => {
    e.preventDefault();

    console.log(nextLibCardNo);

    if (confirm("Are you sure proceed to DELETE and Untag ? ")) {
      //alert($('#UserModalDocId').val());
      firebase.firestore().collection("users").doc($("#UserModalDocId").val()).delete().then(() => {

          //search email address from LibCard tagged, and untagging for rebuild
          firebase.firestore().collection("libraryCards")
            .where("cardNo", "==", $("#UserModalTagedCardNo").val())
            .where("email", "==", $("#UserModalTagedEmail").val())
            .where("untag", "!=", true).onSnapshot(snaps => {
              snaps.forEach(doc => {
                //Remark untagging on untag field as boolean
                firebase.firestore().collection("libraryCards").doc(doc.id).update({ untag: true });
                console.log("Untagging User :  " + doc.id + " " + doc.data().email + " " +doc.data().cardNo);
              });
            });

          if ($("#UserModalTagedCardNo").val() != "") {
            //Release library card is ready!  == REBUILD ==
            firebase.firestore().collection("libraryCards").doc().set({
                cardNo: $("#UserModalTagedCardNo").val(),
                email: "",
                no: nextLibCardNo
              }).then(() => {
                console.log("Added & Rebuild LibCard successfully written!" + $("#UserModalTagedCardNo").val() + " " + nextLibCardNo );
              })
              .catch(error => {
                console.error("Error Rebuild libraryCards: ", error);
              });          
          }
          nextLibCardNo++;


          // Deletion apply to the DataTables
          tableFirebase.row(".selected").remove().draw(false);
          $("#UserModal").modal("toggle");
          console.log("Document successfully deleted!");

        })
        .catch(error => {
          //Any Error While deleting on Firebase documnet
          alert("Error removing document: ", error);
          console.error("Error removing document: ", error);
        });
    }
    return false;
  });
  
  //Event Handelers for LibModal Windows ===============================>
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

              console.log("Rebuild Lib Card : " + doc.data().no +" " + doc.data().cardNo +" " + doc.data().email);

              firebase.firestore().collection("users").where("email", "==", doc.data().email).onSnapshot(snaps => {
                  snaps.forEach(doc => {
                    firebase.firestore().collection("users").doc(doc.id).update({ cardNo: "" });
                    console.log("Untagging User :  " +doc.data().email +" " +doc.data().name);
                  });
                });

              //Release library card is ready!
              firebase.firestore().collection("libraryCards").doc().set({
                  cardNo: doc.data().cardNo,
                  email: "",
                  no: nextLibCardNo
                })
                .then(() => {
                  $("#LibModal").modal("toggle");
                  console.log("Added & Rebuild LibCard successfully written!");
                })
                .catch(error => {
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
    }
    return false;
  });

  btnImportCards.addEventListener("click", e => {
    e.preventDefault();
    var newCards = $.trim($('#txtNewCards').val());
    if(newCards != ""){
      newCards = newCards.replace(/\s/g, '');
      var iLoop = 0;
      var arrCards = newCards.split(",").filter(function (el) { return el != ''; });
      var objData = new Object();
      console.log(arrCards);

      if(confirm('A total of ' + arrCards.length + ' new codes were found. Do you want to continue?')) {
        arrCards.forEach(function(item) {
          objData = {"cardNo": item, "email": "", "no": nextLibCardNo};
          iLoop++;
          firebase.firestore().collection('libraryCards').add(objData).then(function(docRef) {
            console.log("Document written with ID: ", docRef.id);
          })
          .catch(function(error) {
            console.error("Error adding document: ", error);
          });
          nextLibCardNo++;
        });

        //var jsonObj = JSON.stringify(arrData);
        //console.log(arrData);
        //console.log(jsonObj);
        //return false;

        /*firebase.firestore().collection('libraryCards').doc().set(arrData).then(() => {
          console.log("Imported Data Successfully");
          alert('Imported Data Successfully!');
        })
        .catch(error => {
          console.error("Error Import Library Card Data: ", error);
        });*/


      } // if confirm
    }
    return false;
  });
  

} // and 'async main' function

function Welcome() {
  WelcomeSec.style.display = "block";
}

function ModeSelection() {
  var url = document.location.href;
  var mode = findGetParameter("mode");
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
}

function findGetParameter(parameterName) {
  var result = null,
    tmp = [];
  location.search.substr(1).split("&").forEach(function(item) {
      tmp = item.split("=");
      if (tmp[0] === parameterName) result = decodeURIComponent(tmp[1]);
    });
  return result;
}

function LibCard() {
  var arrData = new Array();
  var iLoop = 0;
  firebase.firestore().collection("libraryCards").orderBy("no", "desc").onSnapshot(snaps => {
      snaps.forEach(doc => {
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
        pageLength: 50,
        destroy: true
      });

      $("#dtFirebase tbody").on("click", "tr", function() {
        var data = tableFirebase.row(this).data();
        var tr = $(this).closest("tr");

        if ($(this).hasClass("selected")) {
          $(this).removeClass("selected");
        } else {
          tableFirebase.$("tr.selected").removeClass("selected");
          $(this).addClass("selected");
          if (data[3] == "") {
            alert("No user tagged on this Library Card");
          } else {
            if (data[4]) {
              alert("This Library Card record is revoked");
            } else {
              tbFirebaseRowIndex = tr.index();
              $("#LibModal").modal("show");
              $("#LibModalDocId").val(data[0]);
              $("#LibModalCardNo").html(data[2]);
              $("#LibModalEmail").html(data[3]);
            }
          }
        }
        //alert( 'You clicked on '+data[0]+'\'s row' ); xxxxxxxxx
      });

      $("#dtFirebase tr").css("cursor", "pointer");
    });
}

function Users() {
  var arrData = new Array();
  var iLoop = 0;
  var tmpObj;
  firebase.firestore().collection("users").orderBy("dateCreated", "asc").onSnapshot(snaps => {
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
        ],
        destroy: true
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
          $("#UserModalDocId").val(data[0]); // document id. hidden from table
          $("#UserModalName").html(data[1]);
          $("#UserModalCardNo").html(data[2]);
          $("#UserModalEmail").html(data[3]);

          $("#UserModalTagedCardNo").val(data[2]);
          $("#UserModalTagedEmail").val(data[3]);
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

function Import() {

  ImportSec.style.display = "block";
}

main();
