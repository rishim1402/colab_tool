const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const config = require('config');
var fs = require('fs');
var path = require('path');

const auth = require('../auth');

const UserBoards = require('../models/userboard.model');

router.get('/getboards', auth, async (req, res) => {
    let username = req.user.id;
    try {
        const userBoards = await UserBoards.find({ username: username }).exec();
        res.status(200).json({ userBoards });
    } catch (err) {
        res.status(400).json({ err });
    }
});
router.post('/addpersonalboards', auth, async (req, res) => {
    console.log("addpersonalboardsrcvd");
    let username = req.user.id;
    let boardname = req.body.boardname;
    let boardcolor = req.body.boardcolor;
    try {
        const userBoards = await UserBoards.find({ username: username }).exec();
        if (userBoards.length == 0) {
            var newPersonalBoards = [];
            newPersonalBoards.push(boardname);
            var obj = new UserBoards({ username: username, personalBoards: newPersonalBoards, teamBoards: [] });
            obj.save((err, data) => {
                if (err) {
                    res.status(400).json({ err: 'error fetching from db' });
                } else {
                    console.log(data);
                    res.status(200).json({ status: 'success', data: data, personalBoards: data.personalBoards });
                }
            });
            return;
        } else {
            let personalBoards = userBoards[0].personalBoards;
            const check = personalBoards.indexOf(boardname);
            console.log("check :" + check);
            if(check == -1){
                personalBoards.push(boardname);
                try {
                    const userBoards = await UserBoards.updateOne({ username: username }, { personalBoards: personalBoards });
                    res.status(200).json({ personalBoards });
                } catch (err) {
                    res.status(400).json({ err: "Error Adding New Board" });
                }
            }
            else{
                res.status(400).json({ err: "Board already exists." });

            }
        }
    } catch (err) {
        res.status(400).json({ err: "Error Adding New Board" });
    }
    /*
    try {
        const userBoards = await UserBoards.find({username: username}).exec();
        res.status(200).json({userBoards});
    } catch(err) {
        res.status(400).json({err});
    }
    */

   var reqData = {
    creator: username,
    boardname: boardname,
    boardcolor: boardcolor,
    creator: username,
    board_list: [],
    users: [username],
  };
  console.log("Token :  " + req.header('colab-tool-token'));
  await axios.post("http://localhost:5000/api/board/addboard/",reqData, {
    headers: {'colab-tool-token': req.header('colab-tool-token')},
    body: reqData
  })
  .then(res => {
    console.log(res);
    if(res.status == 200) {
      console.log("success");
    } else {
      console.log("Something went wrong");
    }
  })
  .catch(err => {
    console.log(err);
  })
});
module.exports = router;
