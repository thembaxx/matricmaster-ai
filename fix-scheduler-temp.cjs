const fs = require('node:fs');
const f = 'src/services/adaptiveScheduler.ts';
const l = fs.readFileSync(f, 'utf8').split('\n');
l[2] =
	'import { and, eq, like, lt, sql } from \
drizzle-orm;';
l[90] = '\t\t\t\tlt(sql\\, 60),';
l[136] = '\t\t\t\t\t\tlike(calendarEvents.title, %%),';
fs.writeFileSync(f, l.join('\n'));
console.log('Fixed!');
