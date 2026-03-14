export const appConfig = {
	name: 'Lumi', //Vora, Kibo
	description:
		"Pass your Matric with confidence. Practice NSC past papers, get help when you're stuck, and track your progress.",
	version: {
		current: '1.0.0',
		build: process.env.NEXT_PUBLIC_BUILD_VERSION || 'dev',
		commit: process.env.NEXT_PUBLIC_COMMIT_HASH || 'unknown',
		timestamp: process.env.NEXT_PUBLIC_BUILD_TIMESTAMP || new Date().toISOString(),
	},
};
