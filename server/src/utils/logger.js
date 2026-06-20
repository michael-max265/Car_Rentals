// server/src/utils/logger.js

/**
 * Simple timestamped logger.
 * Usage: logger.info('message'), logger.warn('msg'), logger.error('msg')
 */
const logger = {
  _format(level, msg) {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${level}] ${msg}`;
  },
  info(msg) {
    console.log(this._format('INFO', msg));
  },
  warn(msg) {
    console.warn(this._format('WARN', msg));
  },
  error(msg) {
    console.error(this._format('ERROR', msg));
  },
};

export default logger;
