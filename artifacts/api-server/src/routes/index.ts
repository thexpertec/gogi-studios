import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import settingsRouter from "./settings";
import contentImagesRouter from "./contentImages";
import catalogRouter from "./catalog";
import testimonialsRouter from "./testimonials";
import workGalleryRouter from "./workGallery";
import workSectionsRouter from "./workSections";
import staticImagesRouter from "./staticImages";
import logoRouter from "./logo";
import servicesRouter from "./services";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(settingsRouter);
router.use(logoRouter);
router.use(contentImagesRouter);
router.use(catalogRouter);
router.use(servicesRouter);
router.use(testimonialsRouter);
router.use(workGalleryRouter);
router.use(workSectionsRouter);
router.use(staticImagesRouter);

export default router;
