import { Router } from "express";
import { googleAuth, logout, getProfile, emailSignUp, emailSignIn } from "../controllers/auth.controller.js";
import { authenticateUser } from "../middleware/auth.middleware.js";
import UserService from "../services/user.service.js";

const router = Router();

// Authentication routes
router.post("/google", googleAuth);
router.post("/email/signup", emailSignUp);
router.post("/email/signin", emailSignIn);
router.post("/logout", logout);

// Protected routes
router.get("/profile", authenticateUser, getProfile);
router.get("/profile-picture/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await UserService.getUserById(parseInt(userId));
    
    if (!user || !user.profile_picture) {
      return res.status(404).json({ error: "Profile picture not found" });
    }

    // Proxy the Google profile picture
    const response = await fetch(user.profile_picture);
    if (!response.ok) {
      return res.status(404).json({ error: "Failed to fetch profile picture" });
    }

    const imageBuffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    
    res.set({
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      'Access-Control-Allow-Origin': '*'
    });
    
    res.send(Buffer.from(imageBuffer));
  } catch (error) {
    console.error('Profile picture proxy error:', error);
    res.status(500).json({ error: "Failed to load profile picture" });
  }
});

export default router;