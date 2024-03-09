import express from "express";
import {conn, mysql, queryAsync} from "../dbconn";
import { MovieGet } from "../model/movie_get";
export const router = express.Router();



router.get("/", (req, res) => {
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
    `;
    
    conn.query(sql,(err: any, results: any[], fields: any) => {
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

router.get("/:moviename",(req,res)=>{
    const moviename = req.params.moviename;
    conn.query('select * from movies where title = ?',[moviename],(err,result,fields)=>{
        if(result && result.length > 0){
            res.json(result);
        }
        else{
            res.json({
                success : false,
                Error : "Incorrect Select Movie."
            });
        }
    });
});

router.post("/insert", (req, res) => {
    let movie: MovieGet = req.body;
    let sql =
      "INSERT INTO `movies`(`title`, `plot`, `rating`, `year`,  `genre`) VALUES (?,?,?,?,?)";
    sql = mysql.format(sql, [
        movie.title,
        movie.plot,
        movie.rating,
        movie.year,
        movie.genre,
    ]);
    conn.query(sql, (err, result) => {
      if (err) throw err;
      res
        .status(201)
        .json({ affected_row: result.affectedRows, last_idx: result.insertId });
    });
  });

  router.post("/insertmax", (req, res) => {
    let movies = req.body; 
    if (!Array.isArray(movies) || movies.length === 0) {
        return res.status(400).json({ error: 'Invalid request body. Expected an array of movies.' });
    }
    for(const movie of movies){
    let sql =
            "INSERT INTO `movies`(`title`, `plot`, `rating`, `year`, `movietime`, `genre`, `poster`) VALUES (?,?,?,?,?,?,?)";
        sql = mysql.format(sql,[
             movie.title,
            movie.plot,
            movie.rating,
            movie.year,
            movie.movietime,
            movie.genre,
            movie.poster,
        ])
        conn.query(sql, (err, result) => {
            if (err) throw err;
            res
            .status(201)
            .json({ affected_rows: result.affectedRows, last_idx: result.insertId });
        });
    }
});

  router.delete("/delete/:movie", async (req, res) => {
    const movie = req.params.movie;
    let movieid : number;
    let sql = mysql.format("select mid from movies where title = ?",[movie])
    let result = await queryAsync(sql);
    const jsonStr =  JSON.stringify(result);
    const jsonobj = JSON.parse(jsonStr);
    const rowData = jsonobj;
    movieid = rowData[0].mid;
    conn.query("delete from movies where mid = ?", [movieid], (err, result) => {
        if (err) throw err;
        res
          .status(200)
          .json({ affected_row: result.affectedRows });
     });
  });

  router.delete("/deletebyid/:id", (req, res) => {
    let id = +req.params.id;
    conn.query("delete from movies where mid = ?", [id], (err, result) => {
       if (err) throw err;
       res
         .status(200)
         .json({ affected_row: result.affectedRows });
    });
  });
  