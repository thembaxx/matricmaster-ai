export async function generateEmbedding(text: string): Promise<number[]> {
	const vector = new Array(768).fill(0);
	for (let i = 0; i < text.length; i++) {
		vector[i % 768] += text.charCodeAt(i) / 255;
	}
	return vector.map((v) => (v / Math.max(text.length, 1)) * 2 - 1);
}
