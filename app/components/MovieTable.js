"use client";
import { useEffect, useState } from "react";
import MovieForm from "./MovieForm"; //  Import MovieForm

export default function MovieTable() {
  const [movies, setMovies] = useState([]);
  const [editingMovie, setEditingMovie] = useState(null);
  const [updatedMovie, setUpdatedMovie] = useState({
    title: "",
    actors: "",
    year: "",
  });

  // Fetch movies from backend
  const fetchMovies = async () => {
    try {
      const response = await fetch("/api/movies");
      if (!response.ok) throw new Error("Failed to fetch movies");

      const data = await response.json();
      setMovies(data);
    } catch (error) {
      console.error("Error fetching movies:", error);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  const handleDelete = async (movieId) => {
    try {
      const response = await fetch(`/api/movies`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: movieId }),
      });

      if (!response.ok) throw new Error(await response.text());

      setMovies((prevMovies) =>
        prevMovies.filter((movie) => movie._id !== movieId)
      );
      alert("Movie deleted successfully!");
    } catch (error) {
      console.error("Error deleting movie:", error);
      alert("Failed to delete movie.");
    }
  };

  const handleEdit = (movie) => {
    setEditingMovie(movie._id);
    setUpdatedMovie({
      title: movie.title,
      actors: Array.isArray(movie.actors)
        ? movie.actors.join(", ")
        : movie.actors,
      year: movie.year,
    });
  };

  const handleUpdate = async (movieId, updatedMovie) => {
    const currentYear = new Date().getFullYear();
    const movieYear = parseInt(updatedMovie.year, 10);

    if (isNaN(movieYear) || movieYear < 1900 || movieYear > currentYear) {
      alert(`Please enter a valid year between 1900 and ${currentYear}`);
      return;
    }

    const formattedMovie = {
      ...updatedMovie,
      actors: updatedMovie.actors.split(",").map((actor) => actor.trim()),
    };

    try {
      const response = await fetch(`/api/movies`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: movieId, ...formattedMovie }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      alert("Movie updated successfully!");

      setMovies((prevMovies) =>
        prevMovies.map((movie) =>
          movie._id === movieId ? { ...movie, ...formattedMovie } : movie
        )
      );

      setEditingMovie(null);
    } catch (error) {
      console.error("Error updating movie:", error);
      alert("Failed to update movie.");
    }
  };

  //  Inline Styles
  const styles = {
    container: {
      maxWidth: "800px",
      margin: "0 auto",
      fontFamily: "Arial, sans-serif",
    },
    table: {
      width: "100%",
      borderCollapse: "collapse",
      marginTop: "20px",
    },
    th: {
      padding: "12px",
      textAlign: "left",
      borderBottom: "1px solid #ddd",
      backgroundColor: "#007bff",
      color: "white",
    },
    td: {
      padding: "12px",
      textAlign: "left",
      borderBottom: "1px solid #ddd",
    },
    rowEven: {
      backgroundColor: "#f2f2f2",
    },
    button: {
      padding: "8px 12px",
      marginRight: "5px",
      border: "none",
      cursor: "pointer",
      borderRadius: "5px",
    },
    editButton: {
      backgroundColor: "#ffc107",
      color: "black",
    },
    deleteButton: {
      backgroundColor: "#dc3545",
      color: "white",
    },
    editForm: {
      background: "#fff",
      padding: "20px",
      borderRadius: "8px",
      boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
      marginTop: "20px",
    },
    input: {
      width: "calc(100% - 22px)",
      padding: "8px",
      margin: "5px 0",
      border: "1px solid #ccc",
      borderRadius: "5px",
    },
    updateButton: {
      backgroundColor: "#28a745",
      color: "white",
    },
    cancelButton: {
      backgroundColor: "#6c757d",
      color: "white",
    },
  };

  return (
    <div style={styles.container}>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Title</th>
            <th style={styles.th}>Actors</th>
            <th style={styles.th}>Release Year</th>
            <th style={styles.th}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {movies.map((movie, index) => (
            <tr key={movie._id} style={index % 2 === 0 ? styles.rowEven : {}}>
              <td style={styles.td}>{movie.title}</td>
              <td style={styles.td}>
                {Array.isArray(movie.actors)
                  ? movie.actors.join(", ")
                  : movie.actors}
              </td>
              <td style={styles.td}>{movie.year}</td>
              <td style={styles.td}>
                <button
                  style={{ ...styles.button, ...styles.editButton }}
                  onClick={() => handleEdit(movie)}
                >
                  Edit
                </button>
                <button
                  style={{ ...styles.button, ...styles.deleteButton }}
                  onClick={() => handleDelete(movie._id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {editingMovie && (
        <div style={styles.editForm}>
          <h3>Edit Movie</h3>
          <input
            type="text"
            placeholder="Title"
            style={styles.input}
            value={updatedMovie.title}
            onChange={(e) =>
              setUpdatedMovie({ ...updatedMovie, title: e.target.value })
            }
          />
          <input
            type="text"
            placeholder="Actors (comma separated)"
            style={styles.input}
            value={updatedMovie.actors}
            onChange={(e) =>
              setUpdatedMovie({ ...updatedMovie, actors: e.target.value })
            }
          />
          <input
            type="number"
            placeholder="Year"
            style={styles.input}
            value={updatedMovie.year}
            onChange={(e) =>
              setUpdatedMovie({ ...updatedMovie, year: e.target.value })
            }
          />
          <button
            style={{ ...styles.button, ...styles.updateButton }}
            onClick={() => handleUpdate(editingMovie, updatedMovie)}
          >
            Update
          </button>
          <button
            style={{ ...styles.button, ...styles.cancelButton }}
            onClick={() => setEditingMovie(null)}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
