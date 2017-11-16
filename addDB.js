const mysql = require('mysql');
const xlsx = require('xlsx');

let studentsInfo = xlsx.readFile('Test.xlsx');
let InfoWorksheet = studentsInfo.Sheets['Sheet1'];
let TableName = InfoWorksheet['C2'].v;
let ColumnName = InfoWorksheet['C3'].v;
let WHERE = InfoWorksheet['C4'].v;
let TotalNumber = InfoWorksheet['C5'].v;
let InsertOrUpdate = InfoWorksheet['C6'].v;
let sql = ""

let pool = mysql.createPool({
    connectionLimit: 500,
    user: "root",
    password: "510S!Dea", // TODO change temporary password
    database: "SAC"
});

pool.getConnection(function(err, con){
    if (InsertOrUpdate === "UPDATE"){
        for (let i=0; i<TotalNumber; i++){
            let num = 8 + i;
            //console.log(num);
            sql = "UPDATE " + TableName + " SET Stu_pass = '" + InfoWorksheet["D" + num].v + "', Card_ID = '" + InfoWorksheet["E" + num].v + "' WHERE " + WHERE + " = '" + InfoWorksheet["C" + num].v + "'";
            con.query(sql, function(err, result){
                if(err){
                    console.log(err);
                }
            });
            console.log(sql);
        }
    }else{
        for(let i=0;i<TotalNumber; i++){
            let num = 8 + i;
            sql = "INSERT INTO " + TableName + " (" + ColumnName + ") VALUES ('" + InfoWorksheet["C" + num].v + "', " + InfoWorksheet["D" + num].v + ")" ;
            con.query(sql, function(err, result){
                if(err){
                    console.log(err);
                }
            });
            console.log(sql);
        }

    }
});
