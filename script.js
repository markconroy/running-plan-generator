const table = document.querySelector(".training-plan__table");
const tableBody = table.querySelector("tbody");
const savedPlansContainer = document.querySelector(".saved-plans__content");
const createPlanButton = document.querySelector(".choice--create button");
const dialog = document.querySelector("dialog");
const dialogContent = document.querySelector(".dialog__content");

const distance = document.querySelector(".choice--distance");
let distanceSelect = distance.querySelector("select");
let distanceValue = distanceSelect.value;

const weeks = document.querySelector(".choice--weeks");
let numberOfWeeksToTrain = parseInt(weeks.querySelector("input").value);

const speedRunSessions = [
  "100m Intervals",
  "400m Intervals",
  "800m Intervals",
  "Hill Repeats",
];

const mediumRunSessions = [
  "Fartlek",
  "Tempo",
  "Progression",
  "Long Intervals",
  "Threshold",
];

const longRunSessions = [
  "Long Run",
  "Long Run",
  "Long Run",
  "Long Run (Sprint Finish)",
  "Long Run (Sprint Finish)",
  "Long Run (Progression)",
  "Long Run (Progression)",
  "Long Run (Race Pace)",
];

let minimumEasyRunDistance;
let maximumEasyRunDistance;
let minimumMediumRunDistance;
let maximumMediumRunDistance;
let minimumSpeedRunDistance;
let maximumSpeedRunDistance;
let minimumLongRunDistance;
let maximumLongRunDistance;

function handleNumberOfWeeksToTrain() {
  numberOfWeeksToTrain = parseInt(weeks.querySelector("input").value);
  // We take 1 week off, so we can specify a specific race week plan.
  // This race week plan then gets added as the last row in the table.
  numberOfWeeksToTrain = numberOfWeeksToTrain - 1;
  // We take 2 weeks off for half-marathon tapering.
  if (distanceValue === "half-marathon") {
    numberOfWeeksToTrain = numberOfWeeksToTrain - 2;
  }
  // We take 3 weeks off for marathon tapering.
  if (distanceValue === "marathon") {
    numberOfWeeksToTrain = numberOfWeeksToTrain - 3;
  }
}

// Set minimum and maximum distances for each type of run per distance.
function handleDistanceChange() {
  distanceValue = distanceSelect.value;
  switch (distanceValue) {
    case "5k":
      minimumEasyRunDistance = 5;
      maximumEasyRunDistance = 8;
      minimumMediumRunDistance = 4;
      maximumMediumRunDistance = 5;
      minimumSpeedRunDistance = 3;
      maximumSpeedRunDistance = 4;
      minimumLongRunDistance = 8;
      maximumLongRunDistance = 12;
      break;
    case "10k":
      minimumEasyRunDistance = 6;
      maximumEasyRunDistance = 9;
      minimumMediumRunDistance = 5;
      maximumMediumRunDistance = 8;
      minimumSpeedRunDistance = 4;
      maximumSpeedRunDistance = 7;
      minimumLongRunDistance = 8;
      maximumLongRunDistance = 14;
      break;
    case "half-marathon":
      minimumEasyRunDistance = 7;
      maximumEasyRunDistance = 12;
      minimumMediumRunDistance = 6;
      maximumMediumRunDistance = 10;
      minimumSpeedRunDistance = 5;
      maximumSpeedRunDistance = 10;
      minimumLongRunDistance = 10;
      maximumLongRunDistance = 18;
      break;
    case "marathon":
      minimumEasyRunDistance = 8;
      maximumEasyRunDistance = 16;
      minimumMediumRunDistance = 7;
      maximumMediumRunDistance = 13;
      minimumSpeedRunDistance = 7;
      maximumSpeedRunDistance = 10;
      minimumLongRunDistance = 12;
      maximumLongRunDistance = 35;
      break;
  }
  return (
    minimumLongRunDistance,
    maximumLongRunDistance,
    minimumMediumRunDistance,
    maximumMediumRunDistance,
    minimumSpeedRunDistance,
    maximumSpeedRunDistance,
    minimumEasyRunDistance,
    maximumEasyRunDistance
  );
}

