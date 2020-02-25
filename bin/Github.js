const request = require("request-promise");
const path = require("path");
const exec = require("util").promisify(require("child_process").exec);

class Github {
  /**
   * Checks repositories on Github an array
   * of Bitbucket repositories
   *
   * @param {Array} repositories
   * @returns {Array} of successful found `repositories`
   * @returns {Array} of undiscovered `repositories`
   */
  static async checkRepositories(repositories) {
    console.log(
      `GITHUB: Checking which of your ${repositories.length} repositories have already been created...`
    );
    const successfulRepositories = [];
    const undiscoveredRepositories = [];
    await Promise.all(
      repositories.map(async repository => {
        try {
          await Github.checkRepository(repository);
          console.log(
            `Yay!  Discovered your bitbucket repository: ${repository.slug} in Github!`
          );
          successfulRepositories.push(repository);
        } catch (error) {
          console.log(`Failed to find repository: ${repository.slug}`);
          undiscoveredRepositories.push(repository);
        }
      })
    );

    return [successfulRepositories, undiscoveredRepositories];
  }

  /**
   * Checks to see if the repository exists first before creating a new one on * Github.
   *
   * @param {Object} repository single Bitbucket repo resource
   * @returns {Bolean} success status
   */
  static async checkRepository(repository) {
    try {
          // First check to see if the repo already exists
          // COMPANY VERSION: url: `https://api.github.com/repos/${process.env.GITHUB_ORGANIZATION}/${repository.slug}?access_token=${process.env.GITHUB_TOKEN}`,
          await request.get({
            url: `https://api.github.com/repos/${process.env.GITHUB_USERNAME}/${repository.slug}?access_token=${process.env.GITHUB_TOKEN}`,
            headers: {
              "User-Agent": "UA is required",
              Authorization: `Bearer ${process.env.GITHUB_TOKEN}`
            },
            json: true
          });
        } catch (e) {
      // something went wrong, log the message
      // but don't kill the script
      const errors = e.error.errors;

      for (let i = 0; i < errors.length; i++) {
        console.log(
          "Could not find the repo so we will create one.",
          repository.slug + ",",
          errors[i].message + "."
        );
      }
      throw e;
    }
  }

  /**
   * Create repositories on Github an array
   * of Bitbucket repositories
   *
   * @param {Array} undiscoveredRepositories
   * @returns {Array} of successfully created `repositories`
   */
  static async createRepositories(successfulRepositories, repositories) {
    console.log(
      `GITHUB: Preparing to create the ${repositories.length} repositories that were not found.`
    );

    await Promise.all(
      repositories.map(async repository => {
        try {
          await Github.createRepository(repository);
          successfulRepositories.push(repository);
        } catch (error) {
          // TODO: If error contains message about not being present.
          // await Github.createRepository(repo);
          console.log(
            `Error creating repository for ${repository.slug}`
          );
        }
      })
    );

    return successfulRepositories;
  }

  /**
   * Creates a new repository on Github.
   *
   * @param {Object} repository single Bitbucket repo resource
   * @returns {Bolean} success status
   */
  static async createRepository(repository) {
    try {
      // First check to see if the repo already exists
      // make the request for a new repo
      await request.post({
        url: "https://api.github.com/user/repos",
        body: {
          name: repository.slug,
          description: repository.description,
          private: repository.is_private,
          has_issues: repository.has_issues,
          has_wiki: repository.has_wiki
        },
        headers: {
          "User-Agent": "UA is required",
          Authorization: `Bearer ${process.env.GITHUB_TOKEN}`
        },
        json: true
      });

      console.log(
        `GITHUB: Was successful in creating the single repo: ${repository.slug}`
      );
    } catch (e) {
      // something went wrong, log the message
      // but don't kill the script
      const errors = e.error.errors;

      for (let i = 0; i < errors.length; i++) {
        console.log(
          "Failed creating repository",
          repository.slug + ",",
          errors[i].message + "."
        );
      }
      throw e;
    }
  }

  /**
   * Push all repositories that have been created or exist on Github.
   *
   * @param {Array} Repositories to be Pushed
   * @returns {Array} Successfully Pushed Repos
   */
  static async pushRepositories(repositories) {
    // keep track of which repos have failed to be pushed to Github
    const successfulRepositories = [];
    const failedRepositories = [];
    console.log(
      `GITHUB: ...Beginning to push the ${repositories.length} bitbucket repositories to your github.`
    );
    await Promise.all(
      repositories.map(async repository => {
        try {
          await Github.pushRepository(repository);
          successfulRepositories.push(repository);
          console.log(`Successfully pushed repository: ${repository.slug}`);
        } catch (e) {
          console.log(e);
          console.log(`Failed to push repository: ${repository.slug}`);
          failedRepositories.push(repository.slug);
        }
      })
    );
    return { successfulRepositories, failedRepositories
  };
  }

  /**
   * Push to the repository a new repository on Github.
   *
   * @param {Object} repository single Bitbucket repo resource
   * @returns {Bolean} success status
   */
  static async pushRepository(repository) {
    // set upstream
    // push

    // path to the local repository
    const pathToRepository = path.resolve(
      __dirname,
      "../repositories/",
      repository.slug
    );
    console.log(
      `GITHUB: Pushing the repository: ${repository.slug}...`
    );

    // Push the locally cloned repository to GitHub using the "mirror" option, which ensures that all references, such as branches and tags, are copied to the imported repository.
    const commands = ` cd ${pathToRepository}/${repository.slug}.git && \
                git push --mirror https://${process.env.GITHUB_USERNAME}:${process.env.GITHUB_TOKEN}@github.com/${process.env.GITHUB_USERNAME}/${repository.slug}.git`;
    try {
      // initialize repo
      await exec(commands);
    } catch (e) {
      console.log(e);
      console.log("Failed to push the repository", repository.slug);
      throw (e);
    }
  }
}

module.exports = Github;
