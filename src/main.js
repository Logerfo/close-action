const fs = require("fs").promises,
    core = require("@actions/core"),
    github = require("@actions/github");

const re = /(?:(?:resolv|clos|fix)e[ds]?|fix) +#(\d+)/ig,
    token = core.getInput("github-token", { required: true }),
    comment = getInput("comment", "true") == "true",
    context = github.context,
    owner = context.repo.owner,
    repo = context.repo.repo,
    client = new github.GitHub(token);

const getEvent = async () => JSON.parse(await fs.readFile(process.env["GITHUB_EVENT_PATH"]));

function getInput(name, fallback) {
    const input = core.getInput(name);
    return input || fallback;
}

async function run() {
    try {
        core.debug(JSON.stringify(context.payload));
        if (github.context.eventName != "pull_request") {
            core.info("This action is supposed to run for pushes to pull requests only. Stepping out...");
            return;
        }
        const event = await getEvent();
        if ("closed" != event.action) {
            core.info("This action is supposed to run for closed pull requests only. Stepping out...");
            return;
        }
        await close();
    }
    catch (err) {
        //Even if it's a valid situation, we want to fail the action in order to be able to find the issue and fix it.
        core.setFailed(err.message);
        core.debug(JSON.stringify(err));
    }
}

async function close() {
    if (!context.payload.pull_request.merged) {
        core.info("Pull request is not merged. Stepping out...");
        return;
    }
    const repoResponse = await client.repos.get({
        owner,
        repo,
    });
    core.debug(JSON.stringify(repoResponse.data));
    if (repoResponse.data.default_branch == context.payload.pull_request.base.ref) {
        core.info(`Base branch (${repoResponse.data.default_branch}) is the default branch of this repository. GitHub will already do what we want. Stepping out...`);
        return;
    }
    const body = context.payload.pull_request.body,
        issues = new Set();
    let match = re.exec(body);
    while (match) {
        issues.add(match[1]);
        core.info(`Found fixed issue: #${match[1]}.`);
        match = re.exec(body);
    }
    if (issues.size == 0) {
        core.info(`This pull request fixes no issue. Stepping out...`);
        return;
    }
    for (const id of issues) {
        const issueResponse = await client.issues.get({
            issue_number: id,
            owner,
            repo,
        });
        core.debug(JSON.stringify(issueResponse.data));
        if (issueResponse.data.state == "closed") {
            core.info(`Issue #${id} is already closed. Skipping...`);
            continue;
        }
        if (comment) {
            core.info(`Commenting on #${id}...`);
            const commentResponse = await client.issues.createComment({
                body: `Closed by #${context.payload.pull_request.number}.`,
                issue_number: id,
                owner,
                repo,
            });
            core.debug(JSON.stringify(commentResponse.data));
        }
        else {
            core.info("Commenting is disabled. Skipping...");
        }
        core.info(`Closing #${id}...`);
        const closeResponse = await client.issues.update({
            issue_number: id,
            owner,
            repo,
            state: "closed",
        });
        core.debug(JSON.stringify(closeResponse.data));
    }
}

run();
