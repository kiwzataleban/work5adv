import express from "express";
import {conn, mysql, queryAsync} from "../dbconn";
export const router = express.Router();

router.get("/", (req, res) => {
    const title = `%${req.query.title}%`;
    const sql = `
        SELECT  movies.mid,
        movies.title AS movie_title,
        movies.plot AS movie_plot,
        movies.rating AS movie_rating,
        movies.year AS movie_year,
        movies.genre AS movie_genre,
        stars.pids AS star_id,
        star.name AS star_name,
        star.Born AS star_born,
        star.bio AS star_bio,
        creators.pidc AS creator_id,
        creator.name AS creator_name,
        creator.Born AS creator_born,
        creator.bio AS creator_bio
        FROM 
            movies , stars , person AS star , creators, person  AS creator 
        WHERE 
            movies.mid = stars.mids
            AND stars.pids = star.pid
            AND movies.mid = creators.midc
            AND creators.pidc = creator.pid
            AND movies.title LIKE ?
    `;
    
    conn.query(sql, [title], (err, results: any[], fields) => {
        if (err) throw err;

        
        const moviesMap = new Map<number, any>();

        results.forEach((row: any) => {
            const movieId = row.mid;

            if (!moviesMap.has(movieId)) {
                moviesMap.set(movieId, {
                    movie_id: row.mid,
                    movie_title: row.movie_title,
                    movies_plot : row.movie_plot,
                    movies_rating : row.movie_rating,
                    movies_year : row.movie_year,
                    movies_genre : row.movie_genre,
                    actors: [],
                    creators: [],
                });
            }

            const movie = moviesMap.get(movieId);

            const star = {
                star_id: row.star_id,
                star_name: row.star_name,
                star_born: row.starr_born,
                star_bio: row.star_bio,
            };

            const creator = {
                creator_id: row.creator_id,
                creator_name: row.creator_name,
                creator_born: row.creator_born,
                creator_bio: row.creator_bio,
            };

            // เพิ่มเช็คว่านักแสดงหรือผู้กำกับซ้ำหรือไม่
            if (!movie.actors.find((a: any) => a.star_id === star.star_id)) {
                movie.actors.push(star);
            }

            if (!movie.creators.find((c: any) => c.creator_id === creator.creator_id)) {
                movie.creators.push(creator);
            }
        });

        const jsonData =  { movie :  Array.from(moviesMap.values())};
        res.json(jsonData);
    });
});



