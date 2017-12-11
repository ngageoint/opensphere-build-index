module.exports = {
  "extends": "google",
  "parserOptions": {
    "ecmaVersion": 6,
  },
  "rules": {
    "guard-for-in": "off",
    "no-multi-str": "off",
    "no-var": "off",
    "max-len": [
      1,
      120,
      4,
      {
        "ignoreComments": true,
        "ignoreUrls": true
      }
    ],

    // This is silly. Negated conditions are highly useful and often much more concise than
    // their complements.
    "no-negated-condition": "off"
  }
};
