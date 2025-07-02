import prisma from "../prisma/client";

export const getAllContacts = async () => {
  return prisma.contact.findMany();
};
