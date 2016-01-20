var gameOver = true;
var whoseTurn = "X";
var userRef, currentBoard;

var $squares;

var mainRef = new Firebase('https://gkjsdll-tic-tac-toe.firebaseio.com/');
var amOnline = new Firebase('https://gkjsdll-tic-tac-toe.firebaseio.com/.info/connected');

function checkOnline(username){
  usersRef = new Firebase('https://gkjsdll-tic-tac-toe.firebaseio.com/users');
  localStorage.username = username;
  amOnline.on('value', function(snapshot) {
    if (snapshot.val()) {
      usersRef.child(username).child("online").onDisconnect().set(false);
      usersRef.child(username).child("online").set(true);
    }
  });
  getBoard();
}

function nameAvailable(name){
  mainRef.child("users").once("value", function(usernames){
    var isAvailable = true;
    usernames.forEach(function(username){
      if(name === username.key()){
        isAvailable = false;
      }
    })
    if(isAvailable){
      checkOnline(name);
      gameOver = false;
      swal.close();
    }
    else{
      swal.showInputError("Username taken");
    }
  });
}

$(document).ready(function(){

  $squares = $('.square');
  $("#newGame").click(newGame)

  for(var i = 0; i < $squares.length; i++){
    $squares.eq(i).css('top', Math.floor(i/3)*128+'px');
    $squares.eq(i).css('left', (i%3)*128+'px');
  }

  initUsername();
})

function squareClickHandler(){ //must be adapted for firebase
  var $this = $(this);
  mainRef.child("boards/"+currentBoard).once("value", function(snap){
    if(!gameOver && snap.val()["whoseTurn"] === localStorage.player){
      if($this.text() === ""){
        var square = $this.attr('id')
        var boardSquare = {};
        boardSquare[square] = localStorage.player;
        mainRef.child("boards").child(currentBoard+"/squares/").update(boardSquare);
        $this.css("cursor","default");
      }
      var whoseturn;
      switch(snap.val()["whoseTurn"]){
        case "X":
          whoseturn = "O";
          break;
        case "O":
        whoseturn = "X";
          break;
      }
      mainRef.child("boards/"+currentBoard).update({"whoseTurn": whoseturn});
    }
  });
};

function initUsername(){
  if(!localStorage.username){
    swal({
      title: "Enter a Username",
      text: "This cannot be changed later.",
      type: "input",
      closeOnConfirm: false,
      animation: "slide-from-top",
      inputPlaceholder: "Username"
    },
    nameAvailable);
  }
  else {
    checkOnline(localStorage.username);
    gameOver = false;
    currentBoard = localStorage.currentBoard;
  }
}

function getBoard(){
  mainRef.once("value", function(snap){
    if(!snap.child("boards").exists()){
      newBoard();
    }

    if(!snap.child("users").child(localStorage.username).child("board").exists()){
      assignBoard();
    }
    else{
      mainRef.child("users").child(localStorage.username).once("value", function(snap){
        currentBoard = snap.val()["board"];
        localStorage.currentBoard = currentBoard;
        watchBoard();
        $squares.click(squareClickHandler);
      });
    }
  });
}

function watchBoard(){
  mainRef.child("boards").child(currentBoard+"/squares/").on("value", function(squares){
    localStorage.turnsTaken = 0;
    squares.forEach(function(square){
      var whichSquare = $('#'+square.key())
      switch(square.val()){
        case "X":
          whichSquare.text("X");
          whichSquare.css("cursor", "default");
          localStorage.turnsTaken = Number(localStorage.turnsTaken) + 1;
          break;
        case "O":
        whichSquare.text("O");
          whichSquare.css("cursor", "default");
          localStorage.turnsTaken = Number(localStorage.turnsTaken) + 1;
          break;
        default:
          whichSquare.text("");
          whichSquare.css("cursor", "pointer");
          break;
      }
    });
  });
}

function newBoard(){
  var board = {square1: "Empty",
  square2: "Empty",
  square3: "Empty",
  square4: "Empty",
  square5: "Empty",
  square6: "Empty",
  square7: "Empty",
  square8: "Empty",
  square9: "Empty"};
  var boardData = {};
  boardData["whoseTurn"] = "X";
  boardData["squares"] = board;
  boardData["turnsTaken"] = 0;
  localStorage.turnsTaken = 0;
  mainRef.child("boards").push(boardData);
  mainRef.child("users").child(localStorage.username).once("value", function(snap){
    if(currentBoard){
      var userGone = {};
      userGone[localStorage.username] =  "Gone";
      mainRef.child("boards/"+currentBoard+"/users").update(userGone);
    }
    mainRef.child("boards").limitToLast(1).once("value", function(snap){
      for (var key in snap.val()){
        mainRef.child("users").child(localStorage.username).update({"board": key});
        var playerX = {};
        playerX[localStorage.username] = "X";
        localStorage.player = "X";
        mainRef.child("boards/"+key).child("users").update(playerX);
        currentBoard = key;
        watchBoard();
        $squares.click(squareClickHandler);
      }
    });
  });
}

function newGame(){
  assignBoard();
  gameOver = false;
}

function assignBoard(){
  mainRef.child("boards").limitToLast(1).once("value", function(snap){
    for (var key in snap.val()){
      var boardRef = new Firebase(mainRef.child("boards").limitToLast(1).toString() + "/" + key);
      boardRef.child("users").once("value", function(snap){
        var users = 0;
        for(var i in snap.val()){
          if(i !== localStorage.username) users++;
          if(currentBoard === key) users = 2;
        }
        if(users < 2){
          var thisUser = {};
          switch (users){
            case 0:
              thisUser[localStorage.username] = "X";
              localStorage.player = "X";
              break;
            case 1:
              thisUser[localStorage.username] = "O";
              localStorage.player = "O";
              break;
          }
          mainRef.child("boards").child(currentBoard+"/squares/").off();
          boardRef.child("users").update(thisUser);
          mainRef.child("users").child(localStorage.username).update({"board": key});
          currentBoard = key;
          watchBoard();
        }
        else{
          newBoard();
        }
      });
    }
  })
}


function checkWin($square){
  spacesRemaining--;
  switch($square.index()){
    case 0:
      checkSquares(1,2);
      checkSquares(3,6);
      checkSquares(4,8);
      break;
    case 1:
      checkSquares(0,2);
      checkSquares(4,7);
      break;
    case 2:
      checkSquares(0,1);
      checkSquares(4,6);
      checkSquares(5,8);
      break;
    case 3:
      checkSquares(0,6);
      checkSquares(4,5);
      break;
    case 4:
      for(var i = 0; i < 4; i++){
        checkSquares(i, 8-i);
      }
      break;
    case 5:
      checkSquares(2,8);
      checkSquares(3,4);
      break;
    case 6:
      checkSquares(0,3);
      checkSquares(2,4);
      checkSquares(7,8);
      break;
    case 7:
      checkSquares(1,4);
      checkSquares(6,8);
      break;
    case 8:
      checkSquares(0,4);
      checkSquares(2,5);
      checkSquares(6,7);
      break;
  }
  if(!spacesRemaining && !gameOver){
    noWin();
  }
};

function noWin(){
  gameOver = true;
}
