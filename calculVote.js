const mysql = require('mysql');
let pool = mysql.createPool({
    connectionLimit: 500,
    user: "root",
    password: "510S!Dea", // TODO change temporary password
    database: "SAC"
});

pool.getConnection(function(err, con){
    for(let i=1; i<5; i++){
        let sql = "SELECT * FROM betnvote WHERE Round" + i + " = 'A'";
        let A = 0;
        con.query(sql, function(err, result){
            if(err){
                console.log(err);
            }else{
                A = result.length;
                console.log("Round" + i + " - A : " + A);
            }
        })
        sql = "SELECT * FROM betnvote WHERE Round" + i + " = 'B'";
        let B = 0;
        con.query(sql, function(err, result){
            if(err){
                console.log(err);
            }else{
                B = result.length;
                console.log("Round" + i + " - B : " + B);
            }
        })
    }
    let finalVote = [0, 0, 0, 0, 0, 0, 0, 0];
    for (let i=1; i<8; i++){
        let sql = "SELECT * FROM betnvote WHERE Round5 = '" + i + "'";
        con.query(sql, function(err, result){
            if(err){
                console.log(err);
            }else{
                finalVote[i] = result.length;
                if(i === 7)
                    console.log(finalVote);
            }
        })
    }
});