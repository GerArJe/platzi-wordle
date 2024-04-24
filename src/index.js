import { fromEvent, Subject } from "rxjs";
import WORDS_LIST from "./wordsList.json";

const letterRows = document.getElementsByClassName("letter-row");
const onKeyDown$ = fromEvent(document, "keydown");
const message = document.getElementById("message-text");
let letterIndex = 0;
let letterRowIndex = 0;
let userAnswer = [];
const getRandomWord = () =>
  WORDS_LIST[Math.floor(Math.random() * WORDS_LIST.length)];
let rightWord = getRandomWord();
console.log("🚀 ~ rightWord:", rightWord);
const userWinOrLose$ = new Subject();

const insertLetter = {
  next: (event) => {
    const pressedKey = event.key.toUpperCase();
    if (pressedKey.length === 1 && pressedKey.match(/[a-z]/i)) {
      let letterBox = letterRows[letterRowIndex].children[letterIndex];
      letterBox.textContent = pressedKey;
      letterBox.classList.add("filled-letter");
      letterIndex++;
      userAnswer.push(pressedKey);
    }
  },
};

const deleteLetter = {
  next: (event) => {
    const pressedKey = event.key;
    if (pressedKey === "Backspace" && letterIndex !== 0) {
      let letterBox =
        letterRows[letterRowIndex].children[userAnswer.length - 1];
      letterBox.textContent = "";
      letterBox.classList = "letter";
      letterIndex--;
      userAnswer.pop();
    }
  },
};

const checkWord = {
  next: (event) => {
    if (event.key === "Enter") {
      const rightWordArray = Array.from(rightWord);
      if (userAnswer.length !== 5) {
        message.textContent = "Te faltan alguna letras";
        return;
      }
      for (let index = 0; index < 5; index++) {
        let letterColor = "";
        let letterBox = letterRows[letterRowIndex].children[index];
        let letterPosition = rightWordArray.indexOf(userAnswer[index]);
        if (letterPosition === -1) {
          letterColor = "letter-grey";
        } else if (rightWordArray[index] === userAnswer[index]) {
          letterColor = "letter-green";
        }
        if (letterColor) {
          letterBox.classList.add(letterColor);
        }
      }
      if (userAnswer.length === 5) {
        letterIndex = 0;
        userAnswer = [];
        letterRowIndex++;
      } 
      if (userAnswer.join("") === rightWord) {
        userWinOrLose$.next();
      }
    }
  },
};

onKeyDown$.subscribe(insertLetter);
onKeyDown$.subscribe(deleteLetter);
onKeyDown$.subscribe(checkWord);
userWinOrLose$.subscribe({
  next: () => {
    let letterRowsWinned = Array.from(letterRows)[letterRowIndex];
    for (let index = 0; index < 5; index++) {
      letterRowsWinned.children[index].classList.add("letter-green");
    }
  },
});
