import { Router } from "express";
import prisma from "../prisma/client.js";

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const { search, sort } = req.query;

    const page = Number(req.query.page) || 1;
    const pageSize = 10;
    const skip = (page - 1) * pageSize;
    const take = pageSize;

    const where = search
      ? {
          title: {
            contains: search,
            mode: "insensitive",
          },
        }
      : {};

    const orderBy =
      sort === "oldest"
        ? { createdAt: "asc" }
        : { createdAt: "desc" };

    const [threads, total] = await Promise.all([
      prisma.thread.findMany({
        where,
        skip,
        take,
        orderBy,
        include: {
          author: {
            select: {
              name: true,
              avatarUrl: true,
            },
          },
          _count: {
            select: {
              comments: true,
            },
          },
        },
      }),
      prisma.thread.count({ where }),
    ]);

    const hasMore = total > page * pageSize;

    res.json({ threads, total, hasMore });
  } catch (error) {
    next(error);
  }
});

export default router;