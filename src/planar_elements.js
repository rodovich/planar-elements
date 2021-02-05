// `elementArray` is an array of objects containing `point` objects with `x` and `y` values.
// Callers may optionally include other properties in the element objects as well.
// `PlanarElements`'s accessors return the entire objects, but `PlanarElement` does not look at anything but the `point`s.
const PlanarElements = (elementArray) => {
  const bandCount = Math.floor(Math.pow(elementArray.length, 1/4));
  const blocks = {};

  const boundingBox = (() => {
    let xmin = Infinity, xmax = -Infinity, ymin = Infinity, ymax = -Infinity;
    elementArray.forEach(({ point: { x, y } }) => {
      xmin = Math.min(xmin, x);
      xmax = Math.max(xmax, x);
      ymin = Math.min(ymin, y);
      ymax = Math.max(ymax, y);
    });
    return { xmin, xmax, ymin, ymax };
  })();

  const getBlockIndex = ({ x, y }) => {
    return {
      x: Math.round(bandCount * (x - boundingBox.xmin) / (boundingBox.xmax - boundingBox.xmin)),
      y: Math.round(bandCount * (y - boundingBox.ymin) / (boundingBox.ymax - boundingBox.ymin)),
    };
  };

  const getKey = ({ x, y }) => `${x}:${y}`;

  elementArray.forEach((element) => {
    const key = getKey(getBlockIndex(element.point));
    blocks[key] = blocks[key] || [];
    blocks[key].push(element);
  });

  // interface

  const count = () => {
    let total = 0;
    for (const key in blocks) {
      total += blocks[key].length;
    }
    return total;
  }

  const findClosestElement = (point) => {
    let closestDistance = Infinity;
    let closestElement = undefined;
    for (const key in blocks) {
      blocks[key].forEach((element) => {
        const distance = Math.hypot(point.y - element.point.y, point.x - element.point.x);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestElement = element;
        }
      });
    }
    return closestElement;
  };

  const remove = (element) => {
    const key = getKey(getBlockIndex(element.point));
    const block = blocks[key];
    const index = block.indexOf(element);
    block.splice(index, 1);
  };

  return {
    count,
    findClosestElement,
    remove,
  };
};

module.exports = PlanarElements;
