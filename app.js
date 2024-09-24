import express from "express";
import { PrismaClient, Prisma } from "@prisma/client";
import { assert } from "superstruct";
import {
  CreateProduct,
  PatchProduct,
  CreateArticle,
  PatchArticle,
} from "./structs.js";
import * as dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const prisma = new PrismaClient();
const app = express();

const corsOptions = {
  origin: ["http://localhost:3000", "https://react-sprint.netlify.app/"],
  methods: ["GET", "POST", "PUT", "DELETE"],
};

app.use(cors(corsOptions));
app.use(express.json());

function asyncHandler(handler) {
  return async function (req, res) {
    try {
      await handler(req, res);
    } catch (e) {
      if (
        e.name === "StructError" ||
        e instanceof Prisma.PrismaClientValidationError
      ) {
        res.status(400).send({ message: e.message });
      } else if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === "P2025"
      ) {
        res.sendStatus(404);
      } else {
        res.status(500).send({ message: e.message });
      }
    }
  };
}

// product
app.post(
  "/products",
  asyncHandler(async (req, res) => {
    assert(req.body, CreateProduct);
    const product = await prisma.product.create({
      data: req.body,
    });
    res.status(201).send(product);
  })
);

app.get(
  "/products/:id",
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const product = await prisma.product.findUniqueOrThrow({
      where: { id },
    });

    res.send(product);
  })
);

app.patch(
  "/products/:id",
  asyncHandler(async (req, res) => {
    assert(req.body, PatchProduct);
    const { id } = req.params;
    const product = await prisma.product.update({
      where: { id },
      data: req.body,
    });
    res.send(product);
  })
);

app.delete(
  "/products/:id",
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    await prisma.product.delete({
      where: { id },
    });
    res.sendStatus(204);
  })
);

app.get(
  "/products",
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, sort = "recent", search = "" } = req.query;
    const skip = (page - 1) * limit;
    const sortOption = { createdAt: sort === "recent" ? "desc" : "asc" };

    const products = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ],
      },
      orderBy: sortOption,
      skip: skip,
      take: parseInt(limit),
    });

    res.send(products);
  })
);

// article
app.post(
  "/articles",
  asyncHandler(async (req, res) => {
    assert(req.body, CreateArticle);
    const article = await prisma.article.create({
      data: req.body,
    });
    res.status(201).send(article);
  })
);

app.get(
  "/articles/:id",
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const article = await prisma.article.findUniqueOrThrow({
      where: { id },
    });

    res.send(article);
  })
);

app.patch(
  "/articles/:id",
  asyncHandler(async (req, res) => {
    assert(req.body, PatchArticle);
    const { id } = req.params;
    const article = await prisma.article.update({
      where: { id },
      data: req.body,
    });
    res.send(article);
  })
);

app.delete(
  "/articles/:id",
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    await prisma.article.delete({
      where: { id },
    });
    res.sendStatus(204);
  })
);

app.get(
  "/articles",
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, sort = "recent", search = "" } = req.query;
    const skip = (page - 1) * limit;
    const sortOption = { createdAt: sort === "recent" ? "desc" : "asc" };

    const articles = await prisma.article.findMany({
      where: {
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { content: { contains: search, mode: "insensitive" } },
        ],
      },
      orderBy: sortOption,
      skip: skip,
      take: parseInt(limit),
    });

    res.send(articles);
  })
);

app.listen(process.env.PORT || 5000, () => console.log("server start"));