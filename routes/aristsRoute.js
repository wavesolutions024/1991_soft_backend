import express from "express";
import { addArtist, deleteArtist, editArtist, getAllArtists, getArtistById } from "../controller/ArtistsController.js";
import { token, verifyRole } from "../utils/Token.js";

export const artistsRoute = express.Router();

artistsRoute.post("/add", token, verifyRole, addArtist);
artistsRoute.get("/getAllArtists", token, verifyRole, getAllArtists);
artistsRoute.delete("/deleteArtist",  token, verifyRole, deleteArtist);
artistsRoute.get("/getArtistById",token, verifyRole, getArtistById);
artistsRoute.put("/editArtist",token, verifyRole, editArtist)
