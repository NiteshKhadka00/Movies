"use client";
import { useState } from "react";

export default function MovieForm({ refreshMovies }) {
  const [newMovie, setNewMovie] = useState({ title: "", actors: "", year: "" });

  function handleInputChange(e) {
    const { name, value } = e.target;
    setNewMovie((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const currentYear = new Date().getFullYear();
    const movieYear = parseInt(newMovie.year, 10);

    if (
      !newMovie.year ||
      isNaN(movieYear) ||
      movieYear < 1900 ||
      movieYear > currentYear
    ) {
      alert(`Please enter a valid year between 1900 and ${currentYear}`);
      return;
    }

    const actorsArray = newMovie.actors.split(",").map((actor) => actor.trim());
    const movieWithActorsArray = { ...newMovie, actors: actorsArray };

    try {
      const response = await fetch("/api/movies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(movieWithActorsArray),
      });

      if (response.ok) {
        setNewMovie({ title: "", actors: "", year: "" });
        alert("Movie added successfully!");
        window.location.reload(); // Refresh the page to show the new movie
      } else {
        const errorMessage = await response.text();
        console.error("Error adding movie:", errorMessage);
        alert("Failed to add movie.");
      }
    } catch (error) {
      console.error("Error during fetch:", error);
      alert("An error occurred. Check the console for details.");
    }
  }

  //  Inline Styles for better design
  const styles = {
    formContainer: {
      maxWidth: "700px",
      margin: "20px auto",
      padding: "40px",
      background: "#ffffff",
      borderRadius: "8px",
      boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
      textAlign: "center",
    },
    heading: {
      fontSize: "24px",
      color: "#333",
      marginBottom: "15px",
    },
    input: {
      width: "100%",
      padding: "10px",
      marginBottom: "10px",
      border: "1px solid #ccc",
      borderRadius: "5px",
      fontSize: "16px",
    },
    button: {
      width: "100%",
      padding: "10px",
      backgroundColor: "#007bff",
      color: "white",
      fontSize: "16px",
      border: "none",
      borderRadius: "5px",
      cursor: "pointer",
      marginTop: "10px",
    },
    buttonHover: {
      backgroundColor: "#0056b3",
    },
  };

  return (
    <div style={styles.formContainer}>
      <h2 style={styles.heading}>Add a Movie</h2>
      <form onSubmit={handleSubmit}>
        <input
          name="title"
          placeholder="Movie Title"
          style={styles.input}
          value={newMovie.title}
          onChange={handleInputChange}
          required
        />
        <input
          name="actors"
          placeholder="Actors (comma separated)"
          style={styles.input}
          value={newMovie.actors}
          onChange={handleInputChange}
          required
        />
        <input
          type="number"
          name="year"
          placeholder="Release Year"
          style={styles.input}
          value={newMovie.year}
          onChange={handleInputChange}
          required
        />
        <button type="submit" style={styles.button}>
          Add Movie
        </button>
      </form>
    </div>
  );
}
