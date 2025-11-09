// ------елементи------
let usernameInput = document.getElementById("username");
let passwordInput = document.getElementById("password");
let loginButton = document.getElementById("login");

// -----функції------
function setCookie(name, value, days) {
  const d = new Date();
  d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
  const expires = "expires=" + d.toUTCString();
  document.cookie = name + "=" + value + ";" + expires + ";path=/";
}

function getCookie(name) {
  const cname = name + "=";
  const decodedCookie = decodeURIComponent(document.cookie);
  const ca = decodedCookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1);
    if (c.indexOf(cname) === 0) {
      return c.substring(cname.length, c.length);
    }
  }
  return "";
}

// ---- робота з юзерами ----
function getAllUsers() {
  return JSON.parse(localStorage.getItem("users")) || {};
}

function saveAllUsers(users) {
  localStorage.setItem("users", JSON.stringify(users));
}

function authenticateUser(username, password) {
  const users = getAllUsers();
  if (!users[username]) return [false, false]; // [правильний пароль, існує]
  return [users[username] === password, true];
}

function addUser(username, password) {
  const users = getAllUsers();
  users[username] = password;
  saveAllUsers(users);
  return true;
}

// ------перевірка чи користувач вже увійшов------
window.onload = function() {
  let currentUser = getCookie("currentUser");
  if (currentUser && currentUser in getAllUsers()) {
    window.location.href = "main.html"; 
  }
};

// ------обробник події для кнопки входу------
loginButton.addEventListener("click", function (event) {
  event.preventDefault();
  let username = usernameInput.value.trim();
  let password = passwordInput.value.trim();

  if (!username || !password) {
    alert("Будь ласка, введіть ім’я користувача та пароль.");
    return;
  }

  const [correctPassword, exists] = authenticateUser(username, password);

  if (correctPassword) {
    setCookie("currentUser", username, 1);
    alert("Вхід успішний!");
    window.location.href = "main.html";
  } else if (exists) {
    alert("Невірний пароль. Спробуйте ще раз.");
  } else {
    addUser(username, password);
    setCookie("currentUser", username, 1);
    alert("Реєстрація успішна! Ви увійшли в систему.");
    window.location.href = "main.html";
  }
});