// Get a random session from each session type.
function getRandomSession(array) {
  return array[Math.floor(Math.random() * array.length)];
}

// Each time the user changes their choice, we need to update the plan.
function clearPlan() {
  tableBody.innerHTML = "";
}

// Given 2 numbers, return an increasing number between them for each week.
// i parameter is the index from the loop that this function is called in.
function getIncreasingNumberBetween(min, max, i, numberOfWeeksToTrain) {
  const difference = max - min;
  const increment = difference / numberOfWeeksToTrain;
  return Math.round(min + increment * i);
}

// Create a row for each taper week.
function handleTaperWeeks(week) {
  const mediumRunSession = getRandomSession(mediumRunSessions);
  const mediumRunSessionLink = mediumRunSession
    .replace(/\s+/g, "-")
    .toLowerCase();
  const speedRunSession = getRandomSession(speedRunSessions);
  const speedRunSessionLink = speedRunSession
    .replace(/\s+/g, "-")
    .toLowerCase();
  const longRunSession = getRandomSession(longRunSessions);
  const longRunSessionLink = longRunSession
    .replace(/\s+/g, "-")
    .replace(/\(/g, "")
    .replace(/\)/g, "")
    .toLowerCase();

  const numberOfTableRows = tableBody.querySelectorAll("tr").length;
  const weekNumber = parseInt(numberOfTableRows + 1);
  const row = document.createElement("tr");
  row.classList.add("training-plan__row");
  row.innerHTML = `
      <td headers="traning-plan-week" class="training-plan__cell training-plan__cell--week-number">${weekNumber}</td>
      <td headers="traning-plan-day-1" class="training-plan__cell training-plan__cell--day-1">
        <a href="#run-type-rest-crosstrain">Rest or <br>Crosstrain</a></td>
      <td headers="traning-plan-day-2" class="training-plan__cell training-plan__cell--day-2">
      <a href="#run-type-${mediumRunSessionLink}">${mediumRunSession}</a> - ${week.mediumRunDistance}k</td>
      <td headers="traning-plan-day-3" class="training-plan__cell training-plan__cell--day-3"><a href="#run-type-easy">Easy</a> - ${week.easyRunDistance}k</td>
      <td headers="traning-plan-day-4" class="training-plan__cell training-plan__cell--day-4">
      <a href="#run-type-${speedRunSessionLink}">${speedRunSession}</a> - ${week.speedRunDistance}k</td>
      <td headers="traning-plan-day-5" class="training-plan__cell training-plan__cell--day-5">
        <a href="#run-type-rest-crosstrain">Rest or <br>Crosstrain</a></td>
      <td headers="traning-plan-day-6" class="training-plan__cell training-plan__cell--day-6"><a href="#run-type-easy">Easy</a> - ${week.easyRunDistance}k</td>
      <td headers="traning-plan-day-7" class="training-plan__cell training-plan__cell--day-7">
      <a href="#run-type-${longRunSessionLink}">${longRunSession}</a> - ${week.longRunDistance}k</td>
    `;
  tableBody.appendChild(row);
}

// This function is used for when you click on a link in the training plan.
// It opens the dialog and loads the content from the corresponding link.
function runningPlanDialog() {
  const runTypeLinks = document.querySelectorAll(".training-plan__cell a");
  const runTypeLinksArray = Array.from(runTypeLinks);
  runTypeLinksArray.forEach((link) => {
    const linkHref = link.getAttribute("href");
    const correspondingDialog = document.querySelector(linkHref);
    link.addEventListener("click", (e) => {
      e.preventDefault();
      dialogContent.innerHTML = correspondingDialog.innerHTML;
      dialog.showModal();
    });
  });
}

