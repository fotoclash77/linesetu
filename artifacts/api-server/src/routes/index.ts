import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import doctorsRouter from "./doctors.js";
import tokensRouter from "./tokens.js";
import queuesRouter from "./queues.js";
import patientsRouter from "./patients.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use(doctorsRouter);
router.use(tokensRouter);
router.use(queuesRouter);
router.use(patientsRouter);

export default router;
