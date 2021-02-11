const { Engine, Render, Runner, World, Bodies, Body, Events } = Matter;

const cellsHorizontal = 15;
const cellsVertical = 10;
const width = window.innerWidth, height = window.innerHeight;
const unitLengthX = width / cellsHorizontal;
const unitLengthY = height / cellsVertical;

const engine = Engine.create();
const { world } = engine;
world.gravity.y = 0;
const render = Render.create({
    element: document.body,
    engine,
    options: {
        wireframes: false,
        width, //px
        height //px
    },
});

Render.run(render);
Runner.run(Runner.create(), engine);


//Walls
const walls = [
    Bodies.rectangle(width / 2, 0, width, 2, { isStatic: true }),
    Bodies.rectangle(width / 2, height, width, 2, { isStatic: true }),
    Bodies.rectangle(0, height / 2, 2, height, { isStatic: true }),
    Bodies.rectangle(width, height / 2, 2, width, { isStatic: true })
];
World.add(world, walls);

// Maze generation
const shuffle = (arr) => {
    let counter = arr.length;
    while (counter > 0) {
        const index = Math.floor(Math.random() * counter);
        counter--;
        const temp = arr[counter];
        arr[counter] = arr[index];
        arr[index] = temp;
    }
    return arr;
}

const grid = Array(cellsVertical).fill(null).map(() => Array(cellsHorizontal).fill(false));
const verticals = Array(cellsVertical).fill(null).map(() => Array(cellsHorizontal - 1).fill(false));
const horizontals = Array(cellsVertical - 1).fill(null).map(() => Array(cellsHorizontal).fill(false));

const startRow = Math.floor(Math.random() * cellsVertical);
const startColumn = Math.floor(Math.random() * cellsHorizontal);

const stepThroughCell = (row, column) => {
    //If i have visited the cell at [row,col] return
    if (grid[row][column]) return;
    // Mark this cell as visited
    grid[row][column] = true;
    // Assemble randomly ordered list of neighbours
    const neighbours = shuffle([[row - 1, column, 'up'], [row, column + 1, 'right'], [row + 1, column, 'down'], [row, column - 1, 'left']]);
    // for each neighbour
    for (let neighbour of neighbours) {
        const [nextRow, nextColumn, direction] = neighbour;
        // See if neighbour is out of bounds
        if (nextRow < 0 || nextRow >= cellsVertical || nextColumn < 0 || nextColumn >= cellsHorizontal) continue;
        // if we have visited that neighbour, continue to next neighbour
        if (grid[nextRow][nextColumn]) continue;
        // remove the wall from either from vertical or horizontal
        if (direction === 'left') verticals[row][column - 1] = true;
        else if (direction === 'right') verticals[row][column] = true;
        else if (direction === 'up') horizontals[row - 1][column] = true;
        else if (direction === 'down') horizontals[row][column] = true;
        // Visit the next cell
        stepThroughCell(nextRow, nextColumn);
    }
}
stepThroughCell(startRow, startColumn);

horizontals.forEach((row, rowIndex) => {
    row.forEach((open, columnIndex) => {
        if (open) return;
        const wall = Bodies.rectangle(
            columnIndex * unitLengthX + unitLengthX / 2,
            rowIndex * unitLengthY + unitLengthY,
            unitLengthX,
            2,
            {
                label : 'wall',
                isStatic: true,
                render : {
                    fillStyle : 'red'
                }
            }
        )
        World.add(world, wall);
    });
});

verticals.forEach((row, rowIndex) => {
    row.forEach((open, columnIndex) => {
        if (open) return;
        const wall = Bodies.rectangle(
            columnIndex * unitLengthX + unitLengthX,
            rowIndex * unitLengthY + unitLengthY / 2,
            2,
            unitLengthY,
            {
                label : 'wall',
                isStatic: true,
                render : {
                    fillStyle : 'red'
                }
            }
        )
        World.add(world, wall);
    });
});

// Goal
const goal = Bodies.rectangle(
    width - unitLengthX / 2,
    height - unitLengthY / 2,
    unitLengthX * 0.7,
    unitLengthY * 0.7,
    {
        label: 'goal',
        isStatic: true,
        render : {
            fillStyle : 'green'
        }
    }
);
World.add(world, goal);

// Ball
const ballRadius = Math.min(unitLengthX, unitLengthY)/4;
const ball = Bodies.circle(
    unitLengthX / 2,
    unitLengthY / 2,
    ballRadius, {
    label: 'ball',
    render : {
        fillStyle : 'blue'
    }
}
);
World.add(world, ball);

document.addEventListener('keydown', (event) => {
    const { x, y } = ball.velocity;

    if (event.keycode === 87 || event.keyCode === 38) {
        Body.setVelocity(ball, { x, y: y - 5 });
    }
    else if (event.keycode === 68 || event.keyCode === 39) {
        Body.setVelocity(ball, { x: x + 5, y });
    }
    else if (event.keycode === 83 || event.keyCode === 40) {
        Body.setVelocity(ball, { x, y: y + 5 });
    }
    else if (event.keycode === 65 || event.keyCode === 37) {
        Body.setVelocity(ball, { x: x - 5, y });
    }
});

// Win condition
Events.on(engine, 'collisionStart', event => {
    event.pairs.forEach(collision => {
        const labels = ['ball', 'goal'];
        if(labels.includes(collision.bodyA.label) && labels.includes(collision.bodyB.label)) {
            document.querySelector('.winner').classList.remove('hidden');
            world.gravity.y = 1;
            world.bodies.forEach(body => {
                if(body.label === 'wall') {
                    Body.setStatic(body, false);
                }
            });
        }
    });
});