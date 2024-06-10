import express, { ErrorRequestHandler } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send('Welcome to the API!'); // Replace this with your desired response
});


// Create a new post
app.post(`/post`, async (req, res) => {
  const { title, content, authorEmail } = req.body;
  try {
    const result = await prisma.post.create({
      data: {
        title,
        content,
        author: {
          connect: { email: authorEmail }, // Associate post with author by email
        },
      },
    });
    res.json(result);
  } catch (error: any) { // Explicitly define the type of error
    res.status(500).json({ error: error.message });
  }
});

// Update view count for a post
app.put("/post/:id/views", async (req, res) => {
  const { id } = req.params;
  try {
    const post = await prisma.post.update({
      where: { id: parseInt(id) },
      data: {
        // Update view count
      },
    });
    res.json(post);
  } catch (error: any) {
    res.status(404).json({ error: `Post with ID ${id} does not exist` });
  }
});

// Publish or unpublish a post
app.put("/publish/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const updatedPost = await prisma.post.update({
      where: { id: parseInt(id) },
      data: {
        // Toggle published field
      },
    });
    res.json(updatedPost);
  } catch (error: any) {
    res.status(404).json({ error: `Post with ID ${id} does not exist` });
  }
});

// Delete a post
app.delete(`/post/:id`, async (req, res) => {
  const { id } = req.params;
  try {
    const post = await prisma.post.delete({
      where: { id: parseInt(id) },
    });
    res.json(post);
  } catch (error: any) {
    res.status(404).json({ error: `Post with ID ${id} does not exist` });
  }
});

// Get all users
app.get("/users", async (req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
});

// Get drafts of a user
app.get("/user/:id/drafts", async (req, res) => {
  const { id } = req.params;
  const drafts = await prisma.post.findMany({
    where: {
      authorId: parseInt(id),
      published: false,
    },
  });
  res.json(drafts);
});

// Get a specific post
app.get(`/post/:id`, async (req, res) => {
  const { id } = req.params;
  const post = await prisma.post.findUnique({
    where: { id: parseInt(id) },
  });
  if (!post) {
    return res.status(404).json({ error: `Post with ID ${id} not found` });
  }
  res.json(post);
});

// Get posts based on search criteria
app.get("/feed", async (req, res) => {
  const { searchString, skip, take, orderBy } = req.query;
  const where = {
    published: true,
    // Add search criteria if searchString is provided
  };
  const posts = await prisma.post.findMany({
    where,
    skip: skip ? parseInt(skip as string) : undefined,
    take: take ? parseInt(take as string) : undefined,
    orderBy: {
      // Specify orderBy based on the parameter
    },
  });
  res.json(posts);
});

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
};

app.use(errorHandler);

const server = app.listen(3001, () =>
  console.log(`
🚀 Server ready at: http://localhost:3001`)
);
