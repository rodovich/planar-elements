const PlanarElements = require('../src/planar_elements.js');

const test = (size) => {
  const elements = new Array(size).fill().map(() => ({ point: { x: Math.round(Math.random()*100), y: Math.round(Math.random()*100) } }));
  const start = process.cpuUsage();
  const collection = PlanarElements(elements);
  let element = elements[0];
  while (collection.count() > 0) {
    collection.remove(element);
    const nextElement = collection.findClosestElement(element.point);
    element = nextElement;
  }
  return process.cpuUsage(start).user / 1e6;
}

[50, 500, 5000, 50000].forEach((size) => {
  console.log(`${size}: ${test(size).toFixed(1)}s`);
});
