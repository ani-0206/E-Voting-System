const Web3 = require('web3');
const truffle_connect = require('./connectChain.js');
const mysql = require('mysql');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const express = require('express');
const router = require('express').Router();
const path = require('path');
router.use(express.json());
const cookieParser = require('cookie-parser');
router.use(cookieParser());


const db = mysql.createConnection({
    host: 'localhost',
    user:'root',
    password: '',
    database: 'proj_db'
});
function auth(req,res,next){
	if(req.cookies == null)
    return res.sendStatus(401);
    const token = req.cookies.accessToken;
    if(token == null ) return res.sendStatus(401);
    jwt.verify(token,process.env.ACCESS_TOKEN_SECRET,(err,user)=>{
         if(err) return res.sendStatus(401);
		 res.username = user;
         next();
    })
}


	router.get('/getAccounts',auth,(req, res) => {
	  console.log("**** GET /getAccounts ****");
	  truffle_connect.start(function (answer) {
	    res.send(answer);
	  })
	});

	router.post('/setUserName',auth,(req, res) => {
	  console.log("**** POST /setUserName ****");
	  console.log(req.body);

	  let userName = req.body.userName;
	  truffle_connect.setUserName(userName, (response) => {
	    res.send(response);
	  });
	});

	router.post('/setAccount',auth,(req, res) => {
	  console.log("**** POST /setAccount ****");
	  console.log(req.body);

	  let sender = req.body.sender;
	  truffle_connect.setAccount(sender, (response) => {
	    res.send(response);
	  });
	});

	router.get('/getBallotCount',auth,(req, res) => {
	  console.log("**** GET / getBallotCount ****");
	  truffle_connect.getBallotCount(function (answer) {
	    res.send(answer);
	  })
	});

	router.post('/ballot_i',auth,(req, res) => {
	  console.log("**** POST /ballot_i ****");
	  let id = req.body.id;

	  truffle_connect.ballot_i(id, (response) => {
	    res.send(response);
	  });
	});

	router.get('/currentBallot',auth,(req, res) => {
	  console.log("**** GET / currentBallot ****");
	  truffle_connect.currentBallot(function (answer) {
	    res.send(answer);
	  })
	});

	router.post('/setBallot',auth, (req, res) => {
	  console.log("**** post /setBallot ****");
	  console.log("data to post: ", req.body);
	  let name = req.body.name;
	  let startTime = req.body.startTime;
	  let endTime = req.body.endTime;
	  let canString = req.body.canString;
	  let userid = req.res.username.name;
	  let voters = req.body.voters;
       console.log("Start Time :  "+startTime);
	   console.log("Start Time :  "+endTime);
	  	// include all
		if(voters.length === 0){
			let sqlAllVote = "SELECT userid FROM `voters`";
			db.query(sqlAllVote, (err,res)=>{
				if(err) throw err;
				else{
					for(let i = 0; i < res.length; i++) voters.push(res[i].userid);
					//console.log(voters);
				}
			});
		}
	  // console.log("Ballotid2: "+userid+" "+req.res.username.name);

	  //username#count
	  let ballotid = 0; // userid;
	  // let sqlcount = "SELECT COUNT(*) as `count` FROM `ballots` WHERE `userid` = ?";
	  let sqlcount = "SELECT COUNT(*) as `count` FROM `ballots` ";

	  //db.query(sqlcount, [userid], (err,result)=>{
	  db.query(sqlcount, (err,result)=>{
		if(err)
		{
			throw err;
		}
		else {
			console.log("result: "+JSON.stringify(result)+" "+result[0]);
			// ballotid = ballotid+"#"+(result[0][`count`]+1);

			ballotid = (result[0][`count`]+1); // console.log("Ballotid: "+ballotid);
			
			let sqlball = "INSERT INTO ballots VALUES(?, ?, ?, ?, ?)";
			db.query(sqlball, [ballotid, name,startTime, endTime, userid], (err, result)=>{
				if(err)
				{
					throw err;
				}
				else {
					console.log("Ballot details inserted in ballots!"+result[0]+" "+voters[0]);
				}
			});
			// console.log("Ballotid: "+ballotid);


			for(let i = 0; i<voters.length; i++)
			{
				let voteballot = "INSERT INTO `voter-ballot` VALUES(?, ?)";
				db.query(voteballot, [voters[i],ballotid], (err,result) =>{
					if(err)
					{
						throw err;
					}
					else {
						console.log("Ballot details inserted in voter-ballot!"+JSON.stringify(result));
					}
				})
			}
		}
	  });

	  truffle_connect.setBallot(name, startTime, endTime, canString, (response) => {
		console.log(response);
	    res.send(response);
	  });
	});

	router.post('/setBallotID',auth, (req, res) => {
	  console.log("**** POST /setBallotID ****");
	  console.log(req.body);

	  let id = req.body.id;
	  truffle_connect.setBallotID(id, (response) => {
	    res.send(response);
	  });
	});

	router.get('/viewCandidates',auth, (req, res) => {
	  console.log("**** GET / viewCandidates ****");
	  truffle_connect.viewCandidates(function (answer) {
	    res.send(answer);
	  })
	});

	router.post('/candidate_i',auth,(req, res) => {
	  console.log("**** POST /candidate_i ****");
	  let id = req.body.id; 

	  truffle_connect.candidate_i(id, (response) => {
	    res.send(response);
	  });
	});

	router.get('/votedORnot',auth,(req, res) => {
	  console.log("**** GET / votedORnot ****");
	  truffle_connect.votedORnot(function (answer) {
	    res.send(answer);
	  })
	});

	router.post('/vote',auth,(req, res) => {
	  console.log("**** POST /vote ****");
	  let id = req.body.id; 

	  truffle_connect.vote(id, (response) => {
	    res.send(response);
	  });
	});

module.exports = router;