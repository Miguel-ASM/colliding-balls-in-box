//                             MAIN LOGIC OF THE APP

// init the html elements
let app = document.querySelector('#app');

// Div representing the board
let boardDiv = document.querySelector('#board');

// form tag containing all the controls of the app
let controlPanelForm = document.querySelector('#control-panel');

// Input widget for the ball radius
let ballRadiusInput = document.querySelector('#ballRadius');
let ballRadiusDisplay = document.querySelector('#ballRadiusGroup p.slide-control-display');

// Input widget for the ball number
let ballNumberInput = document.querySelector('#ballNumber');
let ballNumberDisplay = document.querySelector('#ballNumberGroup p.slide-control-display');

// Set board button
let setBoardButton = document.querySelector('#set-board-button');
let playPauseButton = document.querySelector('#play-pause-button');



// board objet containing the balls
let board = {}

// time interval for the motion loop
let mainTimeLoop;
let animationRunning = false;

// Start the app
initApp();


//                             FUNCTIONS



function initApp(){
    ballRadiusDisplay.innerHTML = ballRadiusInput.value;
    ballNumberDisplay.innerHTML = ballNumberInput.value;
    
    
    // add event listeners to the controls
    controlPanelForm.addEventListener('submit',event=>event.preventDefault());
    
    ballRadiusInput.addEventListener('input',()=>{
        ballRadiusDisplay.innerHTML = ballRadiusInput.value;
    });
    
    ballNumberInput.addEventListener('input',()=>{
        ballNumberDisplay.innerHTML = ballNumberInput.value;
    });

    setBoardButton.addEventListener('click',setBoard);
    playPauseButton.addEventListener('click',playPause);

    

}


function setBoard(){
    // Update/set the number of balls and radius
    board.nBalls = parseInt(ballNumberInput.value);
    board.ballRadius = parseInt(ballRadiusInput.value);
    // remove the ball divs from the DOM
    boardDiv.innerHTML ='';
    board.balls = [];

    // add the balls to the board and position them randomly
    while(board.balls.length < board.nBalls){
        // create a ball div 
        let ballDiv = document.createElement('div');
        ballDiv.innerHTML = `<p>${1+board.balls.length}</p>`
        boardDiv.appendChild(ballDiv);
        // style the ball
        ballDiv.classList.add('ball');
        // size the ball relatively to its container
        ballDiv.style.width  = 2*board.ballRadius+'%';
        ballDiv.style.height = 2*board.ballRadius+'%';
        // generate the position of the ball div randomly
        let x = Math.random() * (100 - 2*board.ballRadius) + board.ballRadius;
        let y = Math.random() * (100 - 2*board.ballRadius) + board.ballRadius;
        // check if the ball touches any of the previously created balls
        let touchesAnother = board.balls.some(({xCenter,yCenter}) => (xCenter-x)**2 + (yCenter-y)**2 <=4*board.ballRadius**2  )
        if (touchesAnother){
            boardDiv.removeChild(ballDiv);
        } else{
            // create a ball object
            let ball = {
                xCenter:x,
                yCenter:y,
                div:ballDiv,
                radius: board.ballRadius,
                setBallDivPosition : function () {
                    this.div.style.left   = (this.xCenter - this.radius)+'%';
                    this.div.style.bottom = (this.yCenter - this.radius)+'%';
                }
            }
            // position the ball div inside of the boardDiv
            ball.setBallDivPosition();
            // give initial velocity to the ball
            let theta = 2*Math.PI*Math.random();
            let delta = Math.random();
            ball.deltaX = delta * Math.cos(theta);
            ball.deltaY = delta * Math.sin(theta);
            // push a ball object into board
            board.balls.push(ball);
        }
    }
    playPauseButton.disabled = false;
}

function playPause() {
    if (animationRunning){
        clearInterval(mainTimeLoop);
        animationRunning = false;
        setBoardButton.disabled = false;
        playPauseButton.innerHTML = '<i class="fa fa-play"></i>';

    } else{
        mainTimeLoop = setInterval(moveBalls,10);
        animationRunning = true;
        setBoardButton.disabled = true;
        playPauseButton.innerHTML = '<i class="fa fa-pause"></i>';
    }
    playPauseButton.classList.toggle('play');
    playPauseButton.classList.toggle('pause');
}

// function that makes the balls move in the board (so far without collisions between balls)
function moveBalls() {
    board.balls.forEach(ball=>{
        ball.deltaX = ((ball.xCenter-ball.radius)*(ball.xCenter+ball.radius-100)>0) ? -ball.deltaX : ball.deltaX;
        ball.deltaY = ((ball.yCenter-ball.radius)*(ball.yCenter+ball.radius-100)>0) ? -ball.deltaY : ball.deltaY;
        ball.xCenter += ball.deltaX;
        ball.yCenter += ball.deltaY;
        ball.setBallDivPosition();
    })
}