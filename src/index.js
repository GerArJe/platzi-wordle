import { filter, fromEvent, map, Subject, takeUntil } from "rxjs";
import WORDS_LIST from "./wordsList.json";

const restartButton = document.getElementById("restart-button");
const letterRows = document.getElementsByClassName("letter-row");
const onKeyDown$ = fromEvent(document, "keydown");
const messageText = document.getElementById("message-text");
let letterIndex = 0;
let letterRowIndex = 0;
let userAnswer = [];
const getRandomWord = () =>
  WORDS_LIST[Math.floor(Math.random() * WORDS_LIST.length)];
let rightWord = getRandomWord();
console.log("🚀 ~ rightWord:", rightWord);
const userWinOrLoose$ = new Subject();

const insertLetter$ = onKeyDown$.pipe(
  map((event) => event.key.toUpperCase()),
  filter(
    (pressedKey) =>
      pressedKey.length === 1 && pressedKey.match(/[a-z]/i) && letterIndex < 5
  )
);
const insertLetter = {
  next: (letter) => {
    let letterBox =
      Array.from(letterRows)[letterRowIndex].children[letterIndex];
    letterBox.textContent = letter;
    letterBox.classList.add("filled-letter");
    letterIndex++;
    userAnswer.push(letter);
  },
};

const removeLetter$ = onKeyDown$.pipe(
  map((event) => event.key),
  filter((key) => key === "Backspace" && letterIndex !== 0)
);
const deleteLetter = {
  next: () => {
    let letterBox = letterRows[letterRowIndex].children[userAnswer.length - 1];
    letterBox.textContent = "";
    letterBox.classList = "letter";
    letterIndex--;
    userAnswer.pop();
  },
};

const checkWord$ = onKeyDown$.pipe(
  map((event) => event.key),
  filter((key) => key === "Enter" && letterIndex === 5 && letterRowIndex <= 5)
);
const checkWord = {
  next: () => {
    if (userAnswer.length !== 5) {
      messageText.textContent = "¡Te faltan algunas letras!";
      return;
    }

    userAnswer.map((_, i) => {
      let letterColor = "";
      let letterBox = letterRows[letterRowIndex].children[i];

      let letterPosition = rightWord.indexOf(userAnswer[i]);

      if (rightWord[i] === userAnswer[i]) {
        letterColor = "letter-green";
      } else {
        if (letterPosition === -1) {
          letterColor = "letter-grey";
        } else {
          letterColor = "letter-yellow";
        }
      }
      letterBox.classList.add(letterColor);
    });

    if (userAnswer.join("") === rightWord) {
      messageText.textContent = `😊 ¡Sí! La palabra ${rightWord.toUpperCase()} es la correcta`;
      userWinOrLoose$.next();
      restartButton.disabled = false;
    } else {
      letterIndex = 0;
      letterRowIndex++;
      userAnswer = [];

      if (letterRowIndex === 6) {
        messageText.textContent = `😔 Perdiste. La palabra correcta era: "${rightWord.toUpperCase()}"`;
        userWinOrLoose$.next();
        restartButton.disabled = false;
      }
    }
  },
};

userWinOrLoose$.subscribe({
  next: () => {
    let letterRowsWinned = Array.from(letterRows)[letterRowIndex];
    for (let index = 0; index < 5; index++) {
      letterRowsWinned.children[index].classList.add("letter-green");
    }
  },
});
insertLetter$.pipe(takeUntil(userWinOrLoose$)).subscribe(insertLetter);
checkWord$.pipe(takeUntil(userWinOrLoose$)).subscribe(checkWord);
removeLetter$.pipe(takeUntil(userWinOrLoose$)).subscribe(deleteLetter);
