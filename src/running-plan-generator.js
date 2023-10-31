import Stripe from "stripe";
const stripe = new Stripe(`${import.meta.env.VITE_STRIPE_SECRET_KEY}`);

export function runningPlanGenerator() {
  let loggedIn = false;
  let loggedInUntil;
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


  function handleLogin() {
    const loginButtons = document.querySelectorAll(".login-button");
    const dialog = document.querySelector(".dialog");
    const dialogContent = document.querySelector(".dialog__content");
    const loginForm = document.createElement("form");
    loginForm.classList.add("login-form");
    loginForm.innerHTML = `
    <div class="login-form__notes">
      <h2>Login</h2>
      <p>
        If your email address matches the email address we have for someone who
        has purchased the training plan generator, you will be logged in for 2 weeks
        from the date of your purchase.
      </p>
      <p>During this time, you will be able to copy and print your training plan. Note,
      however, training plans are not saved. Each time you refresh your page or click
      "Create Training Plan" a new plan will be generated.</p>
      <p>If you wish to save your training plan, you can click the "Copy" button and then
      paste it into a document or spreadsheet. This "Copy" button will be visible once
      you have logged in.</p>
    </div>
    <div class="login-form__item login-form__item--email">
    <label for="email">Email</label>
    <input type="email" name="email" id="email" required />
    </div>
    <div class="login-form__item login-form__item--submit">
    <button class="action-item" type="submit">Login</button>
    </div>
  `;

    function showLoginForm() {
      dialogContent.appendChild(loginForm);
      dialog.showModal();
      const loginFormRendered = dialog.querySelector(".login-form");

      // We need this .js-processed class to prevent the event listener
      // from being added multiple times.
      if (!loginFormRendered.classList.contains("js-processed")) {
        loginFormRendered.addEventListener("submit", async (e) => {
          e.preventDefault();
          const formData = new FormData(loginFormRendered);
          const email = formData.get("email");
          // All sessions must have been created in the last 14 days.
          const currentDate = new Date();
          currentDate.setDate(currentDate.getDate() - 14);
          let fourteenDaysAgo = currentDate.getTime() / 1000;
          fourteenDaysAgo = parseInt(fourteenDaysAgo, 10);

          // Find all the sessions for the email address entered in the
          // login form.
          const sessions = await stripe.checkout.sessions.list({
            limit: 100,
            customer_details: {
              email: email,
            },
          });

          // Filter the sessions to only include those that were created
          // in the last 14 days and that have a payment status of "paid".
          const runningPlanGeneratorSessions = sessions.data.filter(
            (session) =>
              session.created > fourteenDaysAgo &&
              session.payment_status === "paid"
          );

          if (runningPlanGeneratorSessions.length > 0) {
            // We only need to work on the first session in the array
            // as that will be the latest session from that email address.
            // We then allow that user to access the app for 14 days from
            // the date that session was created.
            loggedIn = true;
            loggedInUntil = runningPlanGeneratorSessions[0].created + 1209600;
            handleHeaderOptions();

            document.cookie = `RPGLoggedIn=${loggedIn}; expires=${new Date(
              loggedInUntil * 1000
            )}; path=/`;

            document.cookie = `RPGLoggedInUntil=${new Date(
              loggedInUntil * 1000
            )}; expires=${new Date(loggedInUntil * 1000)}; path=/`;

            // Once you login, let's remove the CTA to purchase the full plan.
            const fullPlan = document.querySelector(".full-plan");
            if (fullPlan) {
              fullPlan.remove();
            }
            handleSavedPlans();
          }
          dialog.close();
        });
      }
      loginFormRendered.classList.add("js-processed");
    }

    loginButtons.forEach((button) => {
      button.addEventListener("click", showLoginForm);
    });
  }

  function checkIfTheUserIsLoggedIn() {
    // Check to see if we have a cookie called RPGLoggedIn.
    // Check to see if we have a cookie called RPGLoggedInUntil.
    const cookies = document.cookie.split("; ");
    const loggedInCookie = cookies.find((cookie) =>
      cookie.startsWith("RPGLoggedIn=")
    );
    const loggedInUntilCookie = cookies.find((cookie) =>
      cookie.startsWith("RPGLoggedInUntil=")
    );

    if (loggedInCookie && loggedInUntilCookie) {
      loggedInUntil = loggedInUntilCookie.split("=")[1];
      Boolean(loggedInCookie.split("=")[1]) == true ? (loggedIn = true) : "";
    } else {
      loggedIn = false;
    }
  }

  // This function allows us to have different buttons/links in the header
  // depending on whether the user is logged in or not.
  function handleHeaderOptions() {
    const landmarkActions = document.querySelectorAll(".landmark__actions");
    if (loggedIn === true) {
      const observer = new MutationObserver((mutationsList) => {
        for (const mutation of mutationsList) {
          if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
            const addedNodes = Array.from(mutation.addedNodes);
            const saveButton = addedNodes.find(
              (node) =>
                node.classList && node.classList.contains("action-item--save")
            );
            const copyButton = addedNodes.find(
              (node) =>
                node.classList && node.classList.contains("action-item--copy")
            );
            const printButton = addedNodes.find(
              (node) =>
                node.classList && node.classList.contains("action-item--print")
            );
            if (saveButton) {
              const saveButtons =
                document.querySelectorAll(".action-item--save");
              saveButtons.forEach((saveButton) => {
                saveButton.addEventListener("click", () => {
                  const trainingPlan = document.querySelector(".training-plan");
                  const trainingPlanText = trainingPlan.innerHTML;
                  const distanceSelect = document.querySelector("#distance");
                  const distanceValue = distanceSelect.value;
                  const trainingPlans =
                    JSON.parse(localStorage.getItem("trainingPlans")) || [];
                  const existingIndex = trainingPlans.findIndex(
                    (plan) => plan.distance === distanceValue
                  );
                  if (existingIndex !== -1) {
                    trainingPlans[existingIndex].plan = trainingPlanText;
                  } else {
                    trainingPlans.push({
                      distance: distanceValue,
                      plan: trainingPlanText,
                    });
                  }
                  localStorage.setItem(
                    "trainingPlans",
                    JSON.stringify(trainingPlans)
                  );
                  handleSavedPlans();
                });
              });
            }

            if (copyButton) {
              const copyButtons =
                document.querySelectorAll(".action-item--copy");
              copyButtons.forEach((copyButton) => {
                copyButton.addEventListener("click", () => {
                  const trainingPlan = document.querySelector(".training-plan");
                  let trainingPlanText = trainingPlan.innerHTML;

                  const tempDiv = document.createElement("div");
                  tempDiv.innerHTML = trainingPlanText;
                  const links = tempDiv.querySelectorAll("a");
                  links.forEach((link) => {
                    const textNode = document.createTextNode(link.textContent);
                    link.replaceWith(textNode);
                  });
                  trainingPlanText = tempDiv.innerHTML;
                  navigator.clipboard.writeText(trainingPlanText);
                  dialogContent.innerHTML = `
                  <p>Your training plan has been copied to your clipboard.</p>
                  <p>You can now paste it into a document or spreadsheet such as Microsoft Word or Excel.</p>
                `;
                  dialog.showModal();
                });
              });
            }
            if (printButton) {
              const printButtons = document.querySelectorAll(
                ".action-item--print"
              );
              printButtons.forEach((printButton) => {
                printButton.addEventListener("click", () => {
                  window.print();
                });
              });
            }
          }
        }
      });
      observer.observe(landmarkActions[0], { childList: true });
      landmarkActions.forEach((landmarkAction) => {
        // If we are logged in, show these items.
        landmarkAction.innerHTML = `
          <button class="action-item action-item--pulse action-item--pulse-once action-item--save" type="button">
            <span class="action-item__icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
              <!--! Font Awesome Pro 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. -->
              <path
              d="M384 336H192c-8.8 0-16-7.2-16-16V64c0-8.8 7.2-16 16-16l140.1 0L400 115.9V320c0 8.8-7.2 16-16 16zM192 384H384c35.3 0 64-28.7 64-64V115.9c0-12.7-5.1-24.9-14.1-33.9L366.1 14.1c-9-9-21.2-14.1-33.9-14.1H192c-35.3 0-64 28.7-64 64V320c0 35.3 28.7 64 64 64zM64 128c-35.3 0-64 28.7-64 64V448c0 35.3 28.7 64 64 64H256c35.3 0 64-28.7 64-64V416H272v32c0 8.8-7.2 16-16 16H64c-8.8 0-16-7.2-16-16V192c0-8.8 7.2-16 16-16H96V128H64z" />
              </svg>
            </span>
            <span class="action-item__text">Save</span>
          </button>
          <button class="action-item action-item--pulse action-item--pulse-once action-item--copy" type="button">
            <span class="action-item__icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
              <!--! Font Awesome Pro 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. -->
              <path
              d="M384 336H192c-8.8 0-16-7.2-16-16V64c0-8.8 7.2-16 16-16l140.1 0L400 115.9V320c0 8.8-7.2 16-16 16zM192 384H384c35.3 0 64-28.7 64-64V115.9c0-12.7-5.1-24.9-14.1-33.9L366.1 14.1c-9-9-21.2-14.1-33.9-14.1H192c-35.3 0-64 28.7-64 64V320c0 35.3 28.7 64 64 64zM64 128c-35.3 0-64 28.7-64 64V448c0 35.3 28.7 64 64 64H256c35.3 0 64-28.7 64-64V416H272v32c0 8.8-7.2 16-16 16H64c-8.8 0-16-7.2-16-16V192c0-8.8 7.2-16 16-16H96V128H64z" />
              </svg>
            </span>
            <span class="action-item__text">Copy</span>
          </button>
          <button class="action-item action-item--pulse action-item--pulse-once action-item--print" type="button">
            <span class="action-item__icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
              <!--! Font Awesome Pro 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. -->
              <path
              d="M128 0C92.7 0 64 28.7 64 64v96h64V64H354.7L384 93.3V160h64V93.3c0-17-6.7-33.3-18.7-45.3L400 18.7C388 6.7 371.7 0 354.7 0H128zM384 352v32 64H128V384 368 352H384zm64 32h32c17.7 0 32-14.3 32-32V256c0-35.3-28.7-64-64-64H64c-35.3 0-64 28.7-64 64v96c0 17.7 14.3 32 32 32H64v64c0 35.3 28.7 64 64 64H384c35.3 0 64-28.7 64-64V384zM432 248a24 24 0 1 1 0 48 24 24 0 1 1 0-48z" />
              </svg>
            </span>
            <span class="action-item__text">Print</span>
          </button>
        `;
      });
    } else {
      landmarkActions.forEach((landmarkAction) => {
        // If we are logged out, show these items.
        landmarkAction.innerHTML = `
          <a class="action-item action-item--pulse action-item--pulse-delay action-item--purchase" href="https://buy.stripe.com/14k28p8vN17x2YM146"
            target="_blank">
            <span class="action-item__icon">
              <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 576 512"><!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M0 24C0 10.7 10.7 0 24 0H69.5c22 0 41.5 12.8 50.6 32h411c26.3 0 45.5 25 38.6 50.4l-41 152.3c-8.5 31.4-37 53.3-69.5 53.3H170.7l5.4 28.5c2.2 11.3 12.1 19.5 23.6 19.5H488c13.3 0 24 10.7 24 24s-10.7 24-24 24H199.7c-34.6 0-64.3-24.6-70.7-58.5L77.4 54.5c-.7-3.8-4-6.5-7.9-6.5H24C10.7 48 0 37.3 0 24zM128 464a48 48 0 1 1 96 0 48 48 0 1 1 -96 0zm336-48a48 48 0 1 1 0 96 48 48 0 1 1 0-96z"/></svg>
            </span>
            <span class="action-item__text">Buy Now</span>
          </a>
          <button class="action-item action-item--pulse action-item--login login-button">
            <span class="action-item__icon">
              <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512"><!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M217.9 105.9L340.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L217.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1L32 320c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM352 416l64 0c17.7 0 32-14.3 32-32l0-256c0-17.7-14.3-32-32-32l-64 0c-17.7 0-32-14.3-32-32s14.3-32 32-32l64 0c53 0 96 43 96 96l0 256c0 53-43 96-96 96l-64 0c-17.7 0-32-14.3-32-32s14.3-32 32-32z"/></svg>
            </span>
            <span class="action-item__text">Login</span>
          </button>
        `;
      });
    }
  }

  function handleSavedPlans() {
    const savedPlans = JSON.parse(localStorage.getItem("trainingPlans")) || [];
    if (loggedIn) {
      if (savedPlans.length > 0) {
        savedPlansContainer.innerHTML = `
        <p>Click on any of the plans below to load it into the running plan table.</p>
        <ul class="saved-plans__list">
        ${savedPlans
          .map(
            (plan) => `
              <li class="saved-plans__item">
                <button aria-label="Load the ${
                  plan.distance
                } plan in to the running plan table." class="action-item action-item--ghost saved-plans__action">${
              plan.distance.charAt(0).toUpperCase() + plan.distance.slice(1)
            }</button>
              </li>
            `
          )
          .join("")}
            </ul>
            `;
        const savedPlansActions = document.querySelectorAll(
          ".saved-plans__item button"
        );
        // If you click on any of the saved plans, replace the table with that plan.
        savedPlansActions.forEach((action, index) => {
          action.addEventListener("click", () => {
            const savedPlan = savedPlans[index].plan;
            table.innerHTML = savedPlan;
          });
        });
      } else {
        savedPlansContainer.innerHTML = `
          <p>You have no saved plans.</p>
        `;
      }
    } else {
      savedPlansContainer.innerHTML = `
        <p>You have no saved plans. Have you purchased the full Training Plan Generator?</p>
        <a class="action-item" href="https://buy.stripe.com/14k28p8vN17x2YM146">Buy Now (€29)</a></p>
      `;
    }
  }

  function handleCreatePlan() {
    clearPlan();
    handleDistanceChange();
    checkIfTheUserIsLoggedIn();
    handleHeaderOptions();
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

    // If loggedIn is false,
    //  1 Remove every row except the last 4 rows.
    //  2 Add a CTA to the table to ask people to purchase and/or login.
    if (loggedIn === false) {
      //  1 Remove every row except the last 4 rows.
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
      //  2 Add a CTA to the table to ask people to purchase and/or login.
      const toSeeFullPlan = document.createElement("div");
      toSeeFullPlan.classList.add("full-plan");
      const fullPlan = document.querySelector(".full-plan");
      toSeeFullPlan.innerHTML = `
          <p>You must purchase the training plan and login to see the full plan and your saved plans.</p>
          <p class="full-plan__actions">
            <a class="action-item" href="https://buy.stripe.com/14k28p8vN17x2YM146">Buy Now (€29)</a> <button class="action-item">Login</button>
          </p>
        `;
      if (!fullPlan) {
        table.insertAdjacentElement("afterend", toSeeFullPlan);
      }
    }
  }

  handleDistanceChange();
  handleCreatePlan();
  handleLogin();
  runningPlanDialog();
  closeDialog();
  handleSavedPlans();

  createPlanButton.addEventListener("click", handleCreatePlan);
}
