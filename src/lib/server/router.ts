import { z } from 'zod';
import { publicProcedure, createRouter } from './context';
import { donatorsRouter } from './routes/donatorsRouter';
import { authRouter } from './routes/authRouter';
import { placesRouter } from './routes/placesRouter';
import { medicalStaffRouter } from './routes/medicalStaffRouter';
import { reservationSlotsRouter } from './routes/reservationSlotsRouter';
import { preFeedBackRouter } from './routes/preFeedBackRouter';
import { rewardRouter } from './routes/rewardRouter';
import { moderatorRoutes } from './routes/moderatorsRoutes';
import { announcementsRouter } from './routes/announcementRouter';
import { reservationsRouter } from './routes/reservationsRouter';

export const appRouter = createRouter({
	greet: publicProcedure
		.input(
			z.object({
				name: z.string()
			})
		)
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		.query(({ ctx, input }) => {
			return `Hello ${input.name}`;
		}),
	donators: donatorsRouter,
	auth: authRouter,
	places: placesRouter,
	medicalStaff: medicalStaffRouter,
	preFeedback: preFeedBackRouter,
	reservationSlot: reservationSlotsRouter,
	reservation: reservationsRouter,
	moderator: moderatorRoutes,
	reward: rewardRouter,
	announcement: announcementsRouter
});

export type AppRouter = typeof appRouter;
