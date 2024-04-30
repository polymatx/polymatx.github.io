import { TermColors } from "../constants.js";
import { colorize } from "../utils.js";

const LAST_UPDATE = "2023-08-15";

const whoami = {
  id: "whoami",
  args: 0,
  description: "display effective developer info",
  async exec(term, _args) {
    term.writeln(colorize(TermColors.Green, "name: ") + "Farid");
    term.writeln(
      colorize(TermColors.Green, "current position: ") +
      "Backend Developer / DevOps"
    );
    term.writeln(
      colorize(TermColors.Green, "company: ") +
      "SigmaTelecom < https://www.sigmatelecom.com >"
    );
    term.writeln(colorize(TermColors.Green, "location: ") + "Istanbul, Turkey");
    term.writeln(
      colorize(TermColors.Green, "fav languages: ") +
      "[golang, JS (NodeJs), PHP]"
    );
    term.writeln(
      colorize(TermColors.Green, "hobbies: ") +
      "[photography, music, movie, gym]"
    );
    term.writeln(
      colorize(TermColors.Green, "About: ") +
      "I am passionate about writing codes and developing applications to solve real-life challenges. " +
      "I also work in configuring the infrastructure of applications."
    );
    term.writeln(
      colorize(TermColors.Green, "blog: ") + "https://polymatx.dev/blog"
    );
    term.writeln(colorize(TermColors.Green, "last update: ") + LAST_UPDATE);
  },
};

export default whoami;
