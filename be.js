import { db } from "./firebase-config.js";
import { ref, push, set, onValue } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-database.js";

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


var userAnswer = ""; // 记录用户的选择


// 获取今天的日期，格式化日期为 xxxx/xx/xx xx:xx
function getTodayDate() {
    const formattedDate = new Date();
    const year = formattedDate.getFullYear();
    const month = (formattedDate.getMonth() + 1).toString().padStart(2, "0");
    const day = formattedDate.getDate().toString().padStart(2, "0");
    const hours = formattedDate.getHours().toString().padStart(2, "0");
    const minutes = formattedDate.getMinutes().toString().padStart(2, "0");

    return `${year}/${month}/${day} ${hours}:${minutes}`;
}


// 检查今天是否已经回答
function checkAnsweredStatus() {
    var today = getTodayDate().split(' ')[0]; // 提取年月日部分
    const answeredRef = ref(db, 'answered/' + today);
    return new Promise((resolve, reject) => {
        onValue(answeredRef, (snapshot) => {
            const answer = snapshot.val();
            const hasAnsweredToday = !!answer;  // 如果存在数据，则认为今天已经回答
            resolve(hasAnsweredToday);
        }, (error) => {
            console.error('检查回答状态时出错:', error);
            reject(error);
        });
    });
}

// 用户确认选择
async function askConfirmation(answer) {
   try {
        const hasAnsweredToday = await checkAnsweredStatus();
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
                document.getElementById("modal-title").innerText = "为什么呀?";
            }
        } else if (userAnswer === '想') {
            // 隐藏按钮并显示弹窗
            document.getElementById("modal").style.display = "block";
            document.getElementById("modal-title").innerText = "为什么呀?";
        }
} catch (error) {
        console.error("检查回答状态时出错:", error);
    }
}

// 创建一个延迟的函数
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// 提交原因
async function submitReason() {
    try {
        console.log("提交原因逻辑执行");
        var todayDate = getTodayDate();  // 获取今天的日期
        closeModal();  // 关闭弹窗

        // 标记用户今天已经做了选择
      
        const today = todayDate.split(' ')[0]; // 获取今天的日期并格式化
        set(ref(db, 'answered/' + today), true); // 记录今天的选择

   // 延迟 1 秒
    await delay(1000);
    // 随机选择图片
        const imageLinks = [
            'https://web-framework-odd-01.oss-cn-hangzhou.aliyuncs.com/%E6%9D%80.png',
            'https://web-framework-odd-01.oss-cn-hangzhou.aliyuncs.com/%E5%B1%8F%E5%B9%95%E6%88%AA%E5%9B%BE%202024-12-26%20150247.png',
            'https://web-framework-odd-01.oss-cn-hangzhou.aliyuncs.com/%E5%B1%8F%E5%B9%95%E6%88%AA%E5%9B%BE%202024-12-26%20150326.png',
            'https://web-framework-odd-01.oss-cn-hangzhou.aliyuncs.com/%E5%B1%8F%E5%B9%95%E6%88%AA%E5%9B%BE%202024-12-26%20150334.png',
            'https://web-framework-odd-01.oss-cn-hangzhou.aliyuncs.com/%E5%B1%8F%E5%B9%95%E6%88%AA%E5%9B%BE%202024-12-26%20150348.png',
            'https://web-framework-odd-01.oss-cn-hangzhou.aliyuncs.com/%E5%B1%8F%E5%B9%95%E6%88%AA%E5%9B%BE%202024-12-26%20150355.png',
            'https://web-framework-odd-01.oss-cn-hangzhou.aliyuncs.com/%E5%B1%8F%E5%B9%95%E6%88%AA%E5%9B%BE%202024-12-26%20150407.png',
            'https://web-framework-odd-01.oss-cn-hangzhou.aliyuncs.com/%E6%96%A9%E7%AB%8B%E5%86%B3.png'
        ];
        const randomImage = imageLinks[Math.floor(Math.random() * imageLinks.length)];
      
  
    // 显示图片和消息
    if (userAnswer === '想') {
        // 显示“好狗狗好狗狗”并插入图片
        document.getElementById("response").innerHTML = "好狗狗好狗狗<br><img src='https://web-framework-odd-01.oss-cn-hangzhou.aliyuncs.com/%E8%B5%9E.png' alt='狗狗图片' class='response-image'>";
        document.getElementById("response").style.display = "block";
    } else if (userAnswer === '不想') {
        // 显示“接招吧！”并插入图片
        document.getElementById("response").innerHTML = `接招吧！<br><img src='${randomImage}' alt='接招图片' class='response-image'>`;
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
      
    } catch (error) {
        console.error('提交原因时出错:', error);
    }
}

// 关闭弹窗
function closeModal() {
    console.log("关闭弹窗逻辑执行");
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

   // 获取 Firebase 数据库实例
    const messagesRef = ref(db, 'messages');

    // 使用 push 将新消息添加到 Firebase
    const newMessageRef = push(messagesRef);
    set(newMessageRef, newMessage)
        .then(() => console.log('Message added to Firebase'))
        .catch((err) => console.error('Failed to add message:', err));
}

// 从 Firebase 获取消息数据并展示
function loadMessagesFromFirebase() {
    const messagesRef = ref(db, 'messages');

    // 使用 onValue 监听数据库的变化
    onValue(messagesRef, function(snapshot) {
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
    }, (error) => {
        console.error('从 Firebase 获取消息时出错:', error);
    });
}

// 页面加载时自动获取消息并展示
window.onload = () => {
    checkAnsweredStatus().then((hasAnswered) => {
        if (hasAnswered) {
            console.log("今天已经回答过了！");
        } else {
            console.log("今天还未回答！");
        }
    });
    loadMessagesFromFirebase(); // 加载消息
};

// 显示弹窗2的函数
function openModal2() {
    modal2.style.display = 'block'; // 显示弹窗
}
// 关闭弹窗2的函数
function closeModal2() {
    modal2.style.display = 'none'; // 隐藏弹窗
}
// 提交内容的函数，调用 addMessage 处理提交的内容
function submitWords() {
    var wordsInput = document.getElementById("words-input");  // 获取输入框元素
    var message = wordsInput.value.trim(); // 获取输入的内容
    if (message) {
        var todayDate = getTodayDate();
        addMessage(todayDate + ' 有人说:"' + message + '"' ); // 调用 addMessage 处理内容
        wordsInput.value = ''; // 清空输入框
        closeModal2(); // 关闭弹窗
    } else {
        alert('熊没听见'); // 如果输入为空，提示用户
    }
}
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("wantButton").addEventListener("click", () => askConfirmation("想"));
    document.getElementById("notWantButton").addEventListener("click", () => askConfirmation("不想"));
    document.getElementById("closeModalButton").addEventListener("click", closeModal);
    document.getElementById("closeModalButton2").addEventListener("click", closeModal2);
    document.getElementById("submitReasonButton").addEventListener("click", submitReason);
    document.getElementById("submitWordsButton").addEventListener('click', submitWords);
  
    document.getElementById("headerImage").addEventListener('click', openModal2);

    loadMessagesFromFirebase();
});

