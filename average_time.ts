export class Issue {
    constructor(
        public created_at: string,
        public closed_at: string,
        public number: number,
        public state: string,
        public pull_request?: object,
    ) { }
}

const fetchAndFilterIssues = async (url: string, startDate: string, issues: Array<Issue>) => {
    try {
        const response = await fetch(url, {
            headers: {
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        const responseData = await response.json();

        if (Array.isArray(responseData)) {
            responseData.forEach(({ created_at, closed_at, number, state, pull_request }: any) => {
                // Filter issues created after the specified start date
                if (new Date(created_at) >= new Date(startDate)) {
                    issues.push(new Issue(created_at, closed_at, number, state, pull_request));
                }
            });
        }
    } catch (error) {
        console.error('Error fetching issues:', error);
    }
};


export const calculateAverageTimeToClose = async (owner: string, repo: string, team: string, impact: string, startDate: string) => {
    const openIssues: Array<Issue> = [];
    const closedIssues: Array<Issue> = [];

    const labels = `${team},impact:${impact},bug`;

    // Fetch open issues
    const openUrl = `https://api.github.com/repos/${owner}/${repo}/issues?labels=${encodeURIComponent(labels)}&state=open`;
    await fetchAndFilterIssues(openUrl, startDate, openIssues);

    // Fetch closed issues
    const closedUrl = `https://api.github.com/repos/${owner}/${repo}/issues?labels=${encodeURIComponent(labels)}&state=closed`;
    await fetchAndFilterIssues(closedUrl, startDate, closedIssues);

    // Combine open and closed issues
    const issues = openIssues.concat(closedIssues);

    console.log(issues);
    console.log(issues.length);

    let totalTimeToClose = 0;
    let issueCount = 0;
    const now = new Date();

    issues.forEach(issue => {
        const createdAt = new Date(issue.created_at);
        const closedAt = issue.closed_at ? new Date(issue.closed_at) : now;
        const timeToClose = closedAt.getTime() - createdAt.getTime();
        totalTimeToClose += timeToClose;
        issueCount += 1;
    });

    if (issueCount > 0) {
        const averageTimeToClose = totalTimeToClose / issueCount;
        const averageTimeToCloseHours = averageTimeToClose / (1000 * 60 * 60);
        const averageTimeToCloseDays = averageTimeToClose / (1000 * 60 * 60 * 24);
        console.log(`Average time to close an issue with impact ${impact} in the ${team}: ${averageTimeToCloseDays} days or ${averageTimeToCloseHours} hours`);
    } else {
        console.log('No issues found with the specified label/s.');
    }
};

