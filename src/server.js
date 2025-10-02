import express from "express";
import { ENV } from "./config/env.js";
import { db } from "./config/db.js";
import { favoritesTable } from "./db/schema.js";

const app = express();
const PORT = ENV.PORT || 8001;

//extracts user details from the request body
app.use(express.json());

// Health check endpoint
app.get("/api/health", (res, req) => {
  res.statusCode(200).json({ success: true });
});

// Add recipe
app.post("/api/favorites", async (req, res) => {
  try {
    const { userId, recipeId, title, image, cookTime, servings } = req.body;
    if (!userId || !recipeId || !title) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const newFavorite = await db
      .insert(favoritesTable)
      .values({
        userId,
        recipeId,
        title,
        image,
        cookTime,
        servings,
      })
      .returning();

    res.status(201).json(newFavorite[0]);
  } catch (error) {
    console.log("Error adding favorite:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//Delete a favorite recipe
app.delete("/api/favorites/:userId/:recipeId", async (req, res) => {
  try {
    const { userId, recipeId } = req.params;

    await db
      .delete(favoritesTable)
      .where(
        and(
          eq(favoritesTable.userId, userId),
          eq(favoritesTable.recipeId, parseInt(recipeId))
        )
      );

    res.status(200).json({ message: "Recipe removed from favorites" });
  } catch (error) {
    console.log("Error removing from favorite:", error);
    res.status(500).json({ error: "Something went wrong!" });
  }
});

//Get favorites recipe for user
app.get("/api/favorites/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const userFavorites = await db
      .select()
      .from(favoritesTable)
      .where(eq(favoritesTable.userId, userId));

    res.status(200).json(userFavorites);
  } catch (error) {
    console.log("Error getting favorites:", error);
  }
});

app.listen(PORT, () => {
  console.log("Server is running on 5001", PORT);
});
