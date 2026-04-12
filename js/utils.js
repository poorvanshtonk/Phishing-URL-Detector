export function debounce(func, delay) {
  let timeoutId;
  return function (...args) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

export function paginate(items, page, itemsPerPage) {
  const startIndex = (page - 1) * itemsPerPage;
  return items.slice(startIndex, startIndex + itemsPerPage);
}
