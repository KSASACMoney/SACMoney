let mysql = require('mysql');

let pool = mysql.createPool({
    connectionLimit: 50000,
    user: "root",
    password: "510S!Dea", // TODO change temporary password
    database: "SAC"
});

const ERROR_CODE = {
    Unavailable_ID: 401,
    No_matched_ID: 402,
    Wrong_credentials: 403,
    DB_error: 501
};

module.exports.ERROR_CODE = ERROR_CODE;

// 아이디를 입력하면 그 사람의 잔액을 리턴해 주는 함수
// 카드번호를 입력해도 동일하게 동작한다.
module.exports.checkMoney = function(ID, callback) {
    pool.getConnection(function (err, con) {
        if (err) {
            callback(ERROR_CODE.DB_error, 0);
            console.log(err)
        } else {
            let flag = 0;
            let sql;
            if(ID === undefined){
                con.release();
                callback(ERROR_CODE.DB_error, 0);
            }else{
                if (ID.length === 8)
                    sql = 'SELECT money FROM info WHERE Card_ID = ?';
                else if (ID.length === 6)
                    sql = 'SELECT money From info WHERE Stu_ID = ?';
                else {
                    con.release();
                    callback(ERROR_CODE.Unavailable_ID, 0);
                    flag = 1
                }
                if (flag === 0) {
                    con.query(sql, [ID], function (err, result) {
                        con.release();
                        if (err) {
                            callback(ERROR_CODE.DB_error, 0);
                            console.log(err)
                        } else {
                            if (result.length <= 0) {
                                callback(ERROR_CODE.No_matched_ID, 0)
                            }
                            else {
                                callback(false, result[0].money)
                            }
                        }
                    });
                }
            }

        }
    });
};

// 아이디 / 패스워드를 받으면 로그인 성공 여부를 리턴하는 함수
// 카드번호 / PIN 번호를 받아도 잘 동작한다.
module.exports.checkPassword = function(ID, Pass, callback) {
    pool.getConnection(function (err, con) {
        if (err) {
            callback(ERROR_CODE.DB_error);
            console.log(err);
        } else {
            let flag = 0;
            let sql;
            if (ID.length === 6) {
                sql = 'SELECT * FROM info WHERE Stu_ID = ? AND Stu_Pass = ?';
            } else if (ID.length === 8) {
                sql = 'SELECT * FROM info WHERE Card_ID = ? AND Card_PIN = ?';
            } else {
                con.release();
                callback(ERROR_CODE.Unavailable_ID);
                flag = 1;
            }
            if (flag === 0) {
                con.query(sql, [ID, Pass], function (err, result) {
                    con.release();
                    if (err) {
                        callback(ERROR_CODE.DB_error);
                    } else {
                        if (result.length <= 0) {
                            callback(ERROR_CODE.No_matched_ID);
                        } else {
                            callback(false, true);
                        }
                    }
                })
            }
        }
    });
};

// 아이디를 입력하면 콜백으로 사람 이름을 출력해 주는 함수.
module.exports.getUserName = function(ID, callback){
    pool.getConnection(function(err, con){
        if(err){
            callback(ERROR_CODE.DB_error, '');
            console.log(err);
        }else{
            let flag = 0;
            let sql = "";
            if (ID.length === 6){
                sql = 'SELECT Name FROM info WHERE Stu_ID = ?'
            }else if(ID.length === 8){
                sql = 'SELECT Name FROM info WHERE Card_ID = ?'
            }else {
                con.release();
                callback(ERROR_CODE.Unavailable_ID);
                flag = 1;
            }
            if (flag === 0){
                con.query(sql, [ID], function(err, result){
                    con.release();
                    if(err){
                        callback(ERROR_CODE.DB_error, "");
                    }else{
                        if(result.length <= 0){
                            callback(ERROR_CODE.No_matched_ID);
                        }else{
                            callback(false, result[0].Name);
                        }
                    }
                })
            }
        }
    })
};

module.exports.updateMoney = function(ID, money, callback) {
    pool.getConnection(function (err, con) {
        if (err) {
            callback(ERROR_CODE.DB_error);
            console.log(err);
        } else {
            let flag = 0;
            let sql;
            if (ID.length === 6) {
                sql = 'UPDATE info SET money = ' + money + ' WHERE Stu_ID = ?';
            } else if (ID.length === 8) {
                sql = 'UPDATE info SET money = ' + money + ' WHERE Card_ID = ? ';
            } else {
                con.release();
                callback(ERROR_CODE.Unavailable_ID);
                flag = 1;
            }
            if (flag === 0) {
                con.query(sql, [ID], function (err, result) {
                    con.release();
                    if (err) {
                        callback(ERROR_CODE.DB_error);
                    } else {
                        if (!result.affectedRows) {
                            callback(ERROR_CODE.Wrong_credentials);
                        } else {
                            callback(false);
                        }
                    }
                })
            }
        }
    })
};

module.exports.updateBoothMoney = function(name, money, callback){
    pool.getConnection(function(err, con){
        if(err){
            callback(ERROR_CODE.DB_error);
            console.log(err);
        }else{
            let sql = 'UPDATE info SET Money = ' + money + ' WHERE Name = ?';
            con.query(sql, [name], function(err, result){
                con.release();
                if(err){
                    callback(ERROR_CODE.DB_error);
                }else{
                    if(!result.affectedRows){
                        callback(ERROR_CODE.Wrong_credentials);
                    }else{
                        callback(false);
                    }
                }
            })
        }
    })
};

