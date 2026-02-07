import type { Achievement, Ranking, Subject } from '@/types';

export const SUBJECTS: Subject[] = [
	{
		id: 'math',
		name: 'Mathematics',
		icon: 'calculate',
		color: 'bg-blue-500',
		progress: 75,
		description: 'Calculus, Algebra, Geometry',
	},
	{
		id: 'physics',
		name: 'Physical Sciences',
		icon: 'science',
		color: 'bg-purple-500',
		progress: 25,
		description: 'Mechanics, Chemistry, Waves',
	},
	{
		id: 'accounting',
		name: 'Accounting',
		icon: 'pie_chart',
		color: 'bg-yellow-500',
		progress: 10,
		description: 'Financial statements, Ledgers',
	},
	{
		id: 'lifesci',
		name: 'Life Sciences',
		icon: 'biotech',
		color: 'bg-green-500',
		progress: 0,
		description: 'Genetics, Evolution, DNA',
	},
];

export const ACHIEVEMENTS: Achievement[] = [
	{
		id: '1',
		name: 'Night Owl',
		description: 'Study after 10 PM',
		imageUrl:
			'https://lh3.googleusercontent.com/aida-public/AB6AXuCC3YRwfyp3iVHby8gs5s1DiI5JAOiXvMtuLO0T4hpnuKQi7-zkS4Y9xeb8UZgloR0b-U6F2pR1rZDaKBYlIc2zFDgh2icEq-ajUVFwyLNEDQHqfrbJbEh1qSXsKZUqQ8CuEtnGPOFGXHEV9VDvv-aZcgPozunRCWN3CQF9o6oBQGGWmZhGAkTuS8H2-ztXWyxBzvXgP4MKLoVO0kvnNeLFexUoPIS9XY37V_rDpqqcYjCj4XqDZcbDkM8WGFhkIBJwXgXlvNCjgx_V',
		isLocked: false,
		unlockedAt: 'Oct 12, 2023',
	},
	{
		id: '2',
		name: 'Physics Master',
		description: 'Complete Mechanics module',
		imageUrl:
			'https://lh3.googleusercontent.com/aida-public/AB6AXuA3q-6Xcwb32D_PSCg6sYXUJgqdnmoryNhHsTPAQYSwTH9FuY_YWVJt2Knn0Eu8htF7tSTeSbgZUrwgbQ-GiOE1xdHlGY1uf7KDkSQDy2_Lob0k27g_7FFHKFhx4R8qRziyTL3vhG3olSYiokhHFlsM8QXJsEfdctIXp7ifsXWXyTeRUpElR5HHhmfsczU4QYK85TyCpWTgOwrNspSXqbNDUur_nI-FHlnqnLXq-Hhc7bzKsaCb_2_E6Fiehw0XDG_94ggPb8pYMgQA',
		isLocked: false,
		unlockedAt: 'Oct 12, 2023',
	},
	{
		id: '3',
		name: 'Fast Finisher',
		description: 'Complete quiz in < 1 min',
		imageUrl:
			'https://lh3.googleusercontent.com/aida-public/AB6AXuCMYx7TNhIQ0QfcUBYvGTqGUKtWM509_fx4nqoXblmmrUPWRSS-S9zkfPumNz0hMeFhtrPQp3x3qxCNllbyBgDkAAjaVkqPmV9UGFThsSnYHmVsTqh5TbU2yMW5_H_nXIoJktUp7TSDshO0U9h-npv-sKAm9C3Vy1chnuRBOb3sNClSeCftwCvrD6M0eTPGB3DPTC4HEM-HBNMg2TOHafuAePDAKd6_BvKEqj7vtrxDvhDIT2qHtFcOqDUi-VovJlPqZWTTjcKqAQqx',
		isLocked: false,
		unlockedAt: 'Oct 14, 2023',
	},
	{
		id: '4',
		name: 'Calculus King',
		description: 'Master Derivatives',
		imageUrl: '',
		isLocked: true,
	},
];

