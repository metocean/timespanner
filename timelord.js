// Generated by CoffeeScript 1.9.1
var isAlpha, isNumber, isOperation, isTimezone, moment;

moment = require('moment-timezone');

isNumber = function(n) {
  return n >= '0' && n <= '9';
};

isAlpha = function(n) {
  return n >= 'a' && n <= 'z';
};

isOperation = function(n) {
  return n === '/' || n === '+' || n === '-';
};

isTimezone = function(n) {
  return isAlpha(n) || n >= 'A' && n <= 'Z' || n === '_' || n === '/';
};

module.exports = function(s, vars) {
  var anchor, f, i, iso8601, op, readalpha, readnumber, readtimezone, shorthand, timezone, value, variable;
  iso8601 = moment(s, moment.ISO_8601);
  if (iso8601.isValid()) {
    return iso8601;
  }
  timezone = 'UTC';
  anchor = moment();
  i = 0;
  readalpha = function() {
    var n, res;
    n = 0;
    while (i + n < s.length && isAlpha(s[i + n])) {
      n++;
    }
    res = s.substr(i, n);
    i += n;
    return res;
  };
  readnumber = function() {
    var n, res;
    n = 0;
    while (i + n < s.length && isNumber(s[i + n])) {
      n++;
    }
    res = s.substr(i, n);
    i += n;
    return res;
  };
  readtimezone = function() {
    var n, res;
    n = 0;
    while (i + n < s.length && isTimezone(s[i + n])) {
      n++;
    }
    res = s.substr(i, n);
    i += n;
    return res;
  };
  if (i < s.length && s[i] === '(') {
    i++;
    timezone = readtimezone();
    if (s[i] === ')') {
      i++;
    }
  }
  if (i < s.length && isAlpha(s[i])) {
    variable = readalpha();
    if (variable !== 'now') {
      if ((vars == null) || (vars[variable] == null)) {
        throw new Error("Variable " + variable + " not known");
      }
      f = vars[variable];
      if (typeof f === 'function') {
        f = f(timezone);
      }
      anchor = f;
    }
  }
  anchor = anchor.tz(timezone);
  while (i < s.length && isOperation(s[i])) {
    op = null;
    if (s[i] === '/') {
      i++;
      shorthand = readalpha();
      anchor = anchor.startOf(shorthand);
    } else if (s[i] === '+') {
      i++;
      while (i < s.length) {
        value = readnumber();
        if (value === '') {
          value = 1;
        }
        shorthand = readalpha();
        anchor = anchor.add(moment.duration(+value, shorthand));
      }
    } else if (s[i] === '-') {
      i++;
      while (i < s.length) {
        value = readnumber();
        if (value === '') {
          value = 1;
        }
        shorthand = readalpha();
        anchor = anchor.subtract(moment.duration(+value, shorthand));
      }
    } else if (s[i] === '(') {
      i++;
      timezone = readtimezone();
      anchor = anchor.tz(timezone);
      if (s[i] === ')') {
        i++;
      }
    }
  }
  if (i < s.length) {
    throw new Error('unknown format');
  }
  return anchor;
};
