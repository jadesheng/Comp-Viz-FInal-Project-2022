let capture;
let poseNet;
let poses = [];
let specialElite;

let subj = [
  "I",
  "she",
  "he",
  "it",
  "what",
  "they",
  "we",
  "God",
  "nobody",
  "someone",
  "you",
  "others",
];
let shuffledSubj = [];

let tense1 = [
  "am to",
  "must",
  "was to",
  "should",
  "can",
  "need to",
  "seem to",
  "do",
  "will",
  "will not",
  "must not",
  "do not",
  "cannot",
  "should not",
  "was not to",
];
let shuffledTense1 = [];

let tense2 = [
  "are to",
  "must",
  "were to",
  "should",
  "can",
  "need to",
  "seem to",
  "do",
  "will",
  "will not",
  "must not",
  "do not",
  "cannot",
  "should not",
  "were not to",
];
let shuffledTense2 = [];

let tense3 = [
  
  "must",
 
  "should",
  "can",
 
  "will",
  "will not",
  "must not",
"ought to",
  "cannot",
  "should not",

];
let shuffledTense3 = [];

let verbs = [
  "sleep",
  "stand",
  "come",
  "be",
  "change",
  "see",
  "believe",
  "think",
  "work",
  "love",
  "rise",
  "learn",
  "live",
  "die",
  "pause",
  "grow",
];
let shuffledVerbs = [];

let prepos = [
  "in",
  "on",
  "under",
  "over",
  "at",
  "to",
  "of",
  "towards",
  "before",
  "after",
  "for",
  "from",
  "by",
  "until",
  "as",
  "into",
  "about",
];
let shuffledPrepos = [];

let obj = [
  "me",
  "her",
  "him",
  "it",
  "what",
  "them",
  "us",
  "God",
  "nobody",
  "someone",
  "you",
  "others",
];
let shuffledObj = [];

let conjunctions = ["and", "because","so", "but", "before", "if","after", "unless"];

let windowScaleRatio;

// if sketch is slow, try 960x540
const w = 1280;
const h = 720;

function preload() {
  specialElite = loadFont("SpecialElite-Regular.ttf");
}

function setup() {
  createCanvas(w, h);
  let constraints = {
    audio: false,
    video: {
      width: { min: 320, ideal: w, max: 1920 },
      height: { min: 240, ideal: h, max: 1080 },
      frameRate: { min: 1.0, max: 60.0 },
    },
  };
  capture = createCapture(constraints);
  const v = document.querySelector("video");
  const c = document.querySelector("canvas");

  $(".container").append(v);
  $(".container").append(c);

  capture.size(w, h);

  windowScaleRatio = innerWidth / w;
  c.style.transform = `scale(${windowScaleRatio})`;

  v.style.transform = `scale(${windowScaleRatio}, ${windowScaleRatio}) translate(100%, 0) scaleX(-1)`;

  centerVertical();

  const options = {
    flipHorizontal: true, // boolean value for if the video
  };

  // Create a new poseNet method with a single detection
  poseNet = ml5.poseNet(capture, options, modelReady);
  // This sets up an event that fills the global variable "poses"
  // with an array every time new poses are detected
  poseNet.on("pose", function (results) {
    poses = results;
  });
  // Hide the video element, and just show the canvas

  for (let i = 0; i < 6; i++) {
    shuffle(subj, true);
    shuffle(tense3, true);
    shuffle(verbs, true);
    shuffle(prepos, true);
    shuffle(obj, true);
    shuffledSubj.push(subj);
    shuffledVerbs.push(verbs);
    shuffledTense3.push(tense3);
    shuffledPrepos.push(prepos);
    shuffledObj.push(obj);
  }
}

function modelReady() {
  console.log("model ready");
}

function draw() {
  clear(); // clear the canvas with each frame
  // We can call both functions to draw all keypoints and the skeletons
  calculateDistances();
}