module.exports.updateCardMoney = function(card, money, callback){
    pool.getConnection(function(err, con){
        if(err){
            callback(ERROR_CODE.DB_error);
            console.log(err);
        }else{
            let sql = 'UPDATE info SET money = ' + money + ' WHERE Card_ID = ?';
            con.query(sql, [card], function(err, result){
                con.release();
                if(err){
                    callback(ERROR_CODE.DB_error);
                }else{
                    if(!result.affectedRows){
                        callback(ERROR_CODE.Wrong_credentials);
                    }else{
                        callback(false);
                    }
                }
            })
        }
    })
};

module.exports.updateCouponMoney = function(Stu_ID, money, callback){
    pool.getConnection(function(err, con){
        if(err){
            callback(ERROR_CODE.DB_error);
            console.log(err);
        }else{
            let sql = 'UPDATE info SET money = ' + money + ' WHERE Stu_ID = ?';
            con.query(sql, [Stu_ID], function(err, result){
                con.release();
                if(err){
                    callback(ERROR_CODE.DB_error);
                }else{
                    if(!result.affectedRows){
                        callback(ERROR_CODE.Wrong_credentials);
                    }else{
                        callback(false);
                    }
                }
            })
        }
    })
};

module.exports.getBoothMoney = function(name, callback){
    pool.getConnection(function(err, con){
        if(err){
            callback(ERROR_CODE.DB_error);
            console.log(err);
        }else{
            let sql = 'SELECT money FROM info WHERE Name = ?';
            con.query(sql, [name], function(err, result){
                con.release();
                if(err){
                    callback(ERROR_CODE.DB_error, 0);
                }else{
                    if(result.length <= 0){
                        callback(ERROR_CODE.Wrong_credentials, 0);
                    }else{
                        callback(false, result[0].money);
                    }
                }
            })
        }
    })
};

// 패스워드 업데이트 함수. OldPassword 가 있는지 먼저 확인 후 NewPassword 로 업데이트 한다.
// OldPassword 가 틀리면 ERROR_CODE.No_matched_ID를 리턴한다.
module.exports.updatePassword = function(ID, OldPassword, NewPassword, callback){
    pool.getConnection(function(err, con){
        if(err){
            callback(ERROR_CODE.DB_error);
            console.log(err);
        }else{
            sql1 = "SELECT Stu_Pass FROM info WHERE Stu_ID = ? and Stu_Pass = ?";
            sql2 = "UPDATE info SET Stu_Pass = '" + NewPassword + "' WHERE Stu_ID = ?";
            con.query(sql1, [ID, OldPassword], function(err, result){
                if(err){
                    callback(ERROR_CODE.DB_error);
                    console.log(err);
                }else{
                    if(result.length <= 0){
                        callback(ERROR_CODE.No_matched_ID);
                    }else{
                        con.query(sql2, [ID], function(err, result){
                            con.release();
                            if(err){
                                callback(ERROR_CODE.DB_error);
                                console.log(err);
                            }else{
                                if(!result.affectedRows){
                                    callback(ERROR_CODE.Wrong_credentials);
                                }else{
                                    callback(false);
                                }
                            }
                        })
                    }
                }
            })
        }
    })
};

module.exports.updatePIN = function(ID, OldPIN, NewPIN, callback){
    pool.getConnection(function(err, con){
        if(err){
            callback(ERROR_CODE.DB_error);
            console.log(err);
        }else{
            sql1 = "SELECT Card_PIN FROM info WHERE Stu_ID = ? and Card_PIN = ?";
            sql2 = "UPDATE info SET Card_PIN = '" + NewPIN + "' WHERE Stu_ID = ?";
            con.query(sql1, [ID, OldPIN], function(err, result){
                if(err){
                    callback(ERROR_CODE.DB_error);
                    console.log(err);
                }else{
                    if(result.length <= 0){
                        callback(ERROR_CODE.No_matched_ID);
                    }else{
                        con.query(sql2, [ID], function(err, result){
                            con.release();
                            if(err){
                                callback(ERROR_CODE.DB_error);
                                console.log(err);
                            }else{
                                if(!result.affectedRows){
                                    callback(ERROR_CODE.Wrong_credentials);
                                }else{
                                    callback(false);
                                }
                            }
                        })
                    }
                }
            })
        }
    })
};

// 베팅 전 중복 여부를 체크하여 베팅 가능 여부를 리턴하는 함수, Callback 부분으로는 True / false 값이 전달된다.
// True 일 경우 songBetting()을 실행시켜도 무방하다.
module.exports.songBettingCheck = function(ID, callback){
    pool.getConnection(function(err, con){
        if(err){
            callback(ERROR_CODE.DB_error);
            console.log(err);
        }else{
            console.log(ID);
            let sql = "SELECT Betting FROM betnvote WHERE Stu_ID = ?"
            con.query(sql, [ID], function(err, result){
                con.release();
                if(err){
                    callback(ERROR_CODE.DB_error);
                    console.log(err);
                }else{
                    //console.log(result[0].Betting);
                    if(result.length <= 0 || result[0].Betting === ''){
                        console.log(true);
                        callback(true);
                    }else{
                        console.log(false);
                        callback(false);
                    }
                }
            })
        }
    })
};

