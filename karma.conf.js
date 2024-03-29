// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html

module.exports = function (config) {
  config.set({
    basePath: "",
    frameworks: ["jasmine", "@angular-devkit/build-angular"],
    plugins: [
      require("karma-jasmine"),
      require("karma-chrome-launcher"),
      require("karma-jasmine-html-reporter"),
      require("karma-coverage"),
      require("@angular-devkit/build-angular/plugins/karma"),
    ],
    client: {
      clearContext: false, // leave Jasmine Spec Runner output visible in browser
    },
    coverageReporter: {
      dir: require("path").join(__dirname, "./coverage/angular-rpg"),
      reporters: [
        { type: "html", subdir: "report-html" },
        { type: "lcov", subdir: "report-lcov" },
        { type: "text-summary" },
      ],
      fixWebpackSourcePaths: true,
    },
    reporters: ["progress", "kjhtml", "coverage"],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ["Chrome"],
    singleRun: false,
    customLaunchers: {
      ChromeCustom: {
        base: "Chrome",
        flags: [
          // Don't require interaction to play sounds
          "--autoplay-policy=no-user-gesture-required",
          // Don't hang rAF/timers when in background
          "--disable-background-timer-throttling",
          "--disable-backgrounding-occluded-windows",
          // Don't play audio effects
          "--mute-audio",
        ],
      },
      ChromeDebug: {
        base: "Chrome",
        flags: [
          "--remote-debugging-port=9333",
          "--autoplay-policy=no-user-gesture-required",
        ],
      },
      ChromeHeadlessCustom: {
        base: "ChromeHeadless",
        flags: [
          "--no-sandbox",
          "--disable-gpu",
          "--autoplay-policy=no-user-gesture-required",
        ],
      },
    },
    restartOnFileChange: true,
  });
};
