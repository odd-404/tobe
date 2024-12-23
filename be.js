var userAnswer = ""; // 记录用户的选择
var hasAnsweredToday = false; // 标记用户是否已经选择过

// 配置 Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCeuW4TN7TpDpSNrno9FMfxh3RdrYLjm6o",
  authDomain: "tobe-odd.firebaseapp.com",
  projectId: "tobe-odd",
  storageBucket: "tobe-odd.firebasestorage.app",
  messagingSenderId: "264520250425",
  appId: "1:264520250425:web:888f22708fd987135989e8",
  measurementId: "G-XJKZLKD1KJ"
};

// 初始化 Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// 获取今天的日期
function getTodayDate() {
    var today = new Date();
    var year = today.getFullYear();
    var month = today.getMonth() + 1; // 月份从0开始，所以下标加1
    var day = today.getDate();
    return year + '-' + (month < 10 ? '0' + month : month) + '-' + (day < 10 ? '0' + day : day);
}

// 检查是否已经选择过
function checkAnsweredStatus() {
    var todayDate = getTodayDate();

    // 从 Firebase 获取今天是否已经选择
    db.ref('answered/' + todayDate).once('value', function(snapshot) {
        const answer = snapshot.val();
        if (answer) {
            hasAnsweredToday = true;
            alert("你今天已经做出选择啦！");
        }
    }, function(error) {
        console.error('Error checking answered status:', error);
    });
}

// 用户确认选择
function askConfirmation(answer) {
    if (hasAnsweredToday) {
        alert("你今天已经做出选择啦！");
        return; // 防止重复选择
    }

    userAnswer = answer; // 记录用户的选择

    var todayDate = getTodayDate(); // 获取今天的日期
    // 如果是“不想”，弹出确认框
    if (userAnswer === '不想') {
        var confirmAnswer = confirm("你确定?");
        if (confirmAnswer) {
            // 隐藏按钮并显示弹窗
            document.getElementById("modal").style.display = "block";
            document.getElementById("modal-title").innerText = "为什么呢?";
        }
    } else if (userAnswer === '想') {
        // 隐藏按钮并显示弹窗
        document.getElementById("modal").style.display = "block";
        document.getElementById("modal-title").innerText = "为什么呢?";
    }
}

// 创建一个延迟的函数
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// 提交原因
async function submitReason() {
    // 关闭弹窗
    closeModal();  // 调用关闭弹窗的函数
    hasAnsweredToday = true; // 标记已经选择过

  
    var todayDate = getTodayDate();
  

  // 延迟 1 秒
    await delay(1000);
    // 显示图片和消息
  
    if (userAnswer === '想') {
        // 显示“好狗狗好狗狗”并插入图片
        document.getElementById("response").innerHTML = "好狗狗好狗狗<br><img src='https://web-framework-odd-01.oss-cn-hangzhou.aliyuncs.com/%E8%B5%9E.png' alt='狗狗图片' class='response-image'>";
        document.getElementById("response").style.display = "block";
    } else if (userAnswer === '不想') {
        // 显示“接招吧！”并插入图片
        document.getElementById("response").innerHTML = "接招吧！<br><img src='https://web-framework-odd-01.oss-cn-hangzhou.aliyuncs.com/%E6%9D%80.png' alt='接招图片' class='response-image'>";
        document.getElementById("response").style.display = "block";

        // 等待用户点击后显示第二个消息
        setTimeout(function () {
            // 显示第二个消息并插入图片
            document.getElementById("response").innerHTML = "今天的你已经死了，等待零点复活......<br><img src='https://web-framework-odd-01.oss-cn-hangzhou.aliyuncs.com/%E6%AD%BB%E4%BA%A1.png' alt='死亡图片' class='response-image'>";
        }, 2000);  // 延迟显示第二条消息
    }

    // 延迟 1 秒
    await delay(1000);
  
    //添加到生死簿
    var reason = document.getElementById("reason-input").value.trim();
    var message = (userAnswer === "想" ? todayDate + " 张嘉旺还活着" : todayDate + " 张嘉旺莫名其妙地死了");

    if (reason !== "") {
        // 在生死簿中添加消息
        message = (userAnswer === "想" ? todayDate + " 张嘉旺因" + reason + "而幸存!" : todayDate + " 张嘉旺因" + reason + "而死.");
    }
    addMessage(message);

    // 保存用户选择到 Firebase
    db.ref('answered/' + todayDate).set(userAnswer);
}

// 关闭弹窗
function closeModal() {
    document.getElementById("modal").style.display = "none";
}

// 在生死簿上添加消息并上传到 Firebase
function addMessage(message) {
    var messageBoard = document.getElementById("message-board");
    var messageItem = document.createElement("div");
    messageItem.classList.add("message-item");
    messageItem.innerText = message;
    messageBoard.appendChild(messageItem);

    // 获取当前日期
    var todayDate = new Date().toISOString().split('T')[0];
    var newMessage = {
        date: todayDate,
        message: message
    };

    // 将新消息添加到 Firebase Realtime Database
    db.ref('messages').push(newMessage)
        .then(function () {
            console.log('Message added to Firebase');
        })
        .catch(function (err) {
            console.error('Failed to add message:', err);
        });
}

// 从 Firebase 获取消息数据并展示
function loadMessagesFromFirebase() {
    db.ref('messages').on('value', function(snapshot) {
        const messages = snapshot.val();
        const messageBoard = document.getElementById("message-board");
        messageBoard.innerHTML = "";  // 清空当前显示的消息

        for (let key in messages) {
            if (messages.hasOwnProperty(key)) {
                const message = messages[key];
                var messageItem = document.createElement("div");
                messageItem.classList.add("message-item");
                messageItem.innerText = message.message;
                messageBoard.appendChild(messageItem);
            }
        }
    }, function(error) {
        console.error('Error fetching messages from Firebase:', error);
    });
}

// 页面加载时自动获取消息并展示
window.onload = function() {
    checkAnsweredStatus();  // 检查是否已经回答过
    loadMessagesFromFirebase();  // 加载 Firebase 中的消息
}
