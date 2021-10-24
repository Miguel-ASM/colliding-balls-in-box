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
        ballDiv.innerHTML = `<p>${board.balls.length}</p>`
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
                id:board.balls.length,
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
    // Take care of collisions with walls first
    board.balls.forEach(ball=>{
        if (ballHitsHorizontalWall(ball)){console.log('hitting H wall');}
        if (ballHitsVerticalWall(ball)){console.log('hitting V wall');}
        ball.deltaX = ( ballHitsVerticalWall(ball) )   ? -ball.deltaX : ball.deltaX;
        ball.deltaY = ( ballHitsHorizontalWall(ball) ) ? -ball.deltaY : ball.deltaY;
        ball.xCenter += ball.deltaX;
        ball.yCenter += ball.deltaY;
        ball.setBallDivPosition();
    })
    // Now take care of collisions between balls
    if (board.balls.length > 1){
        board.balls.map( (v, i) => board.balls.slice(i + 1).map(w => [v, w]) ).flat().forEach(pair=>{
            if ( ballsTouch(pair) ){
                solvePairCollision(pair);
                // Update the positions until the collision is solved
                pair[0].xCenter += pair[0].deltaX;
                pair[0].yCenter += pair[0].deltaY;
                pair[0].setBallDivPosition();

                pair[1].xCenter += pair[1].deltaX;
                pair[1].yCenter += pair[1].deltaY;
                pair[1].setBallDivPosition();
            }
        })
    }
}


function solvePairCollision(pair) {
    // balls positions
    let q1 = [pair[0].xCenter,pair[0].yCenter];
    let q2 = [pair[1].xCenter,pair[1].yCenter];
    // balls speeds
    let v1 = [pair[0].deltaX,pair[0].deltaY];
    let v2 = [pair[1].deltaX,pair[1].deltaY];
    // ballsDistance
    let centerDistance = distance(q1,q2);
    // collision coefficient
    let c = dot(
        q1.map((v,i)=>q1[i]-q2[i]),
        v1.map((v,i)=>v1[i]-v2[i]),
    )/centerDistance**2;
    // update the values of the velocities
    [pair[0].deltaX,pair[0].deltaY] = v1.map( (v,i) => v1[i] - c * (q1[i]-q2[i]) );
    [pair[1].deltaX,pair[1].deltaY] = v2.map( (v,i) => v2[i] + c * (q1[i]-q2[i]) );
}


function ballsTouch(pair){
    let a = [pair[0].xCenter,pair[0].yCenter];
    let b = [pair[1].xCenter,pair[1].yCenter];
    if (distance(a,b) <= pair[0].radius + pair[1].radius){
        console.log(`Balls ${pair[0].id} and ${pair[1].id} Have collided!!!`)
        return true;
    }
}

function ballHitsTopWall(ball) {
    return ( ball.yCenter+ball.radius-100 >= 0 && ball.deltaY>0);
}

function ballHitsBottomWall(ball) {
    return ( ball.yCenter-ball.radius <= 0 && ball.deltaY<0);
}

function ballHitsHorizontalWall(ball) {
    return ballHitsTopWall(ball) || ballHitsBottomWall(ball);
}



function ballHitsRightWall(ball) {
    return ( ball.xCenter + ball.radius - 100 >= 0 && ball.deltaX >0);
}

function ballHitsLeftWall(ball) {
    return ( ball.xCenter-ball.radius <= 0 && ball.deltaX<0);
}

function ballHitsVerticalWall(ball) {
    return ballHitsLeftWall(ball) || ballHitsRightWall(ball);
}


function ballHitsWall(ball){
    return ballHitsHorizontalWall(ball) || ballHitsVerticalWall(ball);
}


function dot(a, b){
    return a.map((x, i) => a[i] * b[i]).reduce((m, n) => m + n);
}

function distance(a,b) {
    return Math.sqrt( a.map( (x, i) => (a[i] - b[i] )**2 ).reduce((m, n) => m + n) )
}