const blessed = require("blessed");
const contrib = require("blessed-contrib");

class Screen {
  constructor() {
    let screen = blessed.screen();
    let grid = new contrib.grid({ rows: 12, cols: 12, screen: screen });
    const scr = {
      top: { left: grid.set(0, 0, 6, 12, contrib.log, { label: "Log" }) },
      bot: {
        left: grid.set(6, 0, 6, 6, contrib.log, { label: "API" }),
        right: grid.set(6, 6.1, 6, 6, contrib.log, { label: "SSE" })
      }
    };
    screen.key(["escape", "q", "C-c"], function(ch, key) {
      return process.exit(0);
    });
    screen.render();
    return { screen, scr };
  }
}

module.exports = screen = new Screen();
