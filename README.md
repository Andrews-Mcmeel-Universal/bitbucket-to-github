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
3. `yarn install`
4. Create bitbucket app password: https://confluence.atlassian.com/bitbucket/app-passwords-828781300.html _TIP: Bitbucket 2.0 api does not work well with two factor authentication so turn this off temporarily and use the app password with full rights. ('write' on all functions)_
5. Create github access token for your account: `https://help.github.com/articles/creating-a-personal-access-token-for-the-command-line/`
6. Save the .env.sample as a new file named: .env (\$ cp .env.sample .env) and then follow the instructions next to each variable.

### General Process Explained

The steps below is how each sequential repository gets processed individually.

#### Duplicating a Bitbucket repository to Github a Single Time

1. `git clone --mirror https://bitbucket.com/amu_technology/old-repository.git`
2. `cd old-repository.git`
3. `git push --mirror https://github.com/exampleuser/new-repository.git`
4. `cd ..`
5. `rm -rf old-repository.git`

#### Mirroring a Bitbucket repository to Github

1. `git clone --mirror https://bitbucket.com/amu_technology/repository-to-mirror.git`
2. `cd repository-to-mirror.git`
3. `git remote set-url --push origin https://github.com/abarrows/mirrored`
4. `git fetch -p origin`
5. `git push --mirror`

##### Run the script

```javascript
`node index.js`;
```

## TODOS

1. Wrap all console logs into a verbose flag.
2. Fix testing logic being TEST_MODE and REPO_LIMIT flag
3. Add optional flag for "mirroring/syncing" a repo to both bitbucket and github.
4. Improve the failsafes for operations that have already occurred.
5. Potentially use GM's node service worker prototype to visually represent this utility.
6. Add back in the dotenv.config() so variables are not required during the command line script.
