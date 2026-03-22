import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface NewsItem {
    id: bigint;
    title: string;
    source: string;
    date: Time;
    description: string;
    category: string;
}
export type Time = bigint;
export interface UserProgress {
    lastCompletedDate: Time;
    totalDaysInProgram: bigint;
    totalDaysCompleted: bigint;
    currentStreak: bigint;
}
export interface UserStats {
    totalScore: bigint;
    testsAttempted: bigint;
    accuracy: number;
}
export interface UserProfile {
    id: Principal;
    name: string;
    email: string;
    totalScore: bigint;
    testsAttempted: bigint;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addNewsItem(title: string, description: string, category: string, source: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    getAllNewsItems(): Promise<Array<NewsItem>>;
    getAllNewsItemsByDate(): Promise<Array<NewsItem>>;
    getCallerUserRole(): Promise<UserRole>;
    getMyProfile(): Promise<UserProfile | null>;
    getMyStats(): Promise<UserStats>;
    getNewsItem(id: bigint): Promise<NewsItem>;
    getUserProgress(): Promise<UserProgress>;
    incrementTestsAttempted(score: bigint): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    markDayCompleted(): Promise<void>;
    prepopulateNewsItems(): Promise<void>;
    saveProfile(name: string, email: string): Promise<void>;
}
