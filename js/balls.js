// init the html elements
let app = document.querySelector('#app');
let boardDiv = document.querySelector('#board');

// board object
let board = {
    div : boardDiv,
    balls : [],
    nBalls: 10,
}

// add the balls to the board and position them randomly
while(board.balls.length < board.nBalls){
    // create a ball div 
    let ballDiv = document.createElement('div');
    ballDiv.classList.add('ball');
    boardDiv.appendChild(ballDiv);
    // generate the position the ball div randomly
    let radius = 0.5 * ballDiv.offsetWidth / boardDiv.clientWidth;
    let x = Math.random() * (1 - 2 * radius) + radius;
    let y = Math.random() * (1 - 2 * radius) + radius;
    // check if the ball touches any of the previously created balls
    let touchesAnother = board.balls.some(({xCenter,yCenter}) => (xCenter-x)**2 + (yCenter-y)**2 <=4*radius**2  )
    if (touchesAnother){
        boardDiv.removeChild(ballDiv);
    } else{
        // position the ball div inside of the boardDiv
        ballDiv.style.left = 100*(x-radius)+'%';
        ballDiv.style.bottom = 100*(y-radius)+'%';
        // push a ball object into board
        board.balls.push(
            {
                xCenter:x,
                yCenter:y,
                div:ballDiv,
            }
        )
    }
}
