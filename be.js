var userAnswer = ""; // 记录用户的选择
var hasAnsweredToday = false; // 标记用户是否已经选择过

// 初始化 OSS 客户端
var client = new OSS({
    region: 'oss-cn-hangzhou',  // 设置你自己的地区
    accessKeyId: 'LTAI5t5oYYFzJ2vYHgm1eS1w',
    accessKeySecret: '8sOY3mrW8VtPL90uALVfe7aMNLnuwG',
    bucket: 'web-framework-odd-01'
});

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
    var storedAnswer = localStorage.getItem('answered_' + todayDate); // 从本地存储获取今天的选择状态
    if (storedAnswer) {
        hasAnsweredToday = true;
        alert("你今天已经做出选择啦！");
    }
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

// 提交原因
function submitReason() {
    // 关闭弹窗
    closeModal();  // 调用关闭弹窗的函数
    hasAnsweredToday = true; // 标记已经选择过
 
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

    // 保存用户选择到本地存储
    localStorage.setItem('answered_' + todayDate, userAnswer);

    //添加到生死簿
    var reason = document.getElementById("reason-input").value.trim();
    var todayDate = getTodayDate(); // 获取今天的日期

    // 如果没有输入，使用默认的消息
    var message = (userAnswer === "想" ? todayDate + " 张嘉旺还活着" : todayDate + " 张嘉旺莫名其妙地死了");

    if (reason !== "") {
        // 在生死簿中添加消息
        message = (userAnswer === "想" ? todayDate + " 张嘉旺因" + reason + "而幸存!" : todayDate + " 张嘉旺因" + reason + "而死.");
    }
    addMessage(message);
}

// 关闭弹窗
function closeModal() {
    document.getElementById("modal").style.display = "none";
}

// 在生死簿上添加消息并上传到 OSS
function addMessage(message) {
    var messageBoard = document.getElementById("message-board");
    var messageItem = document.createElement("div");
    messageItem.classList.add("message-item");
    messageItem.innerText = message;
    messageBoard.appendChild(messageItem);

    // 获取现有消息并添加新消息
    client.get('messages/messages.json')
        .then(function (result) {
            var messages = [];
            try {
                messages = JSON.parse(result.content);  // 获取现有消息并解析
            } catch (e) {
                console.error('Failed to parse existing messages:', e);
            }

            // 生成当前日期并添加新的消息
            var todayDate = new Date().toISOString().split('T')[0];
            var newMessage = {
                date: todayDate,
                message: message
            };
            messages.push(newMessage);

            // 将消息数组更新为 JSON 格式
            var updatedMessageJSON = JSON.stringify(messages);

            // 上传更新后的消息到 OSS
            return client.put('messages/messages.json', new Blob([updatedMessageJSON], { type: 'application/json' }));
        })
        .then(function (result) {
            console.log('Messages updated and uploaded to OSS:', result);
        })
        .catch(function (err) {
            console.error('Failed to update messages:', err);
        });
}

// 从 OSS 获取消息数据并展示
function loadMessagesFromOSS() {
    client.get('messages/messages.json')
        .then(function (result) {
            // 获取到文件内容后，解析并展示
            var messages = JSON.parse(result.content);
            var messageBoard = document.getElementById("message-board");
            messages.forEach(function (message) {
                var messageItem = document.createElement("div");
                messageItem.classList.add("message-item");
                messageItem.innerText = message.message;
                messageBoard.appendChild(messageItem);
            });
        })
        .catch(function (err) {
            console.error('Failed to load messages from OSS:', err);
        });
}

// 页面加载时检查是否已选择
window.onload = function() {
    checkAnsweredStatus();
}

