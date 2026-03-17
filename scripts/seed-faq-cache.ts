import path from 'node:path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config();

import { kv } from '@vercel/kv';

const CACHE_PREFIX = 'matricmaster:faq:';

const FAQ_SEEDS: Array<{ question: string; answer: string }> = [
	{
		question: 'how to calculate aps score',
		answer: `# How to Calculate Your APS Score

Your **Admission Point Score (APS)** is calculated from your Grade 11 or Grade 12 final marks.

## Step-by-Step

1. **List your 7 best subjects** (including mandatory ones)
2. **Convert each mark to points** using the scale below:

| NSC Level | Points |
|-----------|--------|
| 80-100%  | 7      |
| 70-79%   | 6      |
| 60-69%   | 5      |
| 50-59%   | 4      |
| 40-49%   | 3      |
| 30-39%   | 2      |
| 0-29%    | 1      |

3. **Add up all points** = Your APS

## Example
- Mathematics: 75% = 6 points
- Physical Sciences: 68% = 5 points
- Life Sciences: 72% = 6 points
- English: 80% = 7 points
- Geography: 65% = 5 points
- Accounting: 70% = 6 points
- Afrikaans: 60% = 5 points

**Total APS = 40 points**

## Tips
- Most universities require 25-35+ APS for admission
- Some competitive courses (Medicine, Engineering) require 40+ APS
- Check each university's specific requirements as they vary!`,
	},
	{
		question: 'what is the minimum aps for university',
		answer: `# Minimum APS Requirements for South African Universities

APS requirements vary by university and course. Here's a general guide:

## Minimum APS by University (Commerce/Faculty)
- **University of Cape Town (UCT)**: 28-42+ (varies by degree)
- **University of Pretoria (UP)**: 26-40+
- **Wits University**: 28-42+
- **Stellenbosch University**: 28-38+
- **UKZN**: 25-35+
- **University of Johannesburg**: 20-30+
- **University of the Free State**: 20-28+

## By Faculty
- **Health Sciences (Medicine)**: 40-45+
- **Engineering**: 35-42+
- **Commerce/Business**: 28-35+
- **Arts/Humanities**: 25-30+
- **Science**: 28-35+

## Important Notes
- These are GENERAL guidelines - check specific requirements
- Meeting minimum doesn't guarantee admission
- Some courses have additional subject requirements
- Grade 12 mid-year marks may be used for provisional admission`,
	},
	{
		question: 'how do i apply to university',
		answer: `# How to Apply to South African Universities

## Step 1: Research (Grade 11-12)
- Visit university websites
- Check APS requirements for your desired course
- Note application deadlines (usually May-September)

## Step 2: Gather Documents
- ID document or birth certificate
- Grade 11 final results
- Grade 12 June/Mock results (for provisional)
- Parent/guardian details
- Application fee (R100-R500)

## Step 3: Apply Online
Most universities use **Nafacts** or their own portals:
1. Create an account
2. Fill in personal details
3. Select course(s)
4. Upload documents
5. Pay application fee
6. Submit

## Step 4: Track Your Application
- Check your email regularly
- Log into the portal for status updates
- Respond to any requests promptly

## Key Deadlines
- **UP**: May 31
- **Wits**: June 30
- **UCT**: September 30
- **Stellenbosch**: August 31

*Deadlines vary yearly - check the official website!*`,
	},
	{
		question: 'what is nsc',
		answer: `# What is the NSC?

The **National Senior Certificate (NSC)** is the Grade 12 exit qualification in South Africa, introduced in 2008 to replace the Senior Certificate.

## NSC Requirements
To pass the NSC, you need:
- **7 subjects** (including 4 compulsory)
- **Minimum 30%** in Home Language
- **Minimum 40%** in at least 4 subjects
- **Average of 50%** across all 7 subjects

## Compulsory Subjects
1. **Home Language** (e.g., English, Afrikaans, isiZulu)
2. **First Additional Language**
3. **Mathematics** OR **Mathematical Literacy**
4. **Life Orientation**

## Subject Streams
- **Mathematics**: For university-bound Science, Engineering, Commerce
- **Mathematical Literacy**: For Commerce, Humanities, Arts
- **Sciences**: Physical Sciences, Life Sciences
- **Commerce**: Accounting, Economics, Business Studies
- **Arts**: Visual Arts, Music, Drama

## Grading Scale
| Level | Percentage | Description |
|-------|-----------|-------------|
| 7     | 80-100%   | Outstanding |
| 6     | 70-79%    | Excellent   |
| 5     | 60-69%    | Very Good   |
| 4     | 50-59%    | Good       |
| 3     | 40-49%    | Satisfactory|
| 2     | 30-39%    | Elementary |
| 1     | 0-29%     | Not Achieved|`,
	},
	{
		question: 'how to calculate admission point score',
		answer: `# Calculating Your Admission Point Score (APS)

The APS is your matric mark converted to points, used for university admission.

## The 7-Point Scale

| Percentage | Points |
|------------|--------|
| 80-100%   | 7      |
| 70-79%    | 6      |
| 60-69%    | 5      |
| 50-59%    | 4      |
| 40-49%    | 3      |
| 30-39%    | 2      |
| 0-29%     | 1      |

## How to Calculate

1. Use your **best 7 subjects**
2. Convert each percentage to points
3. **Add them all up**

## Example Calculation
Maths: 75% = 6 pts
Physics: 68% = 5 pts
English: 80% = 7 pts

Add all 7 = Your APS

## What You Need
- Minimum 20-25 points (varies by uni)
- 35+ points for competitive courses
- 40+ points for Medicine/Engineering at top universities`,
	},
	{
		question: 'university application',
		answer: `# University Application Guide

## When to Apply
- Grade 11: Start researching, attend open days
- Grade 12, May-August: Submit applications
- Grade 12, September-November: Check status, accept offers

## Where to Apply
1. Nafacts - Central application portal for most universities
2. University websites - Direct applications for some

## Required Documents
- ID or birth certificate
- Grade 11 results
- Grade 12 mid-year results
- Proof of residence
- Application fee proof

## After Applying
- Receive student number
- Check application status online
- Apply for accommodation if needed
- Register for classes

## Tips
- Apply to 3+ universities
- Include a safe choice
- Meet early deadlines
- Keep copies of everything`,
	},
	{
		question: 'aps calculation',
		answer: `# APS Calculation Made Simple

Your Admission Point Score (APS) determines if you qualify for university.

## Quick Steps

1. Take your best 7 subjects
2. Convert each percentage to points
3. Sum all 7 numbers

## The Conversion Table

| Your Mark | Points |
|-----------|--------|
| 90-100%  | 7      |
| 80-89%   | 7      |
| 70-79%   | 6      |
| 60-69%   | 5      |
| 50-59%   | 4      |
| 40-49%   | 3      |
| 30-39%   | 2      |
| Below 30% | 1     |

## Example
Maths: 75% = 6 pts
Physics: 68% = 5 pts
English: 80% = 7 pts
...

Add all 7 = Your APS

## What You Need
- Minimum 20-25 for most universities
- 35+ for competitive courses
- 40+ for Medicine/Engineering at top universities`,
	},
	{
		question: 'south african universities',
		answer: `# Top South African Universities

## Research Universities

### Cape Town
- University of Cape Town (UCT) - Top ranked, diverse
- Stellenbosch University - Strong research focus

### Gauteng
- University of Pretoria (UP) - Largest, strong academics
- Wits University - Research-intensive
- University of Johannesburg - Applied focus
- UNISA - Distance learning

### KwaZulu-Natal
- University of KwaZulu-Natal (UKZN)
- University of Zululand

### Other Provinces
- University of the Free State (UFS)
- University of the Western Cape (UWC)
- Rhodes University - Small, liberal arts
- University of Limpopo
- North-West University
- Nelson Mandela University

## Choosing a University
Consider:
- Course offerings
- Location
- Accommodation
- Fees
- Campus culture
- Ranking but not the only factor!`,
	},
	{
		question: 'nsc certificate',
		answer: `# Your NSC Certificate

The National Senior Certificate (NSC) is your Grade 12 qualification.

## What It Shows
- 7 subjects with marks
- APS calculation
- Pass/Fail status
- Endorsements if any

## How to Get It
1. Collect from your school (March-April)
2. Or apply via Examens Bureau
3. Digital copy available online

## Whats Required to Pass
- 7 subjects
- 30% in Home Language
- 40% in 4 subjects
- 50% average

## Uses of NSC
- University admission
- TVET College application
- Job applications
- Further training

## Lost Certificate?
- Request replacement from Provincial Education
- May take 4-6 weeks`,
	},
	{
		question: 'grade 12 requirements',
		answer: `# Grade 12 NSC Requirements

## Compulsory Subjects (4)
1. Home Language - English, Afrikaans, or African language
2. First Additional Language
3. Mathematics OR Mathematical Literacy
4. Life Orientation

## Elective Subjects (3-4)
Choose from:
- Sciences: Physics, Chemistry, Life Sciences
- Commerce: Accounting, Economics, Business Studies
- Arts: Visual Arts, Music, Drama
- Technology: Computer Applications Technology
- Humanities: History, Geography

## To Pass NSC
- Minimum 30% in Home Language
- Minimum 40% in 4 subjects
- Average 50% across all 7

## For University
- Check specific APS requirements
- Some courses need specific subjects
- Mathematics often required for Engineering, Science, Commerce`,
	},
];

async function seedCache() {
	console.log('Seeding FAQ cache...');

	let seeded = 0;
	let failed = 0;

	for (const faq of FAQ_SEEDS) {
		try {
			const key = `${CACHE_PREFIX}${faq.question.toLowerCase().trim()}`;
			await kv.set(key, faq.answer, { ex: 86400 * 365 }); // 1 year TTL
			console.log(`Seeded: ${faq.question}`);
			seeded++;
		} catch (error) {
			console.error(`Failed: ${faq.question}`, error);
			failed++;
		}
	}

	console.log(`\nSeeded ${seeded} FAQs`);
	console.log(`Failed ${failed} FAQs`);

	if (failed > 0) {
		process.exit(1);
	}
}

seedCache();
