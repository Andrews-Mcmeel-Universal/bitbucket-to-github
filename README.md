## Bitbucket to Github Migration - forked

This repository transfers ALL of your Bitbucket repositories to Github while maintaining its privacy status.

### Changes made in the fork

- Make use of exception handling, instead of passing flag to indicate status
- Make use of `Promise.all()` to pull/create/push repos "at the same time"
- Repositories are cloned using SSH instead of HTTPS.

### Getting Started

Make sure you have node and npm before continuing.

##### Add your SSH public key to Bitbucket

Since this version of the script is cloning Bitbucket repos with SSH, make sure your SSH public key is added into Bitbucket settings.

##### Clone the repo

`git clone https://github.com/pouriaa/bitbucket-to-github.git`

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

## AMU Notes

### NOTES

```bash
git clone --mirror https://bitbucket.org/exampleuser/repository-to-mirror.git
# Make a bare mirrored clone of the repository

cd repository-to-mirror.git
git remote set-url --push origin https://github.com/exampleuser/mirrored
# Set the push location to your mirror

git push --mirror
```