// 베팅하는 함수. Callback 부분으로는 error code 가 전달된다.
// 이 함수를 쓰기 전 중복 체크 함수 songBettingCheck()를 먼저 돌려야 한다.
// 이 함수의 콜백값이 false 인 경우 해당 아이디의 잔액을 차감해야 한다.
module.exports.songBetting = function(ID, TeamName, Money, callback){
    pool.getConnection(function(err, con){
        if(err){
            callback(ERROR_CODE.DB_error);
            console.log(err);
        }else{
            let flag = 0;
            let sql = 'SELECT * FROM betnvote WHERE Stu_ID = ?';
            //let sql = 'INSERT INTO SONG_BETTING (Stu_ID, Team, Winner, Money) VALUES ?';
            //let values = [[ID, Team, Winner, Money]];
            con.query(sql, [ID], function(err, result){
                if(err) {
                    con.release();
                    callback(ERROR_CODE.DB_error);
                }else if(result.length <= 0){
                    sql = "INSERT INTO betnvote (Stu_ID, Betting, BetMoney) VALUES ?";
                    let values = [[ID, TeamName, Money]];
                    con.query(sql, [values], function(err2, result2){
                        con.release();
                        if(err2){
                            console.log(err2);
                            callback(ERROR_CODE.DB_error);
                        }else{
                            if(!result2.affectedRows){
                                callback(ERROR_CODE.Wrong_credentials);
                            }else{
                                callback(false);
                            }
                        }
                    })
                }else{
                    sql = "UPDATE betnvote SET Betting = ?, BetMoney = ? WHERE Stu_ID = ? ";
                    let values = [TeamName, Money, ID];
                    con.query(sql, values, function(err2, result){
                        con.release();
                        if(err2){
                            callback(ERROR_CODE.DB_error);
                        }else{
                            if(!result2.affectedRows){
                                callback(ERROR_CODE.Wrong_credentials);
                            }else{
                                callback(false);
                            }
                        }
                    })
                }
            })
        }
    })
};


// 가요제 투표 함수 songVoting()을 실행하기 전 중복 투표 여부를 체크하여 투표 가능 여부를 리턴하는 함수이다.
// 콜백 값으로 1 / false 가 리턴된다.
// 이 함수가 실행된 후 1이 리턴되었으면 songVoting()을 실행시켜도 무방하다.
module.exports.songVotingCheck = function(ID, Round, callback){
    pool.getConnection(function(err, con){
        if(err){
            callback(ERROR_CODE.DB_error, false);
            console.log(err);
        }else{
            let sql = 'SELECT Round FROM betnvote WHERE Stu_id = ?';
            con.query(sql, [ID], function(err, result){
                con.release();
                if(err){
                    callback(ERROR_CODE.DB_error, false);
                }else{
                    if (result.length <= 0 || result[0].Round <= Round -1){
                        callback(false, true); //해당 라운드 투표 가능
                    }else{
                        callback(false, false); //해당 라운드 투표 불가능
                    }
                }
            })
        }
    })
};

// 가요제 투표 결과를 DB에 저장하는 함수.
// Callback 값으로는 Error code 가 리턴된다.
module.exports.songVoting = function(ID, RT, callback){
    pool.getConnection(function(err, con){
        if(err){
            callback(ERROR_CODE.DB_error);
            console.log(err);
        }else{
            let Round = RT[1];
            let Team;
            if(RT[3] === "1"){
                Team = "A";
            }else if(RT[3] === "2"){
                Team = "B";
            }
            console.log("Team: " + Team, "RT[3]: " + RT[3]);

            let sql = 'SELECT Round FROM betnvote WHERE Stu_id = ?';
            con.query(sql, [ID], function(err, result){
                if(err){
                    con.release();
                    console.log(err);
                    callback(ERROR_CODE.DB_error);
                }else{
                    if(result.length <= 0){
                        if(Round < 5){
                            sql = 'INSERT INTO betnvote (Stu_ID, Round, Round' + Round + ') VALUES ?';
                            let values = [[ID, RT[1] * 1, Team]];
                            con.query(sql, [values], function(err2, result){
                                con.release();
                                if(err2){
                                    console.log(err2);
                                    callback(ERROR_CODE.DB_error);
                                }else{
                                    if(!result.affectedRows){
                                        callback(ERROR_CODE.Wrong_credentials);
                                    }else{
                                        callback(false);
                                    }
                                }
                            })
                        }else{
                            sql = 'INSERT INTO betnvote (Stu_ID, Round, Round' + Round + ') VALUES ?';
                            let values = [[ID, RT[1]*1, RT[3]]];
                            con.query(sql, [values], function(err2, result){
                                con.release();
                                if(err2){
                                    console.log(err2);
                                    callback(ERROR_CODE.DB_error);
                                }else{
                                    if(!result.affectedRows){
                                        callback(ERROR_CODE.Wrong_credentials);
                                    }else{
                                        callback(false);
                                    }
                                }
                            })
                        }
                    }else{
                        if(Round < 5){
                            sql = 'UPDATE betnvote SET Round = ?, Round' + Round + ' = ? WHERE Stu_ID = ?';
                            console.log(sql);
                            con.query(sql, [RT[1]*1, Team, ID], function(err2, result){
                                con.release();
                                if(err2){
                                    console.log(err2);
                                    callback(ERROR_CODE.DB_error);
                                }else{
                                    console.log(result);
                                    if(!result.affectedRows){
                                        callback(ERROR_CODE.Wrong_credentials);
                                    }else{
                                        callback(false);
                                    }
                                }
                            })
                        }else{
                            sql = 'UPDATE betnvote SET Round = ?, Round' + Round + ' = ? WHERE Stu_ID = ?';
                            con.query(sql, [RT[1]*1, RT[3], ID], function(err2, result){
                                con.release();
                                if(err2){
                                    console.log(err2);
                                    callback(ERROR_CODE.DB_error);
                                }else{
                                    console.log(result);
                                    if(!result.affectedRows){
                                        callback(ERROR_CODE.Wrong_credentials);
                                    }else{
                                        callback(false);
                                    }
                                }
                            })
                        }
                    }
                }
            })
        }
    })
};

