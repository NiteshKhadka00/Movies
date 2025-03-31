import { MongoClient, ObjectId } from "mongodb";
import MovieForm from "./components/MovieForm";
import MovieTable from "./components/MovieTable"; // Import the MovieTable Component

const client = new MongoClient(process.env.MONGODB_URI);

async function getMovies() {
  try {
    await client.connect();
    const db = client.db("moviesDB");
    const movies = await db.collection("movies").find().toArray();

    // Convert ObjectId to string
    return movies.map((movie) => ({
      ...movie,
      _id: movie._id.toString(), // Convert ObjectId to string
    }));
  } catch (error) {
    console.error("Error fetching movies:", error);
    return [];
  } finally {
    client.close();
  }
}

export default async function MoviesPage() {
  const movies = await getMovies(); // Fetch movies from MongoDB on the server side

  return (
    <div>
      <nav style={{ background: "#333", padding: "10px", color: "white" }}>
        <h1>Movie List</h1>
      </nav>

      <main style={{ padding: "20px" }}>
        {/* Movie Form (Client Component) */}
        <MovieForm />

        {/* Movie List Table */}
        <MovieTable movies={movies} />
      </main>

      <footer
        style={{
          background: "#333",
          padding: "10px",
          color: "white",
          marginTop: "20px",
        }}
      >
        <p>SM Cinema | Contact: movies@cinema.com</p>
      </footer>
    </div>
  );
}
