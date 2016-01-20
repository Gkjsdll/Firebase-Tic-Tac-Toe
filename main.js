var gameOver = true;
var whoseTurn = "X";
var userRef, currentBoard;

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
  //try usernamesRef.once in console
  mainRef.child("users").once("value", function(usernames){
    var isAvailable = true;
    usernames.forEach(function(username){
      if(name === username.key()){
        isAvailable = false;
      }
    })
    console.log("Username available: ", isAvailable);
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

  var $squares = $('.square');
  $("#newGame").click(clearBoard)


  $squares.click(squareClickHandler);

  for(var i = 0; i < $squares.length; i++){
    $squares.eq(i).css('top', Math.floor(i/3)*128+'px');
    $squares.eq(i).css('left', (i%3)*128+'px');
  }

  initUsername();
})

function squareClickHandler(){ //must be adapted for firebase
  if(!gameOver){
    var $this = $(this);
    if($this.text() === ""){
      var square = $(this).attr('id')
      var boardSquare = {};
      boardSquare[square] = whoseTurn;
      mainRef.child("boards").child(currentBoard).update(boardSquare);
      $this.css("cursor","default");
      switch(whoseTurn){
        case "X":
        whoseTurn = "O";
        break;
        case "O":
        whoseTurn = "X";
        break;
      }
      // checkWin($this);
    }
  }
};



function clearBoard(){
  mainRef.child("boards").child(currentBoard).once("value", function(squares){
    squares.forEach(function(square){
      var key = square.key();
      var boardSquare = {};
      boardSquare[key] = "Empty";
      mainRef.child("boards").child(currentBoard).update(boardSquare);
    });
  });
}

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
    currentBoard = localStorage.currentBoard;
    gameOver = false;
    getBoard();
  }
}

function getBoard(){ //also remove listener for previous board if there is one
  debugger;
  mainRef.once("value", function(snap){
    if(!snap.child("boards").exists()){
      newBoard();
    }

    if(!snap.child("users").child(localStorage.username).child("board").exists()){
      mainRef.child("boards").limitToLast(1).once("value", function(snap){
        for (var key in snap.val()){
          var boardRef = new Firebase(mainRef.child("boards").limitToLast(1).toString() + "/" + key);
          debugger;
          boardRef.child("users").once("value", function(snap){
            var users = 0;
            for(var i in snap.val()){
              users++;
            }
            if(users < 2){
              var thisUser = {};
              switch (users){
                case 0:
                  thisUser[localStorage.username] = "X";
                  break;
                case 1:
                  thisUser[localStorage.username] = "O";
                  break;
              }
              boardRef.child("users").update(thisUser);
              mainRef.child("users").child(localStorage.username).update({"board": key});
            }
            else{
              newBoard();
              getBoard();
            }
            debugger;
          });
        }
      })
      //find last board;
    }
    else{
      // currentBoard = boardKeyFromFirebase
    }
  });
}

function watchBoard(){
  mainRef.child("boards").child(currentBoard).on("value", function(squares){
    squares.forEach(function(square){
      var whichSquare = $('#'+square.key())
      switch(square.val()){
        case "X":
          whichSquare.text("X");
          whichSquare.css("cursor", "default");
          break;
        case "O":
        whichSquare.text("O");
          whichSquare.css("cursor", "default");
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
  mainRef.child("boards").push({"squares": board});
}
