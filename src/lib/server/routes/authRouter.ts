import { createRouter } from '../context';
import { publicProcedure } from '../context';
import { z } from 'zod';
import prisma from '$lib/server/database';
import { TRPCError } from '@trpc/server';
import { sessionController } from '../database/controllers/sessionController';
import { comparePassword } from '$lib/utils';

export const authRouter = createRouter({
	getUser: publicProcedure.query(async ({ ctx }) => {
		const { userContext } = ctx;
		return userContext;
	}),
	logout: publicProcedure.mutation(async ({ ctx }) => {
		console.log(ctx.token);
		await prisma.session.delete({
			where: {
				session_token: ctx.token
			}
		});
		(ctx.session = {}), (ctx.user = {}), (ctx.token = '');
	}),
	donatorLogin: publicProcedure
		.input(
			z.object({
				phone_number: z.string().min(1),
				password: z.string().min(1)
			})
		)
		.mutation(async ({ input, ctx }) => {
			console.log('donatorLogin()');

			// Get phone_number and password from user input
			const { phone_number, password } = input;

			// Get user with phone_number and password correct
			const user = await prisma.donators.findUnique({
				where: {
					phone_number: phone_number
				}
			});

			const isPasswordMatch = await comparePassword(user?.password || '', password);

			if (!user || !isPasswordMatch) {
				throw new TRPCError({
					code: 'UNAUTHORIZED'
				});
			}

			// Create new session for user
			const session = await sessionController.createSessionToken({
				donator: { connect: { id: user.id } }
			});

			if (session.session_token && user) {
				ctx.session = session;
				ctx.user = user;
				ctx.token = session.session_token;
				ctx.opts.resHeaders.append('Set-Cookie', `session-token=${session.session_token}`);
			}

			return { user, session };
		}),
	staffLogin: publicProcedure
		.input(
			z.object({
				email: z.string().email(),
				password: z.string().min(1)
			})
		)
		.mutation(async ({ input, ctx }) => {
			const { email, password } = input;

			let user;
			if (email === 'admin@kmitl.ac.th') {
				user = await prisma.moderators.findFirst({
					where: {
						email: 'admin@kmitl.ac.th'
					}
				});
			} else {
				user = await prisma.medical_Staff.findFirst({
					where: {
						email: email
					}
				});
			}

			console.log('staffLogin() user: ', user);

			const isPasswordMatch = await comparePassword(user?.password || '', password);
			console.log('staffLogin() isPasswordMatch: ', isPasswordMatch);

			if (!user || !isPasswordMatch) {
				throw new TRPCError({
					code: 'UNAUTHORIZED'
				});
			}

			let session;
			if (email === 'admin@kmitl.ac.th') {
				session = await sessionController.createSessionToken({
					moderator: { connect: { id: user.id } }
				});
			} else {
				session = await sessionController.createSessionToken({
					medical_staff: { connect: { id: user.id } }
				});
			}

			if (session.session_token && user) {
				ctx.session = session;
				ctx.user = user;
				ctx.token = session.session_token;
				ctx.opts.resHeaders.append('Set-Cookie', `session-token=${session.session_token}`);
			}

			return { user, session };
		}),
	setAsVerifyUser: publicProcedure.mutation(async ({ ctx }) => {
		const medicalAccount = await prisma.medical_Accounts.update({
			where: {
				id: ctx.userContext?.user.id
			},
			data: {
				account_status: 'VERIFIED',
				is_activated: true
			}
		});
		return medicalAccount;
	})
});