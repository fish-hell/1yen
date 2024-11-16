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

  const messagesRef = firebase.database().ref('messages');
  const coinRef = firebase.database().ref('randCount');
  const probRef = firebase.database().ref('probabilities');
  const usersRef = firebase.database().ref('users');

  let chatName = "名無し";
  let coinCount = 0;
  let baseProbability = 50;

  if (localStorage.getItem('chatName')) {
    chatName = localStorage.getItem('chatName');
  }

  function updateCoinDisplay() {
    document.getElementById('coin-count').innerHTML = `
    <img src="1rand-omote.png" width="25px" alt="1ランド" style="vertical-align: middle; display:inline-block;">×${coinCount}枚`;
  }

  coinRef.once('value').then((snapshot) => {
    if (snapshot.exists()) {
      coinCount = snapshot.val();
    } else {
      coinRef.set(coinCount);
    }
    updateCoinDisplay();
  });

  probRef.once('value').then((snapshot) => {
    if (snapshot.exists()) {
      const probs = snapshot.val();
      baseProbability = probs.n !== undefined ? probs.n : 50;
    } else {
      probRef.set({ n: baseProbability });
    }
  });

coinRef.on('value', (snapshot) => {
  if (snapshot.exists()) {
    coinCount = snapshot.val();
    updateCoinDisplay();
  }
});

probRef.on('value', (snapshot) => {
  if (snapshot.exists()) {
    const probs = snapshot.val();
    baseProbability = probs.n !== undefined ? probs.n : 50;
  }
});


  document.getElementById('menu-button').addEventListener('click', () => {
    const menu = document.getElementById('menu');
    menu.style.display = menu.style.display === 'none' || menu.style.display === '' ? 'block' : 'none';
  });

  document.getElementById('textmenu-button').addEventListener('click', () => {
    const textmenu = document.getElementById('textmenu');
    textmenu.style.display = textmenu.style.display === 'none' || textmenu.style.display === '' ? 'block' : 'none';
  });


  document.getElementById('set-chat-name').addEventListener('click', () => {
  usersRef.child(chatName).remove();
  const nameInput = document.getElementById('chat-name');
  chatName = nameInput.value.trim() || "名無し";
  localStorage.setItem('chatName', chatName);

  firebase.database().ref('users/' + chatName).set(true);

  alert(`チャット名が "${chatName}" に設定されました`);
  document.getElementById('menu').style.display = 'none';

  updateUserList();
});