// 가요제 팀 이름 리스트를 불러오는 함수
// round가 0이면 청청청청청백백백백백
// 양수면 청백
module.exports.songTeams = function(round, callback){
    pool.getConnection(function(err, con){
        if(err){
            callback(ERROR_CODE.DB_error);
            console.log(err);
        }else{
            let S = ""
            if(round==0){
                let sql = `SELECT TeamName FROM songfes WHERE BW = ?`
                con.query(sql, ["A"], function(err, result_B){
                    if(err) callback(ERROR_CODE.DB_error)
                    else{
                        result_B.forEach(function(elem) {
                            S += `\n${elem.TeamName}`
                        });
                        con.query(sql, ["B"], function(err, result_W){
                            con.release()
                            if(err) callback(ERROR_CODE.DB_error)
                            else{
                                result_W.forEach(function(elem) {
                                    S += `\n${elem.TeamName}`
                                });
                                callback(false, S)
                            }
                        })
                    }
                })
            }else{
                let sql = `SELECT TeamName FROM songfes WHERE Round = ?`
                con.query(sql, [`${round}`], function(err, result){
                    con.release()
                    result.forEach(function(elem) {
                        S += `\n${elem.TeamName}`
                    })
                    callback(false, S)
                })
            }
        }
    })
}

// 현재 경매에서 가장 높은 금액을 부른 사람과 금액을 콜백으로 리턴한다.
// 처음 시작인 경우에는 '' 과 false 값이 리턴된다.
// setAuction 함수를 부르기 전에 먼저 이 함수를 불러서 적합성을 판정해야 한다.
module.exports.getAuction = function(callback){
    pool.getConnection(function(err, con){
        if(err){
            callback(ERROR_CODE.DB_error, ['', 0]);
            console.log(err);
        }else{
            let sql = "SELECT * FROM AUCTION";
            con.query(sql, function(err, result){
                con.release();
                if(err){
                    callback(ERROR_CODE.DB_error, ['', 0]);
                }else{
                    if(result.length <= 0){
                        callback(false, ['', 0]);
                    }else{
                        callback(false, [result[0].Stu_ID, result[0].Money]);
                    }
                }
            })
        }
    })
};


// 이전에 가장 높은 금액을 부른 사람과 현재 최고가를 부른 사람의 아이디와 돈을 인풋으로 받는다.
// 처음 시작인 경우에는 last_ID에 '' 값을 넣어주면 된다.
// 이전 거 삭제하고 새로 쓰는 함수. 뭔가 좀 더 효율적인 방법이 생각나면 새로 쓰는 것을 권장한다.
module.exports.setAuction = function(last_ID, ID, Money, callback){
    pool.getConnection(function(err, con){
        if(err){
            callback(ERROR_CODE.DB_error);
            console.log(err);
        }else{
            if (last_ID !== ""){
                let sql = "DELETE FROM AUCTION WHERE Stu_ID = '" + last_ID + "'";
                let sql2 = "INSERT INTO AUCTION (Stu_ID, Money) VALUES ?";
                let values = [[ID, Money]];
                con.query(sql, function(err, result){
                    if(err){
                        con.release();
                        callback(ERROR_CODE.DB_error);
                    }else{
                        con.query(sql2, [values], function(err2, result2){
                            con.release();
                            if(err) {
                                callback(ERROR_CODE.DB_error);
                            }else{
                                if(!result2.affectedRows){
                                    callback(ERROR_CODE.Wrong_credentials);
                                }else{
                                    callback(false);
                                }
                            }
                        })
                    }
                })
            }else{
                let sql = "INSERT INTO AUCTION (Stu_ID, Money) VALUES ?";
                let values = [[ID, Money]];
                con.query(sql, [values], function (err, result) {
                    con.release();
                    if(err){
                        callback(ERROR_CODE.DB_error);
                    }else{
                        if(!result.affectedRows){
                            callback(ERROR_CODE.Wrong_credentials);
                        }else{
                            console.log(result.affectedRows);
                            callback(false);
                        }
                    }
                })
            }
        }
    })
};

