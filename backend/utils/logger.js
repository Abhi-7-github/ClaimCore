const timestamp = () => new Date().toISOString();

const logInfo = (message, meta) => {
  if (meta) {
    console.log(`[${timestamp()}] INFO: ${message}`, meta);
    return;
  }

  console.log(`[${timestamp()}] INFO: ${message}`);
};

const logWarn = (message, meta) => {
  if (meta) {
    console.warn(`[${timestamp()}] WARN: ${message}`, meta);
    return;
  }

  console.warn(`[${timestamp()}] WARN: ${message}`);
};

const logError = (message, error) => {
  console.error(`[${timestamp()}] ERROR: ${message}`);

  if (error) {
    console.error(error);
  }
};

module.exports = {
  logInfo,
  logWarn,
  logError,
};