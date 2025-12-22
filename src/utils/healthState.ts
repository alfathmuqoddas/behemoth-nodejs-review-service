let started = false;
let shuttingDown = false;

export const healthState = {
  markStarted() {
    started = true;
  },
  markShuttingDown() {
    shuttingDown = true;
  },
  isStarted() {
    return started;
  },
  isShuttingDown() {
    return shuttingDown;
  },
};