module.exports.resetAuction = function(callback){
    pool.getConnection(function(err, con){
        if(err){
            callback(ERROR_CODE.DB_error);
            console.log(err);
        }else{
            let sql = "DELETE FROM AUCTION";
            con.query(sql, function(err, result){
                if(err){
                    con.release();
                    callback(ERROR_CODE.DB_error);
                }else{
                    if(!result.affectedRows){
                        callback(ERROR_CODE.Wrong_credentials);
                    }else{
                        callback(false);
                    }
                }
            })
        }
    })
};

// 카드번호가 찍혔을 때 사용자의 Position 을 업데이트하는 함수
// Student ID 가 들어와도 업데이트가 가능하다.
module.exports.updatePosition = function(ID, Position, callback){
    pool.getConnection(function(err, con){
        if(err){
            callback(ERROR_CODE.DB_error);
            console.log(err);
        }else{
            let flag = 0;
            let sql = '';
            if (ID.length === 6){
                sql = "UPDATE info SET Position = '" + Position + "' WHERE Stu_ID = ?";
            } else if(ID.length === 8){
                sql = "UPDATE info SET Position = '" + Position + "' WHERE Card_ID = ?";
            } else{
                con.release();
                flag = 1;
                callback(ERROR_CODE.Unavailable_ID);
            }
            if (flag === 0){
                con.query(sql, [ID], function(err, result){
                    con.release();
                    if (err){
                        callback(ERROR_CODE.DB_error);
                    }else{
                        if(!result.affectedRows){
                            callback(ERROR_CODE.Wrong_credentials);
                        }else{
                            callback(false);
                        }
                    }
                })
            }
        }
    })
};

// Card ID 나 Students ID 가 들어오면 현재 Position 을 콜백으로 리턴하는 함수.
// 경매가 진행되거나 (확정 아님) 가요제가 진행될 때 (이건 확정) 이 함수를 이용해서 사용자가 투표할 수 있는 상황인지 먼저 체크한다.
// 콜백 형식은 (err, Position)이다.
module.exports.getPosition = function(ID, callback){
    pool.getConnection(function(err, con){
        if(err){
            console.log(err);
            callback(ERROR_CODE.DB_error, '');
        }else{
            let sql;
            let flag = 0;
            if(ID.length === 6){
                sql = "SELECT Position FROM info WHERE Stu_ID = ?";
            }else if(ID.length === 8){
                sql = "SELECT Position FROM info WHERE Card_ID = ?";
            }else{
                flag = 1;
                con.release();
                callback(ERROR_CODE.Unavailable_ID, '');
            }
            if(flag === 0){
                con.query(sql, [ID], function(err, result){
                    con.release();
                    if(err){
                        callback(ERROR_CODE.DB_error, '');
                    }else{
                        if(result.length <= 0){
                            callback(ERROR_CODE.Wrong_credentials, '');
                        }else{
                            callback(false, result[0].Position);
                        }
                    }
                })
            }
        }
    })
};

// 학번이나 카드 번호가 입력되면 권한을 리턴하는 함수
// 뭔진 모르겠는데 어쨌든 어딘가에는 쓰일 것 같다.
module.exports.getAuthority = function(ID, callback){
    pool.getConnection(function(err, con){
        if(err){
            console.log(err);
            callback(ERROR_CODE.DB_error, '');
        }else{
            let sql = '';
            let flag = 0;
            if(ID.length === 6){
                sql = "SELECT Authority FROM info WHERE Stu_ID = ?"
            }else if(ID.length === 8){
                sql = "SELECT Authority FROM info WHERE Card_ID = ?"
            }else{
                flag = 1;
                con.release();
                callback(ERROR_CODE.Unavailable_ID, '');
            }
            if(flag === 0){
                con.query(sql, [ID], function(err, result){
                    con.release();
                    if(err){
                        callback(ERROR_CODE.DB_error, '');
                    }else{
                        if(result.length <= 0){
                            callback(ERROR_CODE.Wrong_credentials, '');
                        }else{
                            callback(false, result[0].Authority);
                        }
                    }
                })
            }
        }
    })
};

// 경매 물품의 정보를 받아오는 함수. 검색이 끝나면 배열로 값을 리턴하는데 0번째 요소가 물품 이름이고 1번째 요소가 이미지 이름이다.
module.exports.getAuctionProduct = function(Index, callback){
    pool.getConnection(function(err, con){
        if(err){
            console.log(err);
            callback(ERROR_CODE.DB_error, ['', '']);
        }else{
            let sql = "SELECT * FROM auction_product WHERE _id = ?";
            con.query(sql, [Index], function(err, result){
                con.release();
                if(err){
                    callback(ERROR_CODE.DB_error, ['', '']);
                }
                else{
                    if(result.length <= 0){
                        callback(ERROR_CODE.No_matched_ID, ['', '']);
                    }else{
                        callback(false, [result[0].ProductName, result[0].ProductImg]);
                    }
                }
            })
        }
    })
};

module.exports.deleteCard = function(ID, callback){
    pool.getConnection(function(err, con){
        if(err){
            console.log(err);
            callback(ERROR_CODE.DB_error);
        }else{
            let sql = "UPDATE info SET Card_ID = '00000000' WHERE Stu_ID = ?";
            con.query(sql, [ID], function(err, result){
                con.release();
                if(err){
                    callback(ERROR_CODE.DB_error);
                }else{
                    if(!result.affectedRows){
                        callback(ERROR_CODE.Wrong_credentials);
                    }else{
                        callback(false);
                    }
                }
            })
        }
    })
};

