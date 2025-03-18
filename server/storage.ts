import { users, User, InsertUser, Challenge, challenges, InsertChallenge, UserChallenge, userChallenges, InsertUserChallenge, Badge, badges, InsertBadge, UserBadge, userBadges, InsertUserBadge, Question, questions, InsertQuestion, Answer, answers, InsertAnswer, Course, courses, InsertCourse, UserCourse, userCourses, InsertUserCourse, Activity, activities, InsertActivity } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;
  getTopUsers(limit: number): Promise<User[]>;
  getUserRank(userId: number): Promise<number>;

  // Challenge methods
  getChallenges(): Promise<Challenge[]>;
  getChallenge(id: number): Promise<Challenge | undefined>;
  createChallenge(challenge: InsertChallenge): Promise<Challenge>;
  getUserChallenges(userId: number): Promise<(UserChallenge & { challenge: Challenge })[]>;
  completeUserChallenge(userId: number, challengeId: number): Promise<UserChallenge | undefined>;
  createUserChallenge(userChallenge: InsertUserChallenge): Promise<UserChallenge>;

  // Badge methods
  getBadges(): Promise<Badge[]>;
  getBadge(id: number): Promise<Badge | undefined>;
  createBadge(badge: InsertBadge): Promise<Badge>;
  getUserBadges(userId: number): Promise<(UserBadge & { badge: Badge })[]>;
  awardUserBadge(userId: number, badgeId: number): Promise<UserBadge | undefined>;

  // Question methods
  getQuestions(limit?: number): Promise<Question[]>;
  getQuestion(id: number): Promise<Question | undefined>;
  createQuestion(question: InsertQuestion): Promise<Question>;
  voteQuestion(id: number, value: number): Promise<Question | undefined>;

  // Answer methods
  getAnswersForQuestion(questionId: number): Promise<Answer[]>;
  createAnswer(answer: InsertAnswer): Promise<Answer>;
  voteAnswer(id: number, value: number): Promise<Answer | undefined>;

  // Course methods
  getCourses(): Promise<Course[]>;
  getCourse(id: number): Promise<Course | undefined>;
  createCourse(course: InsertCourse): Promise<Course>;
  getUserCourses(userId: number): Promise<(UserCourse & { course: Course })[]>;
  updateUserCourseProgress(userId: number, courseId: number, lessonsCompleted: number): Promise<UserCourse | undefined>;
  startUserCourse(userCourse: InsertUserCourse): Promise<UserCourse>;

  // Activity methods
  getUserActivities(userId: number, limit?: number): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;

  // Session store
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private challenges: Map<number, Challenge>;
  private userChallenges: Map<number, UserChallenge>;
  private badges: Map<number, Badge>;
  private userBadges: Map<number, UserBadge>;
  private questions: Map<number, Question>;
  private answers: Map<number, Answer>;
  private courses: Map<number, Course>;
  private userCourses: Map<number, UserCourse>;
  private activities: Map<number, Activity>;
  
  sessionStore: session.SessionStore;
  
  private currentIds: {
    users: number;
    challenges: number;
    userChallenges: number;
    badges: number;
    userBadges: number;
    questions: number;
    answers: number;
    courses: number;
    userCourses: number;
    activities: number;
  };

  constructor() {
    this.users = new Map();
    this.challenges = new Map();
    this.userChallenges = new Map();
    this.badges = new Map();
    this.userBadges = new Map();
    this.questions = new Map();
    this.answers = new Map();
    this.courses = new Map();
    this.userCourses = new Map();
    this.activities = new Map();
    
    this.currentIds = {
      users: 1,
      challenges: 1,
      userChallenges: 1,
      badges: 1,
      userBadges: 1,
      questions: 1,
      answers: 1,
      courses: 1,
      userCourses: 1,
      activities: 1
    };
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
    
    // Initialize default data
    this.initializeDefaultData();
  }

  // Initialize some default data
  private async initializeDefaultData() {
    // Add default challenges
    await this.createChallenge({
      title: "Tägliche Lektion abschließen",
      description: "Schließe eine Lektion zu einem beliebigen Thema ab",
      pointsReward: 25,
      icon: "check_circle",
      iconBgColor: "success",
      type: "daily"
    });
    
    await this.createChallenge({
      title: "Quiz zum Thema \"Aktien Grundlagen\"",
      description: "Beantworte 10 Fragen über Aktien und den Aktienmarkt",
      pointsReward: 50,
      icon: "quiz",
      iconBgColor: "primary",
      type: "daily"
    });
    
    await this.createChallenge({
      title: "Beantworte eine Frage von der Community",
      description: "Helfe anderen Nutzern, indem du eine Frage beantwortest",
      pointsReward: 40,
      icon: "forum",
      iconBgColor: "accent",
      type: "daily"
    });
    
    // Add default badges
    await this.createBadge({
      title: "7 Tage Serie",
      description: "Logge dich 7 Tage in Folge ein",
      icon: "local_fire_department",
      iconBgColor: "accent",
      requirement: "streak",
      requiredAmount: 7
    });
    
    await this.createBadge({
      title: "Quiz Meister",
      description: "Schließe 5 Quizze erfolgreich ab",
      icon: "psychology",
      iconBgColor: "secondary",
      requirement: "quizzes_completed",
      requiredAmount: 5
    });
    
    await this.createBadge({
      title: "5 Kurse abgeschlossen",
      description: "Schließe 5 Kurse vollständig ab",
      icon: "school",
      iconBgColor: "primary",
      requirement: "courses_completed",
      requiredAmount: 5
    });
    
    await this.createBadge({
      title: "10 Antworten",
      description: "Beantworte 10 Fragen von der Community",
      icon: "forum",
      iconBgColor: "neutral",
      requirement: "answers_given",
      requiredAmount: 10
    });
    
    await this.createBadge({
      title: "Level 20 erreichen",
      description: "Erreiche Level 20",
      icon: "trending_up",
      iconBgColor: "neutral",
      requirement: "level",
      requiredAmount: 20
    });
    
    await this.createBadge({
      title: "Top 10 Rangliste",
      description: "Erreiche einen Platz in den Top 10 der Rangliste",
      icon: "emoji_events",
      iconBgColor: "neutral",
      requirement: "leaderboard_rank",
      requiredAmount: 10
    });
    
    // Add default courses
    await this.createCourse({
      title: "Aktien Grundlagen",
      description: "Lerne die Grundlagen des Aktienhandels",
      totalLessons: 5
    });
    
    await this.createCourse({
      title: "Altersvorsorge planen",
      description: "Plane deine finanzielle Zukunft",
      totalLessons: 4
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentIds.users++;
    const user: User = { ...insertUser, id, points: 0, level: 1, streak: 0, lastLoginDate: new Date() };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getTopUsers(limit: number): Promise<User[]> {
    return Array.from(this.users.values())
      .sort((a, b) => b.points - a.points)
      .slice(0, limit);
  }

  async getUserRank(userId: number): Promise<number> {
    const sortedUsers = Array.from(this.users.values())
      .sort((a, b) => b.points - a.points);
    
    const index = sortedUsers.findIndex(user => user.id === userId);
    return index !== -1 ? index + 1 : -1;
  }

  // Challenge methods
  async getChallenges(): Promise<Challenge[]> {
    return Array.from(this.challenges.values());
  }

  async getChallenge(id: number): Promise<Challenge | undefined> {
    return this.challenges.get(id);
  }

  async createChallenge(challenge: InsertChallenge): Promise<Challenge> {
    const id = this.currentIds.challenges++;
    const newChallenge: Challenge = { ...challenge, id };
    this.challenges.set(id, newChallenge);
    return newChallenge;
  }

  async getUserChallenges(userId: number): Promise<(UserChallenge & { challenge: Challenge })[]> {
    return Array.from(this.userChallenges.values())
      .filter(uc => uc.userId === userId)
      .map(uc => {
        const challenge = this.challenges.get(uc.challengeId);
        if (!challenge) throw new Error(`Challenge with id ${uc.challengeId} not found`);
        return { ...uc, challenge };
      });
  }

  async completeUserChallenge(userId: number, challengeId: number): Promise<UserChallenge | undefined> {
    const userChallenge = Array.from(this.userChallenges.values())
      .find(uc => uc.userId === userId && uc.challengeId === challengeId);
    
    if (!userChallenge) return undefined;
    
    const updated: UserChallenge = {
      ...userChallenge,
      completed: true,
      completedAt: new Date()
    };
    
    this.userChallenges.set(userChallenge.id, updated);
    
    // Award points to user
    const challenge = this.challenges.get(challengeId);
    if (challenge) {
      const user = this.users.get(userId);
      if (user) {
        const updatedUser = {
          ...user,
          points: user.points + challenge.pointsReward
        };
        this.users.set(userId, updatedUser);
        
        // Create activity record
        await this.createActivity({
          userId,
          type: "challenge_completed",
          description: `Du hast die Herausforderung "${challenge.title}" abgeschlossen`,
          pointsAwarded: challenge.pointsReward,
          metadata: { challengeId }
        });
      }
    }
    
    return updated;
  }

  async createUserChallenge(userChallenge: InsertUserChallenge): Promise<UserChallenge> {
    const id = this.currentIds.userChallenges++;
    const newUserChallenge: UserChallenge = {
      ...userChallenge,
      id,
      completed: false,
      completedAt: undefined,
      expiresAt: undefined
    };
    this.userChallenges.set(id, newUserChallenge);
    return newUserChallenge;
  }

  // Badge methods
  async getBadges(): Promise<Badge[]> {
    return Array.from(this.badges.values());
  }

  async getBadge(id: number): Promise<Badge | undefined> {
    return this.badges.get(id);
  }

  async createBadge(badge: InsertBadge): Promise<Badge> {
    const id = this.currentIds.badges++;
    const newBadge: Badge = { ...badge, id };
    this.badges.set(id, newBadge);
    return newBadge;
  }

  async getUserBadges(userId: number): Promise<(UserBadge & { badge: Badge })[]> {
    return Array.from(this.userBadges.values())
      .filter(ub => ub.userId === userId)
      .map(ub => {
        const badge = this.badges.get(ub.badgeId);
        if (!badge) throw new Error(`Badge with id ${ub.badgeId} not found`);
        return { ...ub, badge };
      });
  }

  async awardUserBadge(userId: number, badgeId: number): Promise<UserBadge | undefined> {
    // Check if user already has this badge
    const existing = Array.from(this.userBadges.values())
      .find(ub => ub.userId === userId && ub.badgeId === badgeId);
    
    if (existing) return existing;
    
    const badge = this.badges.get(badgeId);
    if (!badge) return undefined;
    
    const id = this.currentIds.userBadges++;
    const userBadge: UserBadge = {
      id,
      userId,
      badgeId,
      earnedAt: new Date()
    };
    
    this.userBadges.set(id, userBadge);
    
    // Create activity record
    await this.createActivity({
      userId,
      type: "badge_earned",
      description: `Du hast das Abzeichen "${badge.title}" freigeschaltet!`,
      pointsAwarded: 0,
      metadata: { badgeId }
    });
    
    return userBadge;
  }

  // Question methods
  async getQuestions(limit?: number): Promise<Question[]> {
    const questions = Array.from(this.questions.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    return limit ? questions.slice(0, limit) : questions;
  }

  async getQuestion(id: number): Promise<Question | undefined> {
    return this.questions.get(id);
  }

  async createQuestion(question: InsertQuestion): Promise<Question> {
    const id = this.currentIds.questions++;
    const newQuestion: Question = {
      ...question,
      id,
      createdAt: new Date(),
      votes: 0
    };
    this.questions.set(id, newQuestion);
    
    // Award points for asking a question
    const user = this.users.get(question.userId);
    if (user) {
      const points = 10; // Points for asking a question
      const updatedUser = {
        ...user,
        points: user.points + points
      };
      this.users.set(user.id, updatedUser);
      
      // Create activity
      await this.createActivity({
        userId: user.id,
        type: "question_asked",
        description: "Du hast eine Frage gestellt",
        pointsAwarded: points,
        metadata: { questionId: id }
      });
    }
    
    return newQuestion;
  }

  async voteQuestion(id: number, value: number): Promise<Question | undefined> {
    const question = this.questions.get(id);
    if (!question) return undefined;
    
    const updatedQuestion: Question = {
      ...question,
      votes: question.votes + value
    };
    
    this.questions.set(id, updatedQuestion);
    return updatedQuestion;
  }

  // Answer methods
  async getAnswersForQuestion(questionId: number): Promise<Answer[]> {
    return Array.from(this.answers.values())
      .filter(answer => answer.questionId === questionId)
      .sort((a, b) => b.votes - a.votes);
  }

  async createAnswer(answer: InsertAnswer): Promise<Answer> {
    const id = this.currentIds.answers++;
    const newAnswer: Answer = {
      ...answer,
      id,
      createdAt: new Date(),
      votes: 0
    };
    this.answers.set(id, newAnswer);
    
    // Award points for answering a question
    const user = this.users.get(answer.userId);
    if (user) {
      const points = 20; // Points for answering a question
      const updatedUser = {
        ...user,
        points: user.points + points
      };
      this.users.set(user.id, updatedUser);
      
      // Create activity
      await this.createActivity({
        userId: user.id,
        type: "answer_given",
        description: "Du hast eine Frage beantwortet",
        pointsAwarded: points,
        metadata: { answerId: id, questionId: answer.questionId }
      });
      
      // Check for badge eligibility (10 answers)
      const userAnswers = Array.from(this.answers.values())
        .filter(a => a.userId === user.id);
      
      if (userAnswers.length === 10) {
        const answerBadge = Array.from(this.badges.values())
          .find(b => b.requirement === "answers_given" && b.requiredAmount === 10);
        
        if (answerBadge) {
          await this.awardUserBadge(user.id, answerBadge.id);
        }
      }
    }
    
    return newAnswer;
  }

  async voteAnswer(id: number, value: number): Promise<Answer | undefined> {
    const answer = this.answers.get(id);
    if (!answer) return undefined;
    
    const updatedAnswer: Answer = {
      ...answer,
      votes: answer.votes + value
    };
    
    this.answers.set(id, updatedAnswer);
    return updatedAnswer;
  }

  // Course methods
  async getCourses(): Promise<Course[]> {
    return Array.from(this.courses.values());
  }

  async getCourse(id: number): Promise<Course | undefined> {
    return this.courses.get(id);
  }

  async createCourse(course: InsertCourse): Promise<Course> {
    const id = this.currentIds.courses++;
    const newCourse: Course = { ...course, id };
    this.courses.set(id, newCourse);
    return newCourse;
  }

  async getUserCourses(userId: number): Promise<(UserCourse & { course: Course })[]> {
    return Array.from(this.userCourses.values())
      .filter(uc => uc.userId === userId)
      .map(uc => {
        const course = this.courses.get(uc.courseId);
        if (!course) throw new Error(`Course with id ${uc.courseId} not found`);
        return { ...uc, course };
      });
  }

  async updateUserCourseProgress(userId: number, courseId: number, lessonsCompleted: number): Promise<UserCourse | undefined> {
    const userCourse = Array.from(this.userCourses.values())
      .find(uc => uc.userId === userId && uc.courseId === courseId);
    
    if (!userCourse) return undefined;
    
    const course = this.courses.get(courseId);
    if (!course) return undefined;
    
    // Check if this completes the course
    const completed = lessonsCompleted >= course.totalLessons;
    const wasCompleted = userCourse.lessonsCompleted >= course.totalLessons;
    
    const updated: UserCourse = {
      ...userCourse,
      lessonsCompleted,
      completedAt: completed && !wasCompleted ? new Date() : userCourse.completedAt
    };
    
    this.userCourses.set(userCourse.id, updated);
    
    // If completed, and wasn't before, award points and create activity
    if (completed && !wasCompleted) {
      const user = this.users.get(userId);
      if (user) {
        const coursePoints = 75; // Points for completing a course
        const updatedUser = {
          ...user,
          points: user.points + coursePoints
        };
        this.users.set(userId, updatedUser);
        
        // Create activity
        await this.createActivity({
          userId,
          type: "course_completed",
          description: `Du hast den Kurs "${course.title}" abgeschlossen`,
          pointsAwarded: coursePoints,
          metadata: { courseId }
        });
        
        // Check for badge eligibility (5 courses completed)
        const completedCourses = Array.from(this.userCourses.values())
          .filter(uc => uc.userId === userId && uc.completedAt !== undefined);
        
        if (completedCourses.length === 5) {
          const courseBadge = Array.from(this.badges.values())
            .find(b => b.requirement === "courses_completed" && b.requiredAmount === 5);
          
          if (courseBadge) {
            await this.awardUserBadge(userId, courseBadge.id);
          }
        }
      }
    }
    
    return updated;
  }

  async startUserCourse(userCourse: InsertUserCourse): Promise<UserCourse> {
    // Check if already started
    const existing = Array.from(this.userCourses.values())
      .find(uc => uc.userId === userCourse.userId && uc.courseId === userCourse.courseId);
    
    if (existing) return existing;
    
    const id = this.currentIds.userCourses++;
    const newUserCourse: UserCourse = {
      ...userCourse,
      id,
      lessonsCompleted: 0,
      startedAt: new Date(),
      completedAt: undefined
    };
    
    this.userCourses.set(id, newUserCourse);
    return newUserCourse;
  }

  // Activity methods
  async getUserActivities(userId: number, limit?: number): Promise<Activity[]> {
    const activities = Array.from(this.activities.values())
      .filter(activity => activity.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    return limit ? activities.slice(0, limit) : activities;
  }

  async createActivity(activity: InsertActivity): Promise<Activity> {
    const id = this.currentIds.activities++;
    const newActivity: Activity = {
      ...activity,
      id,
      createdAt: new Date()
    };
    
    this.activities.set(id, newActivity);
    return newActivity;
  }
}

export const storage = new MemStorage();