function calculateDistances() {
  // loop through each pose, calculate their distances, and link them to each other

  if (poses != undefined) {
    
    let actualPoses = [];
    for(let i = 0; i < poses.length; i++) {
      
      if(poses[i].pose.score > 0.7) {
        actualPoses.push(poses[i]);
      }
    }
    

    if (actualPoses.length == 1) {
      let rightWrist = poses[0].pose.keypoints[10]
     // fill(255, 0, 0);
     // textSize(40);
      //text("1 person", rightWrist.position.x, rightWrist.position.y);
    } else {
      for (let i = 0; i < actualPoses.length - 1; i++) {
        const p0LeftWrist = actualPoses[i].pose.keypoints[9];
        const p1LeftWrist = actualPoses[i + 1].pose.keypoints[9];

        let rightWrist;
        let leftWrist;

        // if person0 is to the left of person1
        if (p0LeftWrist.position.x < p1LeftWrist.position.x) {
          // do stuff
          rightWrist = actualPoses[i].pose.keypoints[10];
          leftWrist = actualPoses[i + 1].pose.keypoints[9];
        } else {
          leftWrist = actualPoses[i].pose.keypoints[9];
          rightWrist = actualPoses[i + 1].pose.keypoints[10];
        }

        // determines which conjunction to draw
        let distance = dist(
          rightWrist.position.x,
          rightWrist.position.y,
          leftWrist.position.x,
          leftWrist.position.y
        );

        // determines where it should be drawn
        let wordPositionX = lerp(
          rightWrist.position.x,
          leftWrist.position.x,
          0.5
        );
        let wordPositionY = lerp(
          rightWrist.position.y,
          leftWrist.position.y,
          0.5
        );

        // drawConjunction
        let cIndex = int(map(distance, 0, 3* w / 5, 0, conjunctions.length));
        let colorMap = int(map(distance, 0, 3* w / 5, 0, 255))
        colorMode(HSB, 100);
        fill(colorMap,255,200);
        textSize(50);
        text(conjunctions[cIndex], wordPositionX, wordPositionY);
      }
    }
  }

  drawKeypoints();
  drawSkeleton();
}

// A function to draw ellipses over the detected keypoints
function drawKeypoints() {
  // Loop through all the poses detected
  for (let i = 0; i < poses.length; i++) {
    // For each pose detected, loop through all the keypoints
    let pose = poses[i].pose;
    //console.log(pose);
    if (pose.score > 0.3) {
      noStroke();
      fill(255);
      textFont(specialElite);
      textSize(30);
      textAlign(CENTER);

      let leftWrist = pose.keypoints[9];
      let rightWrist = pose.keypoints[10];
      let leftWx = leftWrist.position.x;
      let leftWy = leftWrist.position.y;
      let rightWx = rightWrist.position.x;
      let rightWy = rightWrist.position.y;
      let shufS = shuffledSubj[i][i];
      let shufO = shuffledObj[i][i];
      let shufT3 = shuffledTense3[i][i];

      text(shufO, rightWx, rightWy);

      text(shufS, leftWx, leftWy);

      // if (shufS == "you"){
      //   shufT3 = shuffledTense2[i][i];
      // }
      //   else if (shufS == "we"){
      //   shufT3 = shuffledTense2[i][i];
      //   }
      //   else if (shufS == "they"){
      //   shufT3 = shuffledTense2[i][i];
      //   }

      let leftShould = pose.keypoints[5];
      let rightShould = pose.keypoints[6];
      let leftSx = leftShould.position.x;
      let leftSy = leftShould.position.y;
      let rightSx = rightShould.position.x;
      let rightSy = rightShould.position.y;
      let chestX = map(50, 1, 100, leftSx, rightSx);
      let chestY = map(50, 1, 100, leftSy, rightSy);

      text(shuffledVerbs[i][i], chestX, chestY);

      let leftElb = pose.keypoints[7];
      let rightElb = pose.keypoints[8];
      let leftEx = leftElb.position.x;
      let leftEy = leftElb.position.y;
      let rightEx = rightElb.position.x;
      let rightEy = rightElb.position.y;

      text(shuffledPrepos[i][i], rightEx, rightEy);

      text(shufT3, leftEx, leftEy);
    }
  }
}

// A function to draw the skeletons
function drawSkeleton() {
  // Loop through all the skeletons detected
  for (let i = 0; i < poses.length; i++) {
    let skeleton = poses[i].skeleton;
    // For every skeleton, loop through all body connections
    for (let j = 0; j < skeleton.length; j++) {
      let partA = skeleton[j][0];
      let partB = skeleton[j][1];
      stroke(255, 0, 0);
      //line(partA.position.x, partA.position.y, partB.position.x, partB.position.y);
    }
  }
}

function windowResized() {
  windowScaleRatio = innerWidth / w;
  canvas.style.transform = `scale(${windowScaleRatio})`;
  let v = document.querySelector("video");
  v.style.transform = `scale(${windowScaleRatio}, ${windowScaleRatio}) translate(100%, 0) scaleX(-1)`;

  centerVertical();
}

function mousePressed() {
  let fs = fullscreen();
  fullscreen(!fs);
}

function centerVertical() {
  const sketchHeight = windowScaleRatio * height;

  if (sketchHeight >= innerHeight) {
    const heightDifference = floor((sketchHeight - innerHeight) / 2);
    $(".container").css("transform", `translateY(-${heightDifference}px)`);
  } else {
    const heightDifference = floor((innerHeight - sketchHeight) / 2);
    $(".container").css("transform", `translateY(${heightDifference}px)`);
  }
}

setTimeout(function(){

window.location.href = "https://jadesheng.github.io/Comp-Viz-FInal-Project-2022/"}, 600000

)