import { config } from 'dotenv';
config({ path: '.env.local' });

import { eq, isNotNull, isNull, and } from 'drizzle-orm';
import { getDb, closeConnection } from '../src/lib/db';
import { pastPapers } from '../src/lib/db/schema';
import { convertPdfToMarkdown, uploadMarkdownToUploadThing } from '../src/services/markdownConverter';

async function migrate() {
	console.log('🚀 Starting markdown migration...');
	
	try {
		const db = await getDb();
		
		// Get all papers with storedPdfUrl but no markdownFileUrl
		const papers = await db.select().from(pastPapers).where(
			and(
				isNotNull(pastPapers.storedPdfUrl),
				isNull(pastPapers.markdownFileUrl)
			)
		);
		
		console.log(`found ${papers.length} papers to migrate`);
		
		for (const paper of papers) {
			try {
				console.log(`📄 Processing: ${paper.paperId} (${paper.subject} ${paper.year})`);
				
				const result = await convertPdfToMarkdown(paper.storedPdfUrl!);
				
				if (result.success && result.markdown) {
					console.log(`✅ Converted ${paper.paperId} to markdown (${result.markdown.length} chars)`);
					
					const upload = await uploadMarkdownToUploadThing(result.markdown, paper.paperId);
					
					if (upload.success && upload.url) {
						await db.update(pastPapers)
							.set({ markdownFileUrl: upload.url })
							.where(eq(pastPapers.id, paper.id));
						
						console.log(`✨ Updated: ${paper.paperId} with markdown URL: ${upload.url}`);
					} else {
						console.error(`❌ Failed to upload markdown for ${paper.paperId}:`, upload.error);
					}
				} else {
					console.error(`❌ Failed to convert ${paper.paperId}:`, result.error);
				}
				
				// Rate limit - 2 seconds between papers to avoid hitting markdown.new limits
				console.log('Waiting 2 seconds...');
				await new Promise(r => setTimeout(r, 2000));
			} catch (error) {
				console.error(`💥 Failed: ${paper.paperId}`, error);
			}
		}
		
		console.log('✅ Migration complete!');
	} catch (error) {
		console.error('❌ Migration failed:', error);
	} finally {
		await closeConnection();
		process.exit(0);
	}
}

migrate();
