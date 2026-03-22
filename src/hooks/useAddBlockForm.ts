interface BlockData {
	id?: string;
	title: string;
	startTime: Date;
	endTime: Date;
	subjectId?: number | null;
	color?: string;
}

export interface FormState {
	title: string;
	date: string;
	startTime: string;
	endTime: string;
	repeatable: boolean;
	subjectId: string;
}

export type FormAction =
	| { type: 'SET_TITLE'; payload: string }
	| { type: 'SET_DATE'; payload: string }
	| { type: 'SET_START_TIME'; payload: string }
	| { type: 'SET_END_TIME'; payload: string }
	| { type: 'SET_REPEATABLE'; payload: boolean }
	| { type: 'SET_SUBJECT_ID'; payload: string }
	| { type: 'RESET_FORM' }
	| { type: 'INIT_FROM_BLOCK'; payload: BlockData };

function formatTimeFromDate(date: Date): string {
	const hours = String(date.getHours()).padStart(2, '0');
	const minutes = String(date.getMinutes()).padStart(2, '0');
	return `${hours}:${minutes}`;
}

function formatDateFromDate(date: Date): string {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
}

function getCurrentDateString(): string {
	const today = new Date();
	const year = today.getFullYear();
	const month = String(today.getMonth() + 1).padStart(2, '0');
	const day = String(today.getDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
}

export function getInitialFormState(editMode: BlockData | null | undefined): FormState {
	if (editMode) {
		const start = new Date(editMode.startTime);
		const end = new Date(editMode.endTime);
		return {
			title: editMode.title,
			date: formatDateFromDate(start),
			startTime: formatTimeFromDate(start),
			endTime: formatTimeFromDate(end),
			repeatable: false,
			subjectId: editMode.subjectId?.toString() || '',
		};
	}
	return {
		title: '',
		date: getCurrentDateString(),
		startTime: '16:00',
		endTime: '17:00',
		repeatable: false,
		subjectId: '',
	};
}

export function formReducer(state: FormState, action: FormAction): FormState {
	switch (action.type) {
		case 'SET_TITLE':
			return { ...state, title: action.payload };
		case 'SET_DATE':
			return { ...state, date: action.payload };
		case 'SET_START_TIME':
			return { ...state, startTime: action.payload };
		case 'SET_END_TIME':
			return { ...state, endTime: action.payload };
		case 'SET_REPEATABLE':
			return { ...state, repeatable: action.payload };
		case 'SET_SUBJECT_ID':
			return { ...state, subjectId: action.payload };
		case 'RESET_FORM':
			return getInitialFormState(null);
		case 'INIT_FROM_BLOCK': {
			const start = new Date(action.payload.startTime);
			const end = new Date(action.payload.endTime);
			return {
				title: action.payload.title,
				date: formatDateFromDate(start),
				startTime: formatTimeFromDate(start),
				endTime: formatTimeFromDate(end),
				repeatable: false,
				subjectId: action.payload.subjectId?.toString() || '',
			};
		}
		default:
			return state;
	}
}
