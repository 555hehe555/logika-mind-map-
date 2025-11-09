// --- Елементи ---
const logout = document.getElementById("logout");
const stressLevelText = document.getElementById("stress-level");
const testButton = document.getElementById("test-button");
const clearButton = document.getElementById("clear-button");
const historyList = document.getElementById("history-list");
const ctx = document.getElementById("stressChart").getContext("2d");
const emulateDayChange = document.getElementById("emulateDayChange");

let now = new Date();
emulateDayChange.value = now.toLocaleDateString("uk-UA");

// --- Допоміжні функції ---
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

// --- Перевірка користувача ---
let currentUser = getCookie("currentUser");
if (!currentUser) {
  window.location.href = "index.html"; // якщо не увійшов
}

// --- Завантаження даних користувача ---
function loadStressData() {
  const allData = JSON.parse(localStorage.getItem("stressData")) || {};
  return allData[currentUser] || [];
}

function saveStressData(newEntries) {
  const allData = JSON.parse(localStorage.getItem("stressData")) || {};
  if (!Array.isArray(allData[currentUser])) {  allData[currentUser] = [];  }
  allData[currentUser].push(...newEntries);
  localStorage.setItem("stressData", JSON.stringify(allData));
}


function clearStressData() {
  const allData = JSON.parse(localStorage.getItem("stressData")) || {};
  delete allData[currentUser];
  localStorage.setItem("stressData", JSON.stringify(allData));
}

let stressData = loadStressData();

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

// --- Графік ---
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

// --- Оновлення графіка ---
function updateChart() {
  const weekData = new Array(7).fill(null);

  stressData.forEach((item) => {
    const [day, month, year] = item.date.split(".");
    const date = new Date(`${year}-${month}-${day}`);
    const dayOfWeek = (date.getDay() + 6) % 7;
    weekData[dayOfWeek] = item.value;
  });

  // середнє за сьогодні
  const today = new Date().toLocaleDateString("uk-UA");
  const todayEntries = stressData.filter((i) => i.date === today);
  if (todayEntries.length > 0) {
    const avg =
      todayEntries.reduce((sum, i) => sum + i.value, 0) / todayEntries.length;
    const rounded = Math.round(avg * 10) / 10;
    stressLevelText.textContent = `${rounded}/10`;

    // кольори
    stressLevelText.style.color =
      rounded < 4 ? "green" : rounded < 7 ? "orange" : "red";
  } else {
    stressLevelText.textContent = "—";
    stressLevelText.style.color = "black";
  }

  stressChart.data.datasets[0].data = weekData;
  stressChart.update();
}



function updateHistory() {
  historyList.innerHTML += stressData
    .map(
      (item) =>
        `<div class="history-item">${item.date} (${item.time}): ${item.value}/10</div>`
    )
    .join("");
}

// --- Модалка тесту ---
const modal = document.getElementById("testModal");
const questionText = document.getElementById("questionText");
const answerButtons = document.querySelectorAll(".answer");

function showQuestion() {
  if (currentQuestion < questions.length) {
    questionText.textContent = questions[currentQuestion];
  } else {
    finishTest();
  }
}

function startTest() {
  totalScore = 0;
  currentQuestion = 0;
  modal.classList.remove("hidden");
  showQuestion();
}

answerButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const value = parseInt(btn.dataset.value);
    totalScore += value;
    currentQuestion++;
    showQuestion();
  });
});

function finishTest() {
  modal.classList.add("hidden");
  const stressLevel = Math.round((totalScore / (questions.length * 2)) * 10);

  const now = new Date();
  const dateStr = emulateDayChange.value;
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
    stressData = [];
    updateChart();
    updateHistory();
  }
}

// --- Події ---
testButton.addEventListener("click", startTest);
clearButton.addEventListener("click", clearHistory);
logout.addEventListener("click", function () {
  document.cookie = "currentUser=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  window.location.href = "index.html";
});

// --- Ініціалізація ---
updateChart();
updateHistory();
