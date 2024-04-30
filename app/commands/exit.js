
export async function exec(term, _args) {
  term.writeln('terminating session...');
}

const exit = {
  id: "exit",
  args: 0,
  description: 'terminate current session',
  exec
};

export default exit;
