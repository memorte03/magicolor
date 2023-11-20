let lastEventName: string | null = '';

export function mark(eventName: string) {
  if (window.document) {
    window.performance.mark(eventName);

    if (lastEventName) {
      const measureName = `[${lastEventName}] 👉 [${eventName}]`;
      window.performance.measure(measureName, lastEventName, eventName);
    }
  } else {
    performance.mark(eventName);

    if (lastEventName) {
      const measureName = `[${lastEventName}] 👉 [${eventName}]`;
      performance.measure(measureName, lastEventName, eventName);
    }
  }

  lastEventName = eventName;
}

export function printBenchmark() {
  let measures;

  if (window.document) {
    measures = window.performance.getEntriesByType('measure');

    measures.length > 0 && console.table(measures, ['name', 'duration']);

    window.performance.clearMarks();
    window.performance.clearMeasures();
    lastEventName = null;
  } else {
    measures = performance.getEntriesByType('measure').map((entry) => ({
      name: entry.name,
      duration: Math.round(entry.duration * 100) / 100,
    }));

    measures.length > 0 && console.table(measures, ['name', 'duration']);

    performance.clearMarks();
    performance.clearMeasures();
    lastEventName = null;
  }
}
