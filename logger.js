const chalk = require("chalk");
class Logger {
  constructor(fnc) {
    return (req, res, next) => {
      let ip = this.getIp(req);
      let timestamp = this.getTimestamp(new Date());
      let output = `${chalk.white.bold(timestamp + ">")} ${chalk.inverse(
        req.method
      )} ${chalk.cyan(req.originalUrl)} from ${chalk.bold(ip)}`;
      fnc.log(output);
      next();
    };
  }
  getIp(req) {
    let xff = req.get("x-forwarded-for");
    if (xff) {
      let ips = xff.split(",").map(function onIp(ip) {
        return ip.trim();
      });
      let ip = ips[ips.length - 1];
      if (ip) {
        return ip;
      }
    }
    return req.ip;
  }
  getTimestamp(d) {
    return `${d.getDate()}.${d.getMonth()}.${d.getFullYear()}/${d.getHours()}:${
      d.getMinutes() < 10 ? "0" + d.getMinutes() : d.getMinutes()
    }`;
  }
}

module.exports = fnc => new Logger(fnc);
