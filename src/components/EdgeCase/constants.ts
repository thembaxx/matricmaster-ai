import {
	AlertTriangle,
	BookOpen,
	Clock,
	CloudOff,
	Flame,
	HelpCircle,
	Info,
	Lightbulb,
	RefreshCw,
	ShieldAlert,
	Sparkles,
	Users,
	Zap,
} from 'lucide-react';
import type { EdgeCaseType } from '@/services/edge-case-service';

export const EDGE_CASE_ICONS: Record<EdgeCaseType, React.ElementType> = {
	COMPLETE_FAILURE: HelpCircle,
	HINT_OVERUSE: Lightbulb,
	RAPID_SUCCESS: Sparkles,
	BURNOUT_RISK: Flame,
	EMPTY_QUESTION_BANK: BookOpen,
	OFFLINE_CONFLICT: CloudOff,
	API_RATE_LIMIT: Zap,
	SESSION_TIMEOUT: Clock,
	TOXIC_COMPETITION: ShieldAlert,
	COMPARISON_ANXIETY: Users,
	AI_CONTENT_ERROR: AlertTriangle,
	CURRICULUM_CHANGE: RefreshCw,
	CONTRADICTORY_INFO: Info,
};

export const SEVERITY_COLORS = {
	low: 'text-muted-foreground bg-muted',
	medium: 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30',
	high: 'text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/30',
	critical: 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30',
} as const;

export const SEVERITY_BORDER = {
	low: 'border-muted',
	medium: 'border-yellow-500/50',
	high: 'border-orange-500/50',
	critical: 'border-red-500/50',
} as const;