// General function to handle closing the dialog.
function closeDialog() {
  const dialog = document.querySelector("dialog");
  const closeButton = document.querySelector(".dialog__close");
  closeButton.addEventListener("click", () => {
    dialog.close();
  });
  dialog.addEventListener("click", (e) => {
    if (e.target === dialog) {
      dialog.close();
    }
  });
}

function handleCreatePlan() {
  clearPlan();
  handleDistanceChange();
  runningPlanDialog();
  closeDialog();
  distanceValue = distanceSelect.value;

  for (let i = 1; i <= numberOfWeeksToTrain; i++) {
    const mediumRunSession = getRandomSession(mediumRunSessions);
    const mediumRunSessionLink = mediumRunSession
      .replace(/\s+/g, "-")
      .toLowerCase();
    const speedRunSession = getRandomSession(speedRunSessions);
    const speedRunSessionLink = speedRunSession
      .replace(/\s+/g, "-")
      .toLowerCase();
    const longRunSession = getRandomSession(longRunSessions);
    const longRunSessionLink = longRunSession
      .replace(/\s+/g, "-")
      .replace(/\(/g, "")
      .replace(/\)/g, "")
      .toLowerCase();

    const row = document.createElement("tr");
    row.classList.add("training-plan__row");

    row.innerHTML = `
      <td headers="training-plan-week" class="training-plan__cell training-plan__cell--week-number">${i}</td>

      <td headers="training-plan-day-1" class="training-plan__cell training-plan__cell--day-1">
        <a href="#run-type-rest-crosstrain">Rest or <br>Crosstrain</a></td>

      <td headers="training-plan-day-2" class="training-plan__cell training-plan__cell--day-2">
        <a href="#run-type-${mediumRunSessionLink}">${mediumRunSession}</a> - ${getIncreasingNumberBetween(
      minimumMediumRunDistance,
      maximumMediumRunDistance,
      i,
      numberOfWeeksToTrain
    )}k
      </td>

      <td headers="training-plan-day-3" class="training-plan__cell training-plan__cell--day-3">
        <a href="#run-type-easy">Easy</a> - ${getIncreasingNumberBetween(
          minimumEasyRunDistance,
          maximumEasyRunDistance,
          i,
          numberOfWeeksToTrain
        )}k
      </td>

      <td headers="training-plan-day-4" class="training-plan__cell training-plan__cell--day-4">
        <a href="#run-type-${speedRunSessionLink}">${speedRunSession}</a> - ${getIncreasingNumberBetween(
      minimumSpeedRunDistance,
      maximumSpeedRunDistance,
      i,
      numberOfWeeksToTrain
    )}k
      </td>

      <td headers="training-plan-day-5" class="training-plan__cell training-plan__cell--day-5">
        <a href="#run-type-rest-crosstrain">Rest or <br>Crosstrain</a></td>

      <td headers="training-plan-day-6" class="training-plan__cell training-plan__cell--day-6">
        <a href="#run-type-easy">Easy</a> - ${getIncreasingNumberBetween(
          minimumEasyRunDistance,
          maximumEasyRunDistance,
          i,
          numberOfWeeksToTrain
        )}k
      </td>

      <td headers="training-plan-day-7" class="training-plan__cell training-plan__cell--day-7">
        <a href="#run-type-${longRunSessionLink}">${longRunSession}</a> - ${getIncreasingNumberBetween(
      minimumLongRunDistance,
      maximumLongRunDistance,
      i,
      numberOfWeeksToTrain
    )}k
      </td>
    `;

    handleNumberOfWeeksToTrain();

    tableBody.appendChild(row);
  }

  if (distanceValue === "half-marathon") {
    // Create 2 more rows for the 2 half-marathon taper weeks
    const taperWeeks = [
      {
        week: 1,
        longRunDistance: 15,
        mediumRunDistance: 7,
        speedRunDistance: 7,
        easyRunDistance: 10,
      },
      {
        week: 2,
        longRunDistance: 12,
        mediumRunDistance: 6,
        speedRunDistance: 5,
        easyRunDistance: 10,
      },
    ];

    taperWeeks.forEach((week) => {
      handleTaperWeeks(week);
    });
  }

  if (distanceValue === "marathon") {
    // Create 3 more rows for the 3 marathon taper weeks
    const taperWeeks = [
      {
        week: 1,
        longRunDistance: 26,
        mediumRunDistance: 10,
        speedRunDistance: 8,
        easyRunDistance: 12,
      },
      {
        week: 2,
        longRunDistance: 20,
        mediumRunDistance: 8,
        speedRunDistance: 6,
        easyRunDistance: 10,
      },
      {
        week: 3,
        longRunDistance: 16,
        mediumRunDistance: 7,
        speedRunDistance: 4,
        easyRunDistance: 10,
      },
    ];

    taperWeeks.forEach((week) => {
      handleTaperWeeks(week);
    });
  }

  // Add one final row to the table
  // This is the race week workouts, and is the same for all distances.
  const lastRow = document.createElement("tr");
  lastRow.classList.add("training-plan__row");
  const numberOfTableRows = tableBody.querySelectorAll("tr").length;
  lastRow.innerHTML = `
      <td headers="training-plan-week" class="training-plan__cell training-plan__cell--week-number">${
        numberOfTableRows + 1
      }</td>
      <td headers="training-plan-day-1" class="training-plan__cell training-plan__cell--day-1">
        <a href="#run-type-rest-crosstrain">Rest or <br>Crosstrain</a></td>
      <td headers="training-plan-day-2" class="training-plan__cell training-plan__cell--day-2"><a href="#run-type-easy">Easy</a> - 5k</td>
      <td headers="training-plan-day-3" class="training-plan__cell training-plan__cell--day-3">
        <a href="#run-type-rest-crosstrain">Rest or <br>Crosstrain</a></td>
      <td headers="training-plan-day-4" class="training-plan__cell training-plan__cell--day-4">Rest</td>
      <td headers="training-plan-day-5" class="training-plan__cell training-plan__cell--day-5"><a href="#run-type-easy">Easy</a> - 3k</td>
      <td headers="training-plan-day-6" class="training-plan__cell training-plan__cell--day-6">Rest</td>
      <td headers="training-plan-day-7" class="training-plan__cell training-plan__cell--day-7">Race Day!</td>
    `;
  tableBody.appendChild(lastRow);

  // Remove every row except the last 4 rows.
  const rows = document.querySelectorAll(".training-plan__row");
  const rowsArray = Array.from(rows);
  const rowsArrayReversed = rowsArray.reverse();
  rowsArrayReversed.forEach((row, index) => {
    if (index > rowsArrayReversed.length - 5) {
      return;
    }
    setTimeout(() => {
      row.classList.add("training-plan__row--remove");
      setTimeout(() => {
        row.remove();
      }, 300);
    }, 1000 * index);
  });

  // Add a CTA to the table to ask people to purchase.
  const toSeeFullPlan = document.createElement("div");
  toSeeFullPlan.classList.add("full-plan");
  const fullPlan = document.querySelector(".full-plan");
  toSeeFullPlan.innerHTML = `
          <p>You must purchase the training plan to see the full plan and your saved plans.</p>
          <p class="full-plan__actions">
            <a class="action-item" href="https://buy.stripe.com/14k28p8vN17x2YM146">Buy Now (€29)</a>
          </p>
        `;
  if (!fullPlan) {
    table.insertAdjacentElement("afterend", toSeeFullPlan);
  }
}

handleDistanceChange();
handleCreatePlan();
runningPlanDialog();
closeDialog();

createPlanButton.addEventListener("click", handleCreatePlan);
