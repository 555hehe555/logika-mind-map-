

// --- Елементи ---
const stressLevelText = document.getElementById("stress-level");
const testButton = document.getElementById("test-button");
const clearButton = document.getElementById("clear-button");
const historyList = document.getElementById("history-list");
const ctx = document.getElementById("stressChart").getContext("2d");
const emulateDayChange = document.getElementById("emulateDayChange");
let now = new Date(); emulateDayChange.value = now.toLocaleDateString("uk-UA");

// Модалка тесту
const modal = document.getElementById("testModal");
const questionText = document.getElementById("questionText");
const answerButtons = document.querySelectorAll(".answer");

// --- Дані ---
let stressData = JSON.parse(localStorage.getItem("stressData")) || [];
stressData = stressData.filter((item) => item && item.date && typeof item.value === "number");
localStorage.setItem("stressData", JSON.stringify(stressData));

// --- Питання ---
const questions = [
  "Чи відчував ти сьогодні втому без причини?",
  "Чи було важко зосередитись на справах?",
  "Чи виникали проблеми зі сном або апетитом?",
  "Чи часто сьогодні відчував тривогу або роздратування?",
  "Чи здавалося, що все валиться з рук?",
];

let currentQuestion = 0;
let totalScore = 0;

// --- міні API для local storage ---
function saveStressData(newStressData) {
  const oldStressData = loadStressData();
  const updated = [...oldStressData, ...newStressData]; // правильне об'єднання масивів
  localStorage.setItem("stressData", JSON.stringify(updated));
  return true;
}

function loadStressData() {
  const data = JSON.parse(localStorage.getItem("stressData"));
  return data || [];
}

function clearStressData() {
  localStorage.removeItem("stressData");
  stressData = [];
  return true;
}

function getCurrentUser() {
  let allUsername = localStorage.getItem("username");
  let currentUser = getCookie("currentUser");
  if (currentUser in allUsername) {
    return currentUser;
  } else {
    return null;
  }
}

function authenticateUser(username, password) {
  const storedUser = localStorage.getItem("username");
  const storedPass = localStorage.getItem("password");
  return username === storedUser && password === storedPass;
}

function registerUser(username, password) {
  localStorage.setItem("username", username);
  localStorage.setItem("password", password);
  return true;
}

// --- Створення графіка ---
let stressChart = new Chart(ctx, {
  type: "line",
  data: {
    labels: ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"],
    datasets: [
      {
        label: "Рівень стресу",
        data: [],
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59, 130, 246, 0.2)",
        borderWidth: 2,
        tension: 0.3,
        pointRadius: 5,
        pointBackgroundColor: "#3b82f6",
      },
    ],
  },
  options: {
    scales: {
      y: {
        beginAtZero: true,
        max: 10,
      },
    },
  },
});

// --- Функції оновлення ---
function updateChart() {
  const weekData = new Array(7).fill(null);

  stressData.forEach((item) => {
    const [day, month, year] = item.date.split(".");
    const date = new Date(`${year}-${month}-${day}`);
    const dayOfWeek = (date.getDay() + 6) % 7;
    weekData[dayOfWeek] = item.value;
  });

  stressChart.data.datasets[0].data = weekData;
  stressChart.update();
}

function updateHistory() {
  historyList.innerHTML += stressData
    .map((item) =>
        `<div class="history-item">${item.date} (${item.time}): ${item.value}/10</div>`
    ).join("");
}

// --- Відображення питання ---
function showQuestion() {
  if (currentQuestion < questions.length) {
    questionText.textContent = questions[currentQuestion];
  } else {
    finishTest();
  }
}

// --- Почати тест ---
function startTest() {
  totalScore = 0;
  currentQuestion = 0;
  modal.classList.remove("hidden");
  showQuestion();
}

// --- Обробка відповіді ---
answerButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const value = parseInt(btn.dataset.value);
    totalScore += value;
    currentQuestion++;
    showQuestion();
  });
});

// --- Завершення тесту ---
function finishTest() {
  modal.classList.add("hidden");

  // Максимальний бал = 2 * кількість питань
  const stressLevel = Math.round((totalScore / (questions.length * 2)) * 10);

  const now = new Date();
  const dateStr = emulateDayChange.value
  const hours = now.getHours().toString().padStart(2, "0");
  const minutes = now.getMinutes().toString().padStart(2, "0");

  const existing = stressData.find((item) => item.date === dateStr);
  if (existing) {
    existing.value = stressLevel;
    existing.time = `${hours}:${minutes}`;
  } else {
    stressData.push({
      date: dateStr,
      time: `${hours}:${minutes}`,
      value: stressLevel,
    });
  }

  saveStressData(stressData);

  stressLevelText.textContent = `${stressLevel}/10`;
  updateChart();
  updateHistory();
}

// --- Очистити історію ---
function clearHistory() {
  if (confirm("Очистити всі результати?")) {
    clearStressData();
    updateChart();
    updateHistory();
    window.location.reload();
  }
}

// --- Події ---
testButton.addEventListener("click", startTest);
clearButton.addEventListener("click", clearHistory);

// --- Запуск ---
updateChart();
updateHistory();
