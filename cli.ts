import { z, ZodError } from 'zod';
import yargs from 'yargs';
import { calculateAverageTimeToClose } from './average_time';

const optionsSchema = z.object({
    owner: z.string(),
    repo: z.string(),
    team: z.string(),
    impact: z.string(),
    start_date: z.string(),
});

const cli = async () => {
    const options = await yargs(process.argv.slice(2))
    .option('owner', { type: 'string', description: 'Owner of the repo'})
    .option('repo', { type: 'string', description: 'Name of the repo' })
    .option('team', { type: 'string', description: 'Team' })
    .option('impact', { type: 'string', description: 'Impact' })
    .option('start_date', {type: 'string', description: 'Start date'})
    .usage('Calculates the average of a team to close bug tickets with a given priority.')
    .help().version(false).argv;

    try {
        optionsSchema.parse(options);
    } catch (e) {
        const zodError = e as ZodError;
        zodError.errors.map(err => {
            const path = err.path.join('.');
            console.log(`The field "${path}", is ${err.message.toLowerCase()}`);
        });
        process.exit(1);
    }

    const owner = options.owner;
    const repo = options.repo;
    const team = options.team;
    const impact = options.impact;
    const startDate = options.start_date;

    await calculateAverageTimeToClose(owner, repo, team, impact, startDate);
};

await cli();