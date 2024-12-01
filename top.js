const firebaseConfig = {
    apiKey: "AIzaSyCZYjVLic4JthtsHxubAGVgv0FdQ3mDTSM",
    authDomain: "one-yen-gambling.firebaseapp.com",
    projectId: "one-yen-gambling",
    storageBucket: "one-yen-gambling.appspot.com",
    messagingSenderId: "649927241844",
    appId: "1:649927241844:web:20d3688537b9f0da5ba121",
    measurementId: "G-MFG9548W5S"
  };

  firebase.initializeApp(firebaseConfig);

  const coinRef = firebase.database().ref('coinCount');
  const commandRef = firebase.database().ref('command');
  const box = document.getElementById("comingsoon");

 // ----- bonus -----

  let coinCount = 0;
  // -----bonus 1-----
 let pressTimer;

 box.addEventListener("mousedown", () => {
    pressTimer = setTimeout(bonus1, 10000);
  });

  box.addEventListener("touchstart", () => {
    pressTimer = setTimeout(bonus1, 300000);
  });


  const bonus1 = () => {
  commandRef.once('value').then((commandSnapshot) => {
    const command = commandSnapshot.val() || "";
    if (!command.includes("1")) {
      coinRef.once('value').then((coinSnapshot) => {
        if (coinSnapshot.exists()) {
          const coinCount = coinSnapshot.val() + 50;
          coinRef.set(coinCount);
          alert("隠しコマンドを入力しました。\n1円を50枚入手しました。");
          commandRef.set(command + "1");
        } else {
          alert("error:coinCount not found");
        }
      });
    } else {
      alert("すでに受け取っています。");
    }
  });
};



// ----- bonus2 -----
const header = document.querySelector('.header');
let headerClickCount = 0;
header.addEventListener('click', () => {
  headerClickCount++;

  if (headerClickCount === 20) {
    bonus2();
    headerClickCount = 0;
  }
});
const bonus2 = () => {
  commandRef.once('value').then((commandSnapshot) => {
    const command = commandSnapshot.val() || "";
    if (!command.includes("2")) {
      coinRef.once('value').then((coinSnapshot) => {
        if (coinSnapshot.exists()) {
          const coinCount = coinSnapshot.val() + 20;
          coinRef.set(coinCount);
          alert("隠しコマンドを入力しました。\n1円を20枚入手しました。");
          commandRef.set(command + "2");
        } else {
          alert("error:coinCount not found");
        }
      });
    } else {
      alert("すでに受け取っています。");
    }
  });
};