module.exports.newCard = function(ID, cardID, callback){
    pool.getConnection(function(err, con){
        if(err){
            console.log(err);
            callback(ERROR_CODE.DB_error);
        }else{
            let sql = "UPDATE info set Card_ID = ? WHERE Stu_ID = ?";
            let values = [cardID, ID];
            con.query(sql, values, function(err, result){
                con.release();
                if(err){
                    console.log(err);
                    callback(ERROR_CODE.DB_error);
                }else{
                    if(!result.affectedRows){
                        callback(ERROR_CODE.Wrong_credentials);
                    }else{
                        callback(false);
                    }
                }
            })
        }
    })
};

module.exports.getCouponMoney = function(Coupon_ID, callback){
    pool.getConnection(function(err, con){
        if(err){
            console.log(err);
            callback(ERROR_CODE.DB_error, 0);
        }else{
            let sql = "SELECT money FROM coupon WHERE Coupon_ID = ?";
            con.query(sql, [Coupon_ID], function(err, result){
                con.release();
                if(err){
                    callback(ERROR_CODE.DB_error, 0);
                }else{
                    if(result.length <= 0){
                        callback(ERROR_CODE.No_matched_ID, 0);
                        console.log(result);
                    }else{
                        callback(false, result[0].money);
                    }
                }
            })
        }
    })
};

module.exports.deleteCouponID = function(Coupon_ID, callback){
    pool.getConnection(function(err, con){
        if(err){
            console.log(err);
            callback(ERROR_CODE.DB_error);
        }else{
            let sql = "DELETE FROM coupon WHERE Coupon_ID = ?";
            con.query(sql, [Coupon_ID], function(err, result){
                con.release();
                if(err){
                    callback(ERROR_CODE.DB_error);
                }else{
                    if(!result.affectedRows){
                        callback(ERROR_CODE.Wrong_credentials);
                    }else{
                        callback(false);
                    }
                }
            })
        }
    })
}

module.exports.getCheckIN = function(Stu_ID, callback){
    pool.getConnection(function(err, con){
        if(err){
            console.log(err);
            callback(ERROR_CODE.DB_error, "");
        }else{
            let sql = "SELECT * FROM info WHERE Stu_ID = ?";
            con.query(sql, Stu_ID, function(err, result){
                con.release();
                if(err){
                    console.log(err);
                    callback(ERROR_CODE.DB_error, "")
                }else{
                    if(result.length <=0){
                        callback(ERROR_CODE.Unavailable_ID, "");
                    }else{
                        let s = "";
                        if(result[0].EOS){
                            s += "EOS\n"
                        }
                        if(result[0].Pure){
                            s += "Pure\n"
                        }
                        if(result[0].BBinary){
                            s += "Binary\n"
                        }
                        if(result[0].Groove){
                            s += "Groove\n"
                        }
                        if(result[0].Delight){
                            s += "Delight\n"
                        }
                        if(result[0].No1Sori){
                            s += "No.1Sori\n"
                        }
                        if(result[0].Sturgeon){
                            s += "Sturgeon\n"
                        }
                        if(result[0].NURIBIT){
                            s += "NURIBIT\n"
                        }
                        if(result[0].MCFILM){
                            s += "MCFILM\n"
                        }
                        if(result[0].Chemiphile){
                            s += "Chemiphile\n"
                        }
                        if(result[0].Rubicon){
                            s += "Rubicon\n"
                        }
                        if(result[0].EURZ){
                            s += "EURZ\n"
                        }
                        if(result[0].ESRA){
                            s += "ESRA\n"
                        }
                        if(result[0].Loony){
                            s += "Loony\n"
                        }
                        if(result[0].Starstorm){
                            s += "Starstorm\n"
                        }
                        if(result[0].SSOL){
                            s += "SSOL\n"
                        }
                        if(result[0].Casino){
                            s += "Casino\n"
                        }
                        if(result[0].SongFes){
                            s += "Song Festival\n"
                        }
                        if(result[0].InterNight){
                            s += "International Night\n"
                        }
                        if(result[0].Cocktail){
                            s += "Cafe & Cocktail Bar\n"
                        }
                        if(result[0].ATBooth){
                            s += "ALL-Time Booth\n"
                        }
                        if(result[0].Fashion){
                            s += "Fashion show\n"
                        }
                        if(result[0].Party){
                            s += "Party\n"
                        }
                        if(result[0].Therapy){
                            s += "Therapy\n"
                        }
                        if(result[0].InfoBooth){
                            s += "Information Booth\n"
                        }
                        if(result[0].ClubComp){
                            s += "Club Competition\n"
                        }
                        if(result[0].Consulting){
                            s += "Consulting\n"
                        }
                        if(result[0].EE){
                            s += "EE\n"
                        }
                        if(result[0].JAMS){
                            s += "JAMS\n"
                        }
                        if(result[0].PAWS){
                            s += "PAWS\n"
                        }
                        if(result[0].GungSeo){
                            s += "GungSeo\n"
                        }
                        if(result[0].Economics){
                            s += "Economics\n"
                        }
                        callback(false, s);
                    }
                }
            })
        }
    })
};

