import express from "express";
import {
  addAppointment,
  getAllAppointments,
  getAppointmentById,
  editAppointment,
  deleteAppoinment,
  statusAppoinment,
} from "../controller/AppointmentsController.js";
import { token } from "../utils/Token.js";

const router = express.Router();

router.post("/add",token, addAppointment); // add appointment
router.get("/getAll",token, getAllAppointments); // list with pagination
router.get("/detail",token, getAppointmentById); // get by id via query ?id=
router.put("/edit",token, editAppointment); // edit via query ?id=
router.delete("/delete",token, deleteAppoinment); // edit via query ?id=
router.put("/statusAppoinment",token,statusAppoinment)
export const appointmentsRoute = router;
