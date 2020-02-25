const Bitbucket = require("./bin/Bitbucket");
const Github = require("./bin/Github");
require("dotenv").config();

// load in our environment variables
// node -r dotenv/config index.js

console.log(
  `MIGRATER: Loaded your dotenv vars.\r\nTEST_MODE: ${process.env.TEST_MODE ||
    "--Not Set or Loaded--"}\r\nREPO_LIMIT: ${process.env.TEST_MODE ||
    "--Not Set or Loaded--"}\r\nBITBUCKET_WORKSPACE_ID: ${process.env
    .BITBUCKET_WORKSPACE_ID || "--Not Set or Loaded--"}\r\n${process.env
    .GITHUB_USERNAME || "--Not Set or Loaded--"}`
);

(async () => {
  // get all the bitbucket repositories we're going to transfer
  const repositories = await Bitbucket.getRepositories();
  console.log(
    `********** STEP 1: Has successfully finished!\r\nRepos RETRIEVED from BITBUCKET: ${repositories.length}`
  );

  // create a new repository on Github for the repos
  const successfulDiscovers = await Github.checkRepositories(repositories);
  console.log(
    `********** STEP 2: Has successfully finished!\r\nRepos DISCOVERED on GITHUB: ${!!successfulDiscovers ? successfulDiscovers.length : '0'}`
  );

  // create a new repository on Github for the repos
  const successfulCreates = await Github.createRepositories(successfulDiscovers[0], successfulDiscovers[1]);
  console.log(
    `********** STEP 3: Has successfully finished!\r\nRepos CREATED on GITHUB: ${
      !!successfulCreates ? successfulCreates.length : "0"
    }`
  );

  // clone into a local folder
  const successfulClones = await Bitbucket.pullRepositories(successfulCreates);
  console.log(
    `********** STEP 4: Has successfully finished!\r\nRepos CLONED from BITBUCKET: ${
      !!successfulClones ? successfulClones.length : "0"
    }`
  );

  // Push to Github
  const {
    successfulRepositories = [],
    failedRepositories = []
  } = await Github.pushRepositories(successfulClones);
  console.log(
    `********** STEP 5: Has successfully finished!\r\nRepos PUSHED to GITHUB: ${successfulRepositories.length}/${failedRepositories.length}`
  );
  if (failedRepositories.length) {
    console.log(
      `WARNING: The following repositories have failed:\r\n${failedRepositories
        .map(
          (x) => `https://bitbucket.org/${process.env.BITBUCKET_WORKSPACE_ID}/${x}`
        )
        .join("\r\n")}`
    );
  }
})();
