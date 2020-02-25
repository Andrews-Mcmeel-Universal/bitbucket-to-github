const Bitbucket = require("./bin/Bitbucket");
const Github = require("./bin/Github");
require("dotenv").config();

// load in our environment variables
// node -r dotenv/config index.js

console.log(
  `MIGRATER: Loaded your dotenv vars: ${process.env.BITBUCKET_WORKSPACE_ID} and TEST_MODE=${process.env.TEST_MODE}`
);

(async () => {
  // get all the bitbucket repositories we're going to transfer
  const repositories = await Bitbucket.getRepositories();
  console.log(
    `********** STEP 1: Has successfully finished!\r\nREPOS RETRIEVED FROM BITBUCKET: ${repositories.length}`
  );

  // create a new repository on Github for the repos
  const successfulDiscovers = await Github.checkRepositories(repositories);
  console.log(
    `********** STEP 2: Has successfully finished!\r\nREPOS DISCOVERED ON GITHUB: ${!!successfulDiscovers ? successfulDiscovers.length : '0'}`
  );

  // create a new repository on Github for the repos
  const successfulCreates = await Github.createRepositories(successfulDiscovers[0], successfulDiscovers[1]);
  console.log(
    `********** STEP 3: Has successfully finished!\r\nREPOS CREATED ON GITHUB: ${
      !!successfulCreates ? successfulCreates.length : "0"
    }`
  );

  // clone into a local folder
  const successfulClones = await Bitbucket.pullRepositories(successfulCreates);
  console.log(
    `********** STEP 4: Has successfully finished!\r\nREPOS CLONED FROM BITBUCKET: ${
      !!successfulClones ? successfulClones.length : "0"
    }`
  );

  // Push to Github
  const successfulPushes = await Github.pushRepositories(successfulClones);
  console.log(
    `********** STEP 5: Has successfully finished!\r\nREPOS PUSHED TO GITHUB: ${
      !!successfulPushes ? successfulPushes.length : "0"
    }`
  );
})();
