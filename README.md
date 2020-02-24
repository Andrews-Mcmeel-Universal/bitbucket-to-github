## Bitbucket to Github Migration - forked

This repository transfers ALL of your Bitbucket repositories to Github while maintaining its privacy status.

### Changes made in the fork

- Improved logging for clearer visibility into what's happening during the process.
  - Including the start and stopping of the main functions within index.js.
  - Outputting the non-sensitive dotenv vars as they are processed to notify the engineer if variables are not instantiating. (My experience.)
- Optional organization flags (Bitbucket Organization and Github Teams) that can be used instead of a user.
- Yarn usage.
- Testing dotenv flag to only test a single repo.
- More graceful fallbacks if directories have already been made.

### Requirements

1. Node
2. Yarn
3. Save the .env.sample as a new file named: .env and then follow the instructions to fill out all the values, FIRST!

### General Process Explained

TBD

1. `git clone https://github.com/pouriaa/bitbucket-to-github.git`

##### Enter the repo

`cd bitbucket-to-github/`

##### Install dependencies

`npm i`

##### Make an environment variable file

`cp .env.sample .env`

##### Create an access token on Github

Use `https://help.github.com/articles/creating-a-personal-access-token-for-the-command-line/` to create your token.

##### Enter your Github and Bitbucket credentials to `.env`

This repository uses the `dotenv` library to handle configuration variables.

##### Run the script

```javascript
`node -r dotenv/config index.js`;
```

## Resources

1. Github command line instructions: https://help.github.com/en/github/importing-your-projects-to-github/importing-a-git-repository-using-the-command-line

## TODOS

1. Wrap all console logs into a verbose flag.
2. Fix testing logic being TEST_MODE and REPO_LIMIT flag
3. Add optional flag for "mirroring/syncing" a repo to both bitbucket and github.
4. Improve the failsafes for operations that have already occurred.
5. Potentially use GM's node service worker prototype to visually represent this utility.
6. Add back in the dotenv.config() so variables are not required during the command line script.
