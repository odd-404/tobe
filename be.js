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
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
} else {
    firebase.app(); // 如果已经初始化，使用已初始化的实例
}

const db = firebase.database();


// 获取今天的日期，格式化日期为 xxxx/xx/xx xx:xx
function getTodayDate() {
    var formattedDate = new Date(message.date);
     var year = formattedDate.getFullYear();
     var month = formattedDate.getMonth() + 1;
      var day = formattedDate.getDate();
     var hours = formattedDate.getHours();
     var minutes = formattedDate.getMinutes();

    // 补零格式化
    month = month < 10 ? '0' + month : month;
    day = day < 10 ? '0' + day : day;
     hours = hours < 10 ? '0' + hours : hours;
    minutes = minutes < 10 ? '0' + minutes : minutes;

    return  year + '/' + month + '/' + day + ' ' + hours + ':' + minutes;
}

// 检查是否已经选择过
function checkAnsweredStatus() {
    var today = getTodayDate().split(' ')[0]; // 提取年月日部分
    // 从 Firebase 获取今天是否已经选择
    db.ref('answered/' + today).once('value', function(snapshot) {
        const answer = snapshot.val();
        if (answer) {
            hasAnsweredToday = true;
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
    var message = (userAnswer === "想" ? todayDate + "  张嘉旺还活着" : todayDate + " 张嘉旺莫名其妙地死了");

    if (reason !== "") {
        // 在生死簿中添加消息
        message = (userAnswer === "想" ? todayDate + "  张嘉旺因" + reason + "而幸存!" : todayDate + " 张嘉旺因" + reason + "而死.");
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
    const messageBoard = document.getElementById("message-board");
    const messageItem = document.createElement("div");
    messageItem.classList.add("message-item");
    messageItem.innerText = message;
    messageBoard.appendChild(messageItem);

    const todayDate = getTodayDate(); // 调用 getTodayDate

    const newMessage = {
        date: todayDate,
        message: message,
    };

    // 将新消息添加到 Firebase Realtime Database
   db.ref('messages')
        .push(newMessage)
        .then(() => console.log('Message added to Firebase'))
        .catch((err) => console.error('Failed to add message:', err));
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
                const messageItem = document.createElement("div");
                messageItem.classList.add("message-item");
                
                // 直接展示 message 内容
                messageItem.innerText = message.message;

                // 添加到消息板
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
