const admin = require("firebase-admin");

const serviceAccount = require("./runway-firebase-admin.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const messaging = admin.messaging();
const firestore = admin.firestore();

let firstTime = true;

firestore.collection("feedbacks").onSnapshot(async (snapshot) => {
  let docs = snapshot.docChanges();
  for (let i = 0; i < docs.length; i++) {
    if (docs[i].type == "added" && !firstTime) {
      let doc = docs[i].doc.data();
      let notifications = await firestore.collection("notification").get();
      for (let notification of notifications.docs) {
        messaging
          .send({
            token: notification.data().token,
            webpush: {
              notification: {
                title: "#" + doc.hId,
                body: doc.content,
                icon: "https://feedio.runway.itss.edu.vn/assets/images/Runway-Icon.png",
                vibrate: [200, 100, 200],
              },
            },
          })
          .then(() => {
            console.log(
              "Messaging: " + doc.id + " => " + notification.data().token
            );
          })
          .catch((err) => {
            console.error(err);
          });
      }
    }
  }
  firstTime = false;
});

console.log("Runway Notificator is ready");
