export class Issue {
    constructor(
        public created_at: string,
        public closed_at: string,
        public number: number,
        public pull_request?: object,
    ) { }
  }

export const calculateAverageTimeToClose = async (owner: string, repo: string, team: string, impact: string, startDate: string) => {

    const issues: Array<Issue> = [];

    const labels = `${team},impact:${impact},bug`

    const url = `https://api.github.com/repos/${owner}/${repo}/issues?state=closed&labels=${encodeURIComponent(labels)}&since=${startDate}`;

    try {
        const response = await fetch(url, {
            headers: {
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        const results  = await response.json();

        for (const { created_at, closed_at, number, pull_request } of results) {
            issues.push(new Issue(created_at, closed_at, number, pull_request));
          }

        console.log(issues);

        let totalTimeToClose = 0;
        let issueCount = 0;

        issues.forEach(issue => {
            if (!issue.pull_request) {
                const createdAt = new Date(issue.created_at);
                const closedAt = new Date(issue.closed_at);
                const timeToClose = closedAt.getTime() - createdAt.getTime();
                totalTimeToClose += timeToClose;
                issueCount += 1;
            }
        });

        if (issueCount > 0) {
            const averageTimeToClose = totalTimeToClose / issueCount;
            const averageTimeToCloseHours = averageTimeToClose / (1000 * 60 * 60);
            const averageTimeToCloseDays = averageTimeToClose / (1000 * 60 * 60 * 24);
            console.log(`Average time to close an issue with impact ${impact} in the ${team}: ${averageTimeToCloseDays} days and ${averageTimeToCloseHours} hours`);
        } else {
            console.log('No issues found with the specified label/s.');
        }
    } catch (error) {
        console.error('Error fetching issues:', error);
    }
};