export const RANKINGS: Ranking[] = [
	{
		rank: 1,
		name: 'Thabo M.',
		points: 2840,
		school: "St. John's College",
		avatar:
			'https://lh3.googleusercontent.com/aida-public/AB6AXuDXwqMZGhdwhFer10arFK3qQKu3RLkb78VOrVHCmyglUiNBIKpHe8Q9xhAFQtYd-vfe-qMXjIOjp4Un4MXb3LHxm_4e3g_YtSUfJcBQUfNHbdGEM8NVS2C9vhgOG-4d9JYZSkG6GLO2ZrT2akVTHBuiP4HyLGy_VrqW9XEeo9-HkzDnaTTTE8SbJkdh1HhU2FOjGr3YD8XBBLT5tsoWFxIy_yK_P2ySE0LGwS6KEnai5Shc7-eoq2XSyjA8yP8laTjpy-KH0mId8B-F',
		streak: 12,
	},
	{
		rank: 2,
		name: 'Sipho N.',
		points: 2350,
		school: 'Parktown High',
		avatar:
			'https://lh3.googleusercontent.com/aida-public/AB6AXuA3WYVFwDiXjfNe0BmosOTJyfZXdJF0GcNlrEmBv9st2vMYcFU-J-8p63cGZmlSD6uXgwkarUCUGtFMGaGPBoekKg1-P73FP6MylDkqam2-_2KwY15HtViKhHulj5utd1IsF7xouYHND5P3hoUGPW59NsUG3MosjeHeKyBnWkuEMLnG4z36LmcFQxmrRWuzVVRS-6qB7-HUp9BUh2abw0pDdxak8tRiw4rHqKMM0cFGe7qzZzS0tYyrJik8iBKsnrsLPsGECeRV7904',
	},
	{
		rank: 3,
		name: 'Lerato K.',
		points: 2100,
		school: 'Roedean School',
		avatar:
			'https://lh3.googleusercontent.com/aida-public/AB6AXuBYEUUNEz8M-VNBqj6nWslgN2ckH7id2N6RYbQMJBKMiZBGohF1Ua67q2LxWJBX28gXgAmrXmJlMuQ8N79v3TnA1JsNIgOpNfab_6AcFOuC3ncOs_aI_k6bDOSatlXITTWk5-8ixrHQsWf_KngSEpBzBM6S5VU2BAfEPlSmBE4RJ3v3ddLHjTLQnZehtkmzxiIImYyg_12XaFEbk9lX6v0a76jCe7-2W8JaTpWbU6LJh6Zp6sHzOWDWuUlC5tPdi-RXtAwsS-Ju3kRq',
	},
	{
		rank: 4,
		name: 'Jessica V.',
		points: 1950,
		school: 'Parktown Girls',
		avatar:
			'https://lh3.googleusercontent.com/aida-public/AB6AXuBMObelKQv-gD7TYf7RNNdD4C_6ORmcKWFvv7gobMYdX4IScHzMbi7EK6TQoN3fgbT5T-nUn_J9ohUF42IbjXaO6HJVl8_JknP-SbYpn12ARWxJijOWb9T6c5Zs_NjejA6NlHE1DNYCTZnBFkYSVAuTvTVM8qAGy12i-3GlGmpXfjZzVfHuaMWZTMam01x2D04l0D0kwFj5pzb_Fm2anNAZLTOuaRfar1tpyFBsBqfSl_NT_tNyxuCGfV2Fy1U4AeNML2XZ5nGNlmEM',
	},
	{
		rank: 42,
		name: 'Your Rank',
		points: 1250,
		school: "St. John's College",
		avatar:
			'https://lh3.googleusercontent.com/aida-public/AB6AXuDQcir7nh51t_DOlwZTtFOZ4oQO2O_q_NjhNZDH4taxDeKvqx6nzLnHrXUXFbqUgZJ0qwBstH9b_fJRJxADvmNrftalekUzPqV2KazupXgbdY9ObNVeW_V_k0nsVPK21J1nlcNUvkRiNwxtnSus-OdvpMoWmN52WWmOEF8I_WiepUql3BD7YY775UDuF_Rwg7EOT-PYOMPCZQS60Cbc3gl_h7153nzwNRnA4Ew5M7yeyyHy7NJbku0ciXSZsoesGMJ6GHPwlQNnyqA-',
		isUser: true,
		streak: 5,
	},
];
