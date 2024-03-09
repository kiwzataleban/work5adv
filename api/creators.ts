import  express  from "express";
import { mysql,conn,queryAsync } from "../dbconn";
import { CreatorsGet } from "../model/creators_get";
export const router = express.Router();

router.get("/",(req,res)=>{
    conn.query('select * from creators',(err,result,fields)=>{
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


router.post("/insert", async (req, res) => {
    let creators: CreatorsGet = req.body;
    let pidc : number;
    let sql = mysql.format("select pid from person where name = ?",[creators.personname])
    let result = await queryAsync(sql);
    let jsonStr =  JSON.stringify(result);
    let jsonobj = JSON.parse(jsonStr);
    let rowData = jsonobj;
    pidc = rowData[0].pid;

    let midc : number;
    sql = mysql.format("select mid from movies where title = ?",[creators.moviename])
     result = await queryAsync(sql);
     jsonStr =  JSON.stringify(result);
     jsonobj = JSON.parse(jsonStr);
    rowData = jsonobj;
    midc = rowData[0].mid;


    sql = "INSERT INTO `creators`(`midc`, `pidc`) VALUES (?,?)";
    sql = mysql.format(sql, [
        midc,
        pidc,
    ]);
    conn.query(sql, (err, result) => {
      if (err) throw err;
      res
        .status(201)
        .json({ affected_row: result.affectedRows, last_idx: result.insertId });
    });
  });


  router.delete("/delete/:person/:movie", async (req, res) => {
    const person = req.params.person;
    const movie = req.params.movie;

    let pidc : number;
    let sql = mysql.format("select pid from person where name = ?",[person])
    let result = await queryAsync(sql);
    let jsonStr =  JSON.stringify(result);
    let jsonobj = JSON.parse(jsonStr);
    let rowData = jsonobj;
    pidc = rowData[0].pid;

    let midc : number;
    sql = mysql.format("select mid from movies where title = ?",[movie])
    result = await queryAsync(sql);
    jsonStr =  JSON.stringify(result);
    jsonobj = JSON.parse(jsonStr);
    rowData = jsonobj;
    midc = rowData[0].mid;

    conn.query("delete from creators where midc = ? and pidc = ?", [midc,pidc], (err, result) => {
        if (err) throw err;
        res
          .status(200)
          .json({ affected_row: result.affectedRows });
     });
  });

  router.delete("/deletebyid/:pid/:mid", (req, res) => {
    let pid = +req.params.pid;
    let mid = +req.params.mid;
    conn.query("delete from creators where midc = ? and pidc = ?", [mid,pid], (err, result) => {
       if (err) throw err;
       res
         .status(200)
         .json({ affected_row: result.affectedRows });
    });
  });