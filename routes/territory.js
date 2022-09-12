import express from "express";
import { isLoggedIn } from "../helpers.js";
import {
    createTerritory,
    deleteTerritory,
    editTerritory,
    renderListOfAllTerritories,
    renderListOfAvailableTerritories,
    renderNewTerritoryForm,
    renderTerritoryEditForm,
    renderTerritoryHistory,
    searchAllTerritories,
    searchAvailableTerritories,
} from "../controllers/territory.js";

const router = express.Router({ mergeParams: true });

router.get("/", isLoggedIn, renderListOfAllTerritories);
router.get("/available", isLoggedIn, renderListOfAvailableTerritories);
router.get("/new", isLoggedIn, renderNewTerritoryForm);
router.get("/search", isLoggedIn, searchAllTerritories);
router.get("/:territory_id/edit", isLoggedIn, renderTerritoryEditForm);
router.get("/:territory_id", isLoggedIn, renderTerritoryHistory);
router.get("/:territory_id/delete", isLoggedIn, deleteTerritory);
router.get("/available/search", isLoggedIn, searchAvailableTerritories);

router.post("/", isLoggedIn, createTerritory);

router.put("/:territory_id", isLoggedIn, editTerritory);

export default router;