document.getElementById('set-probabilities').addEventListener('click', () => {
    const probInput = document.getElementById('prob-input').value.trim();

    const regexN = /^n=(\d{1,3})$/;
    const regexC = /^c=(\d{1,5})$/;
    const regexB = /^b=(.+)$/;
    const regexShow = /^show$/i;
    const regexCShow = /^c=show$/i;    

    let match;

    if ((match = probInput.match(regexN)) !== null) {
      let newProbability = parseInt(match[1]);

      if (isNaN(newProbability) || newProbability < 0 || newProbability > 100) {
        alert('不正な値です。');
        return;
      }

      baseProbability = newProbability;
      probRef.set({ n: baseProbability })
        .then(() => {
          alert(`n=${baseProbability} に設定されました。`);
          document.getElementById('menu').style.display = 'none';
        })
        .catch((error) => {
          alert('失敗しました。' + error);
        });
    } else if ((match = probInput.match(regexC)) !== null) {
      let newCoinCount = parseInt(match[1]);

      if (isNaN(newCoinCount) || newCoinCount < 0 || newCoinCount > 100000) {
        alert('不正な値です。');
        return;
      }

      coinCount = newCoinCount;
      updateCoinDisplay();
      coinRef.set(coinCount)
        .then(() => {
          alert(`コイン数が${coinCount}枚に設定されました。`);
          document.getElementById('menu').style.display = 'none';
        })
        .catch((error) => {
          alert('失敗しました。' + error);
        });
    } else if ((match = probInput.match(regexB)) !== null) {
      const newValue = match[1];

      specialbonusRef.set(newValue)
        .then(() => {
          alert(`bonusに "${newValue}" が設定されました。`);
          document.getElementById('menu').style.display = 'none';
        })
        .catch((error) => {
          alert('失敗しました。' + error);
        });
    } else if (regexShow.test(probInput)) {
      document.getElementById('prob-input').value = `n=${baseProbability}`;
    } else if (regexCShow.test(probInput)) {
      alert(`現在のコイン数は ${coinCount}枚です。`);
    } else {
      alert('コードが違います。');
      return;
    }
});

  function sendMessage(message, sender) {
    if (message.trim() === '') {
      alert('メッセージを入力してください');
      return;
    }

    const newMessage = {
      text: message,
      timestamp: firebase.database.ServerValue.TIMESTAMP,
      sender: sender || "名無し"
    };

    messagesRef.push(newMessage);
  }

  function formatMessage(text) {
    text = text.replace(/\[b\](.*?)(?=\[|$)/g, '<b>$1</b>');
    text = text.replace(/\[i\](.*?)(?=\[|$)/g, '<em>$1</em>');
    text = text.replace(/\[s\](.*?)(?=\[|$)/g, '<s>$1</s>');
    text = text.replace(/\[u\](.*?)(?=\[|$)/g, '<u>$1</u>');
    text = text.replace(/\[0\](.*?)(?=\[|$)/g, '<span style="font-size: 1em;">$1</span>');
    text = text.replace(/\[1\](.*?)(?=\[|$)/g, '<span style="font-size: 1.7em;">$1</span>');
    text = text.replace(/\[2\](.*?)(?=\[|$)/g, '<span style="font-size: 1.3em;">$1</span>');
    text = text.replace(/\[3\](.*?)(?=\[|$)/g, '<span style="font-size: 0.7em;">$1</span>');
    
    text = text.replace(/\[([a-zA-Z]+|#[0-9a-fA-F]{6})\](.*?)(?=\]|$)/g, '<span style="color:$1">$2</span>');

    return text;
  }

  messagesRef.on('child_added', (snapshot) => {
  const message = snapshot.val();
  const time = new Date(message.timestamp).toLocaleTimeString();

  const messageElement = document.createElement('div');
  messageElement.classList.add('message');

  const formattedText = formatMessage(message.text);


  const youtubeRegex = /https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]+)/;
  const youtubeMatch = message.text.match(youtubeRegex);
  const link = formattedText.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>');

  let content;
  if (youtubeMatch) {
    const videoId = youtubeMatch[1];
    const embedHTML = `${link}<br><iframe width="320" height="180" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen>上記のリンクをタップしてYouTubeに移動します</iframe>`;
    content = embedHTML;
  } else {
    content = link;
  }

  messageElement.innerHTML = `
    <div class="meta-info">
      <span class="sender-name">${message.sender}</span>
      <span class="timestamp">${time}</span>
    </div>
    <div class="text">${content}</div>
  `;

  document.getElementById('chat-messages').appendChild(messageElement);
  document.getElementById('chat-messages').scrollTop = document.getElementById('chat-messages').scrollHeight;
});

  document.getElementById('send-button').addEventListener('click', () => {
    const messageInput = document.getElementById('message-input');
    const message = messageInput.value;
    sendMessage(message, chatName);
    messageInput.value = '';
  });

  document.getElementById('message-input').addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      const messageInput = document.getElementById('message-input');
      const message = messageInput.value;
      sendMessage(message, chatName);
      messageInput.value = '';
    }
  });

  function getCoinSize(betAmount) {
    if (betAmount >= 1 && betAmount <= 2) {
      return '50px';
    } else if (betAmount >= 3 && betAmount <= 5) {
      return '35px';
    } else if (betAmount >= 6 && betAmount <= 10) {
      return '25px';
    } else if (betAmount >= 11 && betAmount <= 20) {
      return '20px';
    } else if (betAmount >= 21 && betAmount <= 30) {
      return '15px';
    } else if (betAmount >= 31 && betAmount <= 40) {
      return '10px';
    } else if (betAmount >= 41 && betAmount <= 50) {
      return '7px';
    } else {
      return '3px';
    }
  }

  document.getElementById('bet-button').addEventListener('click', () => {
    const betButton = document.getElementById('bet-button');
    const selectedSide = document.querySelector('input[name="bet-side"]:checked').value;
    const betAmount = parseInt(document.getElementById('bet-amount').value);
    const coinsContainer = document.getElementById('coins-container');
    const resultContainer = document.getElementById('result');

    if (coinCount < betAmount) {
      alert('コインが不足しています');
      return;
    }

    betButton.disabled = true;


    coinsContainer.innerHTML = '';
    resultContainer.textContent = '';

    const totalCoins = betAmount * 2;


    const coinSize = getCoinSize(betAmount);

    for (let i = 0; i < totalCoins; i++) {
      const coin = document.createElement('div');
      coin.classList.add('coin');
      coin.style.backgroundImage = 'url("1rand-omote.png")';
      coin.style.width = coinSize;
      coin.style.height = coinSize;
      coinsContainer.appendChild(coin);
    }

    const coins = document.querySelectorAll('.coin');

    coinCount -= betAmount;
    updateCoinDisplay();

    coinRef.set(coinCount);

    setTimeout(() => {
      let headsCount = 0;
      let tailsCount = 0;

      coins.forEach(coin => {
        let isSelectedSide;
        if (selectedSide === '表') {
          isSelectedSide = Math.random() < (baseProbability / 100);
        } else {
          isSelectedSide = Math.random() < (baseProbability / 100);
        }

        if (isSelectedSide) {
          if (selectedSide === '表') {
            coin.style.backgroundImage = 'url("1rand-omote.png")';
            headsCount++;
          } else {
            coin.style.backgroundImage = 'url("1rand-ura.png")';
            tailsCount++;
          }
        } else {
          if (selectedSide === '表') {
            coin.style.backgroundImage = 'url("1rand-ura.png")';
            tailsCount++;
          } else {
            coin.style.backgroundImage = 'url("1rand-omote.png")';
            headsCount++;
          }
        }

        coin.style.animation = 'none';
      });


      let userWin = selectedSide === '表' ? headsCount : tailsCount;
      let netChange = userWin - betAmount;

      coinCount += userWin;
      updateCoinDisplay();

      coinRef.set(coinCount);

      const netChangeText = netChange >= 0 ? `(+${netChange})` : `(${netChange})`;
      resultContainer.textContent = `結果: 表 ${headsCount} 裏 ${tailsCount} | 獲得枚数: ${userWin}枚 ${netChangeText}`;

      sendMessage(`${selectedSide}に${betAmount}枚BETして${userWin}枚獲得。1ランド: ${coinCount}${netChangeText}枚`, "ゲームシステム");


      setTimeout(() => {
        betButton.disabled = false;
      }, 3000);
    }, 2500);
  });



  function applyText() {
      const messageInput = document.getElementById('message-input');
      const message = messageInput.value;

      const boldChecked = document.querySelector('input[value="b"]').checked;
      const italicChecked = document.querySelector('input[value="i"]').checked;
      const strikethroughChecked = document.querySelector('input[value="s"]').checked;
      const underlineChecked = document.querySelector('input[value="u"]').checked;

      const fontSize = document.querySelector('input[name="fontsize"]:checked').value;

      let Text1 = message;
      if (boldChecked) {
          Text1 = `[b]${Text1}`;
      }
      let Text2 = Text1;
      if (italicChecked) {
          Text2 = `[i]${Text2}`;
      }
      let Text3 = Text2;
      if (strikethroughChecked) {
          Text3 = `[s]${Text3}`;
      }
      let Text4 = Text3;
      if (underlineChecked) {
          Text4 = `[u]${Text4}`;
      }

      let Text5 = Text4;
      if (fontSize !== '0') {
          Text5 = `[${fontSize}]${Text5}`;
      }

      const chatColor = document.getElementById('colorinput').value;
      formattedMessage = `[${chatColor}]${Text5}`;

      messageInput.value = formattedMessage;

      document.getElementById('textmenu').style.display = 'none'
  }
    

  
  window.addEventListener('load', () => {
  const storedChatName = localStorage.getItem('chatName');
  if (storedChatName) {
    chatName = storedChatName;
  } else {
    chatName = "名無し";
  }
  
  firebase.database().ref('users/' + chatName).set(true);
  loadActiveUsers();
});

function loadActiveUsers() {
  usersRef.once('value').then((snapshot) => {
    const userList = document.getElementById('user-list');
    userList.innerHTML = '';

    snapshot.forEach((childSnapshot) => {
      const userName = childSnapshot.key;
      const listItem = document.createElement('li');
      listItem.textContent = userName;
      userList.appendChild(listItem);
    });
  });
}

function updateUserList() {
  usersRef.once('value').then((snapshot) => {
    const userList = document.getElementById('user-list');
    userList.innerHTML = '';

    snapshot.forEach((childSnapshot) => {
      const userName = childSnapshot.key;
      const listItem = document.createElement('li');
      listItem.textContent = userName;
      userList.appendChild(listItem);
    });
  });
}

window.addEventListener('beforeunload', () => {
  usersRef.child(chatName).remove();
});

usersRef.on('child_added', (snapshot) => {
  const userName = snapshot.key;
  updateUserList();
});

usersRef.on('child_removed', (snapshot) => {
  updateUserList();
});
