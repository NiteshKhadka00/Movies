import { MongoClient, ObjectId } from "mongodb";

if (!process.env.MONGODB_URI) {
  throw new Error("Missing MONGODB_URI environment variable");
}

const client = new MongoClient(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

let db;

async function connectDb() {
  if (!db) {
    try {
      await client.connect();
      db = client.db("moviesDB");
    } catch (error) {
      console.error("MongoDB Connection Error:", error);
      throw new Error("Failed to connect to MongoDB");
    }
  }
  return db;
}

export async function GET() {
  try {
    const db = await connectDb();
    const collection = db.collection("movies");
    const movies = await collection.find().toArray();

    const moviesWithFixedActors = movies.map((movie) => ({
      ...movie,
      _id: movie._id.toString(),
      actors: Array.isArray(movie.actors) ? movie.actors : [movie.actors],
    }));

    return new Response(JSON.stringify(moviesWithFixedActors), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching movies:", error);
    return new Response(JSON.stringify({ message: "Failed to fetch movies" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function DELETE(req) {
  try {
    const db = await connectDb();
    const collection = db.collection("movies");

    const { id } = await req.json(); // Ensure body is parsed correctly

    if (!id) {
      return new Response(JSON.stringify({ message: "ID is required" }), {
        status: 400,
      });
    }

    const result = await collection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 1) {
      return new Response(
        JSON.stringify({ message: "Movie deleted successfully" }),
        { status: 200 }
      );
    } else {
      return new Response(JSON.stringify({ message: "Movie not found" }), {
        status: 404,
      });
    }
  } catch (error) {
    console.error("Error deleting movie:", error);
    return new Response(JSON.stringify({ message: "Error deleting movie" }), {
      status: 500,
    });
  }
}

export async function PUT(request) {
  try {
    const { id, title, actors, year } = await request.json();

    if (!id || !title || !actors || !year) {
      return new Response("All fields are required.", { status: 400 });
    }

    const updatedMovie = {
      title,
      actors: Array.isArray(actors)
        ? actors
        : actors.split(",").map((actor) => actor.trim()),
      year,
    };

    const db = await connectDb();
    const result = await db
      .collection("movies")
      .updateOne({ _id: new ObjectId(id) }, { $set: updatedMovie });

    if (result.modifiedCount === 1) {
      return new Response("Movie updated successfully", { status: 200 });
    } else {
      return new Response("Movie not found", { status: 404 });
    }
  } catch (error) {
    console.error("Error updating movie:", error);
    return new Response("Error updating movie", { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { title, actors, year } = await request.json();
    const currentYear = new Date().getFullYear();
    const movieYear = parseInt(year, 10);

    if (!title || !actors || !year) {
      return new Response(
        JSON.stringify({ message: "All fields are required." }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (isNaN(movieYear) || movieYear < 1900 || movieYear > currentYear) {
      return new Response(
        JSON.stringify({
          message: `Year must be between 1900 and ${currentYear}`,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const newMovie = {
      title,
      actors: Array.isArray(actors)
        ? actors
        : actors.split(",").map((actor) => actor.trim()),
      year: movieYear,
    };

    const db = await connectDb();
    const result = await db.collection("movies").insertOne(newMovie);

    if (result.acknowledged) {
      return new Response(
        JSON.stringify({ message: "Movie added successfully" }),
        { status: 201 }
      );
    } else {
      return new Response(JSON.stringify({ message: "Failed to add movie" }), {
        status: 500,
      });
    }
  } catch (error) {
    console.error("Error adding movie:", error);
    return new Response(JSON.stringify({ message: "Error adding movie" }), {
      status: 500,
    });
  }
}
