import {TermColors} from "../constants.js";
import {colorize, sleep} from "../utils.js";

const api = 'https://api.thecatapi.com/v1/images/search?category_ids=1';


const randc = {
  id: "randc",
  description: 'open a random cat photo',
  args: 0,
  async exec(term, _args) {
    term.writeln('getting a cato...');
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 5000);
      const res = await fetch(api, {
        signal: controller.signal,
        headers: {
          apiKey: 'live_DVl3eU0RpH9pzYJ3tPfJmeCBY1hrEmZJEBdrbfmBg36tcNbIALC3zXhFUyfgAiWu',
        },
      });
      clearTimeout(id);
      if (!res.ok) {
        term.writeln(colorize(TermColors.Red, `[error] no catos today :( -- ${res.statusText}`));
      } else {
        const [cat] = await res.json();
        term.writeln(colorize(TermColors.Green, 'opening cato...'));
        await sleep(1000);
        window.open(cat.url);
      }
    } catch (e) {
      term.writeln(colorize(TermColors.Red, `[error] no catos today :( -- ${e.message}`));
    }
  },
};

export default randc;
