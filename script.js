let map; // Google Map Object
let locationsArr = []; // Array for Location objects
let selLocsForRound = []; // Locations to be asked for current round
const questionsPerRound = 5; // Limit for questions to generate per round
let isTakingClicks = false; // Prevent registering multiple clicks in one question
let score = 0;
let currIndex = 0; // Currently selected index for question
let rectangleAnswer = null; // Rectangle to show answer

// HTML Elements
let tryBtn;
let triviaContainer;

// Google Maps API Objects
let GoogleMaps_Map;
let GoogleMaps_LatLng;
let GoogleMaps_LatLngBounds;
let GoogleMaps_Rectangle;

// CSUN Locations object constructor
function Location(name, north, east, south, west) {
  this.name = name;
  // Sets top-right and bot-left of rectangle
  this.bounds = {
    north: north,
    south: south,
    east: east,
    west: west,
  };
}

// Initialize Locations Array
function initLocs() {
  // Create Baseball Field bounds
  locationsArr.push(
    new Location(
      "Baseball Field",
      34.245254,
      -118.525891,
      34.244378,
      -118.526836
    )
  );

  // Create Jacaranda Bounds
  locationsArr.push(
    new Location(
      "Jacaranda Hall",
      34.242063,
      -118.52785,
      34.241063,
      -118.529447
    )
  );

  // Create Oviatt Bounds
  locationsArr.push(
    new Location(
      "Oviatt Library",
      34.24039,
      -118.528627,
      34.239461,
      -118.530037
    )
  );

  // Create Sequoia Hall Bounds
  locationsArr.push(
    new Location("Sequoia Hall", 34.240773, -118.527633, 34.240102, -118.528441)
  );

  // Create Bayramian Hall Bounds
  locationsArr.push(
    new Location(
      "Bayramian Hall",
      34.240675,
      -118.530139,
      34.239908,
      -118.531412
    )
  );

  // Create SRC Bounds
  locationsArr.push(
    new Location(
      "Student Recreation Center",
      34.240597,
      -118.524709,
      34.239335,
      -118.525199,
    )
  );

  // Create Eucalyptus Hall
  locationsArr.push(
    new Location(
      "Eucalyptus Hall",
      34.23875989834445,
      -118.52880318043472,
      34.2385526335265,
      -118.52763228868402
    )
  );

  // Create Live Oak Hall
  locationsArr.push(
    new Location(
      "Live Oak Hall",
      34.238370424083506,
      -118.52763030584282,
      34.2381708662376,
      -118.5288108035998,
    )
  );

  // Create Sierra Quad
  locationsArr.push(
    new Location(
      "Sierra Quad",
      34.2391163313056,
      -118.52894548833264,
      34.23791339777363,
      -118.52966566146516,
    )
  );

  // Create Campus Store Complex
  locationsArr.push(
    new Location(
      "Campus Store Complex",
      34.23776600644081,
      -118.52762012292402,
      34.23700764924485,
      -118.52875335624783,
    )
  );

  // Create Chaparral Hall
  locationsArr.push(
    new Location(
      "Chaparral Hall",
      34.23857186500327,
      -118.52669628674079,
      34.237900608779945,
      -118.52727368450748,
    )
  );
}

// Initialize Google Map
async function initMap() {
  // Import Google Maps API
  await google.maps.importLibrary("maps");
  const { ColorScheme } = await google.maps.importLibrary("core");
  GoogleMaps_Map = google.maps.Map;
  GoogleMaps_LatLng = google.maps.LatLng;
  GoogleMaps_LatLngBounds = google.maps.LatLngBounds;
  GoogleMaps_Rectangle = google.maps.Rectangle;

  // CSUN coordinates
  const position = new GoogleMaps_LatLng(
    34.239184253041635,
    -118.52755997696627
  );
  map = new GoogleMaps_Map(document.getElementById("map"), {
    zoom: 16.8,
    center: position,
    mapId: "6ec192d7384ae6107a572109",
    colorScheme: ColorScheme.LIGHT,

    // Disable controls (zoom, panning)
    gestureHandling: "none",
    // Disables UI buttons
    disableDefaultUI: true,
    // Disable keyboard shortcuts
    keyboardShortcuts: false,
    // Disable being able to click on location for info
    clickableIcons: false,
  });

  map.addListener("click", handleMapClick);

  startRound();
}
// Select random locations for current round
function randomizeLocs() {
  // Make shallow copy and randomize sort questions
  const randomArr = [...locationsArr].sort(() => 0.5 - Math.random());
  // Select index 0 to number of questions per round (default: 3 questions)
  selLocsForRound = randomArr.slice(0, questionsPerRound);
}

