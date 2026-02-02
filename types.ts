
export enum Screen {
    DASHBOARD = 'DASHBOARD',
    PATH = 'PATH',
    CHANNELS = 'CHANNELS',
    BOOKMARKS = 'BOOKMARKS',
    QUIZ = 'QUIZ',
    PROFILE = 'PROFILE',
    STUDY_PLAN = 'STUDY_PLAN',
    ACHIEVEMENTS = 'ACHIEVEMENTS',
    LEADERBOARD = 'LEADERBOARD',
    CMS = 'CMS'
}

export interface Subject {
    id: string;
    name: string;
    icon: string;
    color: string;
    progress: number;
    description?: string;
}

export interface Achievement {
    id: string;
    name: string;
    description: string;
    unlockedAt?: string;
    imageUrl: string;
    isLocked: boolean;
}

export interface Ranking {
    rank: number;
    name: string;
    points: number;
    school: string;
    avatar: string;
    isUser?: boolean;
    streak?: number;
}

export interface ContentItem {
    id: string;
    title: string;
    topic: string;
    category: string;
    content: string;
    image?: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    status: 'Draft' | 'Published';
    updatedAt: string;
}
