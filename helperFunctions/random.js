/*
------------------------
METHOD: create something for camelCase
------------------------
  */
function toTitleCase(str) {
  let words = str.split(' ');

  for(let i = 0; i < words.length; i++) {
      words[i] = words[i].toUpperCase();
  }

  return words.join(' ');
}

export {toTitleCase};

