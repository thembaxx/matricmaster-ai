import os
f = 'src/services/adaptiveScheduler.ts'
lines = open(f, 'r').readlines()
lines[2] = 'import { and, eq, like, lt, sql } from \
drizzle-orm\;\n'
lines[90] = '\t\t\t\tlt(sql\\\, 60),\n'
lines[136] = '\t\t\t\t\t\tlike(calendarEvents.title, \%\%\),\n'
open(f, 'w').writelines(lines)
print('Fixed!')

