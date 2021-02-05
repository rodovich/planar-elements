// `elementArray` is an array of objects containing `point` objects with `x` and `y` values.
// Callers may optionally include other properties in the element objects as well.
// `PlanarElements`'s accessors return the entire objects, but `PlanarElement` does not look at anything but the `point`s.
const PlanarElements = (elementArray) => {
  const bandCount = Math.floor(Math.pow(elementArray.length, 1/4));

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

  const getKey = ({ x, y }) => `${x}:${y}`;

  const getBlockIndex = ({ x, y }) => {
    return {
      x: Math.round(bandCount * (x - boundingBox.xmin) / (boundingBox.xmax - boundingBox.xmin)),
      y: Math.round(bandCount * (y - boundingBox.ymin) / (boundingBox.ymax - boundingBox.ymin)),
    };
  };

  const blocks = (() => {
    const result = {};
    for (let xIndex = 0; xIndex <= bandCount; xIndex++) {
      const xmin = boundingBox.xmin + (boundingBox.xmax - boundingBox.xmin) * (xIndex - 0.5) / bandCount;
      const xmax = boundingBox.xmax + (boundingBox.xmax - boundingBox.xmin) * (xIndex + 0.5) / bandCount;
      for (let yIndex = 0; yIndex <= bandCount; yIndex++) {
        const ymin = boundingBox.ymin + (boundingBox.ymax - boundingBox.ymin) * (yIndex - 0.5) / bandCount;
        const ymax = boundingBox.ymax + (boundingBox.ymax - boundingBox.ymin) * (yIndex + 0.5) / bandCount;
        result[getKey({ x: xIndex, y: yIndex })] = { xmin, xmax, ymin, ymax, elements: [] };
      }
    }
    elementArray.forEach((element) => {
      const key = getKey(getBlockIndex(element.point));
      result[key] = result[key] || [];
      result[key].elements.push(element);
    });
    return result;
  })();

  // interface

  const count = () => {
    let total = 0;
    for (const key in blocks) {
      total += blocks[key].elements.length;
    }
    return total;
  };

  const minDistanceToBlock = (point, block) => {
    if (block.minx <= point.x && point.x <= block.maxx && block.miny <= point.y && point.y <= block.maxy) {
      return 0;
    }
    return Math.min(
      Math.hypot(point.y - block.ymin, point.x - block.xmin),
      Math.hypot(point.y - block.ymin, point.x - block.xmax),
      Math.hypot(point.y - block.ymax, point.x - block.xmin),
      Math.hypot(point.y - block.ymax, point.x - block.xmax),
    );
  };

  const findClosestElement = (point) => {
    let blocksByDistance = Object.values(blocks)
      .sort((block1, block2) => minDistanceToBlock(point, block1) - minDistanceToBlock(point, block2));
    let closestDistance = Infinity;
    let closestElement = undefined;
    for (const block of blocksByDistance) {
      if (closestDistance < minDistanceToBlock(point, block)) {
        break;
      }
      block.elements.forEach((element) => {
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
    const index = block.elements.indexOf(element);
    block.elements.splice(index, 1);
    if (block.elements.length === 0) {
      delete blocks[key];
    }
  };

  return {
    count,
    findClosestElement,
    remove,
  };
};

module.exports = PlanarElements;
