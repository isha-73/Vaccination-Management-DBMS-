import express from 'express';
import connection  from '../connection.cjs';
const router = express.Router();
import dotenv from 'dotenv';
dotenv.config();
import auth from '../services/authentication.cjs';

router.post('/add', auth.authenticateToken, (req, res) => {
    let ben = req.body;
    let query = 'select * from vaccine where Vcode=?'
    connection.query(query, [ben.Vcode], (err, results) => {
     
        if (!err) {
            if (results.length <= 0) {
                let query = 'insert into vaccine(Vcode,Vname,No_of_doses,from_age,to_age,price,availability) values(?,?,?,?,?,?,?)';
                connection.query(query, [ben.Vcode, ben.Vname, ben.No_of_doses, ben.from_age, ben.to_age,ben.price,ben.availability], (err, results) => {
                    if (!err) {
                        return res.status(200).json({ message: "Successfully vaccine has been added." })
                    }
                    else {
                        return res.status(500).json(err)
                    }
                })
            } else {
                return res.status(400).json({ message: "Vaccine already exist." })
            }
        }
    })
})

router.patch('/update',auth.authenticateToken,(req,res,next)=>{
    let benf=req.body;
    let query="update vaccine set Vname=?,No_of_doses=?,from_age=?,To_age=?,price=?,availability=? where Vcode=?"
    connection.query(query,[benf.Vname, benf.No_of_doses, benf.from_age, benf.to_age,benf.price,benf.availability,benf.Vcode],(err,results)=>{
        if(!err){
            if(results.affectedRows==0){
                return res.status(404).json({message:"Vcode doesnot found"});
            }
            return res.status(200).json({message:"Vaccine updated successfully"})

        }
        else return res.status(500).json(err);
    })
})
router.delete('/delete/:id',auth.authenticateToken,(req,res,next)=>{
    const id=req.params.id;
    var query="delete from vaccine where Vcode=?"
    connection.query(query,[id],(err,results)=>{
        if(!err){
            if(results.affectedRows==0){
                return res.status(404).json({message:"Vcode doesnot found"});
            }
            return res.status(200).json({message:"Vaccine deleted successfully"})
        }else return res.status(500).json(err);
    })
})
router.get('/get',(req,res)=>{

    // let user= req.body;
    var query =`select v.Vcode,m.LotNo, v.Vname,m.Manufacturer,v.Availability,m.Manuft_Dt,m.Exp_Dt from 
    vaccine as v join manufacturing as m on v.LotNo=m.LotNo;`;
    connection.query(query,(err,results)=>{
        if(!err){
            return res.status(200).json(results);
        }else return res.status(500).json(err);
    })
})

router.get('/vac/:id',auth.authenticateToken,(req,res)=>{
    let id=req.params.id;
    var query ="select * from vaccine where Vcode=?";
    connection.query(query,[id],(err,results)=>{
        if(!err){
            return res.status(200).json(results);
        }else return res.status(500).json(err);
    })
})

// this will run the procedure which will calculate the age of the benificiary and then will show the vaccines only which are suitable for him/her
router.get('/getvac/:id',auth.authenticateToken,(req,res)=>{
   let vac =req.params.id;
   let query =" call getVac(?)";
   connection.query(query,[vac],(err,results)=>{
    if(!err){
        return res.status(200).json(results[1])
    }else return res.status(500).json(err);
   })
})
router.get('/vacview',(req,res)=>{
    let query= "select * from vacView";
    connection.query(query,(err,results)=>{
        if(!err){
            // console.log(results)
           return res.status(200).json(results)
        }else return res.status(500).json({message:"View can't be loaded"})
    })
})

router.get('/expired',(req,res)=>{
    let query =" call get_expired()";
    connection.query(query,(err,results)=>{
     if(!err){
        // console.log(results[0])
         return res.status(200).json(results[0])
     }else return res.status(500).json(err);
    })
 })
router.get('/zero',(req,res)=>{
    let query=`SELECT vaccine.Vcode, vaccine.Vname, vaccine.LotNo, manufacturing.Manufacturer
    FROM vaccine
    INNER JOIN manufacturing ON vaccine.LotNo = manufacturing.LotNo
    WHERE vaccine.availability = 0;
    `

    connection.query(query,(err,results)=>{
        if(!err){
            return res.status(200).json(results)
        }else return res.status(500).json(err);
       })
})




export default router