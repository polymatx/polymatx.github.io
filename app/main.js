import { HistorySize, TermColors, SHELL_PROMPT } from "./constants.js";
import fileSystem from "./file-system.js";
import { colorize, handleBackspace, isPrintableKeyCode, sleep } from "./utils.js";
import { exec } from "./commands/index.js";
import { exec as exit } from "./commands/exit.js";

function printError(term, error) {
  term.write(TermColors.Red + error);
}

function prompt(term) {
  term.write("\r\n" + SHELL_PROMPT);
}

function deleteCurrentInput(term, input) {
  let i = 0;
  while (i < input.length) {
    term.write("\b \b");
    i++;
  }
}

async function initTerminalSession(term) {
  term.writeln('Hi cybernaut. This is an info terminal.\r\nUse ' + colorize(TermColors.Green, '"help"') + ' to see the available commands');
  term.writeln("Creating new session...");
  await sleep(1300);
  prompt(term);
}

function pushCommandToHistory(store, command) {
  if (store.length > 0 && store[store.length - 1] === command) {
    return;
  }
  store.push(command);
  if (store.length > HistorySize) {
    store.shift();
  }
  setTimeout(() => localStorage.setItem("history", JSON.stringify(store)), 0);
}

function loadCommandHistory() {
  const data = localStorage.getItem("history");
  if (!data) {
    return [];
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    console.error("Failed to parse command history", e);
    return [];
  }
}

function createOnKeyHandler(term) {
  let userInput = "";
  let commandHistory = loadCommandHistory();
  let currentHistoryPosition = commandHistory.length;
  let currentProcessId = null;

  function onProcessExit() {
    prompt(term);
    currentProcessId = null;
  }

  async function handleEnter() {
    userInput = userInput.trim();
    if (userInput.length === 0) {
      prompt(term);
      return;
    }

    term.writeln("");
    try {
      currentProcessId = await exec(term, userInput, onProcessExit);
    } catch (e) {
      printError(term, e.message);
    }

    pushCommandToHistory(commandHistory, userInput);
    currentHistoryPosition = commandHistory.length;
    userInput = "";
    if (currentProcessId === null) {
      prompt(term);
    }
  }

  return async ({ key, domEvent: ev }) => {
    console.log(`Key pressed: ${ev.key}, KeyCode: ${ev.keyCode}`);
    if (currentProcessId !== null) {
      console.log('Process is active, ignoring other inputs.');
      return;
    }

    if (ev.key === "Enter" || ev.keyCode === 13) {
      ev.preventDefault();
      await handleEnter();
      return;
    }

    switch (ev.key) {
      case "ArrowUp":
      case "ArrowDown":
        navigateHistory(ev.key);
        break;
      case "c":
        if (ev.ctrlKey) { term.clear(); }
        break;
      case "Backspace":
        userInput = handleBackspace(term, userInput);
        break;
      default:
        if (!ev.ctrlKey && !ev.altKey && !ev.metaKey && isPrintableKeyCode(ev.keyCode)) {
          term.write(key);
          userInput += key;
        }
    }
  };

  function navigateHistory(key) {
    if (commandHistory.length === 0) { return; }
    if (key === "ArrowDown" && currentHistoryPosition < commandHistory.length) {
      currentHistoryPosition++;
    } else if (key === "ArrowUp" && currentHistoryPosition > 0) {
      currentHistoryPosition--;
    }
    userInput = commandHistory[currentHistoryPosition] || "";
    deleteCurrentInput(term, userInput);
    term.write(userInput);
  }
}

function attachKeyListeners(term) {
  const handler = createOnKeyHandler(term);
  term.textarea.addEventListener('keydown', (ev) => handler({ key: ev.key, domEvent: ev }));
  term.onKey(handler);
}

async function runTerminal() {
  const container = document.getElementById("term");
  const term = new Terminal({
    cursorBlink: "block",
    scrollback: 1000,
    tabStopWidth: 4,
    fontFamily: "'Fira Code', monospace",
    fontSize: 20,
    theme: {
      background: "#000",
      cursor: "#c7157a",
      selection: "#c7157a",
      cursorAccent: "#c7157a",
      brightMagenta: "#c7157a",
      green: "#2ab025",
      brightGreen: "#2ab025",
      yellow: "#f2ca29",
      brightYellow: "#f2ca29",
      red: "#cf442b",
      brightRed: "#cf442b",
    }
  });

  const fitAddon = new window.FitAddon.FitAddon();
  term.loadAddon(fitAddon);
  term.loadAddon(new window.WebLinksAddon.WebLinksAddon());
  term.open(container);
  fitAddon.fit();
  term.focus();
  await initTerminalSession(term);
  attachKeyListeners(term);
}

window.onload = function() {
  fileSystem.load().catch(console.error);
  runTerminal().catch(console.error);
};
