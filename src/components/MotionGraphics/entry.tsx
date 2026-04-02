import { Composition, registerRoot } from 'remotion';
import { DemoReel } from './DemoReel';

export const portrait = { width: 1080, height: 1920 };
export const landscape = { width: 1920, height: 1080 };

// biome-disable-next-line lint/nursery/useUniqueElementIds
const RemotionRoot = () => {
	return (
		// biome-disable-next-line lint/nursery/useUniqueElementIds
		<Composition
			id="DemoReel"
			component={DemoReel}
			durationInFrames={540}
			fps={30}
			width={portrait.width}
			height={portrait.height}
		/>
	);
};

registerRoot(RemotionRoot);
