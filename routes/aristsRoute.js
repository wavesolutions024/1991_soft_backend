import express from "express";
import { addArtist, getAllArtists } from "../controller/ArtistsController.js";
import { token, verifyRole } from "../utils/Token.js";

export const artistsRoute = express.Router();

artistsRoute.post("/add", token, verifyRole, addArtist);
artistsRoute.get("/getAllArtists", token, verifyRole, getAllArtists);
