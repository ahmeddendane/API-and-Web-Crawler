import { performance } from 'perf_hooks';

export function startTiming() { return performance.now(); }
export function printElapsedTime(startTime, message) {
    const endTime = performance.now();
    const elapsedTimeInSeconds = (endTime - startTime) / 1000;
    const minutes = Math.floor(elapsedTimeInSeconds / 60);
    const seconds = Math.ceil(elapsedTimeInSeconds % 60);

    console.log(`\n${message} completed in:`, elapsedTimeInSeconds.toFixed(2), "seconds");
    console.log(`${message} completed in:`, minutes, "minute(s) and", seconds, "second(s)");
}