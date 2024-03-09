import express from "express";
import {conn, mysql, queryAsync} from "../dbconn";
import { MovieGet } from "../model/movie_get";
export const router = express.Router();


router.get("/", (req, res) => {
    conn.query('select * from movies', (err, result, fields)=>{
        if (result && result.length > 0) {
            // ส่ง response กลับด้วยข้อมูลผู้ใช้
            res.json(result);
        } else {
            // ถ้าไม่พบผู้ใช้, ส่ง response กลับเป็น { success: false }
            res.json({
                success: false,
            });
        }
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
  