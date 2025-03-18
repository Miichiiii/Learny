import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";
import { format } from "date-fns";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

// Update user streak on login
async function updateUserStreak(user: SelectUser) {
  const now = new Date();
  const lastLogin = new Date(user.lastLoginDate);
  
  // Reset date components for day comparison
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const lastLoginDay = new Date(lastLogin.getFullYear(), lastLogin.getMonth(), lastLogin.getDate());
  
  const msDiff = today.getTime() - lastLoginDay.getTime();
  const daysDiff = msDiff / (1000 * 60 * 60 * 24);
  
  let updatedUser = user;
  
  // If last login was yesterday, increment streak
  if (daysDiff === 1) {
    updatedUser = await storage.updateUser(user.id, { 
      streak: user.streak + 1,
      lastLoginDate: now
    }) as SelectUser;
    
    // Check for streak badge
    if (updatedUser.streak === 7) {
      const streakBadge = (await storage.getBadges()).find(b => 
        b.requirement === "streak" && b.requiredAmount === 7
      );
      
      if (streakBadge) {
        await storage.awardUserBadge(user.id, streakBadge.id);
      }
      
      // Create streak activity
      await storage.createActivity({
        userId: user.id,
        type: "streak_milestone",
        description: "Du hast eine 7-Tage Serie erreicht!",
        pointsAwarded: 0,
        metadata: { streakDays: 7 }
      });
    }
  } 
  // If it's the same day, don't update streak
  else if (daysDiff === 0) {
    updatedUser = await storage.updateUser(user.id, { 
      lastLoginDate: now 
    }) as SelectUser;
  }
  // If it's been more than a day, reset streak
  else {
    updatedUser = await storage.updateUser(user.id, { 
      streak: 1,
      lastLoginDate: now
    }) as SelectUser;
  }
  
  return updatedUser;
}

// Check and update user level based on points
async function checkAndUpdateLevel(user: SelectUser) {
  // Calculate level based on points (simple formula)
  const pointsPerLevel = 500;
  const calculatedLevel = Math.floor(user.points / pointsPerLevel) + 1;
  
  if (calculatedLevel > user.level) {
    // Level up!
    const updatedUser = await storage.updateUser(user.id, { level: calculatedLevel }) as SelectUser;
    
    // Create level up activity
    await storage.createActivity({
      userId: user.id,
      type: "level_up",
      description: `Du bist auf Level ${calculatedLevel} aufgestiegen!`,
      pointsAwarded: 0,
      metadata: { newLevel: calculatedLevel, oldLevel: user.level }
    });
    
    // Check for level badge
    if (calculatedLevel >= 20) {
      const levelBadge = (await storage.getBadges()).find(b => 
        b.requirement === "level" && b.requiredAmount === 20
      );
      
      if (levelBadge) {
        await storage.awardUserBadge(user.id, levelBadge.id);
      }
    }
    
    return updatedUser;
  }
  
  return user;
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "finance-learning-platform-secret",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false);
        } else {
          // Update streak and check levels on login
          let updatedUser = await updateUserStreak(user);
          updatedUser = await checkAndUpdateLevel(updatedUser);
          
          return done(null, updatedUser);
        }
      } catch (err) {
        return done(err);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).send("Benutzername und Passwort sind erforderlich");
      }
      
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).send("Benutzername existiert bereits");
      }

      const user = await storage.createUser({
        username,
        password: await hashPassword(password),
      });

      // Create first activity for new user
      await storage.createActivity({
        userId: user.id,
        type: "account_created",
        description: "Willkommen bei FinanzWissen! Dein Konto wurde erstellt.",
        pointsAwarded: 0,
        metadata: {}
      });

      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json(user);
      });
    } catch (err) {
      next(err);
    }
  });

  app.post("/api/login", passport.authenticate("local"), (req, res) => {
    res.status(200).json(req.user);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    res.json(req.user);
  });
  
  // Helper API to get user's level details
  app.get("/api/user/level-details", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const user = req.user;
    const pointsPerLevel = 500;
    const currentLevelPoints = (user.level - 1) * pointsPerLevel;
    const nextLevelPoints = user.level * pointsPerLevel;
    const levelProgress = user.points - currentLevelPoints;
    const pointsToNextLevel = nextLevelPoints - user.points;
    
    res.json({
      level: user.level,
      nextLevel: user.level + 1,
      levelProgress,
      levelCap: pointsPerLevel,
      pointsToNextLevel,
      totalPoints: user.points
    });
  });
}