module.exports.checkIN = function(BoothName, Card_ID, callback){
    let count = 0;
    pool.getConnection(function(err, con){
        if(err){
            console.log(err);
            callback(ERROR_CODE.DB_error);
        }else{
            let sql = "SELECT * FROM info WHERE Card_ID = ?";
            con.query(sql, Card_ID, function(err, result){
                if(err){
                    con.release();
                    console.log(err);
                    callback(ERROR_CODE.DB_error, "")
                }else{
                    if(result.length <=0){
                        callback(ERROR_CODE.Unavailable_ID, "");
                    }else{
                        if(result[0].EOS){
                            count ++;
                        }
                        if(result[0].Pure){
                            count ++;
                        }
                        if(result[0].BBinary){
                            count ++;
                        }
                        if(result[0].Groove){
                            count ++;
                        }
                        if(result[0].Delight){
                            count ++;
                        }
                        if(result[0].No1Sori){
                            count ++;
                        }
                        if(result[0].Sturgeon){
                            count ++;
                        }
                        if(result[0].NURIBIT){
                            count ++;
                        }
                        if(result[0].MCFILM){
                            count ++;
                        }
                        if(result[0].Chemiphile){
                            count ++;
                        }
                        if(result[0].Rubicon){
                            count ++;
                        }
                        if(result[0].EURZ){
                            count ++;
                        }
                        if(result[0].ESRA){
                            count ++;
                        }
                        if(result[0].Loony){
                            count ++;
                        }
                        if(result[0].Starstorm){
                            count ++;
                        }
                        if(result[0].SSOL){
                            count ++;
                        }
                        if(result[0].Casino){
                            count ++;
                        }
                        if(result[0].SongFes){
                            count ++;
                        }
                        if(result[0].InterNight){
                            count ++;
                        }
                        if(result[0].Cocktail){
                            count ++;
                        }
                        if(result[0].ATBooth){
                            count ++;
                        }
                        if(result[0].Fashion){
                            count ++;
                        }
                        if(result[0].Party){
                            count ++;
                        }
                        if(result[0].Therapy){
                            count ++;
                        }
                        if(result[0].InfoBooth){
                            count ++;
                        }
                        if(result[0].ClubComp){
                            count ++;
                        }
                        if(result[0].Consulting){
                            count ++;
                        }
                        if(result[0].EE){
                            count ++;
                        }
                        if(result[0].JAMS){
                            count ++;
                        }
                        if(result[0].PAWS){
                            count ++;
                        }
                        if(result[0].GungSeo){
                            count ++;
                        }
                        if(result[0].Economics){
                            count ++;
                        }
                        sql = "SELECT " + BoothName + " FROM info WHERE Card_ID = ?";
                        con.query(sql, [Card_ID], function(err, result){
                            if(err){
                                con.release();
                                console.log(err);
                                callback(ERROR_CODE.DB_error);
                            }else{
                                if(result <= 0){
                                    con.release();
                                    callback(ERROR_CODE.Unavailable_ID);
                                }else{
                                    let r = {
                                        'EOS': result[0].EOS,
                                        'Pure': result[0].Pure,
                                        'BBinary': result[0].BBinary,
                                        'Groove': result[0].Groove,
                                        'Delight': result[0].Delight,
                                        'No1Sori': result[0].No1Sori,
                                        'Sturgeon': result[0].Sturgeon,
                                        'NURIBIT': result[0].NURIBIT,
                                        'MCFILM': result[0].MCFILM,
                                        'Chemiphile': result[0].Chemiphile,
                                        'Rubicon': result[0].Rubicon,
                                        'EURZ': result[0].EURZ,
                                        'ESRA': result[0].ESRA,
                                        'Loony': result[0].Loony,
                                        'Starstorm': result[0].Starstorm,
                                        'SSOL': result[0].SSOL,
                                        'Casino': result[0].Casino,
                                        'SongFes': result[0].SongFes,
                                        'InterNight': result[0].InterNight,
                                        'Cocktail': result[0].Cocktail,
                                        'ATBooth': result[0].ATBooth,
                                        'Fashion': result[0].Fashion,
                                        'Party': result[0].Party,
                                        'Therapy': result[0].Therapy,
                                        'InfoBooth': result[0].InfoBooth,
                                        'ClubComp': result[0].ClubComp,
                                        'Consulting': result[0].Consulting,
                                        'EE': result[0].EE,
                                        'JAMS': result[0].JAMS,
                                        'PAWS': result[0].PAWS,
                                        'GungSeo': result[0].GungSeo,
                                        'Economics': result[0].Economics
                                    };
                                    if(result.length <= 0 || r[BoothName] !== 0){
                                        con.release();
                                        console.log(r[BoothName]);
                                        callback(ERROR_CODE.Unavailable_ID); // 만들기 귀찮으니까 재활용하자
                                    }else{
                                        let retVal = 50;
                                        let total_number = 29;
                                        if(count%5 === 4){
                                            retVal += (count+1)*10;
                                        }
                                        if(count+1 === 17){
                                            retVal += 170
                                        }
                                        if(count+1 === total_number){
                                            retVal += 1000
                                        }
                                        if(count > total_number){
                                            retVal = 0;
                                        }
                                        sql = "UPDATE info SET " + BoothName + " = ? WHERE Card_ID = ?";
                                        con.query(sql, [1, Card_ID], function(err, result){
                                            if(err){
                                                console.log(err);
                                                con.release();
                                                callback(ERROR_CODE.DB_error);
                                            }else{
                                                if(!result.affectedRows){
                                                    con.release();
                                                    callback(ERROR_CODE.Wrong_credentials);
                                                }else{
                                                    sql = "SELECT Money FROM info WHERE Card_ID = ?";
                                                    con.query(sql, Card_ID, function(err, result){
                                                        if(err){
                                                            console.log(err);
                                                            con.release();
                                                            callback(ERROR_CODE.DB_error);
                                                        }else{
                                                            if(result.length<=0){
                                                                con.release();
                                                                callback(ERROR_CODE.DB_error);
                                                            }else{
                                                                sql = 'UPDATE info SET money = ' + (result[0].Money + retVal) + ' WHERE Card_ID = ? ';
                                                                con.query(sql, Card_ID, function(err, result){
                                                                    con.release();
                                                                    if(err){
                                                                        console.log(err);
                                                                        callback(ERROR_CODE.DB_error);
                                                                    }else{
                                                                        if(!result.affectedRows){
                                                                            callback(ERROR_CODE.Wrong_credentials);
                                                                        }else{
                                                                            callback(false);
                                                                        }
                                                                    }
                                                                })
                                                            }
                                                        }
                                                    })
                                                }
                                            }
                                        })
                                    }
                                }
                            }
                        })

                    }
                }
            })

        }
    })
};

