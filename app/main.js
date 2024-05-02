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
  term.writeln(
    'Hi cybernaut. this is an info terminal.\r\nuse ' + colorize(TermColors.Green, '"help"') + ' to see the available commands'
  );
  term.writeln("creating new session...");
  await sleep(1300);
  term.write(SHELL_PROMPT);
}

function pushCommandToHistory(store, command) {
  // Avoid duplicates with last command
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
  // Track the user input
  let userInput = "";
  // Track command history
  let commandHistory = loadCommandHistory();
  let currentHistoryPosition = commandHistory.length;
  // Only one process at a time
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

    switch (ev.key) {
      case "ArrowUp":
      case "ArrowDown": {
        if (commandHistory.length === 0) {
          return;
        }

        if (ev.key === "ArrowDown") {
          if (currentHistoryPosition === commandHistory.length) return;

          currentHistoryPosition = Math.min(
            commandHistory.length,
            currentHistoryPosition + 1
          );
        } else {
          currentHistoryPosition = Math.max(0, currentHistoryPosition - 1);
        }

        deleteCurrentInput(term, userInput);
        if (currentHistoryPosition === commandHistory.length) {
          userInput = "";
        } else {
          userInput = commandHistory[currentHistoryPosition];
        }
        term.write(userInput);
        return;
      }

      case "c": {
        if (ev.ctrlKey) {
          prompt(term);
          userInput = "";
          currentHistoryPosition = commandHistory.length;
          return;
        }
        break;
      }

      case "l": {
        if (ev.ctrlKey) {
          term.clear();
          return;
        }
        break;
      }

      case "d": {
        if (ev.ctrlKey) {
          await exit(term);
          return;
        }
        break;
      }

      case "Backspace": {
        userInput = handleBackspace(term, userInput);
        return;
      }

      case "Enter":
      case 13:
        await handleEnter();
        break;
    }

    const hasModifier = ev.altKey || ev.altGraphKey || ev.ctrlKey || ev.metaKey;

    if (!hasModifier && isPrintableKeyCode(ev.keyCode)) {
      term.write(key);
      userInput += key;
    }
  };
}

function attachKeyListeners(term) {
  const handler = createOnKeyHandler(term);

  // Using 'keydown' event directly to capture input
  term.textarea.addEventListener('keydown', (ev) => {
    handler({key: ev.key, domEvent: ev}).then(r => console.log({key: ev.key, domEvent: ev}));
  });

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
    },
  });

  const fitAddon = new window.FitAddon.FitAddon();
  term.loadAddon(fitAddon);
  term.loadAddon(new window.WebLinksAddon.WebLinksAddon());

  term.open(container);

  fitAddon.fit();
  term.focus();

  await initTerminalSession(term);

  // Attach key listeners after the terminal is opened and ready
  attachKeyListeners(term);
}

window.onload = function() {
  fileSystem.load().catch(console.error);
  runTerminal().catch(console.error);
};
