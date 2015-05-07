moment = require 'moment-timezone'

isNumber = (n) -> n >= '0' and n <= '9'
isAlpha = (n) -> n >= 'a' and n <= 'z'
isOperation = (n) -> n is '/' or n is '+' or n is '-'
isTimezone = (n) -> isAlpha(n) or n >= 'A' and n <= 'Z' or n is '_' or n is '/'

module.exports = (s, vars) ->
  iso8601 = moment s, moment.ISO_8601
  return iso8601 if iso8601.isValid()

  # defaults
  timezone = 'UTC'
  anchor = moment()

  i = 0

  readalpha = ->
    n = 0
    n++ while i + n < s.length and isAlpha s[i+n]
    res = s.substr i, n
    i += n
    res

  readnumber = ->
    n = 0
    n++ while i + n < s.length and isNumber s[i+n]
    res = s.substr i, n
    i += n
    res

  readtimezone = ->
    n = 0
    n++ while i + n < s.length and isTimezone s[i+n]
    res = s.substr i, n
    i += n
    res

  # could start with a timezone
  if i < s.length and s[i] is '('
    i++
    timezone = readtimezone()
    #console.log "Using timezone #{timezone}"
    i++ if s[i] is ')'

  # could start with 'now' or another variable
  if i < s.length and isAlpha s[i]
    variable = readalpha()
    if variable isnt 'now' # now is the default
      if !vars? or !vars[variable]?
        throw new Error "Variable #{variable} not known"
      f = vars[variable]
      f = f timezone if typeof f is 'function'
      anchor = f

  anchor = anchor.tz timezone
  #console.log "Starting with #{anchor.toString()}"

  while i < s.length and isOperation s[i]
    op = null
    if s[i] is '/'
      i++
      shorthand = readalpha()
      #console.log "Start of #{shorthand}"
      anchor = anchor.startOf shorthand
    else if s[i] is '+'
      i++
      while i < s.length
        value = readnumber()
        value = 1 if value is ''
        shorthand = readalpha()
        #console.log "Adding #{value} #{shorthand}"
        anchor = anchor.add moment.duration +value, shorthand
    else if s[i] is '-'
      i++
      while i < s.length
        value = readnumber()
        value = 1 if value is ''
        shorthand = readalpha()
        #console.log "Subtracting #{value} #{shorthand}"
        anchor = anchor.subtract moment.duration +value, shorthand
    else if s[i] is '('
      i++
      timezone = readtimezone()
      #console.log "Using timezone #{timezone}"
      anchor = anchor.tz timezone
      i++ if s[i] is ')'

  if i < s.length
    throw new Error 'unknown format'

  anchor