function startRound() {
  score = 0;
  currIndex = 0;
  isTakingClicks = true;

  // Generate new questions for new round
  randomizeLocs();

  // Clear rectangle answer on map for new round
  if (rectangleAnswer) {
    rectangleAnswer.setMap(null);
    rectangleAnswer = null;
  }

  // Clear trivia container for new round
  triviaContainer.innerHTML = "";

  // Hide Try Again btn
  tryBtn.style.display = "none";
  askQuestion();
}

function endRound() {
  isTakingClicks = false;
  if (rectangleAnswer) {
    rectangleAnswer.setMap(null);
    rectangleAnswer = null;
  }

  if (triviaContainer) {
    triviaContainer.innerHTML += `<p>Your score is ${score}/${questionsPerRound}</p>`;
  }
  tryBtn.style.display = "block";
}

function askQuestion() {
  // Clear previous rectangle answer on map
  if (rectangleAnswer) {
    rectangleAnswer.setMap(null);
    rectangleAnswer = null;
  }

  // Check if question number is below question limit per round
  if (currIndex < questionsPerRound) {
    const currLoc = selLocsForRound[currIndex];
    triviaContainer.innerHTML += `<p class='score-text'>Where is ${currLoc.name}?</p>`;
    isTakingClicks = true;
  } else {
    endRound();
  }
}

function handleMapClick(e) {
  if (!isTakingClicks) {
    return;
  }

  isTakingClicks = false;

  const selCoords = e.latLng;
  const currLoc = selLocsForRound[currIndex];

  const targetBounds = new GoogleMaps_LatLngBounds(
    new GoogleMaps_LatLng(currLoc.bounds.south, currLoc.bounds.west),
    new GoogleMaps_LatLng(currLoc.bounds.north, currLoc.bounds.east)
  );

  const isCorrect = targetBounds.contains(selCoords);
  let checkerColor;
  let checkerMsg;

  if (isCorrect) {
    score++;
    checkerColor = "green";
    checkerMsg = `Yes! It is ${currLoc.name}`;
  } else {
    checkerColor = "red";
    checkerMsg = `Wrong! That is not ${currLoc.name}`;
  }

  if (rectangleAnswer) {
    rectangleAnswer.setMap(null);
  }

  rectangleAnswer = new GoogleMaps_Rectangle({
    bounds: currLoc.bounds,
    fillColor: checkerColor,
    strokeColor: checkerColor,
    fillOpacity: 0.4,
    strokeOpacity: 0.7,
    map: map,
    clickable: false,
  });

  if (triviaContainer) {
    const answerClass = isCorrect ? "answer-correct" : "answer-incorrect";
    triviaContainer.innerHTML += `<p class='${answerClass}'>${checkerMsg}</p>`;
  }

  // Add buffer between questions
  setTimeout(() => {
    currIndex++;
    askQuestion();
  }, 2500);
}

document.addEventListener("DOMContentLoaded", () => {
  // Connect to HTML DOM
  tryBtn = document.getElementById("try-again-btn");
  triviaContainer = document.querySelector(".trivia-container");

  tryBtn.addEventListener("click", startRound);

  initLocs();

  (async () => {
    try {
      while (
        typeof google === "undefined" ||
        typeof google.maps === "undefined" ||
        typeof google.maps.importLibrary !== "function"
      ) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      await initMap();
    } catch (error) {
      console.error(`ERROR! : ${error}`);
    }
  })();
});