module.exports.getSchedule = function(day, callback){
    pool.getConnection(function(err, con){
        if(err){
            console.log(err);
            callback(ERROR_CODE.DB_error, '');
        }else{
            let sql = "SELECT * FROM event WHERE Day = ?";
            con.query(sql, day, function(err, result){
                con.release();
                if(err){
                    console.log(err);
                    callback(ERROR_CODE.DB_error, '');
                }else{
                    if(result.length<=0){
                        callback(ERROR_CODE.Unavailable_ID, '');
                    }else{
                        let s = '';
                        for (let i=0; i<result.length; i++){
                            s += result[i].Time + "\t" + result[i].Name + '\t' + result[i].Place + '\t' + result[i].Place1 + '\n';
                        }
                        callback(false, s);
                    }
                }
            })
        }
    })
};

module.exports.getBooth = function(callback){
    pool.getConnection(function(err, con){
        if(err){
            console.log(err);
            callback(ERROR_CODE.DB_error, '');
        }else{
            let sql = "SELECT * FROM booth";
            con.query(sql, function(err, result){
                if(err){
                    console.log(err);
                    callback(ERROR_CODE.DB_error, '');
                }else{
                    if(result.length<=0){
                        callback(ERROR_CODE.Unavailable_ID, '');
                    }else{
                        let s = '';
                        for(let i=0; i<result.length; i++){
                            s += result[i].Name + "\t" + result[i].Place + '\n';
                        }
                        callback(false, s);
                    }
                }
            })
        }
    })
};

module.exports.calculVote = function(callback){
    let A = [0, 0, 0, 0], B = [0, 0, 0, 0];
    let finalVote = [0, 0, 0, 0, 0, 0, 0, 0];
    pool.getConnection(function(err, con){
        for(let i=1; i<5; i++){
            let sql = "SELECT * FROM betnvote WHERE Round" + i + " = 'A'";
            con.query(sql, function(err, result){
                if(err){
                    console.log(err);
                }else{
                    A[i] = result.length;
                }
            })
            sql = "SELECT * FROM betnvote WHERE Round" + i + " = 'B'";
            con.query(sql, function(err, result){
                if(err){
                    console.log(err);
                }else{
                    B[i] = result.length;
                }
            })
        }
        for (let i=1; i<8; i++){
            let sql = "SELECT * FROM betnvote WHERE Round5 = '" + i + "'";
            con.query(sql, function(err, result){
                if(err){
                    console.log(err);
                }else{
                    finalVote[i] = result.length;
                    if(i === 7)
                        callback(A, B, finalVote);
                }
            })
        }
    });
};

// 외부인 계정 생성
// 00-xxx 형태의 id를 중복되지 않게 생성한다
const sem = require('semaphore')(1)
module.exports.newVisitorAccount = function(card, password, PIN, callback){
    pool.getConnection(function(err, con){
        let sql_id = "SELECT Stu_ID FROM info WHERE Authority = Visitor"
        sem.take(function(){
            con.query(sql_id, function(err, result_id){
                if(err){
                    console.log(err)
                    callback(ERROR_CODE.DB_error)
                    sem.leave()
                }else{
                    let newId = String(result_id.length + 1)
                    while(newId.length < 3) newId = '0'+newId
                    newId = '00-'+newId
                    let sql_insert = "INSERT INTO info (Stu_id, Card_id, Stu_pass, Card_PIN, Authority) values (?, ?, ?, ?, ?)"
                    con.query(sql_insert, [[[newId, card, password, PIN, "Visitor"]]], function(err, result_insert){
                        if(err){
                            console.log(err)
                            callback(ERROR_CODE.DB_error)
                            sem.leave()
                        }else if(!result2.affectedRows){
                            callback(ERROR_CODE.Wrong_credentials);
                            sem.leave()
                        }else{
                            callback(false, newId)
                            sem.leave()
                        }
                    })
                }
            })
        })

    })
}