import type { Prisma } from '@prisma/client';
import prisma from '..';

export const donationHistoryController = {
	getDonationHistory: async (filter: Prisma.Donation_HistoryWhereUniqueInput) => {
		const res = await prisma.donation_History.findUnique({
			where: filter,
			include: {
				Resevation: {
					include: {
						Reservation_Slot: {
							include: {
								Place: true
							}
						}
					}
				}
			}
		});
		return res;
	}
};
