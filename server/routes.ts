import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { z } from "zod";
import { insertQuestionSchema, insertAnswerSchema, insertUserCourseSchema } from "@shared/schema";

// Middleware to ensure authentication
function ensureAuthenticated(req: any, res: any, next: any) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Nicht autorisiert" });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // User routes
  app.get("/api/users/top", async (req, res) => {
    try {
      const topUsers = await storage.getTopUsers(10);
      res.json(topUsers);
    } catch (error) {
      console.error("Error fetching top users:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/users/rank", ensureAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.id;
      const rank = await storage.getUserRank(userId);
      res.json({ rank });
    } catch (error) {
      console.error("Error fetching user rank:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Badge routes
  app.get("/api/badges", async (req, res) => {
    try {
      const badges = await storage.getBadges();
      res.json(badges);
    } catch (error) {
      console.error("Error fetching badges:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/user/badges", ensureAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.id;
      const userBadges = await storage.getUserBadges(userId);
      res.json(userBadges);
    } catch (error) {
      console.error("Error fetching user badges:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Challenge routes
  app.get("/api/challenges", async (req, res) => {
    try {
      const challenges = await storage.getChallenges();
      res.json(challenges);
    } catch (error) {
      console.error("Error fetching challenges:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/user/challenges", ensureAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.id;
      const userChallenges = await storage.getUserChallenges(userId);
      res.json(userChallenges);
    } catch (error) {
      console.error("Error fetching user challenges:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/challenges/:id/complete", ensureAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.id;
      const challengeId = parseInt(req.params.id, 10);
      
      const completedChallenge = await storage.completeUserChallenge(userId, challengeId);
      if (!completedChallenge) {
        // If the user doesn't have this challenge yet, create it and complete it
        const challenge = await storage.getChallenge(challengeId);
        if (!challenge) {
          return res.status(404).json({ message: "Herausforderung nicht gefunden" });
        }
        
        const userChallenge = await storage.createUserChallenge({
          userId,
          challengeId,
        });
        
        const completed = await storage.completeUserChallenge(userId, challengeId);
        return res.json(completed);
      }
      
      res.json(completedChallenge);
    } catch (error) {
      console.error("Error completing challenge:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Activity routes
  app.get("/api/user/activities", ensureAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.id;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
      const activities = await storage.getUserActivities(userId, limit);
      res.json(activities);
    } catch (error) {
      console.error("Error fetching user activities:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Question and answer routes
  app.get("/api/questions", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
      const questions = await storage.getQuestions(limit);
      res.json(questions);
    } catch (error) {
      console.error("Error fetching questions:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/questions/:id", async (req, res) => {
    try {
      const questionId = parseInt(req.params.id, 10);
      const question = await storage.getQuestion(questionId);
      
      if (!question) {
        return res.status(404).json({ message: "Frage nicht gefunden" });
      }
      
      const answers = await storage.getAnswersForQuestion(questionId);
      
      res.json({ question, answers });
    } catch (error) {
      console.error("Error fetching question:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/questions", ensureAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.id;
      const validatedData = insertQuestionSchema.parse({
        ...req.body,
        userId
      });
      
      const question = await storage.createQuestion(validatedData);
      res.status(201).json(question);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Ungültige Daten", errors: error.errors });
      }
      console.error("Error creating question:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/questions/:id/answers", ensureAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.id;
      const questionId = parseInt(req.params.id, 10);
      
      const question = await storage.getQuestion(questionId);
      if (!question) {
        return res.status(404).json({ message: "Frage nicht gefunden" });
      }
      
      const validatedData = insertAnswerSchema.parse({
        ...req.body,
        userId,
        questionId
      });
      
      const answer = await storage.createAnswer(validatedData);
      res.status(201).json(answer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Ungültige Daten", errors: error.errors });
      }
      console.error("Error creating answer:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/questions/:id/vote", ensureAuthenticated, async (req, res) => {
    try {
      const questionId = parseInt(req.params.id, 10);
      const { value } = req.body;
      
      if (value !== 1 && value !== -1) {
        return res.status(400).json({ message: "Ungültiger Stimmwert" });
      }
      
      const question = await storage.voteQuestion(questionId, value);
      if (!question) {
        return res.status(404).json({ message: "Frage nicht gefunden" });
      }
      
      res.json(question);
    } catch (error) {
      console.error("Error voting on question:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/answers/:id/vote", ensureAuthenticated, async (req, res) => {
    try {
      const answerId = parseInt(req.params.id, 10);
      const { value } = req.body;
      
      if (value !== 1 && value !== -1) {
        return res.status(400).json({ message: "Ungültiger Stimmwert" });
      }
      
      const answer = await storage.voteAnswer(answerId, value);
      if (!answer) {
        return res.status(404).json({ message: "Antwort nicht gefunden" });
      }
      
      res.json(answer);
    } catch (error) {
      console.error("Error voting on answer:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Course routes
  app.get("/api/courses", async (req, res) => {
    try {
      const courses = await storage.getCourses();
      res.json(courses);
    } catch (error) {
      console.error("Error fetching courses:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/user/courses", ensureAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.id;
      const userCourses = await storage.getUserCourses(userId);
      res.json(userCourses);
    } catch (error) {
      console.error("Error fetching user courses:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/courses/:id/start", ensureAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.id;
      const courseId = parseInt(req.params.id, 10);
      
      const course = await storage.getCourse(courseId);
      if (!course) {
        return res.status(404).json({ message: "Kurs nicht gefunden" });
      }
      
      const validatedData = insertUserCourseSchema.parse({
        userId,
        courseId
      });
      
      const userCourse = await storage.startUserCourse(validatedData);
      res.status(201).json(userCourse);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Ungültige Daten", errors: error.errors });
      }
      console.error("Error starting course:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.put("/api/courses/:id/progress", ensureAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.id;
      const courseId = parseInt(req.params.id, 10);
      const { lessonsCompleted } = req.body;
      
      if (typeof lessonsCompleted !== 'number' || lessonsCompleted < 0) {
        return res.status(400).json({ message: "Ungültige Anzahl von abgeschlossenen Lektionen" });
      }
      
      const userCourse = await storage.updateUserCourseProgress(userId, courseId, lessonsCompleted);
      if (!userCourse) {
        return res.status(404).json({ message: "Kurs nicht gefunden oder nicht gestartet" });
      }
      
      res.json(userCourse);
    } catch (error) {
      console.error("Error updating course progress:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
