import express from "express";
import bodyParser from "body-parser";
import pg from "pg"


const app = express();
const port = 3000;

const db = new pg.Client({
  user:"postgres",
  host:"localhost",
  database:"world",
  password:"post123",
  port:5432,
})
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

async function visited_country(){
  const result =await db.query("SELECT country_code FROM visited_countries")
  let country =[];
  result.rows.forEach((code)=>{
    country.push(code.country_code);
  });
  return country
}
app.get("/", async (req, res) => {
const country =await visited_country();
res.render("index.ejs",{countries:country,total:country.length})


});

app.post("/add", async (req,res)=>{
  const country_name =String(req.body.country) ;
  console.log(country_name);
  try{
      let code = await db.query(`SELECT country_code FROM countries WHERE LOWER(country_name) LIKE '%'||'${country_name}'||'%';`);
    
      const c_code =code.rows[0].country_code
     try {
       await db.query(" INSERT INTO visited_countries (country_code) VALUES ($1)",[c_code])
       res.redirect("/")
     } catch (err) {
      let country=visited_country();
        res.render("index.ejs",{
          countries:country,
          total: country.length, 
          error:"country already exist"})

     }  
  }catch(err){
    let country=visited_country();
        res.render("index.ejs",{
          countries:country,
          total: (await country).length, 
          error:"Country does not exist"})

  }
   
})



app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});