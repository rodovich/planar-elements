// `elementArray` is an array of objects containing `point` objects with `x` and `y` values.
// Callers may optionally include other properties in the element objects as well.
// `PlanarElements`'s accessors return the entire objects, but `PlanarElement` does not look at anything but the `point`s.
const PlanarElements = (elementArray) => {
  const count = () => elementArray.length;

  const findClosestElement = (point) => {
    let closestDistance = Infinity;
    let closestElement = undefined;
    elementArray.forEach((element) => {
      const distance = Math.hypot(point.y - element.point.y, point.x - element.point.x);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestElement = element;
      }
    });
    return closestElement;
  };

  const remove = (element) => {
    const index = elementArray.indexOf(element);
    elementArray.splice(index, 1);
  };

  return {
    count,
    findClosestElement,
    remove,
  };
};

module.exports = PlanarElements;
